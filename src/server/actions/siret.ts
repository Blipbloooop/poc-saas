"use server";

import { z } from "zod";

const siretSchema = z.string().regex(/^\d{14}$/, "Le SIRET doit contenir 14 chiffres");

export interface EntrepriseInfo {
  siren: string;
  siret: string;
  nom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  tvaIntracommunautaire: string;
}

export type LookupSiretResult =
  | { success: true; data: EntrepriseInfo }
  | { success: false; error: string };

interface SireneAdresse {
  numeroVoieEtablissement?: string;
  typeVoieEtablissement?: string;
  libelleVoieEtablissement?: string;
  codePostalEtablissement?: string;
  libelleCommuneEtablissement?: string;
}

interface SireneUniteLegale {
  denominationUniteLegale?: string;
  prenom1UniteLegale?: string;
  nomUniteLegale?: string;
}

interface SireneEtablissementResponse {
  etablissement: {
    siren: string;
    siret: string;
    uniteLegale: SireneUniteLegale;
    adresseEtablissement: SireneAdresse;
  };
}

// Clé de contrôle TVA intracommunautaire française : FR + clé (2 chiffres) + SIREN
function computeTvaIntracommunautaire(siren: string): string {
  const key = (12 + 3 * (Number(siren) % 97)) % 97;
  return `FR${String(key).padStart(2, "0")}${siren}`;
}

export async function lookupSiret(siretInput: string): Promise<LookupSiretResult> {
  const parsed = siretSchema.safeParse(siretInput.replace(/\D/g, ""));
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  const siret = parsed.data;

  const apiKey = process.env.INSEE_API_KEY;
  if (!apiKey) {
    return { success: false, error: "Recherche SIRET indisponible : clé API INSEE non configurée" };
  }

  try {
    const res = await fetch(`https://api.insee.fr/api-sirene/3.11/siret/${siret}`, {
      headers: {
        Accept: "application/json",
        "X-INSEE-Api-Key-Integration": apiKey,
      },
    });

    if (res.status === 404) {
      return { success: false, error: "Aucune entreprise trouvée pour ce SIRET" };
    }
    if (res.status === 401 || res.status === 403) {
      return { success: false, error: "Authentification INSEE refusée — vérifiez la clé API" };
    }
    if (!res.ok) {
      return { success: false, error: `Erreur de l'API Sirene (${res.status})` };
    }

    const json = (await res.json()) as SireneEtablissementResponse;
    const { uniteLegale, adresseEtablissement, siren, siret: siretResp } = json.etablissement;

    const nom =
      uniteLegale.denominationUniteLegale ||
      `${uniteLegale.prenom1UniteLegale ?? ""} ${uniteLegale.nomUniteLegale ?? ""}`.trim();

    const adresse = [
      adresseEtablissement.numeroVoieEtablissement,
      adresseEtablissement.typeVoieEtablissement,
      adresseEtablissement.libelleVoieEtablissement,
    ]
      .filter(Boolean)
      .join(" ");

    return {
      success: true,
      data: {
        siren,
        siret: siretResp,
        nom,
        adresse,
        codePostal: adresseEtablissement.codePostalEtablissement ?? "",
        ville: adresseEtablissement.libelleCommuneEtablissement ?? "",
        tvaIntracommunautaire: computeTvaIntracommunautaire(siren),
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erreur inconnue lors de la recherche SIRET",
    };
  }
}
