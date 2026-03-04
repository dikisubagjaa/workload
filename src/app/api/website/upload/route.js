// src/app/api/upload/route.js
import { writeFile, mkdir } from "fs/promises";
import { jsonResponse } from "@/utils/apiResponse";
import path from "path";

export async function POST(req) {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
        return jsonResponse({ msg: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Tentukan path folder
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    // Buat folder kalau belum ada
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, file.name);
    await writeFile(filePath, buffer);

    return jsonResponse({ url: `/uploads/${file.name}` }, { status: 200 });
}
