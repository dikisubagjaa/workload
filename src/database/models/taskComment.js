module.exports = (sequelize, DataTypes) => {
  const TaskComment = sequelize.define('TaskComment', {
    comment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    comment_for: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
    mentioned_user_ids: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    mentioned_attachment_ids: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    filename: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
    type: {
      type: DataTypes.ENUM('activity', 'comment', 'reply'),
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
    },
    deleted_by: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }, {
    tableName: 'task_comment',
    timestamps: false,
    defaultScope: {
      where: {
        deleted: null,
        deleted_by: null
      }
    }
  });

  TaskComment.associate = function (models) {
    TaskComment.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });
  };

  return TaskComment;
};