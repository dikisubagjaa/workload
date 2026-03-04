"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("client");
    if (!table.company_id) return;

    await queryInterface.sequelize.query(`
      UPDATE client c
      INNER JOIN company co
        ON co.deleted IS NULL
       AND LOWER(TRIM(co.title)) = LOWER(TRIM(c.client_name))
       AND co.legal_type = c.type
      SET c.company_id = co.company_id
      WHERE c.company_id IS NULL
    `);

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
        WHERE c.company_id IS NULL
          AND c.client_name IS NOT NULL
          AND TRIM(c.client_name) <> ''
        GROUP BY c.type, LOWER(TRIM(c.client_name))
      ) x
      LEFT JOIN company co
        ON co.deleted IS NULL
       AND LOWER(TRIM(co.title)) = LOWER(x.title)
       AND co.legal_type = x.legal_type
      WHERE co.company_id IS NULL
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

    const [rows] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) AS total
      FROM client
      WHERE company_id IS NULL
    `);
    const totalNull = Number(rows?.[0]?.total || 0);
    if (totalNull > 0) {
      throw new Error(`Cannot enforce NOT NULL on client.company_id because ${totalNull} rows are NULL.`);
    }

    try {
      await queryInterface.removeConstraint("client", "fk_client_company_id");
    } catch {
      // ignore if already removed
    }

    await queryInterface.changeColumn("client", "company_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.addConstraint("client", {
      fields: ["company_id"],
      type: "foreign key",
      name: "fk_client_company_id",
      references: {
        table: "company",
        field: "company_id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("client");
    if (!table.company_id) return;

    try {
      await queryInterface.removeConstraint("client", "fk_client_company_id");
    } catch {
      // ignore if already removed
    }

    await queryInterface.changeColumn("client", "company_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });

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
  },
};
