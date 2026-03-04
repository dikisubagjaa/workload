// src/database/models/emailLog.js
module.exports = (sequelize, DataTypes) => {
    const EmailLog = sequelize.define('EmailLog', {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },

        notification_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
        },

        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },

        to_email: {
            type: DataTypes.STRING(191),
            allowNull: false,
        },

        type: {
            type: DataTypes.STRING(64), // mis. task_comment, timesheet_reminder
            allowNull: false,
        },

        subject: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        template_key: {
            type: DataTypes.STRING(128),
            allowNull: true,
        },

        template_vars: {
            // simpan JSON string variabel template
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },

        body: {
            // FULL email body (HTML/Plain)
            type: DataTypes.TEXT('medium'),
            allowNull: false,
        },

        status: {
            type: DataTypes.ENUM('queued', 'attempt', 'sent', 'skipped', 'failed', 'throttled'),
            allowNull: false,
            defaultValue: 'queued',
        },

        reason: {
            // dedup | quiet_hours | user_pref_off | rate_limit | email_disabled
            type: DataTypes.STRING(64),
            allowNull: true,
        },

        provider: {
            type: DataTypes.STRING(64), // 'gmail-smtp' dll
            allowNull: true,
        },

        provider_message_id: {
            type: DataTypes.STRING(191),
            allowNull: true,
        },

        smtp_response: {
            type: DataTypes.STRING(512),
            allowNull: true,
        },

        error_code: {
            type: DataTypes.STRING(64),
            allowNull: true,
        },

        error_message: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        attempt_no: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 1,
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

        attempted: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        sent: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        created_by: {
            type: DataTypes.STRING(64),
            allowNull: true,
        },

        updated_by: {
            type: DataTypes.STRING(64),
            allowNull: true,
        },
    }, {
        tableName: 'email_log',
        timestamps: false,
        underscored: true,
        indexes: [
            { fields: ['user_id', 'created'] },
            { fields: ['notification_id'] },
            { fields: ['status', 'created'] },
            { fields: ['dedup_key'] },
            { fields: ['to_email', 'created'] },
        ],
    });

    EmailLog.associate = (models) => {
        if (models.Notification) {
            EmailLog.belongsTo(models.Notification, {
                foreignKey: 'notification_id',
                targetKey: 'notification_id',
                as: 'notification',
            });
        }
        if (models.User) {
            EmailLog.belongsTo(models.User, {
                foreignKey: 'user_id',
                targetKey: 'user_id',
                as: 'user',
            });
        }
    };

    return EmailLog;
};
