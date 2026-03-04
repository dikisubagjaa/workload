"use strict";

module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable("client");
    if (table.address) {
      await queryInterface.removeColumn("client", "address");
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("client");
    if (!table.address) {
      await queryInterface.addColumn("client", "address", {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      });
    }
  },
};
