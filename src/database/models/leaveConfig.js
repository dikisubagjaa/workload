// src/database/models/leaveConfig.js
module.exports = (sequelize, DataTypes) => {
    const LeaveConfig = sequelize.define(
        'LeaveConfig',
        {
            lconfig_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            title: {
                type: DataTypes.STRING(150),
                allowNull: false,
            },

            total: {
                // kuota per tahun; NULL = tanpa batas
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },

            max_sequence: {
                // batas hari berturut2 per request; NULL = tanpa batas
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
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
                defaultValue: null,
            },

            deleted_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
        },
        {
            tableName: 'leave_config',
            timestamps: false,
            indexes: [
                { name: 'idx_leave_config_title', fields: ['title'] },
            ],
        }
    );

    return LeaveConfig;
};
