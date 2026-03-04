import { jsonResponse } from "@/utils/apiResponse";
import { createProfileFromBody, listProfiles } from "@/server/controllers/profileController";

export async function GET() {
  try {
    const users = await listProfiles();
    return jsonResponse(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return jsonResponse({ msg: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await createProfileFromBody(body);
    return jsonResponse(result);
  } catch (error) {
    console.error("Error adding user:", error);
    return jsonResponse({ msg: "Gagal menambah profil" }, { status: 500 });
  }
}
