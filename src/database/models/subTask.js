module.exports = (sequelize, DataTypes) => {
  
    const SubTask = sequelize.define(
        "SubTask",
        {
          ts_id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
          },
          task_id: {
            allowNull: false,
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
            type: DataTypes.JSON,
              allowNull: false,
          },
          updated: {
            type: DataTypes.INTEGER,
            allowNull: false,
          },
          updated_by: {
              type: DataTypes.JSON,
              allowNull: false,
          },
          deleted: {
              type: DataTypes.INTEGER,
              allowNull: true,
          },
          deleted_by: {
              type: DataTypes.JSON,
              allowNull: true,
          },
        },
        {
            tableName: "task_subtask",
            timestamps: false,
            defaultScope: {
              where: {
                deleted: null,
                deleted_by: null
              }
            }
        }
    );

     // ✨ PERBAIKAN: Menambahkan asosiasi `belongsTo`
    SubTask.associate = function(models) { 
        SubTask.belongsTo(models.Task, {
            foreignKey: 'task_id',
            as: 'TaskParent' // Alias yang digunakan untuk mengambil task induk
        });
    };
  
    return SubTask;
  };
  