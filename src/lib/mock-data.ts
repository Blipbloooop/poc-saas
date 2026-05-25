// Données fictives pour le POC ERP Artisans/PME

export const ROLES = ["direction", "commercial", "conducteur", "ouvrier", "administratif"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  direction: "Direction / Gérant",
  commercial: "Commercial",
  conducteur: "Conducteur de travaux",
  ouvrier: "Ouvrier / Technicien",
  administratif: "Assistant administratif",
};

// ─── CHANTIERS ────────────────────────────────────────────────────────────────

export const CHANTIER_STATUTS = ["prospect", "devis_envoye", "signe", "en_cours", "termine", "annule"] as const;
export type ChantierStatut = (typeof CHANTIER_STATUTS)[number];

export const STATUT_LABELS: Record<ChantierStatut, string> = {
  prospect: "Prospect",
  devis_envoye: "Devis envoyé",
  signe: "Signé",
  en_cours: "En cours",
  termine: "Terminé",
  annule: "Annulé",
};

export const STATUT_COLORS: Record<ChantierStatut, string> = {
  prospect: "bg-slate-100 text-slate-700",
  devis_envoye: "bg-blue-100 text-blue-700",
  signe: "bg-purple-100 text-purple-700",
  en_cours: "bg-amber-100 text-amber-700",
  termine: "bg-green-100 text-green-700",
  annule: "bg-red-100 text-red-700",
};

export interface Chantier {
  id: string;
  reference: string;
  client: string;
  adresse: string;
  ville: string;
  type: string;
  statut: ChantierStatut;
  commercial: string;
  conducteur: string;
  techniciens: string[];
  dateDebut: string;
  dateFin: string;
  montantHT: number;
  avancement: number;
  retard: boolean;
  notes: string;
}

export const mockChantiers: Chantier[] = [
  {
    id: "c1",
    reference: "CH-2024-001",
    client: "M. et Mme Leroy",
    adresse: "12 rue des Lilas",
    ville: "Lyon (69003)",
    type: "Rénovation salle de bain",
    statut: "en_cours",
    commercial: "Sophie Laurent",
    conducteur: "Jean-Marc Dupont",
    techniciens: ["Pierre Moreau", "Luc Fontaine"],
    dateDebut: "2024-03-01",
    dateFin: "2024-04-15",
    montantHT: 8500,
    avancement: 65,
    retard: true,
    notes: "Client exigeant sur les finitions. Carrelage en attente de livraison.",
  },
  {
    id: "c2",
    reference: "CH-2024-002",
    client: "SCI Les Platanes",
    adresse: "45 avenue Foch",
    ville: "Villeurbanne (69100)",
    type: "Installation électrique complète",
    statut: "signe",
    commercial: "Thomas Garnier",
    conducteur: "Jean-Marc Dupont",
    techniciens: ["Karim Belhadj"],
    dateDebut: "2024-04-20",
    dateFin: "2024-05-30",
    montantHT: 22000,
    avancement: 0,
    retard: false,
    notes: "Mise aux normes NF C 15-100. Permis de travaux en attente.",
  },
  {
    id: "c3",
    reference: "CH-2024-003",
    client: "Boulangerie Michaud",
    adresse: "8 place du Marché",
    ville: "Bron (69500)",
    type: "Ravalement de façade",
    statut: "termine",
    commercial: "Sophie Laurent",
    conducteur: "Romain Petit",
    techniciens: ["Luc Fontaine", "Ahmed Nassif", "Pierre Moreau"],
    dateDebut: "2024-01-15",
    dateFin: "2024-02-28",
    montantHT: 15800,
    avancement: 100,
    retard: false,
    notes: "Chantier terminé dans les délais. Client très satisfait.",
  },
  {
    id: "c4",
    reference: "CH-2024-004",
    client: "M. Bernard Tissot",
    adresse: "3 impasse des Roses",
    ville: "Caluire (69300)",
    type: "Pose de carrelage + plinthes",
    statut: "devis_envoye",
    commercial: "Thomas Garnier",
    conducteur: "",
    techniciens: [],
    dateDebut: "2024-05-06",
    dateFin: "2024-05-20",
    montantHT: 3200,
    avancement: 0,
    retard: false,
    notes: "Devis envoyé le 15/04. Relance à faire.",
  },
  {
    id: "c5",
    reference: "CH-2024-005",
    client: "Résidence Les Acacias",
    adresse: "100 route de Grenoble",
    ville: "Saint-Priest (69800)",
    type: "Plomberie - remplacement colonnes",
    statut: "en_cours",
    commercial: "Sophie Laurent",
    conducteur: "Jean-Marc Dupont",
    techniciens: ["Pierre Moreau"],
    dateDebut: "2024-03-10",
    dateFin: "2024-04-10",
    montantHT: 31500,
    avancement: 40,
    retard: true,
    notes: "Problème d'accès aux sous-sols. Copropriété à recontacter.",
  },
  {
    id: "c6",
    reference: "CH-2024-006",
    client: "Mme Céline Faure",
    adresse: "27 rue Garibaldi",
    ville: "Lyon (69006)",
    type: "Isolation thermique combles",
    statut: "prospect",
    commercial: "Sophie Laurent",
    conducteur: "",
    techniciens: [],
    dateDebut: "2024-06-01",
    dateFin: "2024-06-10",
    montantHT: 5600,
    avancement: 0,
    retard: false,
    notes: "RDV de diagnostic le 22/04.",
  },
];

// ─── COLLABORATEURS ────────────────────────────────────────────────────────────

export interface Collaborateur {
  id: string;
  nom: string;
  prenom: string;
  role: string;
  email: string;
  telephone: string;
  disponibilite: "disponible" | "en_chantier" | "absent" | "conge";
  chantierActuel?: string;
  dateEntree: string;
  permis: boolean;
  competences: string[];
  avatar: string;
}

export const mockCollaborateurs: Collaborateur[] = [
  {
    id: "col1",
    nom: "Dupont",
    prenom: "Jean-Marc",
    role: "Conducteur de travaux",
    email: "jm.dupont@artisan-pro.fr",
    telephone: "06 12 34 56 78",
    disponibilite: "en_chantier",
    chantierActuel: "CH-2024-001",
    dateEntree: "2019-03-01",
    permis: true,
    competences: ["Gestion de chantier", "Électricité", "Plomberie", "Management"],
    avatar: "JD",
  },
  {
    id: "col2",
    nom: "Laurent",
    prenom: "Sophie",
    role: "Commerciale",
    email: "s.laurent@artisan-pro.fr",
    telephone: "06 98 76 54 32",
    disponibilite: "disponible",
    dateEntree: "2021-06-15",
    permis: true,
    competences: ["Vente", "Devis", "CRM", "Relation client"],
    avatar: "SL",
  },
  {
    id: "col3",
    nom: "Moreau",
    prenom: "Pierre",
    role: "Technicien plombier",
    email: "p.moreau@artisan-pro.fr",
    telephone: "06 11 22 33 44",
    disponibilite: "en_chantier",
    chantierActuel: "CH-2024-005",
    dateEntree: "2020-09-01",
    permis: true,
    competences: ["Plomberie", "Chauffage", "Sanitaire", "PAC"],
    avatar: "PM",
  },
  {
    id: "col4",
    nom: "Bonnet",
    prenom: "Marie-Claire",
    role: "Assistante administrative",
    email: "mc.bonnet@artisan-pro.fr",
    telephone: "04 72 11 22 33",
    disponibilite: "disponible",
    dateEntree: "2018-01-10",
    permis: false,
    competences: ["Facturation", "Devis", "Comptabilité", "RH"],
    avatar: "MB",
  },
  {
    id: "col5",
    nom: "Fontaine",
    prenom: "Luc",
    role: "Ouvrier polyvalent",
    email: "l.fontaine@artisan-pro.fr",
    telephone: "06 55 66 77 88",
    disponibilite: "en_chantier",
    chantierActuel: "CH-2024-001",
    dateEntree: "2022-02-01",
    permis: true,
    competences: ["Maçonnerie", "Carrelage", "Peinture", "Plâtrerie"],
    avatar: "LF",
  },
  {
    id: "col6",
    nom: "Garnier",
    prenom: "Thomas",
    role: "Commercial",
    email: "t.garnier@artisan-pro.fr",
    telephone: "06 44 55 66 77",
    disponibilite: "absent",
    dateEntree: "2023-04-01",
    permis: true,
    competences: ["Vente", "Prospection", "Devis", "Suivi client"],
    avatar: "TG",
  },
  {
    id: "col7",
    nom: "Belhadj",
    prenom: "Karim",
    role: "Électricien",
    email: "k.belhadj@artisan-pro.fr",
    telephone: "06 33 44 55 66",
    disponibilite: "conge",
    dateEntree: "2021-11-15",
    permis: true,
    competences: ["Électricité", "Domotique", "Photovoltaïque", "NF C 15-100"],
    avatar: "KB",
  },
];

// ─── CONTACTS ─────────────────────────────────────────────────────────────────

export interface Contact {
  id: string;
  type: "client" | "fournisseur" | "prestataire" | "partenaire";
  nom: string;
  entreprise?: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  notes: string;
  tags: string[];
  dateAjout: string;
  chiffresAffaires?: number;
}

export const mockContacts: Contact[] = [
  {
    id: "ct1",
    type: "client",
    nom: "M. et Mme Leroy",
    email: "leroy.famille@gmail.com",
    telephone: "04 72 44 55 66",
    adresse: "12 rue des Lilas",
    ville: "Lyon (69003)",
    notes: "Clients fidèles depuis 2021. Ont recommandé 3 nouveaux clients.",
    tags: ["VIP", "Fidèle", "Prescripteur"],
    dateAjout: "2021-05-10",
    chiffresAffaires: 24500,
  },
  {
    id: "ct2",
    type: "fournisseur",
    nom: "Martin Dupuis",
    entreprise: "Rexel Lyon Sud",
    email: "commercial@rexel-lyon.fr",
    telephone: "04 78 12 34 56",
    adresse: "15 rue de l'Industrie",
    ville: "Vénissieux (69200)",
    notes: "Fournisseur matériel électrique. Remise négociée à 18%.",
    tags: ["Électricité", "Matériel", "Prioritaire"],
    dateAjout: "2019-01-15",
    chiffresAffaires: 45000,
  },
  {
    id: "ct3",
    type: "prestataire",
    nom: "François Renard",
    entreprise: "Location Engins Renard",
    email: "f.renard@location-engins.fr",
    telephone: "06 70 80 90 10",
    adresse: "Zone Artisanale des Pins",
    ville: "Corbas (69960)",
    notes: "Location nacelles, échafaudages. Délai de réservation : 48h.",
    tags: ["Location", "Engins", "Chantier"],
    dateAjout: "2020-03-20",
  },
  {
    id: "ct4",
    type: "client",
    nom: "Sylvie Michaud",
    entreprise: "Boulangerie Michaud",
    email: "contact@boulangerie-michaud.fr",
    telephone: "04 72 88 99 00",
    adresse: "8 place du Marché",
    ville: "Bron (69500)",
    notes: "Chantier façade terminé. Très bonne référence pour commerciaux.",
    tags: ["Commerce", "Référence"],
    dateAjout: "2023-11-01",
    chiffresAffaires: 15800,
  },
  {
    id: "ct5",
    type: "partenaire",
    nom: "Cabinet Merlin",
    entreprise: "Cabinet d'architecture Merlin",
    email: "info@cabinet-merlin.fr",
    telephone: "04 78 55 66 77",
    adresse: "32 cours Gambetta",
    ville: "Lyon (69007)",
    notes: "Partenaire prescripteur. Nous recommandent régulièrement sur les chantiers de rénovation haut de gamme.",
    tags: ["Architecture", "Prescription", "Haut de gamme"],
    dateAjout: "2022-06-01",
  },
  {
    id: "ct6",
    type: "fournisseur",
    nom: "Ahmed Benali",
    entreprise: "Point.P Lyon Est",
    email: "a.benali@pointp.fr",
    telephone: "04 72 00 11 22",
    adresse: "2 rue du Bâtiment",
    ville: "Meyzieu (69330)",
    notes: "Matériaux gros œuvre. Livraison chantier sous 24h. Compte ouvert.",
    tags: ["Matériaux", "Gros œuvre", "Livraison"],
    dateAjout: "2019-06-01",
    chiffresAffaires: 78000,
  },
  {
    id: "ct7",
    type: "client",
    nom: "SCI Les Platanes",
    entreprise: "SCI Les Platanes",
    email: "gestion@sci-lesplatanes.fr",
    telephone: "06 12 99 88 77",
    adresse: "45 avenue Foch",
    ville: "Villeurbanne (69100)",
    notes: "Gestionnaire d'immeubles. Contrat d'entretien annuel en discussion.",
    tags: ["Immobilier", "Récurrent"],
    dateAjout: "2024-01-10",
    chiffresAffaires: 22000,
  },
];

// ─── DONNÉES DASHBOARD ────────────────────────────────────────────────────────

export const mockKPIs = {
  direction: {
    caMonth: 94200,
    caTarget: 120000,
    devisEnAttente: 5,
    facturesImpayees: 3,
    montantImpaye: 28400,
    chantiersEnRetard: 2,
    totalChantiers: 6,
    rentabiliteGlobale: 32,
  },
  commercial: {
    devisARelancer: 3,
    devisEnCours: 5,
    rdvAujourdhui: 2,
    signaturesAttentes: 2,
    nouveauxLeads: 4,
    tauxConversion: 68,
  },
  conducteur: {
    chantiersDuJour: 3,
    retards: 2,
    tachesUrgentes: 4,
    materiauxManquants: 1,
  },
  ouvrier: {
    interventionsDuJour: 2,
    heuresTravaillees: 6.5,
    checklistsCompletes: 3,
  },
  administratif: {
    devisAEnvoyer: 2,
    facturesAEditer: 3,
    facturesImpayees: 3,
    montantImpaye: 28400,
    signaturesAttentes: 2,
    documentsManquants: 5,
  },
};

export const mockChartData = [
  { mois: "Nov", ca: 68000, objectif: 80000 },
  { mois: "Déc", ca: 52000, objectif: 80000 },
  { mois: "Jan", ca: 71000, objectif: 90000 },
  { mois: "Fév", ca: 88000, objectif: 90000 },
  { mois: "Mar", ca: 105000, objectif: 100000 },
  { mois: "Avr", ca: 94200, objectif: 120000 },
];

export const mockRentabiliteChantiers = [
  { chantier: "CH-001", marge: 38 },
  { chantier: "CH-002", marge: 42 },
  { chantier: "CH-003", marge: 29 },
  { chantier: "CH-005", marge: 18 },
];

export const mockAlertes = [
  { id: "a1", type: "danger", message: "Facture impayée : SCI Les Platanes — 22 000 € (45 jours)", date: "2024-04-15" },
  { id: "a2", type: "warning", message: "Chantier CH-2024-001 en retard de 8 jours", date: "2024-04-20" },
  { id: "a3", type: "warning", message: "Chantier CH-2024-005 en retard de 12 jours", date: "2024-04-20" },
  { id: "a4", type: "info", message: "Devis CH-2024-004 sans réponse depuis 10 jours — relance recommandée", date: "2024-04-25" },
  { id: "a5", type: "info", message: "RDV diagnostic Mme Faure demain à 9h00 — 27 rue Garibaldi Lyon 6e", date: "2024-04-21" },
];

export const mockRdv = [
  { id: "r1", heure: "09h00", client: "Mme Céline Faure", type: "Diagnostic isolation", adresse: "27 rue Garibaldi, Lyon 6e" },
  { id: "r2", heure: "14h30", client: "M. Bernard Tissot", type: "Présentation devis carrelage", adresse: "3 impasse des Roses, Caluire" },
];

export const mockInterventionsOuvrier = [
  {
    id: "i1",
    chantier: "CH-2024-001",
    client: "M. et Mme Leroy",
    adresse: "12 rue des Lilas, Lyon 69003",
    type: "Pose carrelage salle de bain",
    heureDebut: "08h00",
    heureFin: "17h00",
    documents: ["Plan salle de bain v2.pdf", "Bon de livraison carrelage.pdf"],
    checklist: [
      { label: "EPI portés", done: true },
      { label: "Zone délimitée", done: true },
      { label: "Photos avant travaux", done: false },
      { label: "Contrôle humidité sol", done: false },
      { label: "Photos après travaux", done: false },
    ],
  },
];
