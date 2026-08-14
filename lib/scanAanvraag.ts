import {
  BASIS,
  FOUTEN,
  GROOTTE,
  TIJD,
  type DomeinSleutel,
  type FoutSleutel,
  type GrootteSleutel,
  type ScanAntwoorden,
  type TijdSleutel,
} from "@/lib/scan";

export type ScanContact = {
  naam: string;
  bedrijf: string;
  email: string;
  telefoon: string;
};

export type ScanAanvraag = {
  antwoorden: ScanAntwoorden;
  contact: ScanContact;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isObject(waarde: unknown): waarde is Record<string, unknown> {
  return typeof waarde === "object" && waarde !== null && !Array.isArray(waarde);
}

function tekst(waarde: unknown, max = 200): string | null {
  if (typeof waarde !== "string") return null;
  const schoon = waarde.trim();
  return schoon.length > 0 && schoon.length <= max ? schoon : null;
}

function sleutel<T extends string>(waarde: unknown, toegestaan: Record<T, unknown>): T | null {
  return typeof waarde === "string" && waarde in toegestaan ? (waarde as T) : null;
}

function sleutels<T extends string>(waarde: unknown, toegestaan: Record<T, unknown>): T[] {
  if (!Array.isArray(waarde)) return [];
  const uniek = new Set<T>();
  for (const item of waarde) {
    const gevonden = sleutel<T>(item, toegestaan);
    if (gevonden) uniek.add(gevonden);
  }
  return [...uniek];
}

/** Vrije lijst (afdelingen, systemen): enkel opschonen en begrenzen. */
function vrijeLijst(waarde: unknown): string[] {
  if (!Array.isArray(waarde)) return [];
  return waarde
    .map((item) => tekst(item, 60))
    .filter((item): item is string => item !== null)
    .slice(0, 24);
}

/**
 * Leest de aanvraag uit onbetrouwbare invoer. Geeft null bij alles wat niet
 * klopt, zodat de route nooit met halve gegevens verder werkt.
 */
export function leesAanvraag(ruw: unknown): ScanAanvraag | null {
  if (!isObject(ruw)) return null;

  const a = ruw.antwoorden;
  const c = ruw.contact;
  if (!isObject(a) || !isObject(c)) return null;

  const grootte = sleutel<GrootteSleutel>(a.grootte, GROOTTE);
  const fout = sleutel<FoutSleutel>(a.fout, FOUTEN);
  const tijd = sleutel<TijdSleutel>(a.tijd, TIJD);
  const domeinen = sleutels<DomeinSleutel>(a.domeinen, BASIS);
  if (!grootte || !fout || !tijd || domeinen.length === 0) return null;

  const naam = tekst(c.naam, 120);
  const bedrijf = tekst(c.bedrijf, 120);
  const email = tekst(c.email, 160);
  const telefoon = tekst(c.telefoon, 40);
  if (!naam || !bedrijf || !email || !telefoon || !EMAIL.test(email)) return null;

  return {
    antwoorden: {
      grootte,
      fout,
      tijd,
      domeinen,
      afdelingen: vrijeLijst(a.afdelingen),
      systemen: vrijeLijst(a.systemen),
    },
    contact: { naam, bedrijf, email, telefoon },
  };
}
