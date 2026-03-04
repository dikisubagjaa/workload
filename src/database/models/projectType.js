module.exports = (sequelize, DataTypes) => {
  
    const ProjectType= sequelize.define(
        "ProjectType",
        {
              pt_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
              },
              
              title: {
                type: DataTypes.STRING(100),
                allowNull: false,
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
            tableName: "project_type",
            timestamps: false,
            defaultScope: {
              where: {
                deleted: null,
                deleted_by: null
              }
            }
        }
    );
  
    return ProjectType;
  };
  