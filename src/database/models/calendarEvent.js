// src/database/models/calendarEvent.js
module.exports = (sequelize, DataTypes) => {
    const CalendarEvent = sequelize.define(
        'CalendarEvent',
        {
            event_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            title: {
                type: DataTypes.STRING(150),
                allowNull: false,
                validate: {
                    len: [1, 150],
                },
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            start_at: {
                type: DataTypes.INTEGER, // unix seconds
                allowNull: false,
            },
            end_at: {
                type: DataTypes.INTEGER, // unix seconds
                allowNull: false,
            },
            color: {
                type: DataTypes.STRING(16), // hex color (e.g. #1677ff)
                allowNull: true,
            },
            is_public: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            deleted: {
                type: DataTypes.INTEGER, // unix seconds (soft delete)
                allowNull: true,
            },
            created: {
                type: DataTypes.INTEGER, // unix seconds
                allowNull: false,
            },
            updated: {
                type: DataTypes.INTEGER, // unix seconds
                allowNull: false,
            },
        },
        {
            tableName: 'calendar_event',
            timestamps: false,
        }
    );

    CalendarEvent.associate = function (models) {
        // optional relation to User; follow existing conventions (User tableName = 'user')
        CalendarEvent.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'User',
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        });
    };

    return CalendarEvent;
};
