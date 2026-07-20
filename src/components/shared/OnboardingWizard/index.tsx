"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";
import { useTheme } from "@/components/shared/ThemeProvider";
import { getMyCompanyProfile, updateOrganizationLogo, markOnboardingCompleted } from "@/server/actions/company-profile";
import { attachInvitationDetails } from "@/server/actions/invitations";
import { StepLogo } from "./StepLogo";
import { StepTheme } from "./StepTheme";
import { StepInvite, emptyInviteRow, type InviteRow } from "./StepInvite";
import { StepVideo } from "./StepVideo";

const STEP_COUNT = 4;

export function OnboardingWizard() {
  const { primaryColor, secondaryColor, applyTheme, setOrganizationLogo } = useTheme();
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [invites, setInvites] = useState<InviteRow[]>([emptyInviteRow()]);

  useEffect(() => {
    getMyCompanyProfile().then((result) => {
      if (result && !result.profile?.onboardingCompletedAt) {
        setOrganizationId(result.organizationId);
        setLogoUrl(result.organizationLogo);
        setOpen(true);
      }
      setLoading(false);
    });
  }, []);

  async function finish() {
    setSubmitting(true);

    if (organizationId) {
      for (const row of invites) {
        if (!row.email.trim()) continue;
        const { data: invitation, error } = await authClient.organization.inviteMember({
          email: row.email,
          role: row.role,
          organizationId,
        });
        if (!error && invitation) {
          await attachInvitationDetails({
            invitationId: invitation.id,
            prenom: row.prenom || "—",
            nom: row.nom || "—",
            telephone: row.telephone || "—",
          });
        }
      }
    }

    await markOnboardingCompleted();
    setSubmitting(false);
    setOpen(false);
  }

  async function skipAll() {
    await markOnboardingCompleted();
    setOpen(false);
  }

  function skipStep() {
    if (step < STEP_COUNT - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  }

  if (loading) return null;

  return (
    <Dialog open={open} onClose={skipAll}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: STEP_COUNT }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>

        {step === 0 && (
          <StepLogo
            logoUrl={logoUrl}
            onUploaded={(url) => {
              setLogoUrl(url);
              setOrganizationLogo(url);
              if (organizationId) updateOrganizationLogo(url);
            }}
          />
        )}
        {step === 1 && (
          <StepTheme
            primary={primaryColor}
            secondary={secondaryColor}
            onChangePrimary={(color) => applyTheme(color, secondaryColor)}
            onChangeSecondary={(color) => applyTheme(primaryColor, color)}
          />
        )}
        {step === 2 && <StepInvite rows={invites} onChange={setInvites} />}
        {step === 3 && <StepVideo />}

        <div className="flex items-center justify-between">
          <button type="button" onClick={skipStep} disabled={submitting} className="cursor-pointer text-sm text-muted-foreground hover:underline disabled:opacity-50">
            Passer pour l&apos;instant
          </button>

          <div className="flex gap-2">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} className="cursor-pointer">
                Retour
              </Button>
            )}
            {step < STEP_COUNT - 1 ? (
              <Button type="button" onClick={() => setStep((s) => s + 1)} className="cursor-pointer">
                Continuer
              </Button>
            ) : (
              <Button type="button" onClick={finish} disabled={submitting} className="cursor-pointer">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Terminer
              </Button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default OnboardingWizard;
