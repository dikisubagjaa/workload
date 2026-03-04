const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Client = sequelize.define('Client', {
        client_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        cover_url: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        client_name: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        meta_keyword: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        created: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        updated: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        deleted: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        deleted_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
        tableName: 'website_client',
        timestamps: false,
        defaultScope: {
            where: {
                deleted: null,
            },
        },
    });

    return Client;
};

