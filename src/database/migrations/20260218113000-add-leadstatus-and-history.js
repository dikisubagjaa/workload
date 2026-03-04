"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const leadstatusTable = "leadstatus";
    let hasLeadstatusTable = true;
    try {
      await queryInterface.describeTable(leadstatusTable);
    } catch {
      hasLeadstatusTable = false;
    }

    if (!hasLeadstatusTable) {
      await queryInterface.createTable(leadstatusTable, {
        leadstatus_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        slug: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
        },
        title: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        ordered: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 1,
        },
        is_active: {
          type: Sequelize.ENUM("true", "false"),
          allowNull: false,
          defaultValue: "true",
        },
        created: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        updated: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        updated_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        deleted: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        deleted_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
      });
    }

    const now = Math.floor(Date.now() / 1000);
    const [existingStatuses] = await queryInterface.sequelize.query(
      "SELECT leadstatus_id FROM leadstatus LIMIT 1"
    );
    if (!Array.isArray(existingStatuses) || existingStatuses.length === 0) {
      await queryInterface.bulkInsert("leadstatus", [
        { slug: "new", title: "New", ordered: 1, is_active: "true", created: now, updated: now },
        { slug: "validated", title: "Validated", ordered: 2, is_active: "true", created: now, updated: now },
        { slug: "contacted", title: "Contacted", ordered: 3, is_active: "true", created: now, updated: now },
        { slug: "won", title: "Won", ordered: 4, is_active: "true", created: now, updated: now },
        { slug: "lost", title: "Lost", ordered: 5, is_active: "true", created: now, updated: now },
      ]);
    }

    const clientTable = await queryInterface.describeTable("client");
    if (!clientTable.leadstatus_id) {
      await queryInterface.addColumn("client", "leadstatus_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: null,
      });
    }

    const historyTable = "client_leadstatus_history";
    let hasHistoryTable = true;
    try {
      await queryInterface.describeTable(historyTable);
    } catch {
      hasHistoryTable = false;
    }

    if (!hasHistoryTable) {
      await queryInterface.createTable(historyTable, {
        leadstatus_history_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        client_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
        },
        from_leadstatus_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
        },
        to_leadstatus_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
        },
        changed_at: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        created: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        updated: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        updated_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        deleted: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        deleted_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
      });
      await queryInterface.addIndex(historyTable, ["client_id"]);
      await queryInterface.addIndex(historyTable, ["to_leadstatus_id"]);
      await queryInterface.addIndex(historyTable, ["changed_at"]);
    }

    await queryInterface.sequelize.query(`
      UPDATE client c
      LEFT JOIN leadstatus ls_won ON ls_won.slug = 'won'
      LEFT JOIN leadstatus ls_lost ON ls_lost.slug = 'lost'
      LEFT JOIN leadstatus ls_contacted ON ls_contacted.slug = 'contacted'
      LEFT JOIN leadstatus ls_validated ON ls_validated.slug = 'validated'
      LEFT JOIN leadstatus ls_new ON ls_new.slug = 'new'
      SET c.leadstatus_id = CASE
        WHEN c.won IS NOT NULL THEN ls_won.leadstatus_id
        WHEN c.lost IS NOT NULL THEN ls_lost.leadstatus_id
        WHEN c.contacted IS NOT NULL THEN ls_contacted.leadstatus_id
        WHEN c.lead_status = 'validate' THEN ls_validated.leadstatus_id
        ELSE ls_new.leadstatus_id
      END
      WHERE c.leadstatus_id IS NULL
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO client_leadstatus_history
        (client_id, from_leadstatus_id, to_leadstatus_id, changed_at, created, created_by, updated, updated_by, deleted, deleted_by)
      SELECT
        c.client_id,
        NULL,
        c.leadstatus_id,
        COALESCE(c.updated, c.created, UNIX_TIMESTAMP()),
        COALESCE(c.updated, c.created, UNIX_TIMESTAMP()),
        c.updated_by,
        COALESCE(c.updated, c.created, UNIX_TIMESTAMP()),
        c.updated_by,
        NULL,
        NULL
      FROM client c
      WHERE c.leadstatus_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM client_leadstatus_history h
          WHERE h.client_id = c.client_id
            AND h.deleted IS NULL
        )
    `);
  },

  async down(queryInterface) {
    const clientTable = await queryInterface.describeTable("client");
    if (clientTable.leadstatus_id) {
      await queryInterface.removeColumn("client", "leadstatus_id");
    }

    await queryInterface.dropTable("client_leadstatus_history");
    await queryInterface.dropTable("leadstatus");
  },
};
