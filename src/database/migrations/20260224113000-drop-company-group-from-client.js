"use strict";

module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable("client");
    if (table.company_group) {
      await queryInterface.removeColumn("client", "company_group");
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("client");
    if (!table.company_group) {
      await queryInterface.addColumn("client", "company_group", {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
      });
    }
  },
};
