// src/database/models/attendanceConfig.js
module.exports = (sequelize, DataTypes) => {
    const AttendanceConfig = sequelize.define(
        "AttendanceConfig",
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            label: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            ip: {
                type: DataTypes.STRING(64),
                allowNull: false,
                validate: { len: [1, 64] },
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            note: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            // audit (unix seconds)
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
        },
        {
            tableName: "attendance_config",
            timestamps: false,
            underscored: true,
            indexes: [
                { unique: true, fields: ["ip", "active"] },
                { fields: ["active"] },
            ],
        }
    );

    AttendanceConfig.associate = function (_models) {
        // no relations for now
    };

    return AttendanceConfig;
};
