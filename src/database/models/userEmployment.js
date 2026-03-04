// src/database/models/userEmployment.js
module.exports = (sequelize, DataTypes) => {
    const UserEmployment = sequelize.define(
        'UserEmployment',
        {
            employment_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            type: {
                type: DataTypes.STRING(20), // 'contract' | 'staff' | 'probation'
                allowNull: false,
            },
            contract_number: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            start_date: {
                type: DataTypes.INTEGER, // unix seconds
                allowNull: true,
            },
            end_date: {
                type: DataTypes.INTEGER, // unix seconds
                allowNull: true,         // bisa null untuk staff
            },
            duration_months: {
                type: DataTypes.INTEGER,
                allowNull: true,         // khusus contract
            },
            salary_json: {
                type: DataTypes.TEXT,    // simpan string JSON dari FE
                allowNull: true,
            },
            evaluation_notes: {
                type: DataTypes.TEXT,    // khusus probation
                allowNull: true,
            },
            recommended_status: {
                type: DataTypes.STRING(50), // khusus probation
                allowNull: true,
            },
            notes: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            created: {
                type: DataTypes.INTEGER, // unix seconds
                allowNull: false,
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            updated: {
                type: DataTypes.INTEGER, // unix seconds
                allowNull: false,
            },
            deleted: {
                type: DataTypes.INTEGER, // unix seconds (soft delete)
                allowNull: true,
            },
        },
        {
            tableName: 'user_employment',
            timestamps: false,
        }
    );

    UserEmployment.associate = function (models) {
        UserEmployment.belongsTo(models.User, {
            as: 'User',
            foreignKey: 'user_id',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        });


    };

    return UserEmployment;
};
