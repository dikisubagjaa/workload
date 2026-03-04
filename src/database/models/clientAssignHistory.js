module.exports = (sequelize, DataTypes) => {
  const ClientAssignHistory = sequelize.define(
    "ClientAssignHistory",
    {
      assign_history_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      client_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      from_assign_to: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      to_assign_to: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      assigned_at: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      moved_at: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      tableName: "client_assign_history",
      timestamps: false,
      defaultScope: {
        where: {
          deleted: null,
          deleted_by: null,
        },
      },
    }
  );

  ClientAssignHistory.associate = function associate(models) {
    ClientAssignHistory.belongsTo(models.Client, {
      foreignKey: "client_id",
      as: "Client",
    });
    ClientAssignHistory.belongsTo(models.User, {
      foreignKey: "from_assign_to",
      targetKey: "user_id",
      as: "FromAssignee",
    });
    ClientAssignHistory.belongsTo(models.User, {
      foreignKey: "to_assign_to",
      targetKey: "user_id",
      as: "ToAssignee",
    });
  };

  return ClientAssignHistory;
};
