import type { Metadata } from "next";
import Link from "next/link";
import Counter from "@/components/Counter";
import GlassCard from "@/components/GlassCard";
import JsonLd from "@/components/JsonLd";
import Marquee from "@/components/Marquee";
import Onthult, { OnthultItem } from "@/components/Onthult";
import { contactLink } from "@/lib/config";
import { DOMEIN_LABEL, type DomeinSleutel } from "@/lib/scan";
import { paginaMetadata, professionalService } from "@/lib/seo";

const OMSCHRIJVING =
  "Van mailverkeer en offertes tot facturatie en rapportering: waar upgrAIde terugkerend werk overneemt en uw systemen met elkaar verbindt.";

export const metadata: Metadata = paginaMetadata({
  titel: "Oplossingen",
  omschrijving: OMSCHRIJVING,
  pad: "/oplossingen",
});

const UITLEG: Record<DomeinSleutel, string> = {
  mail: "Binnenkomende berichten worden gelezen, gesorteerd en bij het juiste dossier gezet. Wat een antwoord nodig heeft, ligt klaar.",
  offertes:
    "Een aanvraag wordt herkend, de juiste prijzen en voorwaarden worden opgezocht en de offerte staat klaar om na te kijken.",
  facturen:
    "Facturen worden aangemaakt, gecontroleerd op afwijkingen en opgevolgd tot ze betaald zijn.",
  leads:
    "Nieuwe leads komen volledig in uw CRM terecht, met de juiste bron, en de eerste opvolging staat ingepland.",
  klantvragen:
    "Terugkerende vragen krijgen een voorbereid antwoord. Uw medewerker kijkt na en verstuurt.",
  planning:
    "Afspraken, taken en herinneringen worden ingepland op basis van wat er echt gebeurd is.",
  documenten:
    "Documenten worden uitgelezen, hernoemd en op de juiste plaats gezet, met de gegevens eruit in uw systemen.",
  rapportering:
    "Cijfers worden verzameld uit uw systemen en op tijd bezorgd, zonder dat iemand ze samenraapt.",
};

const AANPAK = [
  {
    stap: "01",
    titel: "We kijken mee",
    tekst:
      "We lopen met uw mensen mee door het werk zoals het vandaag gebeurt. Niet wat op papier staat, wel wat er echt gebeurt.",
  },
  {
    stap: "02",
    titel: "We beginnen bij één taak",
    tekst:
      "De eerste keten is klein en meetbaar. U ziet binnen enkele weken of het werkt voor u.",
  },
  {
    stap: "03",
    titel: "We breiden uit waar het loont",
    tekst:
      "Werkt de eerste keten, dan volgt de volgende. U beslist per stap hoever dat gaat.",
  },
  {
    stap: "04",
    titel: "We blijven meekijken",
    tekst:
      "Uw werk verandert, dus de keten verandert mee. We houden ze bij en melden het als iets vastloopt.",
  },
];

const DOMEINEN = Object.keys(DOMEIN_LABEL) as DomeinSleutel[];

export default function Oplossingen() {
  return (
    <>
      <JsonLd data={professionalService(OMSCHRIJVING, "/oplossingen")} />

      <section className="gloed relative isolate pt-16 md:pt-24">
        <div className="shell">
          <Onthult gespreid className="max-w-3xl">
            <OnthultItem>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink/65">
                Oplossingen
              </p>
            </OnthultItem>
            <OnthultItem>
              <h1 className="mt-5 text-display font-semibold">
                Van één taak tot een{" "}
                <span className="tekst-merk">volledige organisatie</span>.
              </h1>
            </OnthultItem>
            <OnthultItem>
              <p className="mt-7 max-w-xl text-lede text-ink/70">
                Uw systemen blijven staan waar ze staan. Wij leggen de verbindingen die er
                vandaag niet zijn, en nemen het werk over dat er telkens opnieuw tussen valt.
              </p>
            </OnthultItem>
          </Onthult>
        </div>
      </section>

      {/* -------------------------------------------------------- domeinen */}
      <section className="shell mt-20 md:mt-28">
        <Onthult className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-xl text-title font-semibold">Waar we werk overnemen</h2>
          <p className="text-[0.95rem] text-ink/65">
            <Counter waarde={DOMEINEN.length} className="text-2xl font-semibold text-ink" />{" "}
            domeinen
          </p>
        </Onthult>

        <Onthult gespreid className="mt-10 grid gap-3 md:grid-cols-2 md:gap-4">
          {DOMEINEN.map((d) => (
            <OnthultItem key={d}>
              <GlassCard className="h-full p-7 md:p-8">
                <h3 className="text-xl font-semibold tracking-[-0.03em]">{DOMEIN_LABEL[d]}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/65">{UITLEG[d]}</p>
              </GlassCard>
            </OnthultItem>
          ))}
        </Onthult>
      </section>

      {/* --------------------------------------------------------- collega's */}
      <section className="mt-24 md:mt-32">
        <div className="shell">
          <Onthult className="max-w-2xl">
            <h2 className="text-title font-semibold">
              Elk met <span className="tekst-merk">één duidelijke taak</span>
            </h2>
            <p className="mt-5 text-lede text-ink/70">
              We geven elke keten een naam en een afgebakende opdracht. Zo weet iedereen in uw
              organisatie wie wat doet — ook wanneer het geen mens is.
            </p>
          </Onthult>
        </div>
        <div className="mt-10">
          <Marquee />
        </div>
      </section>

      {/* ----------------------------------------------------------- aanpak */}
      <section className="shell mt-24 md:mt-32">
        <Onthult className="max-w-2xl">
          <h2 className="text-title font-semibold">Onze aanpak</h2>
          <p className="mt-5 text-lede text-ink/70">
            Geen groot traject vooraf. We bewijzen het op één taak en breiden pas uit wanneer u
            het resultaat ziet.
          </p>
        </Onthult>

        <Onthult gespreid className="mt-10 grid gap-3 md:grid-cols-2 md:gap-4">
          {AANPAK.map((a) => (
            <OnthultItem key={a.stap}>
              <GlassCard className="h-full p-7 md:p-8">
                <p className="text-[0.8rem] font-semibold tabular-nums tracking-[0.1em] text-ink/65">
                  {a.stap}
                </p>
                <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em]">{a.titel}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/65">{a.tekst}</p>
              </GlassCard>
            </OnthultItem>
          ))}
        </Onthult>
      </section>

      {/* -------------------------------------------------------------- cta */}
      <section className="shell mt-24 md:mt-32">
        <Onthult>
          <GlassCard className="p-9 text-center md:p-16">
            <h2 className="mx-auto max-w-2xl text-title font-semibold">
              Benieuwd wat dit bij u <span className="tekst-merk">oplevert</span>?
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lede text-ink/70">
              Doe de scan van zes vragen, of leg uw situatie meteen voor in een gesprek van een
              halfuur.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="/automatisatiescan"
                className="rounded-pill bg-ink px-7 py-3.5 text-sm font-medium text-paper transition-opacity hover:opacity-90"
              >
                Start de scan
              </Link>
              <a
                href={contactLink()}
                className="rounded-pill border border-ink/15 px-7 py-3.5 text-sm font-medium transition-colors hover:border-ink/35"
              >
                Plan een gesprek
              </a>
            </div>
          </GlassCard>
        </Onthult>
      </section>
    </>
  );
}
