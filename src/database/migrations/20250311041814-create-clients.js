"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("client", {
      client_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("PT", "CV", "UNOFFICIAL"),
        allowNull: false,
      },
      client_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      brand_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pic_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      pic_phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      pic_email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      finance_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      finance_phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      finance_email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      json_data:{
        type: Sequelize.JSON,
        allowNull: true,
      },
      created: {
        type: Sequelize.DATE,
        allowNull: false,
    },
      created_by: {
          type: Sequelize.INTEGER,
          allowNull: false,
      },
      updated: {
          type: Sequelize.DATE,
          allowNull: false,
      },
      updated_by: {
          type: Sequelize.INTEGER,
          allowNull: false,
      },
      deleted: {
          type: Sequelize.DATE,
          allowNull: true,
      },
      deleted_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("client");
  },
};
