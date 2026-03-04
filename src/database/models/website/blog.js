const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Blog = sequelize.define('Blog', {
        blog_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        category: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        cover_url: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        meta_title: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        meta_description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        meta_keyword: {
            type: DataTypes.STRING(255),
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
        tableName: 'website_blog',
        timestamps: false,
        defaultScope: {
            where: {
                deleted: null
            },
        },
    });

    return Blog;
};
