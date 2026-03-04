module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define(
    "Company",
    {
      company_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      legal_type: {
        type: DataTypes.ENUM("PT", "CV", "UNOFFICIAL"),
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: "company",
      timestamps: false,
      defaultScope: {
        where: {
          deleted: null,
          deleted_by: null,
        },
      },
    }
  );

  Company.associate = function associate(models) {
    Company.hasMany(models.Client, {
      foreignKey: "company_id",
      as: "Clients",
    });
  };

  return Company;
};
