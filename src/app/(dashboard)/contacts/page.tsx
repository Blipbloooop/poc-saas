export default function ContactsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Contacts</h1>
        <p className="text-sm text-slate-500 mt-0.5">Clients, fournisseurs, partenaires</p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <p className="text-5xl mb-4">📋</p>
        <p className="text-base font-medium text-slate-600 mb-1">Module Contacts</p>
        <p className="text-sm text-center max-w-xs">
          Ce module sera disponible dans la prochaine version. Vous pourrez gérer vos clients, fournisseurs et partenaires.
        </p>
      </div>
    </div>
  );
}
