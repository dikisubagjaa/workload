'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('project', {
      project_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      due_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      max_hours: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      project_type: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      maintenance: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      currency: {
        type: Sequelize.ENUM("idr", "usg", "sgd"),
        allowNull: false,
        defaultValue : "idr"
      },
      value: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      terms_of_payment: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('project');
  }
};