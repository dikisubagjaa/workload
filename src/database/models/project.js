const { STRING } = require("sequelize");

// src/database/models/project.js
module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    project_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    title: {
      type: STRING(255),
      allowNull: true,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    company_product: {
      type: STRING(255),
      allowNull: true,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    published: {
      type: DataTypes.ENUM('drafted', 'published', 'unpublished'),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('remaining', 'overdue', 'pending', 'completed'),
      allowNull: true,
    },
    is_overdue: {
      type: DataTypes.ENUM('true', 'false'),
      allowNull: true,
    },
    currency: {
      type: DataTypes.ENUM('idr', 'usd', 'sgd'),
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('pitching', 'project'),
      allowNull: true,
    },
    currency_value: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    terms_of_payment: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    max_hours: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    project_type: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    maintenance: {
      type: DataTypes.ENUM('true', 'false'),
      allowNull: true,
      defaultValue: "false"
    },
    teams: {
      type: DataTypes.JSON,
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
    tableName: 'project',
    timestamps: false,
    defaultScope: {
      where: {
        deleted: null,
        deleted_by: null
      }
    }
  });

  Project.associate = function (models) {
    // Satu Project bisa memiliki banyak Task
    Project.hasMany(models.Task, {
      foreignKey: 'project_id',
      as: 'Task'
    });

    // --- PERBAIKAN: Menambahkan relasi ke Client ---
    Project.belongsTo(models.Client, {
      foreignKey: 'client_id',
      as: 'Client'
    });

    // --- PERBAIKAN: Menambahkan relasi ke User (untuk created_by) ---
    Project.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'Creator' // Alias untuk user yang membuat
    });

    Project.hasMany(models.ProjectQuotation, {
      foreignKey: 'project_id',
      as: 'ProjectQuotations' // Alias yang digunakan di kueri GET
    });
  };

  return Project;
};
