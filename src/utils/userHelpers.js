import axiosInstance from "@/utils/axios";

export function getUserLabel(user) {
  const u = user || {};
  return (
    u.fullname ||
    u.name ||
    u.email ||
    (u.user_id ? `User #${u.user_id}` : u.id ? `User #${u.id}` : "User")
  );
}

export function normalizeUserList(data) {
  if (!data) return [];
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data)) return data;
  return [];
}

export async function fetchUsers({
  q,
  limit = 200,
  page = 1,
  status,
} = {}) {
  const params = { q, limit, page, status };
  Object.keys(params).forEach((k) => params[k] == null && delete params[k]);
  const res = await axiosInstance.get("/user", { params });
  return normalizeUserList(res?.data);
}

export function buildUserOptions(users = []) {
  return (Array.isArray(users) ? users : [])
    .map((u) => {
      const id = u?.user_id ?? u?.id ?? null;
      if (!id) return null;
      return { value: id, label: getUserLabel(u) };
    })
    .filter(Boolean);
}

export function isAeUser(user) {
  const directFlag = String(user?.is_ae ?? user?.RoleDetail?.is_ae ?? "").toLowerCase();
  return directFlag === "true";
}
