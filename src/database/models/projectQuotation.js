module.exports = (sequelize, DataTypes) => {
  
    const ProjectQuotation = sequelize.define(
        "ProjectQuotation",
        {
            pq_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            project_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            quotation_number: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            quotation_doc: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            created: {
                type: DataTypes.INTEGER, // Diubah ke INTEGER agar konsisten
                allowNull: false,
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            updated: {
                type: DataTypes.INTEGER, // Diubah ke INTEGER agar konsisten
                allowNull: false,
            },
            updated_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            deleted: {
                type: DataTypes.INTEGER, // Diubah ke INTEGER agar konsisten
                allowNull: true,
            },
            deleted_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            tableName: "project_quotation",
            timestamps: false,
            defaultScope: {
              where: {
                deleted: null,
                deleted_by: null
              }
            }
        }
    );

    // Mendefinisikan relasi: Satu Quotation bisa memiliki banyak PO
    ProjectQuotation.associate = function(models) {
        ProjectQuotation.hasMany(models.ProjectPurchaseOrder, {
            foreignKey: 'pq_id',
            as: 'PurchaseOrderByQuotation'
        });
    };
  
    return ProjectQuotation;
};
