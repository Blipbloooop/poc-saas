// Constantes de type — les données viennent de la base de données

export const ROLES = ["direction", "commercial", "conducteur", "ouvrier", "administratif"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  direction: "Direction / Gérant",
  commercial: "Commercial",
  conducteur: "Conducteur de travaux",
  ouvrier: "Ouvrier / Technicien",
  administratif: "Assistant administratif",
};
