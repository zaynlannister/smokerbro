import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Sanitize filename and add timestamp
  const ext = path.extname(file.name).toLowerCase();
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  const uploadsDir = path.join(process.cwd(), "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, safeName);
  await writeFile(filePath, buffer);

  return NextResponse.json({ filename: safeName });
}
