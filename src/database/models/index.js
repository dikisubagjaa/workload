'use strict';

const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database'); // Pastikan path benar
const Sequelize = require('sequelize');

if (!sequelize) {
    throw new Error("❌ Koneksi database gagal! Pastikan konfigurasi benar.");
}

const db = {};
const modelsDir = path.join(process.cwd(), "src", "database", "models");

try {
    const files = fs.readdirSync(modelsDir);

    files
        .filter(file => (
            file !== "index.js" && // Jangan baca diri sendiri
            file.startsWith(".") === false && // Hindari file tersembunyi
            file.endsWith(".js") && // Pastikan hanya file .js
            !file.endsWith(".test.js") // Hindari file test
        ))
        .forEach(file => {
            try {
                const model = require('./' + file)(sequelize, Sequelize.DataTypes);
                db[model.name] = model;
            } catch (err) {
                console.error(`❌ Error importing model ${file}:`, err);
            }
        });


    // Inisialisasi relasi jika ada
    Object.keys(db).forEach(modelName => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });

} catch (err) {
    console.error("❌ Error reading models directory:", err);
}

// Tambahkan koneksi Sequelize ke `db` object
db.sequelize = sequelize;
db.Sequelize = Sequelize; // <--- Anda mengekspor KELAS Sequelize
module.exports = db;
