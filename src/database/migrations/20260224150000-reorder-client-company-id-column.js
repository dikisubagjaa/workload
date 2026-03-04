"use strict";

module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable("client");
    if (!table.company_id || !table.client_id) return;

    await queryInterface.sequelize.query(`
      ALTER TABLE client
      MODIFY COLUMN company_id INT NOT NULL AFTER client_id
    `);
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("client");
    if (!table.company_id) return;

    await queryInterface.sequelize.query(`
      ALTER TABLE client
      MODIFY COLUMN company_id INT NOT NULL AFTER leadstatus_id
    `);
  },
};
