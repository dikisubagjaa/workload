module.exports = (sequelize, DataTypes) => {
  const Leadstatus = sequelize.define(
    "Leadstatus",
    {
      leadstatus_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(50),
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
      tableName: "leadstatus",
      timestamps: false,
      defaultScope: {
        where: {
          deleted: null,
          deleted_by: null,
        },
      },
    }
  );

  Leadstatus.associate = function associate(models) {
    Leadstatus.hasMany(models.Client, {
      foreignKey: "leadstatus_id",
      as: "Clients",
    });
  };

  return Leadstatus;
};
