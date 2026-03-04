'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('brand', {
      brand_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      json_data: {
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
    await queryInterface.dropTable('brand');
  }
};