// src/database/models/performanceEventLog.js
module.exports = (sequelize, DataTypes) => {
    const performanceEventLog = sequelize.define('performanceEventLog', {
        perf_event_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        // siapa & periode
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        event_date: { type: DataTypes.DATEONLY, allowNull: false },
        period_year: { type: DataTypes.SMALLINT, allowNull: false },
        period_month: { type: DataTypes.TINYINT, allowNull: false },
        period_start_date: { type: DataTypes.DATEONLY, allowNull: false },

        // referensi config + nilai impact
        perf_config_id: { type: DataTypes.INTEGER, allowNull: false },
        score_value: { type: DataTypes.SMALLINT, allowNull: false },

        // metadata
        source: { type: DataTypes.STRING(32), allowNull: false }, // 'task'|'timesheet'|'attendance'|'manual'
        ref_id: { type: DataTypes.BIGINT, allowNull: true, defaultValue: null },
        note: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
        meta: { type: DataTypes.JSON, allowNull: true, defaultValue: null },

        // audit (tanpa *_at)
        created: { type: DataTypes.INTEGER, allowNull: false },
        created_by: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
        updated: { type: DataTypes.INTEGER, allowNull: false },
        updated_by: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    }, {
        tableName: 'performance_event_log',
        timestamps: false,
        indexes: [
            { fields: ['user_id', 'period_year', 'period_month', 'score_value'], name: 'idx_user_period_score' },
            { fields: ['period_year', 'period_month', 'user_id', 'score_value'], name: 'idx_period_user_score' },
            { fields: ['perf_config_id'], name: 'idx_perf_config' },
            { fields: ['ref_id'], name: 'idx_ref' },
        ],
    });

    performanceEventLog.associate = function (models) {
        performanceEventLog.belongsTo(models.performanceConfig, {
            foreignKey: 'perf_config_id',
            as: 'config',
        });
        performanceEventLog.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'User',
        });
    };

    return performanceEventLog;
};
