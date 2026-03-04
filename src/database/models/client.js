const { STRING } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    client_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    client_name: {
      type: STRING(255),
      allowNull: false,
    },
    brand: {
      type: STRING(255),
      allowNull: false,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    pic_name: {
      type: STRING(255),
      allowNull: false,
    },
    pic_email: {
      type: STRING(255),
      allowNull: false,
    },
    pic_phone: {
      type: STRING(255),
      allowNull: false,
    },
    finance_name: {
      type: STRING(255),
      allowNull: false,
    },
    finance_email: {
      type: STRING(255),
      allowNull: false,
    },
    finance_phone: {
      type: STRING(255),
      allowNull: false,
    },
    division: {
      type: STRING(255),
      allowNull: false,
    },
    assign_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    leadsource_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    leadstatus_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    client_type: {
      type: DataTypes.ENUM("leads", "customer"),
      allowNull: false,
      defaultValue: "customer",
    },
    lead_status: {
      type: DataTypes.ENUM("new", "validate", "lost", "won"),
      allowNull: true,
      defaultValue: null,
    },
    contacted: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    won: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    lost: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    follow_up: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    tableName: 'client',
    timestamps: false,
    defaultScope: {
      where: {
        deleted: null,
        deleted_by: null
      }
    }
  });

  Client.associate = function(models) {
    Client.hasMany(models.Project, {
      foreignKey: 'client_id',
      as: 'Projects'
    });
    Client.hasMany(models.ClientActivity, {
      foreignKey: "client_id",
      as: "Activities",
    });
    Client.belongsTo(models.User, {
      foreignKey: "assign_to",
      targetKey: "user_id",
      as: "AssignTo",
    });
    Client.belongsTo(models.Leadsource, {
      foreignKey: "leadsource_id",
      targetKey: "leadsource_id",
      as: "Leadsource",
    });
    Client.belongsTo(models.Company, {
      foreignKey: "company_id",
      targetKey: "company_id",
      as: "Company",
    });
    Client.belongsTo(models.Leadstatus, {
      foreignKey: "leadstatus_id",
      targetKey: "leadstatus_id",
      as: "Leadstatus",
    });
    Client.hasMany(models.ClientAssignHistory, {
      foreignKey: "client_id",
      as: "AssignHistories",
    });
    Client.hasMany(models.ClientLeadstatusHistory, {
      foreignKey: "client_id",
      as: "LeadstatusHistories",
    });
  };

  return Client;
};
