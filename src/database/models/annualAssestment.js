// src/database/models/AnnualAssestment.js
module.exports = (sequelize, DataTypes) => {
  const AnnualAssestment = sequelize.define(
    "AnnualAssestment",
    {
      annual_assestment_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      period_from_year: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: false,
      },

      period_to_year: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: false,
      },

      staff_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },

      hod_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },

      hrd_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },

      operational_director_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM(
          "draft",
          "submitted_by_staff",
          "approved",
          "rejected"
        ),
        allowNull: false,
        defaultValue: "draft",
      },

      // ✅ DB kamu sudah JSON (NOT NULL)
      staff_payload_json: {
        type: DataTypes.JSON,
        allowNull: false,
      },

      // ✅ DB kamu sudah JSON (NULL)
      hod_payload_json: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      staff_total_score: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: true,
      },

      hod_total_score: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: true,
      },

      staff_submitted_at: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },

      hod_submitted_at: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },

      approval_hod_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      approval_hod_at: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },

      approval_hrd_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      approval_hrd_at: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },

      approval_operational_director_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      approval_operational_director_at: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },

      finalized_at: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },

      created: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      updated: {
        type: DataTypes.INTEGER.UNSIGNED,
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

      // ✅ Snapshot + answers JSON
      questions_json: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      staff_answers_json: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      hod_answers_json: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      // ✅ computed
      staff_average: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true,
      },
      staff_grade: {
        type: DataTypes.CHAR(1),
        allowNull: true,
      },
      hod_average: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true,
      },
      hod_grade: {
        type: DataTypes.CHAR(1),
        allowNull: true,
      },
      final_average: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true,
      },
      final_grade: {
        type: DataTypes.CHAR(1),
        allowNull: true,
      },
    },
    {
      tableName: "annual_assestment",
      timestamps: false,
      defaultScope: {
        where: {
          deleted: null,
          deleted_by: null,
        },
      },
      indexes: [
        {
          unique: true,
          name: "uq_staff_period",
          fields: ["staff_id", "period_from_year", "period_to_year"],
        },
        { name: "idx_hod_status", fields: ["hod_id", "status"] },
        { name: "idx_hrd_status", fields: ["hrd_id", "status"] },
        { name: "idx_operational_director_status", fields: ["operational_director_id", "status"] },
        {
          name: "idx_period_status",
          fields: ["period_from_year", "period_to_year", "status"],
        },
      ],
    }
  );

  AnnualAssestment.associate = function (models) {
    AnnualAssestment.belongsTo(models.User, {
      foreignKey: "staff_id",
      targetKey: "user_id",
      as: "Staff",
    });

    AnnualAssestment.belongsTo(models.User, {
      foreignKey: "hod_id",
      targetKey: "user_id",
      as: "Hod",
    });

    AnnualAssestment.belongsTo(models.User, {
      foreignKey: "hrd_id",
      targetKey: "user_id",
      as: "Hrd",
    });

    AnnualAssestment.belongsTo(models.User, {
      foreignKey: "operational_director_id",
      targetKey: "user_id",
      as: "OperationalDirector",
    });
  };

  return AnnualAssestment;
};
