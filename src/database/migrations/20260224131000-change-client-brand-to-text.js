"use strict";

function pickBrandText(raw) {
  if (raw == null) return "";
  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return "";
    if ((s.startsWith("[") && s.endsWith("]")) || (s.startsWith("{") && s.endsWith("}"))) {
      try {
        return pickBrandText(JSON.parse(s));
      } catch {
        return s;
      }
    }
    return s;
  }
  if (typeof raw === "number") return String(raw);
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const txt = pickBrandText(item);
      if (txt) return txt;
    }
    return "";
  }
  if (typeof raw === "object") {
    return String(raw.title || raw.label || raw.name || raw.brand_title || raw.brand_name || "").trim();
  }
  return "";
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("client");

    if (!table.brand_text_tmp) {
      await queryInterface.addColumn("client", "brand_text_tmp", {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      });
    }

    const [rows] = await queryInterface.sequelize.query(`SELECT client_id, brand FROM client`);
    for (const row of rows || []) {
      const brand = pickBrandText(row.brand || "").slice(0, 255);
      await queryInterface.sequelize.query(
        `UPDATE client SET brand_text_tmp = :brand WHERE client_id = :clientId`,
        {
          replacements: {
            brand: brand || "",
            clientId: row.client_id,
          },
        }
      );
    }

    if (table.brand) {
      await queryInterface.removeColumn("client", "brand");
    }
    await queryInterface.renameColumn("client", "brand_text_tmp", "brand");
    await queryInterface.changeColumn("client", "brand", {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: "",
    });
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("client");
    if (table.brand) {
      await queryInterface.changeColumn("client", "brand", {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
      });
    }
  },
};
