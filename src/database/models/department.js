module.exports = (sequelize, DataTypes) => {
  
    const Department= sequelize.define(
        "Department",
        {
              department_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
              },
              title: {
                type: DataTypes.STRING(100),
                allowNull: false,
              },
              description: {
                type: DataTypes.TEXT,
                allowNull: false,
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
            tableName: "department",
            timestamps: false,
            defaultScope: {
              where: {
                deleted: null,
                deleted_by: null
              }
            }
        }
    );
  
    return Department;
  };
  