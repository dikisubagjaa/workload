import db from "@/database/models";

const {
  Client,
  Brand,
  Company,
  ClientActivity,
  ClientAssignHistory,
  ClientLeadstatusHistory,
  Leadsource,
  Leadstatus,
  User,
  Sequelize,
} = db;
const { Op } = Sequelize;

export function findAllClients() {
  return Client.findAll({
    where: { deleted: null, company_id: { [Op.ne]: null } },
    include: [
      {
        model: Company,
        as: "Company",
        attributes: ["company_id", "title", "legal_type", "address"],
        required: true,
      },
      {
        model: Leadsource,
        as: "Leadsource",
        attributes: ["leadsource_id", "title"],
        required: false,
      },
      {
        model: Leadstatus,
        as: "Leadstatus",
        attributes: ["leadstatus_id", "slug", "title"],
        required: false,
      },
      {
        model: User,
        as: "AssignTo",
        attributes: ["user_id", "fullname", "email", "phone", "profile_pic"],
        required: false,
      },
    ],
    order: [["client_id", "ASC"]],
  });
}

export function findClientById(clientId) {
  return Client.findByPk(clientId, {
    include: [
      {
        model: Company,
        as: "Company",
        attributes: ["company_id", "title", "legal_type", "address"],
        required: true,
      },
      {
        model: Leadsource,
        as: "Leadsource",
        attributes: ["leadsource_id", "title"],
        required: false,
      },
      {
        model: Leadstatus,
        as: "Leadstatus",
        attributes: ["leadstatus_id", "slug", "title"],
        required: false,
      },
      {
        model: User,
        as: "AssignTo",
        attributes: ["user_id", "fullname", "email", "phone", "profile_pic"],
        required: false,
      },
    ],
  });
}

export function findCompanyById(companyId) {
  return Company.findOne({
    where: { company_id: Number(companyId), deleted: null },
    attributes: ["company_id", "title", "legal_type", "address"],
  });
}

export function updateCompanyById(companyId, updates, options = {}) {
  return Company.update(updates, {
    where: { company_id: Number(companyId), deleted: null },
    ...options,
  });
}

export function findClientByNameExact(clientName, excludeClientId = null) {
  const cleanName = String(clientName || "").trim();
  if (!cleanName) return Promise.resolve(null);

  const where = {
    deleted: null,
    [Op.and]: [Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("client_name")), cleanName.toLowerCase())],
  };
  if (excludeClientId != null) {
    where.client_id = { [Op.ne]: Number(excludeClientId) || -1 };
  }
  return Client.findOne({ where, attributes: ["client_id", "client_name", "client_type"] });
}

export function createClient(payload, options = {}) {
  return Client.create(payload, options);
}

export function updateClientById(clientId, updates, options = {}) {
  return Client.update(updates, { where: { client_id: clientId }, ...options });
}

export function updateClientInstance(client, updates) {
  return client.update(updates);
}

export function findBrandsByIds(ids) {
  return Brand.findAll({ where: { brand_id: ids }, attributes: ["brand_id", "title"] });
}

export function findClientActivities(clientId) {
  return ClientActivity.findAll({
    where: { client_id: clientId, deleted: null },
    include: [{ model: User, as: "creator", attributes: ["user_id", "fullname", "profile_pic", "email"] }],
    order: [["created", "DESC"], ["activity_id", "DESC"]],
  });
}

export function findClientActivityById(activityId) {
  return ClientActivity.findByPk(activityId);
}

export function createClientActivity(payload) {
  return ClientActivity.create(payload);
}

export function updateClientActivityById(activityId, updates) {
  return ClientActivity.update(updates, { where: { activity_id: activityId } });
}

export function findAllLeadSources() {
  return Leadsource.findAll({
    where: { deleted: null, is_active: "true" },
    order: [["ordered", "ASC"], ["leadsource_id", "ASC"]],
  });
}

export function findAllLeadstatuses() {
  return Leadstatus.findAll({
    where: { deleted: null, is_active: "true" },
    order: [["ordered", "ASC"], ["leadstatus_id", "ASC"]],
  });
}

export function createClientAssignHistory(payload, options = {}) {
  return ClientAssignHistory.create(payload, options);
}

export function closeOpenClientAssignHistory(clientId, movedAt, userId, options = {}) {
  return ClientAssignHistory.update(
    {
      moved_at: movedAt,
      updated: movedAt,
      updated_by: userId || null,
    },
    {
      where: {
        client_id: Number(clientId),
        moved_at: null,
        deleted: null,
      },
      ...options,
    }
  );
}

export function findClientAssignHistory(clientId) {
  return ClientAssignHistory.findAll({
    where: {
      client_id: Number(clientId),
      deleted: null,
    },
    include: [
      {
        model: User,
        as: "FromAssignee",
        attributes: ["user_id", "fullname", "email"],
        required: false,
      },
      {
        model: User,
        as: "ToAssignee",
        attributes: ["user_id", "fullname", "email"],
        required: false,
      },
    ],
    order: [["assigned_at", "DESC"], ["assign_history_id", "DESC"]],
  });
}

export function createClientLeadstatusHistory(payload, options = {}) {
  return ClientLeadstatusHistory.create(payload, options);
}

export function findClientLeadstatusHistory(clientId) {
  return ClientLeadstatusHistory.findAll({
    where: {
      client_id: Number(clientId),
      deleted: null,
    },
    include: [
      {
        model: Leadstatus,
        as: "FromLeadstatus",
        attributes: ["leadstatus_id", "slug", "title"],
        required: false,
      },
      {
        model: Leadstatus,
        as: "ToLeadstatus",
        attributes: ["leadstatus_id", "slug", "title"],
        required: false,
      },
      {
        model: User,
        as: "Changer",
        attributes: ["user_id", "fullname", "email"],
        required: false,
      },
    ],
    order: [["changed_at", "DESC"], ["leadstatus_history_id", "DESC"]],
  });
}
