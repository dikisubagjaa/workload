module.exports = (sequelize, DataTypes) => {
    const ProjectTeam = sequelize.define('ProjectTeam', {
        pt_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        project_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        task_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        source: {
            type: DataTypes.ENUM('pitching', 'task', 'manual'),
            allowNull: false,
            defaultValue: 'task',
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
            type: DataTypes.DATE,
            allowNull: true,
        },
        deleted_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
        tableName: 'project_team',
        timestamps: false,
        defaultScope: {
            where: { deleted: null, deleted_by: null },
        },
    });

    ProjectTeam.associate = function (models) {
        ProjectTeam.belongsTo(models.Project, { foreignKey: 'project_id', as: 'Project' });
        ProjectTeam.belongsTo(models.Task, { foreignKey: 'task_id', as: 'Task' });
        ProjectTeam.belongsTo(models.User, { foreignKey: 'user_id', as: 'User' });

    };

    return ProjectTeam;
};
