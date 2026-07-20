import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { resolveActiveOrganizationId } from "@/lib/organization";

const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo
const LOGO_MAX_SIZE = 2 * 1024 * 1024; // 2 Mo
const LOGO_MIME_WHITELIST = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const chantierId = formData.get("chantierId") as string | null;
  const kind = formData.get("kind") as string | null;

  if (!file) return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });

  if (kind === "logo") {
    if (!LOGO_MIME_WHITELIST.includes(file.type)) {
      return NextResponse.json({ error: "Format non supporté (PNG, JPG, WEBP ou SVG uniquement)" }, { status: 400 });
    }
    if (file.size > LOGO_MAX_SIZE) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 2 Mo)" }, { status: 400 });
    }

    const organizationId = await resolveActiveOrganizationId(session);
    if (!organizationId) return NextResponse.json({ error: "Aucune organisation active" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "logos", organizationId);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, safeName), buffer);

    const url = `/uploads/logos/${organizationId}/${safeName}`;
    return NextResponse.json({ success: true, url, nom: file.name, taille: file.size, mimeType: file.type });
  }

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
