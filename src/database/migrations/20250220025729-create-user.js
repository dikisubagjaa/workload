module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("users", {
            users_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            job_position: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            profile_pic: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            email: {
                type: Sequelize.STRING(100),
                allowNull: true,
                unique: true,
            },
            phone: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            join_date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            resign_date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            gender: {
                type: Sequelize.ENUM("female", "male"),
                allowNull: true,
            },
            user_type_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            status_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            fullname: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },

            birthdate: {
                type: Sequelize.DATEONLY,
                allowNull: true,
            },
            marital_status: {
                type: Sequelize.ENUM("single", "married", "widowed", "divorced"),
                allowNull: true,
            },
            nationality: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            address: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            address_on_identity: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            identity_number: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            identity_type: {
                type: Sequelize.ENUM("ktp", "passport", "sim"),
                allowNull: true,
            },
            npwp_number: {
                type: Sequelize.CHAR(16),
                allowNull: true,
            },
            tax_start_date: {
                type: Sequelize.DATEONLY,
                allowNull: true,
            },
            bank_code: {
                type: Sequelize.STRING(10),
                allowNull: true,
            },
            bank_account_number: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            beneficiary_name: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            currency: {
                type: Sequelize.ENUM("idr", "usd"),
                allowNull: true,
                defaultValue: "idr",
            },
            bpjs_tk_reg_date: {
                type: Sequelize.DATEONLY,
                allowNull: true,
            },
            bpjs_tk_term_date: {
                type: Sequelize.DATEONLY,
                allowNull: true,
            },
            bpjs_tk_number: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            pension_number: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            bpjs_kes_reg_date: {
                type: Sequelize.DATEONLY,
                allowNull: true,
            },
            bpjs_kes_term_date: {
                type: Sequelize.DATEONLY,
                allowNull: true,
            },
            bpjs_kes_number: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            emergency_fullname: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            emergency_relationship: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            emergency_contact: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            emergency_address: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            created: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            created_by: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            updated: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            updated_by: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            deleted: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            deleted_by: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("users");
    },
};
