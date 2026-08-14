/**
 * Rekenkern van de automatisatiescan.
 *
 * De wegingen en de formules hieronder liggen vast. Wijzig ze niet zonder
 * uitdrukkelijke opdracht: de uitkomst wordt naar buiten gecommuniceerd en
 * moet over gesprekken heen consistent blijven.
 */

export const GROOTTE = { "1-10": 0.45, "11-50": 1, "51-250": 2.4, "250+": 4.2 } as const;

export const FOUTEN = {
  overtypen: 1.2,
  opvolging: 1.15,
  goedkeuringen: 1.1,
  rapportering: 1.05,
  onbekend: 1,
} as const;

export const TIJD = { "<2u": 0.7, "2-5u": 1, "5-10u": 1.35, ">10u": 1.7 } as const;

export const BASIS = {
  mail: 18,
  offertes: 15,
  facturen: 14,
  leads: 13,
  klantvragen: 12,
  planning: 11,
  documenten: 10,
  rapportering: 8,
} as const;

export type GrootteSleutel = keyof typeof GROOTTE;
export type FoutSleutel = keyof typeof FOUTEN;
export type TijdSleutel = keyof typeof TIJD;
export type DomeinSleutel = keyof typeof BASIS;

/** Verplichte zin onder elk resultaat. Woordelijk overnemen. */
export const DISCLAIMER =
  "Dat is een richtcijfer op basis van organisaties met een vergelijkbaar profiel — geen belofte. " +
  "Wat het bij u werkelijk is, meten we in het gesprek.";

export type Leadscore = "heet" | "warm" | "nurture";

export type DomeinUitkomst = {
  domein: DomeinSleutel;
  label: string;
  uren: number;
  low: number;
  high: number;
};

export type ScanAntwoorden = {
  grootte: GrootteSleutel | null;
  domeinen: DomeinSleutel[];
  afdelingen: string[];
  systemen: string[];
  fout: FoutSleutel | null;
  tijd: TijdSleutel | null;
};

export type ScanResultaat = {
  low: number;
  high: number;
  aantalKansen: number;
  leadscore: Leadscore;
  top: DomeinUitkomst[];
};

export const legeAntwoorden: ScanAntwoorden = {
  grootte: null,
  domeinen: [],
  afdelingen: [],
  systemen: [],
  fout: null,
  tijd: null,
};

export const DOMEIN_LABEL: Record<DomeinSleutel, string> = {
  mail: "Mailverkeer en aanvragen",
  offertes: "Offertes opmaken",
  facturen: "Facturatie en opvolging",
  leads: "Leads opvolgen",
  klantvragen: "Klantvragen beantwoorden",
  planning: "Planning en agenda",
  documenten: "Documenten verwerken",
  rapportering: "Rapportering",
};

/**
 * uren(domein) = BASIS[domein] * grootte * fout * tijd
 * low = totaal * 0.42, high = totaal * 0.68 (bewust conservatief)
 */
export function berekenScan(antwoorden: ScanAntwoorden): ScanResultaat | null {
  const { grootte, fout, tijd, domeinen, afdelingen, systemen } = antwoorden;
  if (!grootte || !fout || !tijd || domeinen.length === 0) return null;

  const wegingGrootte = GROOTTE[grootte];
  const wegingFout = FOUTEN[fout];
  const wegingTijd = TIJD[tijd];

  const perDomein: DomeinUitkomst[] = domeinen.map((domein) => {
    const uren = BASIS[domein] * wegingGrootte * wegingFout * wegingTijd;
    return {
      domein,
      label: DOMEIN_LABEL[domein],
      uren,
      low: Math.round(uren * 0.42),
      high: Math.round(uren * 0.68),
    };
  });

  const totaal = perDomein.reduce((som, d) => som + d.uren, 0);
  const low = Math.round(totaal * 0.42);
  const high = Math.round(totaal * 0.68);

  const aantalKansen = Math.max(
    4,
    domeinen.length + (afdelingen.length > 2 ? 2 : 1) + (systemen.length >= 4 ? 1 : 0),
  );

  const leadscore: Leadscore = high >= 60 ? "heet" : high >= 25 ? "warm" : "nurture";

  const top = [...perDomein].sort((a, b) => b.uren - a.uren).slice(0, 4);

  return { low, high, aantalKansen, leadscore, top };
}

export function getal(n: number): string {
  return n.toLocaleString("nl-BE");
}
