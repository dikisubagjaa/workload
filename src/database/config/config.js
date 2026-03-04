// src/database/config/config.js
// Konfigurasi untuk sequelize-cli agar membaca .env / .env.production
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';
const dotenvPath = env === 'production'
    ? path.resolve('.env.production')
    : path.resolve('.env');

if (typeof dotenvPath === 'string' && dotenvPath && fs.existsSync(dotenvPath)) {
    dotenv.config({ path: dotenvPath, quiet: true });
} else {
    dotenv.config({ quiet: true });
}

const base = {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    timezone: process.env.DB_TIMEZONE || '+07:00',
    pool: {
        max: Number(process.env.DB_POOL_MAX || 10),
        min: Number(process.env.DB_POOL_MIN || 0),
        idle: Number(process.env.DB_POOL_IDLE || 10000),
        acquire: Number(process.env.DB_POOL_ACQUIRE || 30000),
    },
    dialectOptions: { dateStrings: true },
};

module.exports = {
    production: { ...base },
};
