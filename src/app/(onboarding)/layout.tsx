export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center gap-9 bg-background px-4 py-10">
      {children}
    </div>
  );
}
