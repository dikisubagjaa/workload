// src/database/models/MasterAnnualAssesmentQuestion.js
module.exports = (sequelize, DataTypes) => {
  const MasterAnnualAssesmentQuestion = sequelize.define(
    "MasterAnnualAssesmentQuestion",
    {
      question_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      section_key: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },

      question_key: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },

      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      input_type: {
        type: DataTypes.ENUM("rating", "text", "textarea"),
        allowNull: false,
        defaultValue: "rating",
      },

      options_json: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      scale_min: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: true,
      },

      scale_max: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: true,
      },

      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      is_active: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
      },

      created: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      updated: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      updated_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      deleted: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      deleted_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
    },
    {
      tableName: "master_annual_assesment_question",
      timestamps: false,
      defaultScope: {
        where: {
          deleted: null,
          deleted_by: null,
          is_active: 1,
        },
      },
      indexes: [
        { name: "idx_section_key", fields: ["section_key"] },
        { name: "idx_question_key", fields: ["question_key"] },
        { name: "idx_sort_order", fields: ["sort_order"] },
      ],
    }
  );

  MasterAnnualAssesmentQuestion.associate = function (_models) {
    // no relation needed (snapshot ada di annual_assestment.questions_json)
  };

  return MasterAnnualAssesmentQuestion;
};
