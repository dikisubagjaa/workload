const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    notification_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    sender: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cover: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'default.png',
    },
    email_send: {
      type: DataTypes.ENUM('false', 'true'),
      allowNull: false,
      defaultValue: 'false',
    },
    email_type: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    is_read: {
      type: DataTypes.ENUM('true', 'false'),
      allowNull: false,
      defaultValue: 'false',
    },
    is_open: {
      type: DataTypes.ENUM('false', 'true'),
      allowNull: false,
      defaultValue: 'false',
    },
    schedule: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    delivery_email_status: {
      type: DataTypes.ENUM('queued', 'attempt', 'sent', 'skipped', 'failed', 'throttled'),
      allowNull: true,
    },
    delivery_email_meta: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dedup_key: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    created: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    updated: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'notification',
    timestamps: false, // karena kamu punya created/updated sendiri
    underscored: true,
  });

  return Notification;
};
