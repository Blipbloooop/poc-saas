export type Activite =
  | "PLOMBERIE"
  | "ELECTRICITE"
  | "MENUISERIE"
  | "MACONNERIE"
  | "PEINTURE"
  | "CHAUFFAGE_CLIMATISATION"
  | "COUVERTURE"
  | "MULTI_SERVICES"
  | "AUTRE";

export type Effectif = "SOLO" | "DE_2_A_5" | "DE_6_A_10" | "DE_11_A_20" | "PLUS_DE_20";

export const ACTIVITES: { value: Activite; label: string }[] = [
  { value: "PLOMBERIE", label: "Plomberie" },
  { value: "ELECTRICITE", label: "Électricité" },
  { value: "MENUISERIE", label: "Menuiserie" },
  { value: "MACONNERIE", label: "Maçonnerie" },
  { value: "PEINTURE", label: "Peinture" },
  { value: "CHAUFFAGE_CLIMATISATION", label: "Chauffage / Climatisation" },
  { value: "COUVERTURE", label: "Couverture" },
  { value: "MULTI_SERVICES", label: "Multi-services" },
  { value: "AUTRE", label: "Autre" },
];

export const EFFECTIFS: { value: Effectif; label: string }[] = [
  { value: "SOLO", label: "Je travaille seul" },
  { value: "DE_2_A_5", label: "2 à 5 salariés" },
  { value: "DE_6_A_10", label: "6 à 10" },
  { value: "DE_11_A_20", label: "11 à 20" },
  { value: "PLUS_DE_20", label: "20+" },
];
