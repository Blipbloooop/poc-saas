import { PlayCircle } from "lucide-react";

// TODO: remplacer par l'URL réelle de la vidéo de prise en main (Loom, YouTube...)
export const ONBOARDING_VIDEO_URL = "";

export function StepVideo() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[20px] font-bold text-foreground">Prenez en main NaviBat</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Une vidéo de 3 minutes pour découvrir l&apos;essentiel : chantiers, devis et factures.
        </p>
      </div>

      <a
        href={ONBOARDING_VIDEO_URL || undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!ONBOARDING_VIDEO_URL}
        className="flex flex-col items-center gap-3 rounded-[10px] border border-border bg-background px-7 py-10 text-center transition-colors hover:border-primary hover:bg-primary-light/30 aria-disabled:pointer-events-none aria-disabled:opacity-50"
      >
        <PlayCircle className="h-10 w-10 text-primary" />
        <span className="text-sm font-semibold text-foreground">
          {ONBOARDING_VIDEO_URL ? "Regarder la vidéo" : "Vidéo bientôt disponible"}
        </span>
      </a>
    </div>
  );
}

export default StepVideo;
