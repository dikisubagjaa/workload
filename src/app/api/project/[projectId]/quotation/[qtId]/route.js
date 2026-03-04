export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import dayjs from "dayjs";
import {
  deleteProjectQuotation,
  uploadPoToQuotation,
} from "@/server/controllers/projectController";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

/**
 * Helper function to save an uploaded file.
 * @param {File} file - The file to save.
 * @param {string} subfolder - The subfolder within 'public/uploads' to save the file.
 * @returns {Promise<string>} The relative path to the saved file.
 */
async function saveFile(file, subfolder) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileExtension = path.extname(file.name);
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const newFilename = `${uniqueSuffix}${fileExtension}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", subfolder);
  const filePath = path.join(uploadDir, newFilename);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  await writeFile(filePath, buffer);
  return `/uploads/${subfolder}/${newFilename}`;
}

/**
 * DELETE handler untuk menghapus quotation (soft delete) + semua PO-nya (soft delete).
 * Route: /api/project/[projectId]/quotation/[qtId]
 */
export const DELETE = withAuth(async function DELETE_HANDLER(req, { params }, currentUser) {
  const { projectId, qtId } = params;

  try {
    if (!qtId || qtId === "undefined") {
      return jsonResponse({ msg: "Quotation ID is required." }, { status: 400 });
    }

    const result = await deleteProjectQuotation(projectId, qtId, currentUser);
    return jsonResponse(result, { status: result.status || 200 });
  } catch (error) {
    console.error("DELETE Quotation msg:", error);
    return jsonResponse({ msg: "Failed to delete quotation." }, { status: 500 });
  }
});

/**
 * POST handler untuk mengunggah dokumen PO ke kutipan yang sudah ada.
 * (legacy - dibiarkan sesuai file aslinya)
 */
export const POST = withAuth(async function POST_HANDLER(req, { params }, currentUser) {
  const { qtId } = params;

  try {
    const formData = await req.formData();
    const poFile = formData.get("po_file");
    const poNumber = formData.get("po_number");

    if (!poFile || !poNumber) {
      return jsonResponse({ msg: "PO file and PO number are required." }, { status: 400 });
    }

    const poPath = await saveFile(poFile, "po");

    const poData = {
      po_number: poNumber,
      po_doc: poPath,
      uploaded_at: dayjs().unix(),
      uploaded_by: currentUser.user_id,
    };

    const result = await uploadPoToQuotation(qtId, poData, currentUser);
    return jsonResponse(result, { status: result.status || 200 });
  } catch (error) {
    console.error("Error uploading PO document:", error);
    return jsonResponse({ msg: "Failed to upload PO document." }, { status: 500 });
  }
});
