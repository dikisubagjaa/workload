import { uploadFile, getFilename } from "@/utils/imageHelpers";
import { notify as notifyUser } from "@/utils/notifier";
import { findAllUsers, createUser, findUserById, findUserByUuid, updateUserInstance } from "@/server/queries/profileQueries";

function canAccess(currentUser, targetUserId) {
  if (!currentUser) return false;
  const role = currentUser.user_role || currentUser.role;
  const self = String(currentUser.user_id ?? currentUser.id ?? "") === String(targetUserId);
  return self || role === "superadmin" || role === "hrd";
}

const ALLOWED_FIELDS = [
  "job_position", "email", "phone",
  "fullname", "birthdate", "marital_status", "nationality", "status",
  "address", "address_on_identity",
  "identity_number", "identity_type", "npwp_number",
  "tax_start_date",
  "bank_code", "bank_account_number", "beneficiary_name", "currency",
  "bpjs_tk_number", "bpjs_tk_reg_date", "bpjs_tk_term_date",
  "bpjs_kes_number", "bpjs_kes_reg_date", "bpjs_kes_term_date",
  "pension_number",
  "emergency_fullname", "emergency_relationship",
  "emergency_contact", "emergency_address",
];

export async function listProfiles() {
  const users = await findAllUsers();
  return users;
}

export async function createProfileFromBody(body) {
  const newUser = await createUser(body);
  return { msg: "Profil berhasil ditambahkan", data: newUser };
}

export async function getProfileByParam(param) {
  if (!param) return { httpStatus: 400, msg: "Missing userId/uuid" };

  let user = null;
  if (/^\d+$/.test(param)) user = await findUserById(Number(param));
  else user = await findUserByUuid(param);

  if (!user) return { httpStatus: 404, msg: "User not found" };

  return { user: user.toJSON() };
}

export async function updateProfileById(userId, body, currentUser) {
  if (!canAccess(currentUser, userId)) return { httpStatus: 403, msg: "Forbidden" };

  const user = await findUserById(userId);
  if (!user) return { httpStatus: 404, msg: "User not found" };

  const prevStatus = String(user.status || "").toLowerCase();

  if (user.status == "new") {
    body.status = "waiting";
  } else {
    delete body.status;
  }

  await updateUserInstance(user, body, { fields: ALLOWED_FIELDS });

  const nextStatus = String(body.status || user.status || "").toLowerCase();
  if (prevStatus !== "waiting" && nextStatus === "waiting") {
    try {
      await notifyUser({
        userId: user.user_id,
        type: "profile_submitted",
        title: "Profile submitted",
        description: "Your profile has been submitted and is awaiting HRD verification.",
        email: false,
        meta: {
          user_id: user.user_id,
          status_from: prevStatus,
          status_to: nextStatus,
        },
      });
    } catch (e) {
      console.warn("Failed to send waiting notification:", e?.message || e);
    }
  }

  return { msg: "Profile updated", user: user.toJSON() };
}

export async function uploadProfileAvatar(userId, req, currentUser) {
  if (!canAccess(currentUser, userId)) return { httpStatus: 403, msg: "Forbidden" };

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file) return { httpStatus: 400, msg: "No file uploaded" };

  const result = await uploadFile(file, "profile");
  const imageUrl = result?.resized;
  const filename = getFilename(imageUrl);

  const user = await findUserById(userId);
  if (!user) return { httpStatus: 404, msg: "User not found" };

  await updateUserInstance(user, { profile_pic: filename }, { fields: ["profile_pic"] });
  return { msg: "Upload successful!", url: imageUrl };
}
