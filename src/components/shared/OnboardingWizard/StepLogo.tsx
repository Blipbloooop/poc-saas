"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";

interface StepLogoProps {
  logoUrl: string | null;
  onUploaded: (url: string) => void;
}

export function StepLogo({ logoUrl, onUploaded }: StepLogoProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "logo");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? "Échec de l'envoi");
      onUploaded(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[20px] font-bold text-foreground">Ajoutez votre logo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Il apparaîtra sur vos devis, factures et dans l&apos;application.
        </p>
      </div>

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-[10px] border-2 border-dashed border-border-strong px-7 py-8 text-center text-[13.5px] text-muted-foreground transition-colors hover:border-primary hover:bg-primary-light/30">
        {logoUrl ? (
          <Image src={logoUrl} alt="Logo" width={64} height={64} className="h-16 w-16 rounded-lg object-contain" />
        ) : uploading ? (
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        ) : (
          <Upload className="h-7 w-7 text-primary" />
        )}
        <span>
          <strong className="text-foreground">
            {logoUrl ? "Changer le logo" : "Cliquez pour importer"}
          </strong>{" "}
          {!logoUrl && "ou glissez-déposez"}
        </span>
        <span className="text-xs text-faint">PNG, JPG, SVG · 2 Mo max</span>
        <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={handleFileChange} disabled={uploading} />
      </label>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default StepLogo;
