module.exports = (sequelize, DataTypes) => {
  const TaskTodo = sequelize.define('TaskTodo', {
    todo_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    todo: {
      type: DataTypes.ENUM(
        'new', 'in_progress', 'revision',
        'need_review_hod', 'revise_hod',
        'need_review_ae', 'revise_account',
        'approved_ae',
        'completed',
        'pending', 'cancel', 'todo', 'review', 'done'
      ),
      allowNull: true,
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
    tableName: 'task_todo',
    timestamps: false,
    defaultScope: {
      where: {
        deleted: null,
        deleted_by: null
      }
    }
  });
  return TaskTodo;
};