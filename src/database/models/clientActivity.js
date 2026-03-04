module.exports = (sequelize, DataTypes) => {
  const ClientActivity = sequelize.define(
    "ClientActivity",
    {
      activity_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("note", "file"),
        allowNull: false,
        defaultValue: "note",
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      real_filename: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      filetype: {
        type: DataTypes.STRING(120),
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
      },
    },
    {
      tableName: "client_activity",
      timestamps: false,
      defaultScope: {
        where: {
          deleted: null,
          deleted_by: null,
        },
      },
    }
  );

  ClientActivity.associate = function associate(models) {
    ClientActivity.belongsTo(models.Client, {
      foreignKey: "client_id",
      as: "Client",
    });
    ClientActivity.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });
  };

  return ClientActivity;
};
