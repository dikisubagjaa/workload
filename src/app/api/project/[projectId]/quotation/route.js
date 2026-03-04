export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import {
  createProjectQuotationWithFile,
  listProjectQuotations,
} from "@/server/controllers/projectController";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

/**
 * Save quotation file into: storage/project/quotation/<filename>
 * Return stored filename only (basename), NOT "/uploads/..."
 */
async function saveQuotationFile(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileExtension = path.extname(file.name || "");
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const storedFilename = `${uniqueSuffix}${fileExtension}`;

  const uploadDir = path.join(process.cwd(), "storage", "project", "quotation");
  const filePath = path.join(uploadDir, storedFilename);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  await writeFile(filePath, buffer);
  return storedFilename;
}

/**
 * GET handler to fetch all quotations for a project, including their associated POs.
 */
export const GET = withAuth(async function GET_HANDLER(req, { params }) {
  const { projectId } = params;
  try {
    const result = await listProjectQuotations(projectId);
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching quotations:", error);
    return jsonResponse({ msg: "Failed to fetch quotations." }, { status: 500 });
  }
});

/**
 * POST handler to upload a new quotation.
 */
export const POST = withAuth(async function POST_HANDLER(req, { params }, currentUser) {
  const { projectId } = params;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const quotationNumber = formData.get("quotation_number");

    if (!file || !quotationNumber) {
      return jsonResponse({ msg: "Quotation file and number are required." }, { status: 400 });
    }

    const storedFilename = await saveQuotationFile(file);
    const result = await createProjectQuotationWithFile(
      projectId,
      { storedFilename, quotationNumber },
      currentUser
    );
    return jsonResponse(result, { status: result.status || 201 });
  } catch (error) {
    console.error("Error uploading quotation:", error);
    return jsonResponse({ msg: "Failed to upload quotation." }, { status: 500 });
  }
});
