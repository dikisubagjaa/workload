// src/database/services/authService.js
import models from "../models";
const { User, UserEmployment } = models;
import { downloadAndSaveImage } from "@/utils/imageHelpers";
import { nowUnix } from "@/utils/dateHelpers";

export async function findOrCreateUser(profile) {
  const t = await models.sequelize.transaction();
  try {
    const ts = nowUnix();

    // ==== siapkan fullname & foto profil ====
    const fullName =
      (profile?.name && String(profile.name).trim()) ||
      [profile?.given_name, profile?.family_name].filter(Boolean).join(" ").trim() ||
      (profile?.email ? profile.email.split("@")[0] : "New User");

    let profileImage = profile?.picture || null;
    if (profile?.picture) {
      try {
        const { original } = await downloadAndSaveImage(profile.picture, "profile");
        profileImage = original;
      } catch (err) {
        console.warn("Gagal download foto profil:", err?.message || err);
      }
    }

    // ==== cari atau buat user ====
    let user = await User.findOne({ where: { email: profile.email }, transaction: t });

    if (!user) {
      const userAttrs = User?.rawAttributes || {};
      const userPayload = {
        fullname: fullName,
        email: profile.email,
        profile_pic: profileImage,
        user_type: "staff",
        user_role: "staff",
        status: "new",
        menu_access: [],
        join_date: ts,
        created: ts,
        created_by: 1,
        updated: ts,
        updated_by: 1, // aman: akan ter-drop jika kolom tidak ada
      };
      const safeUserPayload = Object.fromEntries(
        Object.entries(userPayload).filter(([k]) => userAttrs[k])
      );

      user = await User.create(safeUserPayload, { transaction: t });
    }

    // ==== ensure employment (find-or-create) ====
    const uid = user?.user_id ?? user?.id;
    if (uid) {
      const existingEmployment = await UserEmployment.findOne({
        where: { user_id: uid, deleted: null }, // hanya yang aktif
        transaction: t,
      });

      if (!existingEmployment) {
        const empAttrs = UserEmployment?.rawAttributes || {};
        const basePayload = {
          user_id: uid,
          start_date: ts,
          type: user?.user_type || "staff",
          created: ts,
          created_by: 1,
          updated: ts,
          // (jangan pakai updated_by: tidak ada di model)
        };
        const safePayload = Object.fromEntries(
          Object.entries(basePayload).filter(([k]) => empAttrs[k])
        );

        try {
          await UserEmployment.create(safePayload, { transaction: t });
        } catch (e) {
          // Jangan gagalkan login jika employment gagal dibuat.
          console.warn("UserEmployment.create gagal:", e?.message || e);
        }
      }
    }

    await t.commit();
    return user;
  } catch (error) {
    await t.rollback();
    console.error("Error in findOrCreateUser:", error);
    throw new Error("Database error in findOrCreateUser");
  }
}
