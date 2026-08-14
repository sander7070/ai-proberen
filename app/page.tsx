import type { Metadata } from "next";
import Link from "next/link";
import BentoGrid from "@/components/BentoGrid";
import Chat from "@/components/Chat";
import GlassCard from "@/components/GlassCard";
import JsonLd from "@/components/JsonLd";
import LiveBoard from "@/components/LiveBoard";
import Onthult, { OnthultItem } from "@/components/Onthult";
import VideoStage from "@/components/VideoStage";
import { contactLink } from "@/lib/config";
import { paginaMetadata, professionalService } from "@/lib/seo";

const OMSCHRIJVING =
  "upgrAIde verbindt uw systemen en neemt terugkerend werk over. Voor bedrijven die slimmer willen werken — van één taak tot een volledige organisatie.";

export const metadata: Metadata = paginaMetadata({
  titel: "Minder manueel werk, meer capaciteit",
  omschrijving: OMSCHRIJVING,
  pad: "/",
});

const CASES = [
  {
    profiel: "Technische groothandel, 60 medewerkers",
    situatie:
      "Aanvragen komen binnen via mail en via de webshop. Iemand typt ze over in het CRM, zoekt de juiste prijs op en stuurt een offerte.",
    daarna:
      "De aanvraag wordt gelezen en herkend, het CRM is bijgewerkt voor iemand ze opent, en de offerte ligt klaar om na te kijken.",
  },
  {
    profiel: "Dienstverlener, 25 medewerkers",
    situatie:
      "Na elk gesprek volgt een verslag, een taak voor de collega en een herinnering in de agenda. In drukke weken blijft dat liggen.",
    daarna:
      "Het verslag staat bij de juiste klant, de taak is aangemaakt en de opvolging staat ingepland. Niemand hoeft eraan te denken.",
  },
];

export default function Home() {
  return (
    <>
      <JsonLd data={professionalService(OMSCHRIJVING, "/")} />
      {/* De poster van het heropaneel is het grootste element boven de vouw. */}
      <link rel="preload" as="image" href="/video/poster.jpg" fetchPriority="high" />

      {/* ------------------------------------------------------------ hero */}
      <section className="gloed relative isolate pt-14 md:pt-20">
        <div className="shell">
          <Onthult gespreid className="max-w-3xl">
            <OnthultItem>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink/65">
                Automatisatie en systeemintegratie
              </p>
            </OnthultItem>
            <OnthultItem>
              <h1 className="mt-5 text-display font-semibold">
                Minder manueel werk.
                <br />
                Meer <span className="tekst-merk">capaciteit</span>.
              </h1>
            </OnthultItem>
            <OnthultItem>
              <p className="mt-7 max-w-xl text-lede text-ink/70">
                Een aanvraag komt binnen, upgrAIde leest ze, vult uw CRM aan en zet de volgende
                stap. Voor bedrijven die slimmer willen werken — van één taak tot een volledige
                organisatie.
              </p>
            </OnthultItem>
            <OnthultItem>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/automatisatiescan"
                  className="rounded-pill bg-ink px-7 py-3.5 text-sm font-medium text-paper transition-opacity hover:opacity-90"
                >
                  Doe de automatisatiescan
                </Link>
                <a
                  href={contactLink()}
                  className="rounded-pill border border-ink/15 px-7 py-3.5 text-sm font-medium transition-colors hover:border-ink/35"
                >
                  Plan een gesprek
                </a>
              </div>
            </OnthultItem>
          </Onthult>

          <div className="mt-14 md:mt-16">
            <VideoStage />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ bento */}
      <section className="shell mt-24 md:mt-32">
        <BentoGrid />
      </section>

      {/* -------------------------------------------------------- liveboard */}
      <section className="shell mt-24 md:mt-32">
        <Onthult className="max-w-2xl">
          <h2 className="text-title font-semibold">
            Zo ziet een <span className="tekst-merk">werkdag</span> eruit
          </h2>
          <p className="mt-5 text-lede text-ink/70">
            Werk komt binnen, wordt gelezen, herkend, beoordeeld en uitgevoerd. Uw mensen komen
            pas in beeld waar hun oordeel echt nodig is.
          </p>
        </Onthult>
        <Onthult className="mt-10">
          <LiveBoard />
        </Onthult>
      </section>

      {/* ------------------------------------------------------------ cases */}
      <section className="shell mt-24 md:mt-32">
        <Onthult className="max-w-2xl">
          <h2 className="text-title font-semibold">Twee voorbeeldscenario&apos;s</h2>
          <p className="mt-5 text-lede text-ink/70">
            Geen bestaande klanten en geen cijfers die we niet kunnen staven. Dit zijn opgestelde
            situaties die tonen hoe een keten er in de praktijk uitziet.
          </p>
        </Onthult>

        <Onthult gespreid className="mt-10 grid gap-3 md:grid-cols-2 md:gap-4">
          {CASES.map((c) => (
            <OnthultItem key={c.profiel}>
              <GlassCard className="h-full p-7 md:p-8">
                <p className="inline-block rounded-pill bg-ink/6 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-ink/65">
                  Voorbeeldscenario
                </p>
                <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em]">{c.profiel}</h3>

                <p className="mt-6 text-xs font-medium uppercase tracking-[0.18em] text-ink/65">
                  Vandaag
                </p>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/65">{c.situatie}</p>

                <p className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-ink/65">
                  Met upgrAIde
                </p>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/80">{c.daarna}</p>
              </GlassCard>
            </OnthultItem>
          ))}
        </Onthult>
      </section>

      {/* ------------------------------------------------------------- chat */}
      <section className="shell mt-24 md:mt-32">
        <div className="grid items-start gap-8 md:grid-cols-2 md:gap-12">
          <Onthult>
            <h2 className="text-title font-semibold">
              Liever eerst even <span className="tekst-merk">praten</span>?
            </h2>
            <p className="mt-5 text-lede text-ink/70">
              Stel uw situatie in een paar klikken voor. U kiest daarna zelf of u de scan doet of
              meteen een gesprek inplant.
            </p>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/65">
              Wat u hier invult, blijft in uw browser. We vragen pas gegevens wanneer u ze zelf
              wil achterlaten.
            </p>
          </Onthult>

          <Onthult>
            <Chat />
          </Onthult>
        </div>
      </section>

      {/* -------------------------------------------------------------- cta */}
      <section className="shell mt-24 md:mt-32">
        <Onthult>
          <GlassCard className="p-9 text-center md:p-16">
            <h2 className="mx-auto max-w-2xl text-title font-semibold">
              Weten waar bij u de <span className="tekst-merk">tijd blijft liggen</span>?
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lede text-ink/70">
              Zes vragen, twee minuten. U krijgt meteen een richtcijfer en de domeinen waar de
              winst het grootst is.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="/automatisatiescan"
                className="rounded-pill bg-ink px-7 py-3.5 text-sm font-medium text-paper transition-opacity hover:opacity-90"
              >
                Start de scan
              </Link>
              <Link
                href="/oplossingen"
                className="rounded-pill border border-ink/15 px-7 py-3.5 text-sm font-medium transition-colors hover:border-ink/35"
              >
                Bekijk de oplossingen
              </Link>
            </div>
          </GlassCard>
        </Onthult>
      </section>
    </>
  );
}
