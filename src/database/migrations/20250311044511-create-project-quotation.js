'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('project_quotation', {
      pq_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      quotation_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      quotation_docs: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      po_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      po_docs: {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable('project_quotation');
  }
};