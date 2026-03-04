module.exports = (sequelize, DataTypes) => {
  
  const Pitching = sequelize.define(
      "Pitching",
      {
        pitching_id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER
        },
        uuid: {
          uniqueKey: true,
          type: DataTypes.UUID, // Gunakan UUID
          defaultValue: DataTypes.UUIDV4, // Generate otomatis
        },
        title: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        client_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue : 0
        },
        json_data: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        published: {
          type: DataTypes.ENUM("published", "unpublished", "drafted"),
          allowNull: false,
          defaultValue : "drafted"
        },
        created: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        created_by: {
          type: DataTypes.INTEGER,
            allowNull: false,
        },
        updated: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        deleted: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        deleted_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },   
      },
      {
          tableName: "pitching",
          timestamps: false,
      }
  );

  return Pitching;
};
