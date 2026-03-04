"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = "leadsource";
    let hasLeadsourceTable = true;
    try {
      await queryInterface.describeTable(tableName);
    } catch {
      hasLeadsourceTable = false;
    }

    if (!hasLeadsourceTable) {
      await queryInterface.createTable(tableName, {
        leadsource_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        title: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true,
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
    const [existingSources] = await queryInterface.sequelize.query(
      "SELECT leadsource_id FROM leadsource LIMIT 1"
    );
    if (!Array.isArray(existingSources) || existingSources.length === 0) {
      await queryInterface.bulkInsert("leadsource", [
        { title: "Facebook", ordered: 1, is_active: "true", created: now, updated: now },
        { title: "WhatsApp", ordered: 2, is_active: "true", created: now, updated: now },
        { title: "LinkedIn", ordered: 3, is_active: "true", created: now, updated: now },
        { title: "Instagram", ordered: 4, is_active: "true", created: now, updated: now },
        { title: "Own Research", ordered: 5, is_active: "true", created: now, updated: now },
      ]);
    }

    const clientTable = await queryInterface.describeTable("client");
    if (!clientTable.leadsource_id) {
      await queryInterface.addColumn("client", "leadsource_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: null,
      });
    }

    const assignHistoryTable = "client_assign_history";
    let hasAssignHistoryTable = true;
    try {
      await queryInterface.describeTable(assignHistoryTable);
    } catch {
      hasAssignHistoryTable = false;
    }

    if (!hasAssignHistoryTable) {
      await queryInterface.createTable(assignHistoryTable, {
        assign_history_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        client_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
        },
        from_assign_to: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
        },
        to_assign_to: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
        },
        assigned_at: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        moved_at: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: null,
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

      await queryInterface.addIndex(assignHistoryTable, ["client_id"]);
      await queryInterface.addIndex(assignHistoryTable, ["to_assign_to"]);
      await queryInterface.addIndex(assignHistoryTable, ["moved_at"]);

      await queryInterface.sequelize.query(`
        INSERT INTO client_assign_history
          (client_id, from_assign_to, to_assign_to, assigned_at, moved_at, created, created_by, updated, updated_by, deleted, deleted_by)
        SELECT
          c.client_id,
          NULL,
          c.assign_to,
          COALESCE(c.updated, c.created, UNIX_TIMESTAMP()),
          NULL,
          COALESCE(c.updated, c.created, UNIX_TIMESTAMP()),
          c.updated_by,
          COALESCE(c.updated, c.created, UNIX_TIMESTAMP()),
          c.updated_by,
          NULL,
          NULL
        FROM client c
        WHERE c.assign_to IS NOT NULL
      `);
    }
  },

  async down(queryInterface) {
    const clientTable = await queryInterface.describeTable("client");
    if (clientTable.leadsource_id) {
      await queryInterface.removeColumn("client", "leadsource_id");
    }

    await queryInterface.dropTable("client_assign_history");
    await queryInterface.dropTable("leadsource");
  },
};
