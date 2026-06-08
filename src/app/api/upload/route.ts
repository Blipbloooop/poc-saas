import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const chantierId = formData.get("chantierId") as string | null;

  if (!file) return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Fichier trop volumineux (max 10 Mo)" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Sanitize filename
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const subDir = chantierId ?? "misc";
  const uploadDir = join(process.cwd(), "public", "uploads", subDir);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, safeName), buffer);

  const url = `/uploads/${subDir}/${safeName}`;

  return NextResponse.json({ success: true, url, nom: file.name, taille: file.size, mimeType: file.type });
}
