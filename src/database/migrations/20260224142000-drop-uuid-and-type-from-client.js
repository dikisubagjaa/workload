"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("client");

    if (table.uuid) {
      await queryInterface.removeColumn("client", "uuid");
    }

    if (table.type) {
      await queryInterface.removeColumn("client", "type");
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("client");

    if (!table.uuid) {
      await queryInterface.addColumn("client", "uuid", {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!table.type) {
      await queryInterface.addColumn("client", "type", {
        type: Sequelize.ENUM("PT", "CV", "UNOFFICIAL"),
        allowNull: true,
        defaultValue: null,
      });
    }
  },
};
