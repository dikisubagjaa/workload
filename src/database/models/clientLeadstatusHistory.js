module.exports = (sequelize, DataTypes) => {
  const ClientLeadstatusHistory = sequelize.define(
    "ClientLeadstatusHistory",
    {
      leadstatus_history_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      client_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      from_leadstatus_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      to_leadstatus_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      changed_at: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      updated: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      deleted: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      deleted_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "client_leadstatus_history",
      timestamps: false,
      defaultScope: {
        where: {
          deleted: null,
          deleted_by: null,
        },
      },
    }
  );

  ClientLeadstatusHistory.associate = function associate(models) {
    ClientLeadstatusHistory.belongsTo(models.Client, {
      foreignKey: "client_id",
      as: "Client",
    });
    ClientLeadstatusHistory.belongsTo(models.Leadstatus, {
      foreignKey: "from_leadstatus_id",
      targetKey: "leadstatus_id",
      as: "FromLeadstatus",
    });
    ClientLeadstatusHistory.belongsTo(models.Leadstatus, {
      foreignKey: "to_leadstatus_id",
      targetKey: "leadstatus_id",
      as: "ToLeadstatus",
    });
    ClientLeadstatusHistory.belongsTo(models.User, {
      foreignKey: "created_by",
      targetKey: "user_id",
      as: "Changer",
    });
  };

  return ClientLeadstatusHistory;
};
