// src/database/models/timesheet.js
module.exports = (sequelize, DataTypes) => {
  const Timesheet = sequelize.define(
    "Timesheet",
    {
      timesheet_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      task_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("draft", "submitted", "approved", "rejected"),
        allowNull: false,
        defaultValue: "draft",
      },
      created: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // ⬅️ sudah INT sesuai ALTER
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      updated: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // ⬅️ sudah INT sesuai ALTER
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      deleted: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      // ⬅️ sudah INT sesuai ALTER
      deleted_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "timesheet",
      timestamps: false,
      // ⬅️ ini tempat yang benar
      defaultScope: {
        where: {
          deleted: null,
        },
      },
    }
  );

  Timesheet.associate = function (models) {
    Timesheet.belongsTo(models.User, { foreignKey: "user_id", as: "User" });
    Timesheet.belongsTo(models.Project, { foreignKey: "project_id", as: "Project" });
    Timesheet.belongsTo(models.Task, { foreignKey: "task_id", as: "Task" });
  };

  return Timesheet;
};
