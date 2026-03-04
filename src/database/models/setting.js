module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define('Setting', {
    node_id: {
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
    var_name: { 
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    form_type: { 
      type: DataTypes.ENUM('text','upload','texteditor','html'),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('home','website'),
      allowNull: false,
    },
    ordered: { 
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    published:{
        type: DataTypes.ENUM('publish','unpublish','review'),
        allowNull: true,
        defaultValue: 'publish'
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
      defaultValue: null,
    },
    deleted_by: {
      type: DataTypes.INTEGER, 
      allowNull: true,
      defaultValue: null,
    },
  }, {
    tableName: 'setting',
    timestamps: false,
  });

  return Setting;
};