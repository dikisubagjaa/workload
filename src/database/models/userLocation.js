module.exports = (sequelize, DataTypes) => {
  const UserLocation = sequelize.define('UserLocation', {
    location_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false,
    },
    longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false,
    },
    ip_address: {
        type: DataTypes.STRING(45), 
        allowNull: true,
        defaultValue: null,
    },
    device_info: {
        type: DataTypes.TEXT, 
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
  }, {
    tableName: 'user_location',
    timestamps: false, // Kita mengelola kolom waktu secara manual (recorded_at)
  });

  UserLocation.associate = function(models) {
    UserLocation.belongsTo(models.User, { foreignKey: 'user_id', as: 'User' });
  };

  return UserLocation;
};