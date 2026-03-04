"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    let tableExists = true;
    try {
      await queryInterface.describeTable("company");
    } catch {
      tableExists = false;
    }

    if (!tableExists) {
      await queryInterface.createTable("company", {
        company_id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        legal_type: {
          type: Sequelize.ENUM("PT", "CV", "UNOFFICIAL"),
          allowNull: false,
        },
        created: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        updated: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        updated_by: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        deleted: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        deleted_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
      });

      await queryInterface.addIndex("company", ["title"], {
        name: "idx_company_title",
      });
      await queryInterface.addIndex("company", ["title", "legal_type"], {
        unique: true,
        name: "uk_company_title_legal_type",
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable("company");
  },
};
