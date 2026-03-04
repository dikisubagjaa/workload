// src/database/models/Role.js
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    role_id: {
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
    slug: { 
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    menu_access: { 
      type: DataTypes.JSON, 
      allowNull: false,
      defaultValue: [], 
    },
    is_hod: {
      type: DataTypes.ENUM('true', 'false'),
      allowNull: false,
      defaultValue: 'false',
    },
    is_superadmin: {
      type: DataTypes.ENUM('true', 'false'),
      allowNull: false,
      defaultValue: 'false',
    },
    is_operational_director: {
      type: DataTypes.ENUM('true', 'false'),
      allowNull: false,
      defaultValue: 'false',
    },
    is_hrd: {
      type: DataTypes.ENUM('true', 'false'),
      allowNull: false,
      defaultValue: 'false',
    },
    is_ae: {
      type: DataTypes.ENUM('true', 'false'),
      allowNull: false,
      defaultValue: 'false',
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
  }, {
    tableName: 'role',
    timestamps: false,
    defaultScope: {
      where: {
        deleted: null,
        deleted_by: null
      }
    }
  });

  Role.associate = function(models) {
    models.Role.hasMany(models.User, { foreignKey: 'user_role', sourceKey: 'slug', as: 'User' });
  };

  return Role;
};
