import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { nowUnix } from "@/utils/dateHelpers";
import db from "@/database/models";
import {
  findAllClients,
  findClientById,
  findClientByNameExact,
  createClient,
  updateClientById,
  updateClientInstance,
  findClientActivities,
  findClientActivityById,
  createClientActivity,
  updateClientActivityById,
  findAllLeadSources,
  findAllLeadstatuses,
  createClientAssignHistory,
  closeOpenClientAssignHistory,
  findClientAssignHistory,
  createClientLeadstatusHistory,
  findClientLeadstatusHistory,
  findCompanyById,
  updateCompanyById,
} from "@/server/queries/clientQueries";

dayjs.extend(utc);

function formatClientDates(clientJson) {
  return {
    ...clientJson,
    created: clientJson.created ? dayjs.unix(clientJson.created) : null,
    updated: clientJson.updated ? dayjs.unix(clientJson.updated) : null,
    deleted: clientJson.deleted ? dayjs.unix(clientJson.deleted) : null,
    created_at: clientJson.created ? dayjs.unix(clientJson.created).toISOString() : null,
    updated_at: clientJson.updated ? dayjs.unix(clientJson.updated).toISOString() : null,
    deleted_at: clientJson.deleted ? dayjs.unix(clientJson.deleted).toISOString() : null,
  };
}

function toUnix(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (Number.isFinite(n)) return n > 1e12 ? Math.floor(n / 1000) : Math.floor(n);
  const d = dayjs(v);
  return d.isValid() ? d.unix() : null;
}

function toNullableInt(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.floor(n);
}

function toAssigneeLabel(user) {
  if (!user) return "-";
  return user.fullname || user.email || (user.user_id ? `User #${user.user_id}` : "-");
}

function pickBrandText(raw) {
  if (raw == null) return "";
  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return "";
    if ((s.startsWith("[") && s.endsWith("]")) || (s.startsWith("{") && s.endsWith("}"))) {
      try {
        return pickBrandText(JSON.parse(s));
      } catch {
        return s;
      }
    }
    return s;
  }
  if (typeof raw === "number") return String(raw);
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const txt = pickBrandText(item);
      if (txt) return txt;
    }
    return "";
  }
  if (typeof raw === "object") {
    return String(raw.title || raw.label || raw.name || raw.brand_title || raw.brand_name || "").trim();
  }
  return "";
}

function normalizeBrandText(raw) {
  const v = pickBrandText(raw);
  return v ? v.slice(0, 255) : "";
}

function computeLeadstatusSlug({ lead_status, contacted, won, lost }) {
  if (toUnix(won)) return "won";
  if (toUnix(lost)) return "lost";
  if (toUnix(contacted)) return "contacted";
  const status = String(lead_status || "").toLowerCase();
  if (status === "validate") return "validated";
  if (status === "won") return "won";
  if (status === "lost") return "lost";
  return "new";
}

async function getLeadstatusMapBySlug() {
  const rows = await findAllLeadstatuses();
  const map = new Map();
  for (const row of rows) {
    const j = row?.toJSON ? row.toJSON() : row;
    const key = String(j?.slug || "").trim().toLowerCase();
    if (!key) continue;
    map.set(key, j);
  }
  return map;
}

function normalizeClientFlags(body, now, existing = null) {
  const updates = {};
  const incomingType = body.client_type != null ? String(body.client_type).trim().toLowerCase() : null;
  const incomingStatus = body.lead_status != null ? String(body.lead_status).trim().toLowerCase() : null;
  const hasContactedInput = body.contacted !== undefined || body.contacted_at !== undefined;
  const hasWonInput = body.won !== undefined || body.won_at !== undefined;
  const hasLostInput = body.lost !== undefined || body.lost_at !== undefined;

  if (incomingType && (incomingType === "leads" || incomingType === "customer")) {
    updates.client_type = incomingType;
  } else if (!existing) {
    updates.client_type = "customer";
  }

  if (incomingStatus && ["new", "validate", "lost", "won"].includes(incomingStatus)) {
    updates.lead_status = incomingStatus;
  }

  if (body.follow_up !== undefined || body.follow_up_at !== undefined) {
    updates.follow_up = toUnix(body.follow_up ?? body.follow_up_at);
  }
  if (hasContactedInput) {
    updates.contacted = toUnix(body.contacted ?? body.contacted_at);
  }
  if (hasWonInput) {
    updates.won = toUnix(body.won ?? body.won_at);
  }
  if (hasLostInput) {
    updates.lost = toUnix(body.lost ?? body.lost_at);
  }

  // If caller changes step timestamps without lead_status, keep status in sync.
  if (!updates.lead_status && (hasContactedInput || hasWonInput || hasLostInput)) {
    const nextContacted = hasContactedInput ? updates.contacted : (existing?.contacted ?? null);
    const nextWon = hasWonInput ? updates.won : (existing?.won ?? null);
    const nextLost = hasLostInput ? updates.lost : (existing?.lost ?? null);

    if (nextWon) {
      updates.lead_status = "won";
    } else if (nextLost) {
      updates.lead_status = "lost";
    } else if (nextContacted) {
      updates.lead_status = "validate";
    } else {
      updates.lead_status = "new";
    }
  }

  const finalType = updates.client_type ?? existing?.client_type ?? "customer";
  const finalStatus = updates.lead_status ?? existing?.lead_status ?? null;
  const finalWon = hasWonInput ? updates.won : (existing?.won ?? null);
  const finalLost = hasLostInput ? updates.lost : (existing?.lost ?? null);

  if (finalStatus === "won") {
    updates.client_type = "customer";
    if (!hasWonInput && !finalWon) updates.won = now;
  }

  if (finalStatus === "lost" && !hasLostInput && !finalLost) {
    updates.lost = now;
  }

  if (!existing && finalType === "customer") {
    updates.lead_status = updates.lead_status || "won";
    updates.won = updates.won || now;
  }

  return updates;
}

export async function listClients() {
  const clients = await findAllClients();

  const formattedClients = clients.map((client) => {
    const clientJson = client.toJSON();
    return formatClientDates({
      ...clientJson,
      brand: normalizeBrandText(clientJson.brand),
      address: clientJson?.Company?.address ?? null,
    });
  });

  return { clients: formattedClients };
}

export async function createClientFromBody(body, currentUser) {
  const now = nowUnix();
  const companyId = toNullableInt(body.company_id);
  if (!companyId) {
    return {
      httpStatus: 400,
      msg: "Company is required.",
    };
  }
  let selectedCompany = null;

  selectedCompany = await findCompanyById(companyId);
  if (!selectedCompany) {
    return {
      httpStatus: 400,
      msg: "Selected company is not found.",
    };
  }

  const resolvedClientName = String(body.client_name || selectedCompany?.title || "").trim();
  if (!resolvedClientName || !body.pic_name || !body.pic_email || !body.pic_phone) {
    return {
      httpStatus: 400,
      msg: "Company, PIC Name, Email, and Phone are required.",
    };
  }

  const finalBrandForDb = normalizeBrandText(body.brand);
  if (!finalBrandForDb) {
    return { httpStatus: 400, msg: "Brand is required." };
  }

  const assignToId = toNullableInt(body.assign_to);
  const normalizedFlags = normalizeClientFlags(body, now, null);
  const leadstatusMap = await getLeadstatusMapBySlug();
  const leadstatusSlug = computeLeadstatusSlug({
    lead_status: normalizedFlags?.lead_status,
    contacted: normalizedFlags?.contacted,
    won: normalizedFlags?.won,
    lost: normalizedFlags?.lost,
  });
  const leadstatusId = toNullableInt(leadstatusMap.get(leadstatusSlug)?.leadstatus_id);
  const t = await db.sequelize.transaction();
  let newClient;
  try {
    if (body.address !== undefined) {
      await updateCompanyById(
        companyId,
        {
          address: String(body.address || "").trim() || null,
          updated: now,
          updated_by: currentUser.user_id,
        },
        { transaction: t }
      );
    }

    newClient = await createClient(
      {
        client_name: resolvedClientName,
        brand: finalBrandForDb,
        company_id: companyId,
        division: body.division || null,
        pic_name: body.pic_name,
        pic_email: body.pic_email,
        pic_phone: body.pic_phone,
        finance_name: body.finance_name || null,
        finance_phone: body.finance_phone || null,
        finance_email: body.finance_email || null,
        assign_to: assignToId,
        leadsource_id: toNullableInt(body.leadsource_id),
        leadstatus_id: leadstatusId,
        created: now,
        created_by: currentUser.user_id,
        updated: now,
        updated_by: currentUser.user_id,
        ...normalizedFlags,
      },
      { transaction: t }
    );

    if (assignToId) {
      await createClientAssignHistory(
        {
          client_id: Number(newClient.client_id),
          from_assign_to: null,
          to_assign_to: assignToId,
          assigned_at: now,
          moved_at: null,
          created: now,
          created_by: currentUser.user_id,
          updated: now,
          updated_by: currentUser.user_id,
        },
        { transaction: t }
      );
    }

    if (leadstatusId) {
      await createClientLeadstatusHistory(
        {
          client_id: Number(newClient.client_id),
          from_leadstatus_id: null,
          to_leadstatus_id: leadstatusId,
          changed_at: now,
          created: now,
          created_by: currentUser.user_id,
          updated: now,
          updated_by: currentUser.user_id,
        },
        { transaction: t }
      );
    }

    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }

  return { httpStatus: 201, msg: "Client created successfully!", client: newClient.toJSON() };
}

export async function getClientById(clientId) {
  const client = await findClientById(clientId);

  if (!client) {
    return { httpStatus: 404, msg: "Client not found." };
  }

  const clientJson = client.toJSON();
  const formattedClient = formatClientDates({
    ...clientJson,
    brand: normalizeBrandText(clientJson.brand),
    address: clientJson?.Company?.address ?? null,
  });

  return { client: formattedClient };
}

export async function updateClientFromBody(clientId, body, currentUser) {
  const now = nowUnix();

  const clientToUpdate = await findClientById(clientId);
  if (!clientToUpdate) {
    return { httpStatus: 404, msg: "Client not found." };
  }

  const incomingCompanyId = body.company_id !== undefined ? toNullableInt(body.company_id) : undefined;
  if (body.company_id !== undefined && incomingCompanyId == null) {
    return { httpStatus: 400, msg: "Company is required." };
  }
  let selectedCompany = null;
  if (incomingCompanyId !== undefined && incomingCompanyId !== null) {
    selectedCompany = await findCompanyById(incomingCompanyId);
    if (!selectedCompany) {
      return { httpStatus: 400, msg: "Selected company is not found." };
    }
  }

  if (body.client_name !== undefined) {
    const nextName = String(body.client_name || "").trim();
    if (!incomingCompanyId) {
      const duplicate = await findClientByNameExact(nextName, clientId);
      if (duplicate) {
        return { httpStatus: 409, msg: "Client/leads with this name already exists." };
      }
    }
  }

  const updatedData = {
    updated: now,
    updated_by: currentUser.user_id,
  };
  const existingClientJson = clientToUpdate.toJSON ? clientToUpdate.toJSON() : clientToUpdate;
  const prevAssignTo = toNullableInt(existingClientJson?.assign_to);
  const prevLeadstatusId = toNullableInt(existingClientJson?.leadstatus_id);

  if (body.client_name !== undefined) updatedData.client_name = body.client_name;
  if (incomingCompanyId !== undefined) updatedData.company_id = incomingCompanyId;
  if (body.client_name === undefined && selectedCompany) updatedData.client_name = selectedCompany.title;

  if (body.brand !== undefined) {
    const brandText = normalizeBrandText(body.brand);
    if (!brandText) return { httpStatus: 400, msg: "Brand is required." };
    updatedData.brand = brandText;
  }

  if (body.division !== undefined) updatedData.division = body.division;
  if (body.pic_name !== undefined) updatedData.pic_name = body.pic_name;
  if (body.pic_phone !== undefined) updatedData.pic_phone = body.pic_phone;
  if (body.pic_email !== undefined) updatedData.pic_email = body.pic_email;
  if (body.finance_name !== undefined) updatedData.finance_name = body.finance_name;
  if (body.finance_phone !== undefined) updatedData.finance_phone = body.finance_phone;
  if (body.finance_email !== undefined) updatedData.finance_email = body.finance_email;
  if (body.assign_to !== undefined) updatedData.assign_to = toNullableInt(body.assign_to);
  if (body.leadsource_id !== undefined) updatedData.leadsource_id = toNullableInt(body.leadsource_id);
  Object.assign(updatedData, normalizeClientFlags(body, now, existingClientJson));
  const leadstatusMap = await getLeadstatusMapBySlug();
  const nextLeadstatusSlug = computeLeadstatusSlug({
    lead_status:
      Object.prototype.hasOwnProperty.call(updatedData, "lead_status")
        ? updatedData.lead_status
        : existingClientJson?.lead_status,
    contacted:
      Object.prototype.hasOwnProperty.call(updatedData, "contacted")
        ? updatedData.contacted
        : existingClientJson?.contacted,
    won:
      Object.prototype.hasOwnProperty.call(updatedData, "won")
        ? updatedData.won
        : existingClientJson?.won,
    lost:
      Object.prototype.hasOwnProperty.call(updatedData, "lost")
        ? updatedData.lost
        : existingClientJson?.lost,
  });
  const nextLeadstatusId = toNullableInt(leadstatusMap.get(nextLeadstatusSlug)?.leadstatus_id);
  if (nextLeadstatusId) updatedData.leadstatus_id = nextLeadstatusId;

  const t = await db.sequelize.transaction();
  let updatedCount = 0;
  try {
    if (body.address !== undefined) {
      const companyToUpdateId = toNullableInt(
        incomingCompanyId !== undefined ? incomingCompanyId : existingClientJson?.company_id
      );
      if (!companyToUpdateId) {
        await t.rollback();
        return { httpStatus: 400, msg: "Company is required." };
      }
      await updateCompanyById(
        companyToUpdateId,
        {
          address: String(body.address || "").trim() || null,
          updated: now,
          updated_by: currentUser.user_id,
        },
        { transaction: t }
      );
    }

    [updatedCount] = await updateClientById(clientId, updatedData, { transaction: t });

    const nextAssignTo =
      Object.prototype.hasOwnProperty.call(updatedData, "assign_to")
        ? toNullableInt(updatedData.assign_to)
        : prevAssignTo;

    if (nextAssignTo !== prevAssignTo) {
      await closeOpenClientAssignHistory(clientId, now, currentUser.user_id, { transaction: t });
      if (nextAssignTo) {
        await createClientAssignHistory(
          {
            client_id: Number(clientId),
            from_assign_to: prevAssignTo,
            to_assign_to: nextAssignTo,
            assigned_at: now,
            moved_at: null,
            created: now,
            created_by: currentUser.user_id,
            updated: now,
            updated_by: currentUser.user_id,
          },
          { transaction: t }
        );
      }
    }

    if (nextLeadstatusId && nextLeadstatusId !== prevLeadstatusId) {
      await createClientLeadstatusHistory(
        {
          client_id: Number(clientId),
          from_leadstatus_id: prevLeadstatusId,
          to_leadstatus_id: nextLeadstatusId,
          changed_at: now,
          created: now,
          created_by: currentUser.user_id,
          updated: now,
          updated_by: currentUser.user_id,
        },
        { transaction: t }
      );
    }

    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }

  if (updatedCount === 0) {
    return { msg: "No changes applied to client or client not found." };
  }

  const updatedClient = await findClientById(clientId);
  return { msg: "Client updated successfully!", client: updatedClient?.toJSON ? updatedClient.toJSON() : updatedClient };
}

export async function deleteClient(clientId, currentUser) {
  if (currentUser.user_role !== "admin" && currentUser.user_role !== "superadmin") {
    return { httpStatus: 403, msg: "Unauthorized" };
  }

  const now = nowUnix();

  const clientToDelete = await findClientById(clientId);
  if (!clientToDelete) {
    return { httpStatus: 404, msg: "Client not found." };
  }

  await updateClientInstance(clientToDelete, {
    deleted: now,
    deleted_by: currentUser.user_id,
  });

  return { msg: "Client soft-deleted successfully!" };
}

export async function listLeadSources() {
  const leadsources = await findAllLeadSources();
  return {
    leadsources: leadsources.map((x) => (x?.toJSON ? x.toJSON() : x)),
  };
}

export async function listLeadstatuses() {
  const leadstatuses = await findAllLeadstatuses();
  return {
    leadstatuses: leadstatuses.map((x) => (x?.toJSON ? x.toJSON() : x)),
  };
}

export async function listClientAssignHistoryByClientId(clientId) {
  const client = await findClientById(clientId);
  if (!client || client.deleted) return { httpStatus: 404, msg: "Client not found." };

  const rows = await findClientAssignHistory(clientId);
  const assignHistory = rows.map((r) => {
    const j = r?.toJSON ? r.toJSON() : r;
    return {
      ...j,
      from_assignee_name: toAssigneeLabel(j.FromAssignee),
      to_assignee_name: toAssigneeLabel(j.ToAssignee),
      assigned_at_iso: j.assigned_at ? dayjs.unix(Number(j.assigned_at)).toISOString() : null,
      moved_at_iso: j.moved_at ? dayjs.unix(Number(j.moved_at)).toISOString() : null,
    };
  });
  return { assignHistory };
}

export async function listClientLeadstatusHistoryByClientId(clientId) {
  const client = await findClientById(clientId);
  if (!client || client.deleted) return { httpStatus: 404, msg: "Client not found." };

  const rows = await findClientLeadstatusHistory(clientId);
  const leadstatusHistory = rows.map((r) => {
    const j = r?.toJSON ? r.toJSON() : r;
    const changer = j?.Changer || null;
    return {
      ...j,
      from_leadstatus_title: j?.FromLeadstatus?.title || "-",
      to_leadstatus_title: j?.ToLeadstatus?.title || "-",
      changer_name: changer?.fullname || changer?.email || "-",
      changed_at_iso: j.changed_at ? dayjs.unix(Number(j.changed_at)).toISOString() : null,
    };
  });
  return { leadstatusHistory };
}

export async function listClientActivitiesByClientId(clientId) {
  const client = await findClientById(clientId);
  if (!client || client.deleted) return { httpStatus: 404, msg: "Client not found." };

  const rows = await findClientActivities(clientId);
  const activities = rows.map((r) => {
    const j = r.toJSON();
    return {
      ...j,
      file_url: j.file_name ? `/api/file?folder=client-activity&file=${encodeURIComponent(j.file_name)}` : null,
    };
  });

  return { activities };
}

export async function addClientActivityNote(clientId, body, currentUser) {
  const client = await findClientById(clientId);
  if (!client || client.deleted) return { httpStatus: 404, msg: "Client not found." };

  const note = String(body?.note || "").trim();
  if (!note) return { httpStatus: 400, msg: "Activity note is required." };

  const now = nowUnix();
  const activity = await createClientActivity({
    client_id: Number(clientId),
    type: "note",
    note,
    created: now,
    created_by: currentUser.user_id,
    updated: now,
    updated_by: currentUser.user_id,
  });

  return { httpStatus: 201, msg: "Activity note added.", activity: activity.toJSON() };
}

export async function addClientActivityFile(clientId, fileMeta, body, currentUser) {
  const client = await findClientById(clientId);
  if (!client || client.deleted) return { httpStatus: 404, msg: "Client not found." };

  const now = nowUnix();
  const activity = await createClientActivity({
    client_id: Number(clientId),
    type: "file",
    note: String(body?.note || "").trim() || null,
    file_name: fileMeta?.storedName || null,
    real_filename: fileMeta?.realName || null,
    filetype: fileMeta?.mime || null,
    created: now,
    created_by: currentUser.user_id,
    updated: now,
    updated_by: currentUser.user_id,
  });

  return { httpStatus: 201, msg: "File uploaded.", activity: activity.toJSON() };
}

export async function updateClientActivity(clientId, activityId, body, currentUser) {
  const row = await findClientActivityById(activityId);
  if (!row || row.deleted) return { httpStatus: 404, msg: "Activity not found." };
  if (Number(row.client_id) !== Number(clientId)) return { httpStatus: 400, msg: "Invalid client activity." };

  const now = nowUnix();
  const updates = {
    updated: now,
    updated_by: currentUser.user_id,
  };

  if (body.note !== undefined) {
    const note = String(body.note || "").trim();
    if (!note) return { httpStatus: 400, msg: "Note cannot be empty." };
    updates.note = note;
  }

  await updateClientActivityById(activityId, updates);
  const latest = await findClientActivityById(activityId);
  return { msg: "Activity updated.", activity: latest?.toJSON ? latest.toJSON() : latest };
}

export async function deleteClientActivity(clientId, activityId, currentUser) {
  const row = await findClientActivityById(activityId);
  if (!row || row.deleted) return { httpStatus: 404, msg: "Activity not found." };
  if (Number(row.client_id) !== Number(clientId)) return { httpStatus: 400, msg: "Invalid client activity." };

  const now = nowUnix();
  await updateClientActivityById(activityId, {
    deleted: now,
    deleted_by: currentUser.user_id,
    updated: now,
    updated_by: currentUser.user_id,
  });

  return { msg: "Activity deleted." };
}
