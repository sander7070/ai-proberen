import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Scan from "@/components/Scan";
import { paginaMetadata, professionalService } from "@/lib/seo";

const OMSCHRIJVING =
  "Zes vragen over uw organisatie. U krijgt meteen een richtcijfer van hoeveel uur er per maand naar terugkerend werk gaat, en waar de winst zit.";

export const metadata: Metadata = paginaMetadata({
  titel: "Automatisatiescan",
  omschrijving: OMSCHRIJVING,
  pad: "/automatisatiescan",
});

export default function Automatisatiescan() {
  return (
    <>
      <JsonLd data={professionalService(OMSCHRIJVING, "/automatisatiescan")} />

      <section className="gloed relative isolate pt-16 md:pt-24">
        <div className="shell">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink/45">
            Automatisatiescan
          </p>
          <h1 className="mt-4 max-w-3xl text-display font-semibold">
            Zes vragen. Eén <span className="tekst-merk">richtcijfer</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lede text-ink/70">
            U krijgt meteen te zien hoeveel uur er bij u per maand naar terugkerend werk gaat,
            en in welke domeinen de winst het grootst is. Pas daarna vragen we uw gegevens.
          </p>
        </div>
      </section>

      <section className="shell mt-12 md:mt-16">
        <Scan />
      </section>
    </>
  );
}
