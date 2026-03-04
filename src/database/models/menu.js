// src/database/models/Menu.js
module.exports = (sequelize, DataTypes) => {
  const Menu = sequelize.define(
    "Menu",
    {
      menu_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      path: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      icon: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      ordered: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.ENUM("true","false"),
        allowNull: true,
        defaultValue: "true",
      },
      is_show: {
        type: DataTypes.ENUM("true","false"),
        allowNull: true,
        defaultValue: "true",
      },
      type: {
        type: DataTypes.ENUM('dashboard', 'page'),
        allowNull: false,
        defaultValue: 'page',
        field: 'type',
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      created: {
        type: DataTypes.INTEGER, // Unix timestamp
        allowNull: false,
      },
      created_by: {
        type: DataTypes.INTEGER, // Unix timestamp
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
      tableName: "menu",
      timestamps: false,
      defaultScope: {
        where: {
          deleted: null,
          deleted_by: null
        }
      }
    }
  );

  Menu.associate = function (models) {
    Menu.hasMany(models.Menu, { foreignKey: "parent_id", as: "SubMenu" });
    Menu.belongsTo(models.Menu, { foreignKey: "parent_id", as: "ParentMenu" });
  };

  return Menu;
};
