module.exports = (sequelize, DataTypes) => {
  const TaskRevision = sequelize.define('TaskRevision', {
    revision_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    request_by: {
      type: DataTypes.ENUM('internal','client'),
      allowNull: false,
      defaultValue: 'internal'
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
    },
    deleted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    tableName: 'task_revision',
    timestamps: false,
    defaultScope: {
      where: {
        deleted: null,
        deleted_by: null
      }
    }
  });
  return TaskRevision;
};