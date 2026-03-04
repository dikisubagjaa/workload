// src/database/models/performanceMonthlyScore.js
module.exports = (sequelize, DataTypes) => {
    const performanceMonthlyScore = sequelize.define('performanceMonthlyScore', {
        perf_month_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        period_year: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        period_month: {
            type: DataTypes.TINYINT,
            allowNull: false,
        },
        period_start_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        base_score: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 100,
        },
        delta_sum: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 0,
        },
        final_score: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 100,
        },
        last_event: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
        below70_notified: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
        is_full_100: {
            type: DataTypes.ENUM('true', 'false'),
            allowNull: false,
            defaultValue: 'false',
        },
        consec_100_count: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
        },
        incentive_awarded_at: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },

        // audit
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
        tableName: 'performance_monthly_score',
        timestamps: false,
        indexes: [
            { unique: true, fields: ['user_id', 'period_year', 'period_month'], name: 'uk_user_period' },
            { fields: ['period_year', 'period_month'], name: 'idx_period' },
            { fields: ['user_id'], name: 'idx_user' },
        ],
    });

    performanceMonthlyScore.associate = function (models) {
        performanceMonthlyScore.belongsTo(models.User, { foreignKey: 'user_id', as: 'User' });
    };

    return performanceMonthlyScore;
};
