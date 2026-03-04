// src/database/models/Attendance.js
module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
    attendance_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    clock_in: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    clock_out: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    late_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    minutes_late: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    timesheet: {
      type: DataTypes.ENUM('true', 'false'),
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM('present', 'late', 'absent', 'leave', 'holiday', 'sick', 'permission'),
      allowNull: false,
      defaultValue: 'absent',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    location_latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      defaultValue: null,
    },
    location_longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      defaultValue: null,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      defaultValue: null,
    },
    device_info: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    created: {
      type: DataTypes.INTEGER, // Unix timestamp
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
      defaultValue: null,
    },
    deleted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
  }, {
    tableName: 'attendance',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'date']
      }
    ]
  });

  Attendance.associate = function (models) {
    Attendance.belongsTo(models.User, { foreignKey: 'user_id', as: 'User' });
  };

  return Attendance;
};