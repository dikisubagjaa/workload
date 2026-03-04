const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Service = sequelize.define("Service", {
        service_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        created: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        deleted: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        deleted_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        updated: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        subtitle: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        text_list: {
            type: DataTypes.JSON,
            allowNull: true
        },
        cover_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    },
        {
            tableName: "website_service",
            timestamps: false,
            defaultScope: {
                where: {
                    deleted: null,
                },
            },
        }
    );

    return Service;
};
