"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("client");
    if (!table.assign_to) {
      await queryInterface.addColumn("client", "assign_to", {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("client");
    if (table.assign_to) {
      await queryInterface.removeColumn("client", "assign_to");
    }
  },
};
