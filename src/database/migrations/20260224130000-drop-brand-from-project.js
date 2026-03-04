"use strict";

module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable("project");
    if (table.brand) {
      await queryInterface.removeColumn("project", "brand");
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("project");
    if (!table.brand) {
      await queryInterface.addColumn("project", "brand", {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }
  },
};
