import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import pathMod from "path";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const filePath = pathMod.join(process.cwd(), "uploads", ...params.path);

  // Security: prevent directory traversal
  const resolved = pathMod.resolve(filePath);
  const uploadsRoot = pathMod.resolve(pathMod.join(process.cwd(), "uploads"));
  if (!resolved.startsWith(uploadsRoot)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await stat(resolved);
    const data = await readFile(resolved);
    const ext = pathMod.extname(resolved).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
