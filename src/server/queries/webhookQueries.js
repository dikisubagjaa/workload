import db from "@/database/models";

const { AttendanceConfig } = db;

export function findOfficeIp(ip) {
  return AttendanceConfig.findOne({ where: { ip, active: 1 } });
}

export function createOfficeIp(payload) {
  return AttendanceConfig.create(payload);
}

export function updateOfficeIpInstance(row, updates) {
  return row.update(updates);
}
