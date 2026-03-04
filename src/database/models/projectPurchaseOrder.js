module.exports = (sequelize, DataTypes) => {
  
    const ProjectPurchaseOrder = sequelize.define(
        "ProjectPurchaseOrder",
        {
            po_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            pq_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: 'Foreign key to project_quotation'
            },
            po_number: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            po_doc: {
                type: DataTypes.STRING(255),
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
            tableName: "project_purchase_order",
            timestamps: false,
            defaultScope: {
              where: {
                deleted: null,
                deleted_by: null
              }
            }
        }
    );

    // Mendefinisikan relasi: Setiap PO milik satu Quotation
    ProjectPurchaseOrder.associate = function(models) {
        ProjectPurchaseOrder.belongsTo(models.ProjectQuotation, {
            foreignKey: 'pq_id',
            as: 'Quotation'
        });
    };
  
    return ProjectPurchaseOrder;
};
