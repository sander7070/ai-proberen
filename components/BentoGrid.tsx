import Clip from "@/components/Clip";
import Counter from "@/components/Counter";
import GlassCard from "@/components/GlassCard";
import Marquee from "@/components/Marquee";
import Onthult, { OnthultItem } from "@/components/Onthult";

export default function BentoGrid() {
  return (
    <Onthult gespreid className="grid grid-cols-1 gap-3 md:grid-cols-6 md:gap-4">
      <OnthultItem className="md:col-span-4">
        <GlassCard className="h-full p-7 md:p-10">
          <h2 className="text-title font-semibold">
            Van aanvraag tot <span className="tekst-merk">afgehandelde taak</span>
          </h2>
          <p className="mt-5 max-w-xl text-lede text-ink/70">
            Een aanvraag komt binnen. upgrAIde leest ze, herkent waar ze over gaat, vult uw
            CRM aan en zet meteen de volgende stap. Uw mensen zien het resultaat, niet het
            werk eronder.
          </p>
          <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-ink/65">
            U beslist per stap hoever dat gaat. Van één taak die u nooit meer manueel doet,
            tot een keten die een volledige afdeling ontlast.
          </p>
        </GlassCard>
      </OnthultItem>

      <OnthultItem className="md:col-span-2">
        <GlassCard className="h-full">
          <div className="aspect-[4/3] w-full md:aspect-auto md:h-full md:min-h-[15rem]">
            <Clip
              bron="/video/clip1.mp4"
              poster="/video/poster.jpg"
              omschrijving="Otto verwerkt een binnenkomende aanvraag"
            />
          </div>
        </GlassCard>
      </OnthultItem>

      <OnthultItem className="md:col-span-2">
        <GlassCard className="flex h-full flex-col justify-between p-7 md:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink/65">
            Werkdomeinen
          </p>
          <p className="mt-6 text-[3.4rem] font-semibold leading-none tracking-[-0.05em]">
            <Counter waarde={8} className="tekst-merk tabular-nums" />
          </p>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/60">
            domeinen waar we vandaag terugkerend werk overnemen — van mailverkeer tot
            rapportering.
          </p>
        </GlassCard>
      </OnthultItem>

      <OnthultItem className="md:col-span-2">
        <GlassCard className="h-full p-7 md:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink/65">
            Integratie
          </p>
          <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em]">
            Uw systemen praten met elkaar
          </h3>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/60">
            CRM, boekhouding, mailbox en planning blijven staan waar ze staan. Wij leggen de
            verbindingen die er vandaag niet zijn.
          </p>
        </GlassCard>
      </OnthultItem>

      <OnthultItem className="md:col-span-2">
        <GlassCard className="h-full">
          <div className="aspect-[4/3] w-full md:aspect-auto md:h-full md:min-h-[15rem]">
            <Clip
              bron="/video/clip2.mp4"
              poster="/video/poster.jpg"
              omschrijving="Nora bereidt een antwoord voor"
            />
          </div>
        </GlassCard>
      </OnthultItem>

      <OnthultItem className="md:col-span-6">
        <GlassCard stil className="py-7">
          <h3 className="px-7 text-xs font-medium uppercase tracking-[0.18em] text-ink/65 md:px-8">
            Uw digitale collega&apos;s
          </h3>
          <div className="mt-5">
            <Marquee rand="glass" />
          </div>
        </GlassCard>
      </OnthultItem>
    </Onthult>
  );
}
