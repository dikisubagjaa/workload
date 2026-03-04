// src/database/models/performanceConfig.js
module.exports = (sequelize, DataTypes) => {
    const performanceConfig = sequelize.define('performanceConfig', {
        perf_config_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(128),
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
        },
        score_default: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        is_active: {
            type: DataTypes.ENUM('true', 'false'),
            allowNull: false,
            defaultValue: 'true',
        },
        created: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
        updated: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
    }, {
        tableName: 'performance_config',
        timestamps: false,
        indexes: [
            { unique: true, fields: ['title'], name: 'uk_performance_config_title' },
            { fields: ['is_active'], name: 'idx_is_active' },
        ],
    });

    performanceConfig.associate = function (models) {
    };

    return performanceConfig;
};
