import type {
  DomeinSleutel,
  FoutSleutel,
  GrootteSleutel,
  TijdSleutel,
} from "@/lib/scan";
import { DOMEIN_LABEL } from "@/lib/scan";

export type Keuze<T extends string> = { waarde: T; label: string; hint?: string };

export type Vraag =
  | { id: "grootte"; type: "enkel"; titel: string; hulp: string; keuzes: Keuze<GrootteSleutel>[] }
  | { id: "domeinen"; type: "meer"; titel: string; hulp: string; keuzes: Keuze<DomeinSleutel>[] }
  | { id: "afdelingen"; type: "meer"; titel: string; hulp: string; keuzes: Keuze<string>[] }
  | { id: "systemen"; type: "meer"; titel: string; hulp: string; keuzes: Keuze<string>[] }
  | { id: "fout"; type: "enkel"; titel: string; hulp: string; keuzes: Keuze<FoutSleutel>[] }
  | { id: "tijd"; type: "enkel"; titel: string; hulp: string; keuzes: Keuze<TijdSleutel>[] };

const domeinKeuzes = (Object.keys(DOMEIN_LABEL) as DomeinSleutel[]).map((waarde) => ({
  waarde,
  label: DOMEIN_LABEL[waarde],
}));

export const VRAGEN: Vraag[] = [
  {
    id: "grootte",
    type: "enkel",
    titel: "Hoe groot is uw organisatie?",
    hulp: "Het aantal medewerkers bepaalt hoeveel werk er door de organisatie stroomt.",
    keuzes: [
      { waarde: "1-10", label: "1 tot 10 medewerkers" },
      { waarde: "11-50", label: "11 tot 50 medewerkers" },
      { waarde: "51-250", label: "51 tot 250 medewerkers" },
      { waarde: "250+", label: "Meer dan 250 medewerkers" },
    ],
  },
  {
    id: "domeinen",
    type: "meer",
    titel: "Waar zit vandaag het meeste repetitieve werk?",
    hulp: "Kies alles wat van toepassing is. Meerdere antwoorden mogen.",
    keuzes: domeinKeuzes,
  },
  {
    id: "afdelingen",
    type: "meer",
    titel: "Welke afdelingen zijn erbij betrokken?",
    hulp: "Hoe meer afdelingen een taak passeert, hoe meer overdrachtmomenten er zijn.",
    keuzes: [
      { waarde: "verkoop", label: "Verkoop" },
      { waarde: "administratie", label: "Administratie" },
      { waarde: "klantendienst", label: "Klantendienst" },
      { waarde: "boekhouding", label: "Boekhouding" },
      { waarde: "operations", label: "Operations of productie" },
      { waarde: "hr", label: "Personeelszaken" },
      { waarde: "marketing", label: "Marketing" },
      { waarde: "directie", label: "Directie" },
    ],
  },
  {
    id: "systemen",
    type: "meer",
    titel: "Met welke systemen werkt u?",
    hulp: "Systemen die vandaag niet met elkaar praten, zijn meestal de grootste tijdvreter.",
    keuzes: [
      { waarde: "crm", label: "CRM" },
      { waarde: "boekhouding", label: "Boekhoudpakket" },
      { waarde: "erp", label: "ERP" },
      { waarde: "mail", label: "Mailbox en agenda" },
      { waarde: "webshop", label: "Webshop of website" },
      { waarde: "planning", label: "Planningstool" },
      { waarde: "documenten", label: "Documentbeheer" },
      { waarde: "rekenblad", label: "Excel of Google Sheets" },
    ],
  },
  {
    id: "fout",
    type: "enkel",
    titel: "Waar ontstaan vandaag de meeste vertragingen of fouten?",
    hulp: "Eén antwoord. Het zwaartepunt volstaat.",
    keuzes: [
      { waarde: "overtypen", label: "Gegevens overtypen van het ene systeem naar het andere" },
      { waarde: "opvolging", label: "Opvolging die blijft liggen" },
      { waarde: "goedkeuringen", label: "Goedkeuringen die vastlopen" },
      { waarde: "rapportering", label: "Rapportering die te laat komt" },
      { waarde: "onbekend", label: "Dat weten we vandaag niet precies" },
    ],
  },
  {
    id: "tijd",
    type: "enkel",
    titel: "Hoeveel tijd gaat er per persoon per week naar terugkerende taken?",
    hulp: "Een ruwe inschatting volstaat.",
    keuzes: [
      { waarde: "<2u", label: "Minder dan 2 uur" },
      { waarde: "2-5u", label: "2 tot 5 uur" },
      { waarde: "5-10u", label: "5 tot 10 uur" },
      { waarde: ">10u", label: "Meer dan 10 uur" },
    ],
  },
];
