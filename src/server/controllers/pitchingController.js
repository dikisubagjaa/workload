import dayjs from "dayjs";
import fs from "fs/promises";
import path from "path";
import db from "@/database/models";

const { Project, Pitching, Client } = db;

const toInt = (v, def = null) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

const toYMD = (v) => {
  if (!v) return null;
  try {
    return dayjs(v).format("YYYY-MM-DD");
  } catch {
    return null;
  }
};

export async function createPitchingProject(body, currentUser) {
  const userId = currentUser.user_id;
  const now = dayjs().unix();

  const {
    title,
    client_id,
    start_date,
    due_date,
    currency,
    currency_value,
    duration,
    terms_of_payment,
    max_hours,
    maintenance,
    project_type,
    teams,
    status = "remaining",
    published = "published",
  } = body || {};

  const created = await Project.create({
    title,
    client_id: toInt(client_id),
    start_date: toYMD(start_date),
    due_date: toYMD(due_date),
    currency,
    currency_value: toInt(currency_value),
    duration: toInt(duration),
    terms_of_payment,
    max_hours: toInt(max_hours),
    maintenance,
    project_type: Array.isArray(project_type) ? project_type : [],
    teams: Array.isArray(teams) ? teams : [],
    type: "pitching",
    status,
    published,
    created: now,
    created_by: userId,
    updated: now,
    updated_by: userId,
  });

  const teamIds = Array.isArray(teams)
    ? teams.map((uid) => Number(uid)).filter(Number.isInteger)
    : [];

  if (teamIds.length) {
    const placeholders = teamIds.map(() => "(?,?,?,?,?,?,?,?)").join(",");
    const params = [];
    for (const uid of teamIds) {
      params.push(created.project_id, null, uid, "pitching", now, userId, now, userId);
    }

    await db.sequelize.query(
      `INSERT INTO project_team
       (project_id, task_id, user_id, source, created, created_by, updated, updated_by)
       VALUES ${placeholders}`,
      { replacements: params }
    );
  }

  return { httpStatus: 201, data: created };
}

export async function getPitchingByUuid(param) {
  const uuid = param;
  const pitchingData = await Pitching.findOne({ where: { uuid } });
  if (!pitchingData) return { httpStatus: 404, msg: "Pitching tidak ditemukan" };
  return { Pitching: pitchingData };
}

export async function updatePitchingByUuid(param, body) {
  const uuid = param;
  const pitchingData = await Pitching.findOne({ where: { uuid } });
  if (!pitchingData) return { httpStatus: 404, msg: "Pitching tidak ditemukan" };

  let clientData;
  if (body?.exist_client) {
    clientData = await Client.findOne({ where: { client_id: toInt(body?.exist_client) } });
    if (!clientData) return { httpStatus: 404, msg: "Client tidak ditemukan" };

    await Pitching.update(
      {
        client_id: clientData?.client_id,
        updated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        updated_by: 1,
      },
      { where: { Pitching_id: pitchingData?.Pitching_id } }
    );
  } else {
    const formatPhoneNumber = (phone) => phone.replace(/^0/, "");
    const picPhone = `${body?.pic_phone_code}${formatPhoneNumber(body?.pic_phone_number)}`;
    const financePhone = `${body?.finance_phone_code}${formatPhoneNumber(body?.finance_phone_number)}`;

    clientData = await Client.create(
      {
        type: body?.type,
        client_name: body?.client_name,
        brand: body?.brand,
        address: body?.address,
        division: body?.division,
        pic_name: body?.pic_name,
        pic_phone: picPhone,
        pic_email: body?.pic_email,
        finance_name: body?.finance_name,
        finance_phone: financePhone,
        finance_email: body?.finance_email,
        created: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        created_by: 1,
        updated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        updated_by: 1,
      },
      { returning: true }
    );
  }

  if (body?.type_submit == "publish") {
    await Pitching.update(
      {
        Pitching_name: body?.Pitching_name,
        client_id: clientData?.client_id,
        due_date: body?.due_date,
        start_date: body?.start_date,
        Pitching_type: body?.Pitching_type,
        max_hours: body?.max_hours,
        maintenance: body?.maintenance,
        currency: body?.currency,
        currency_value: body?.currency_value,
        duration: body?.Pitching_duration,
        terms_of_payment: body?.terms_of_payment,
        json_data: { client: clientData },
        published: "published",
        updated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        updated_by: 1,
      },
      { where: { Pitching_id: pitchingData?.Pitching_id } }
    );
  }

  return { msg: "Pitching berhasil diperbarui", Pitching: pitchingData, client: clientData };
}

export async function deletePitchingByUuid(param) {
  const uuid = param;
  const pitchingRow = await Pitching.findOne({ where: { uuid } });
  if (!pitchingRow) return { httpStatus: 404, msg: "Pitching tidak ditemukan" };

  await Pitching.update({
    deleted: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    deleted_by: pitchingRow.Pitchings_id,
  });

  return { msg: "Pitching deleted" };
}

export async function uploadPitchingFile(param, req) {
  const uuid = param;
  const pitchingRow = await Pitching.findOne({ where: { uuid } });
  if (!pitchingRow) return { httpStatus: 404, msg: "Pitching tidak ditemukan" };

  const headers = Object.fromEntries(req.headers);
  if (!headers["content-type"]?.includes("multipart/form-data")) {
    return { httpStatus: 400, msg: "Missing Content-Type" };
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) return { httpStatus: 400, msg: "File tidak ditemukan" };

  const uploadDir = path.join(process.cwd(), `storage/Pitching/${uuid}`);
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  return { msg: "Upload berhasil!", fileName: file.name };
}
