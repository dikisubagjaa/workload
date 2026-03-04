const { STRING } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    task_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pq_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    po_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ts_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    department: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: true,
    },
    start_date: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    todo: {
      type: DataTypes.ENUM(
        'new', 'in_progress', 'revision',        // Staff
        'need_review_hod', 'revise_hod',         // HOD
        'need_review_ae', 'revise_account',      // AE/Account
        'approved_ae',                           // AE final approve
        'completed',                             // final (legacy)
        'pending', 'cancel', 'todo', 'review', 'done' // legacy kept
      ),
      allowNull: true,
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    count_task_child: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    count_task_child_completed: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    count_revision: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    start_revision: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    end_revision: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    last_version: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_overdue: {
      type: DataTypes.ENUM('true', 'false'),
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
    tableName: 'task',
    timestamps: false,
    defaultScope: {
      where: {
        deleted: null,
        deleted_by: null
      }
    }
  });


  Task.associate = function (models) {
    Task.belongsTo(models.Project, {
      foreignKey: 'project_id',
      as: 'Project'
    });

    Task.hasMany(models.TaskAssignment, {
      foreignKey: 'task_id',
      as: 'Assignments'
    });

    Task.belongsTo(models.ProjectQuotation, {
      foreignKey: 'pq_id',
      as: 'Quotation'
    });

    Task.belongsTo(models.ProjectPurchaseOrder, {
      foreignKey: 'po_id',
      as: 'PurchaseOrder'
    });

    Task.hasMany(models.TaskComment, {
      foreignKey: 'task_id',
      as: 'Comments'
    });

    Task.hasMany(models.TaskAttachment, {
      foreignKey: 'task_id',
      as: 'Attachments'
    });

    Task.hasMany(models.SubTask, {
      foreignKey: 'task_id',
      as: 'SubTasks'
    });

    Task.hasMany(models.Task, {
      foreignKey: 'parent_id',
      as: 'SubtaskItems'
    });

    Task.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator' // Alias ini yang harus dicocokkan di query
    });

    Task.belongsToMany(models.User, {
      through: models.TaskAssignment,
      foreignKey: 'task_id',
      otherKey: 'user_id',
      as: 'AssignedUser' // Alias ini yang juga harus dicocokkan di query
    });
  };

  return Task;
};
