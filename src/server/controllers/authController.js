import { nowUnix } from "@/utils/dateHelpers";
import { createUserLocation } from "@/server/queries/authQueries";

function getClientIp(req) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();

  const xri = req.headers.get("x-real-ip");
  if (xri) return xri.trim();

  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();

  return null;
}

export async function recordUserLocation(req, currentUser) {
  const { latitude, longitude } = await req.json();

  if (latitude == null || longitude == null) {
    return { status: 400, msg: "Latitude and longitude are required." };
  }

  const ip_address = getClientIp(req);
  const device_info = req.headers.get("user-agent") || null;

  await createUserLocation({
    user_id: currentUser.user_id,
    latitude,
    longitude,
    ip_address,
    device_info,
    created_by: currentUser.user_id,
    created: nowUnix(),
  });

  return { msg: "Location recorded successfully." };
}

