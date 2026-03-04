// src/database/config/database.js
// Runtime koneksi Sequelize untuk aplikasi (Next.js API routes, dsb.)
const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');            // biar pasti pakai driver mysql2
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';
const dotenvPath = env === 'production'
    ? path.resolve('.env.production')
    : path.resolve('.env');

// load .env (kalau file ada)
if (typeof dotenvPath === 'string' && dotenvPath && fs.existsSync(dotenvPath)) {
    dotenv.config({ path: dotenvPath, quiet: true });
} else {
    dotenv.config({ quiet: true });
}

// Buat instance Sequelize dari ENV
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        dialect: process.env.DB_DIALECT || 'mysql',  // atau 'mariadb'
        dialectModule: mysql2,
        logging: process.env.DB_LOGGING === 'true' ? console.log : false,
        timezone: process.env.DB_TIMEZONE || '+07:00',
        pool: {
            max: Number(process.env.DB_POOL_MAX || 10),
            min: Number(process.env.DB_POOL_MIN || 0),
            idle: Number(process.env.DB_POOL_IDLE || 10000),
            acquire: Number(process.env.DB_POOL_ACQUIRE || 30000),
        },
        dialectOptions: {
            dateStrings: true,
        },
    }
);

module.exports = sequelize;
