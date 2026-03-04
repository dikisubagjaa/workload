"use strict";

module.exports = {
  async up(queryInterface) {
    const [nullRows] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) AS total
      FROM client
      WHERE company_id IS NULL
    `);
    const totalNull = Number(nullRows?.[0]?.total || 0);
    if (totalNull > 0) {
      throw new Error(`Cannot enforce client.company_id NOT NULL because ${totalNull} rows are NULL.`);
    }

    const [fkRows] = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'client'
        AND COLUMN_NAME = 'company_id'
        AND REFERENCED_TABLE_NAME = 'company'
    `);

    for (const row of fkRows || []) {
      const name = row.CONSTRAINT_NAME;
      if (!name) continue;
      await queryInterface.sequelize.query(`ALTER TABLE client DROP FOREIGN KEY \`${name}\``);
    }

    await queryInterface.sequelize.query(`
      ALTER TABLE client
      MODIFY COLUMN company_id INT NOT NULL
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE client
      ADD CONSTRAINT fk_client_company_id
      FOREIGN KEY (company_id) REFERENCES company(company_id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
    `);
  },

  async down(queryInterface) {
    try {
      await queryInterface.sequelize.query(`ALTER TABLE client DROP FOREIGN KEY fk_client_company_id`);
    } catch {
      // ignore
    }

    await queryInterface.sequelize.query(`
      ALTER TABLE client
      MODIFY COLUMN company_id INT NULL
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE client
      ADD CONSTRAINT fk_client_company_id
      FOREIGN KEY (company_id) REFERENCES company(company_id)
      ON UPDATE CASCADE
      ON DELETE SET NULL
    `);
  },
};
