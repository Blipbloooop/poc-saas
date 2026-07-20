import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import Sidebar from "@/components/shared/Sidebar";
import { OnboardingWizard } from "@/components/shared/OnboardingWizard";
import { getOrganizationTheme } from "@/server/actions/theme";
import { getMyCompanyProfile } from "@/server/actions/company-profile";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/signin");
  }

  const [theme, companyProfile] = await Promise.all([getOrganizationTheme(), getMyCompanyProfile()]);

  return (
    <ThemeProvider
      initialPrimary={theme.primary}
      initialSecondary={theme.secondary}
      initialLogo={companyProfile?.organizationLogo ?? null}
      initialName={companyProfile?.organizationName ?? ""}
    >
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <OnboardingWizard />
    </ThemeProvider>
  );
}
