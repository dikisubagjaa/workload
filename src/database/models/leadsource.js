module.exports = (sequelize, DataTypes) => {
  const Leadsource = sequelize.define(
    "Leadsource",
    {
      leadsource_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      ordered: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
      },
      is_active: {
        type: DataTypes.ENUM("true", "false"),
        allowNull: false,
        defaultValue: "true",
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
      tableName: "leadsource",
      timestamps: false,
      defaultScope: {
        where: {
          deleted: null,
          deleted_by: null,
        },
      },
    }
  );

  Leadsource.associate = function associate(models) {
    Leadsource.hasMany(models.Client, {
      foreignKey: "leadsource_id",
      as: "Clients",
    });
  };

  return Leadsource;
};
