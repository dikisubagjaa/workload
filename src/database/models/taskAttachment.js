module.exports = (sequelize, DataTypes) => {

  const TaskAttachment = sequelize.define(
    "TaskAttachment",
    {
      attachment_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      revision_id: {
        allowNull: true,
        type: DataTypes.INTEGER
      },
      task_id: {
        allowNull: true,
        type: DataTypes.INTEGER
      },
      is_star: {
        type: DataTypes.ENUM("true", "false"),
        allowNull: true,
      },

      filename: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      real_filename: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      user_payload: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      task_payload: {
        type: DataTypes.JSON,
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
      tableName: "task_attachment",
      timestamps: false,
      defaultScope: {
        where: {
          deleted: null,
          deleted_by: null
        }
      }
    }
  );


  TaskAttachment.associate = (models) => {
    TaskAttachment.hasMany(models.TaskAttachment, {
      foreignKey: "revision_id",
      as: "revisionFiles"
    });
    TaskAttachment.belongsTo(models.TaskAttachment, {
      foreignKey: "revision_id",
      as: "parentFile"
    });
  };
  return TaskAttachment;
};
