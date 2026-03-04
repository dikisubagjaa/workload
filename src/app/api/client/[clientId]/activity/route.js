export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { uploadFile, getFilename } from "@/utils/imageHelpers";
import {
  addClientActivityFile,
  addClientActivityNote,
  listClientActivitiesByClientId,
} from "@/server/controllers/clientController";

export const GET = withActive(async function GET_HANDLER(_req, { params }, _currentUser) {
  try {
    const { clientId } = params;
    const result = await listClientActivitiesByClientId(clientId);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error fetching client activities:", error);
    return jsonResponse({ msg: error.message || "Failed to fetch client activities." }, { status: 500 });
  }
});

export const POST = withActive(async function POST_HANDLER(req, { params }, currentUser) {
  try {
    const { clientId } = params;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      const note = formData.get("note");

      if (!file || typeof file === "string") {
        return jsonResponse({ msg: "File is required." }, { status: 400 });
      }

      const out = await uploadFile(file, "client-activity");
      const result = await addClientActivityFile(
        clientId,
        {
          storedName: getFilename(out.original),
          realName: file.name || getFilename(out.original),
          mime: file.type || null,
        },
        { note },
        currentUser
      );
      const { httpStatus, ...payload } = result || {};
      return jsonResponse(payload, { status: httpStatus || 200 });
    }

    const body = await req.json();
    const result = await addClientActivityNote(clientId, body, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error creating client activity:", error);
    return jsonResponse({ msg: error.message || "Failed to create client activity." }, { status: 500 });
  }
});
