// src/database/models/masterAppraisalQuestion.js
module.exports = (sequelize, DataTypes) => {
  const MasterAppraisalQuestion = sequelize.define(
    "MasterAppraisalQuestion",
    {
        question_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      // master key (title)
      title: {
        type: DataTypes.STRING(180),
        allowNull: false,
      },

      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      question_title: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      is_active: {
        type: DataTypes.ENUM("true", "false"),
        allowNull: false,
        defaultValue: "true",
      },

      created: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      updated: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      deleted: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      deleted_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "master_appraisal_question",
      timestamps: false,
      defaultScope: {
        where: {
          deleted: null,
          deleted_by: null,
        },
      },
      indexes: [
        { name: "idx_title", fields: ["title"] },
        { name: "idx_sort_order", fields: ["sort_order"] },
        { name: "idx_is_active", fields: ["is_active"] },
        { name: "uq_title_sort_order", unique: true, fields: ["title", "sort_order"] },
      ],
    }
  );

  MasterAppraisalQuestion.associate = function (_models) {
    // no relation (transactional table simpan snapshot/questions_json)
  };

  return MasterAppraisalQuestion;
};
