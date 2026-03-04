export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import {
    createPurchaseOrderForQuotation,
    listPurchaseOrdersByQuotation,
} from "@/server/controllers/projectController";
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

// app/api/project/[projectId]/quotation/[pqId]/po/route.js

export async function GET(req, { params }) {
    try {
        // 1. Ambil parameter 'qtId' dari URL. Nama ini harus cocok dengan nama folder dinamis '[qtId]'.
        const { qtId } = params;

        // 2. Lakukan validasi sederhana untuk memastikan qtId ada.
        if (!qtId || qtId === 'undefined') {
            return jsonResponse({ msg: "Quotation ID is required." }, { status: 400 });
        }

        // 3. Langsung cari semua Purchase Orders berdasarkan 'pq_id' (foreign key).
        const result = await listPurchaseOrdersByQuotation(qtId);
        return jsonResponse(result, { status: 200 });

    } catch (error) {
        console.error("Error fetching Purchase Orders:", error);
        return jsonResponse({
            msg: error.message || "Failed to fetch PO documents"
        }, { status: 500 });
    }
}

/**
 * Helper function to save an uploaded file.
 * Save to: storage/project/po/<filename>
 * Return: stored filename only (basename), NOT "/uploads/..."
 */
async function saveFile(file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExtension = path.extname(file.name || "");
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const newFilename = `${uniqueSuffix}${fileExtension}`;

    const uploadDir = path.join(process.cwd(), 'storage', 'project', 'po');
    const filePath = path.join(uploadDir, newFilename);

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    await writeFile(filePath, buffer);
    return newFilename; // ✅ basename only
}

/**
 * POST handler to upload a new PO document for an existing quotation.
 */
export const POST = withAuth(async function POST_HANDLER(req, { params }, currentUser) {
    const { qtId } = params; // Mengambil ID kutipan (pq_id) dari URL

    try {
        const formData = await req.formData();
        const poFile = formData.get('po_file');
        const poNumber = formData.get('po_number');

        if (!poFile || !poNumber) {
            return jsonResponse({ msg: 'PO file and PO number are required.' }, { status: 400 });
        }

        // Simpan file PO (basename only)
        const storedFilename = await saveFile(poFile);
        const result = await createPurchaseOrderForQuotation(
            qtId,
            { po_number: poNumber, po_doc: storedFilename },
            currentUser
        );
        return jsonResponse(result, { status: result.status || 201 });

    } catch (error) {
        console.error("Error uploading PO document:", error);
        // Menangani error jika qtId tidak valid (foreign key constraint)
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return jsonResponse({ msg: 'Quotation not found for the provided ID.' }, { status: 404 });
        }
        return jsonResponse({ msg: "Failed to upload PO document." }, { status: 500 });
    }
});
