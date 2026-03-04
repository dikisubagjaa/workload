// src/database/models/appraisal.js
module.exports = (sequelize, DataTypes) => {
  const Appraisal = sequelize.define(
    "Appraisal",
    {
      appraisal_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      // FK utama ke table `user` (PK: user_id)
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // snapshot title master yang dipakai
      title: {
        type: DataTypes.STRING(180),
        allowNull: true,
      },

      period_start: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      period_end: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      submitted_at: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM("draft", "submitted", "approved", "rejected"),
        allowNull: false,
        defaultValue: "draft",
      },

      current_step: {
        type: DataTypes.ENUM("staff", "hod", "hrd", "director", "done"),
        allowNull: false,
        defaultValue: "staff",
      },

      staff_snapshot_json: {
        type: DataTypes.JSON,
        allowNull: false,
      },

      employment_snapshot_json: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      rating_scale_json: {
        type: DataTypes.JSON,
        allowNull: false,
      },

      questions_json: {
        type: DataTypes.JSON,
        allowNull: false,
      },

      answers_json: {
        type: DataTypes.JSON,
        allowNull: false,
      },

      total_score: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },

      average_score: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0,
      },

      grade: {
        type: DataTypes.CHAR(1),
        allowNull: true,
      },

      scoring_json: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      approvals_json: {
        type: DataTypes.JSON,
        allowNull: false,
      },

      general_comment: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: "appraisal",
      timestamps: false,
      defaultScope: {
        where: {
          deleted: null,
          deleted_by: null,
        },
      },
      indexes: [
        { name: "idx_user_id", fields: ["user_id"] },
        { name: "idx_submitted_at", fields: ["submitted_at"] },
        { name: "idx_status", fields: ["status"] },
        { name: "idx_grade", fields: ["grade"] },
        { name: "idx_title", fields: ["title"] },
      ],
    }
  );

  Appraisal.associate = function (models) {
    Appraisal.belongsTo(models.User, {
      foreignKey: "user_id",
      targetKey: "user_id",
      as: "Staff",
    });
  };

  return Appraisal;
};
