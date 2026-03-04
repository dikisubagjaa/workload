export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { listCountryCodes } from "@/server/controllers/countryCodeController";

export async function GET() {
  try {
    const result = await listCountryCodes();
    return jsonResponse(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    return jsonResponse({ msg: "Gagal mengambil data" }, { status: 500 });
  }
}
