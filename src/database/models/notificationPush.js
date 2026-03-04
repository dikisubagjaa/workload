// src/database/models/NotificationPush.js
/* eslint-disable camelcase */
module.exports = (sequelize, DataTypes) => {
    const NotificationPush = sequelize.define('NotificationPush', {
        notification_push_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        created_by: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },

        token: {
            type: DataTypes.STRING(512),
            allowNull: false,
        },

        app: {
            type: DataTypes.ENUM('web', 'ios', 'android', 'other'),
            allowNull: false,
            defaultValue: 'web',
        },

        ua: {
            type: DataTypes.STRING(512),
            allowNull: true,
        },

        platform: {
            type: DataTypes.STRING(64),
            allowNull: true,
        },

        browser: {
            type: DataTypes.STRING(64),
            allowNull: true,
        },

        device: {
            type: DataTypes.STRING(128),
            allowNull: true,
        },

        status: {
            type: DataTypes.ENUM('active', 'revoked'),
            allowNull: false,
            defaultValue: 'active',
        },

        last_seen: {
            type: DataTypes.INTEGER.UNSIGNED, // unix seconds
            allowNull: true,
        },

        created: {
            type: DataTypes.INTEGER.UNSIGNED, // unix seconds
            allowNull: false,
        },

        updated: {
            type: DataTypes.INTEGER.UNSIGNED, // unix seconds
            allowNull: true,
        },
    }, {
        tableName: 'notification_push',
        timestamps: false, // pakai created/updated custom
        indexes: [
            {
                name: 'uq_createdby_token',
                unique: true,
                fields: ['created_by', 'token'],
            },
            {
                name: 'idx_createdby_status',
                fields: ['created_by', 'status'],
            },
            {
                name: 'idx_last_seen',
                fields: ['last_seen'],
            },
        ],
    });

    NotificationPush.addHook('beforeCreate', (row) => {
        const now = Math.floor(Date.now() / 1000);
        if (!row.created) row.created = now;
        row.updated = now;
    });

    NotificationPush.addHook('beforeUpdate', (row) => {
        row.updated = Math.floor(Date.now() / 1000);
    });

    NotificationPush.associate = function (models) {
        // sesuaikan nama model user kamu kalau berbeda
        NotificationPush.belongsTo(models.User, {
            foreignKey: 'created_by',
            as: 'User',
        });
    };

    return NotificationPush;
};
