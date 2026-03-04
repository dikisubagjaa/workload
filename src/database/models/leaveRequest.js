// src/database/models/leaveRequest.js
module.exports = (sequelize, DataTypes) => {
    const LeaveRequest = sequelize.define(
        'LeaveRequest',
        {
            leave_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },

            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            start_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },

            end_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },

            days: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            permit: {
                type: DataTypes.STRING(30),
                allowNull: false,
                defaultValue: 'Leave',
            },

            reason: {
                type: DataTypes.STRING(150),
                allowNull: true,
                defaultValue: null,
            },

            detail: {
                type: DataTypes.TEXT,
                allowNull: true,
                defaultValue: null,
            },

            assign_note: {
                type: DataTypes.TEXT,
                allowNull: true,
                defaultValue: null,
            },

            assign_to: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },

            approval_assign_to_status: {
                type: DataTypes.ENUM('pending', 'approved', 'rejected'),
                allowNull: false,
                defaultValue: 'pending',
            },

            approval_assign_to_at: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },

            hod: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },

            approval_hod_status: {
                type: DataTypes.ENUM('pending', 'approved', 'rejected'),
                allowNull: false,
                defaultValue: 'pending',
            },

            approval_hod_at: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },

            hrd: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },

            approval_hrd_status: {
                type: DataTypes.ENUM('pending', 'approved', 'rejected'),
                allowNull: false,
                defaultValue: 'pending',
            },

            approval_hrd_at: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },


            operational_director: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },

            approval_operational_director_status: {
                type: DataTypes.ENUM('pending', 'approved', 'rejected'),
                allowNull: false,
                defaultValue: 'pending',
            },

            approval_operational_director_at: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },

            status: {
                type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
                allowNull: false,
                defaultValue: 'pending',
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
            tableName: 'leave',
            timestamps: false,
            indexes: [
                { name: 'idx_leave_user_id', fields: ['user_id'] },
                { name: 'idx_leave_start_date', fields: ['start_date'] },
                { name: 'idx_leave_end_date', fields: ['end_date'] },
                { name: 'idx_leave_status', fields: ['status'] },
                { name: 'idx_leave_hod', fields: ['hod'] },
                { name: 'idx_leave_user_date', fields: ['user_id', 'start_date', 'end_date'] },
                { name: 'idx_leave_approval_assign_status', fields: ['approval_assign_to_status'] },
                { name: 'idx_leave_approval_hod_status', fields: ['approval_hod_status'] },
                { name: 'idx_leave_approval_dir_status', fields: ['approval_operational_director_status'] },
            ],
        }
    );

    LeaveRequest.associate = (models) => {
        LeaveRequest.belongsTo(models.User, { foreignKey: 'user_id', as: 'User' });
        LeaveRequest.belongsTo(models.User, { foreignKey: 'assign_to', as: 'AssignedTo' });
        LeaveRequest.belongsTo(models.User, { foreignKey: 'hod', as: 'HOD' });
        LeaveRequest.belongsTo(models.User, { foreignKey: 'operational_director', as: 'OperationalDirector' });
        LeaveRequest.belongsTo(models.User, { foreignKey: "hrd", as: "HRD" });

    };

    return LeaveRequest;
};
