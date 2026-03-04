"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const clientTable = await queryInterface.describeTable("client");
    if (!clientTable.company_id) {
      await queryInterface.addColumn("client", "company_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      });
    }

    await queryInterface.sequelize.query(`
      INSERT INTO company (title, legal_type, created, created_by, updated, updated_by, deleted, deleted_by)
      SELECT
        x.title,
        x.legal_type,
        x.created,
        x.created_by,
        x.updated,
        x.updated_by,
        NULL AS deleted,
        NULL AS deleted_by
      FROM (
        SELECT
          TRIM(c.client_name) AS title,
          c.type AS legal_type,
          MIN(COALESCE(c.created, UNIX_TIMESTAMP())) AS created,
          MIN(COALESCE(c.created_by, 0)) AS created_by,
          MAX(COALESCE(c.updated, UNIX_TIMESTAMP())) AS updated,
          MAX(COALESCE(c.updated_by, 0)) AS updated_by
        FROM client c
        WHERE c.deleted IS NULL
          AND c.client_name IS NOT NULL
          AND TRIM(c.client_name) <> ''
        GROUP BY c.type, LOWER(TRIM(c.client_name))
      ) x
      LEFT JOIN company co
        ON co.deleted IS NULL
       AND LOWER(TRIM(co.title)) = LOWER(x.title)
       AND co.legal_type = x.legal_type
      AND co.company_id IS NULL
    `);

    await queryInterface.sequelize.query(`
      UPDATE client c
      INNER JOIN company co
        ON co.deleted IS NULL
       AND LOWER(TRIM(co.title)) = LOWER(TRIM(c.client_name))
       AND co.legal_type = c.type
      SET c.company_id = co.company_id
      WHERE c.company_id IS NULL
    `);

    const [indexRows] = await queryInterface.sequelize.query(`
      SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'client'
        AND INDEX_NAME = 'idx_client_company_id'
      LIMIT 1
    `);
    if (!indexRows.length) {
      await queryInterface.addIndex("client", ["company_id"], {
        name: "idx_client_company_id",
      });
    }

    const [fkRows] = await queryInterface.sequelize.query(`
      SELECT 1
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = DATABASE()
        AND TABLE_NAME = 'client'
        AND CONSTRAINT_NAME = 'fk_client_company_id'
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
      LIMIT 1
    `);
    if (!fkRows.length) {
      await queryInterface.addConstraint("client", {
        fields: ["company_id"],
        type: "foreign key",
        name: "fk_client_company_id",
        references: {
          table: "company",
          field: "company_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }
  },

  async down(queryInterface) {
    const clientTable = await queryInterface.describeTable("client");
    if (clientTable.company_id) {
      try {
        await queryInterface.removeConstraint("client", "fk_client_company_id");
      } catch {
        // ignore if constraint does not exist
      }
      try {
        await queryInterface.removeIndex("client", "idx_client_company_id");
      } catch {
        // ignore if index does not exist
      }
      await queryInterface.removeColumn("client", "company_id");
    }
  },
};
