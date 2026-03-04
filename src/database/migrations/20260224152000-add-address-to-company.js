"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const companyTable = await queryInterface.describeTable("company");
    if (!companyTable.address) {
      await queryInterface.addColumn("company", "address", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      });
    }

    await queryInterface.sequelize.query(`
      UPDATE company co
      INNER JOIN (
        SELECT c.company_id, SUBSTRING_INDEX(GROUP_CONCAT(TRIM(c.address) ORDER BY COALESCE(c.updated,0) DESC SEPARATOR '||'), '||', 1) AS address
        FROM client c
        WHERE c.company_id IS NOT NULL
          AND c.address IS NOT NULL
          AND TRIM(c.address) <> ''
        GROUP BY c.company_id
      ) x ON x.company_id = co.company_id
      SET co.address = x.address
      WHERE co.address IS NULL OR TRIM(co.address) = ''
    `);
  },

  async down(queryInterface) {
    const companyTable = await queryInterface.describeTable("company");
    if (companyTable.address) {
      await queryInterface.removeColumn("company", "address");
    }
  },
};
