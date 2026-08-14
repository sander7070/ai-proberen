# upgrAIde — repo-conventies

- Taal van alle UI-tekst: Belgisch Nederlands, u-vorm.
- Verboden woorden in UI: LLM, RAG, agent(ic), orchestration, vector, generative AI.
- Designtokens staan in app/globals.css. Nooit hardcoded hex in componenten.
- Animatie: uitsluitend Framer Motion, whileInView met once:true.
- Elke animatie respecteert prefers-reduced-motion.
- Cijfers over resultaten zijn richtcijfers en dragen altijd een disclaimer.
- Visuele norm: /referentie/index-licht.html

## Positionering

- Wel: "voor bedrijven die slimmer willen werken", "van één taak tot een volledige organisatie".
- Nooit: "voor Vlaamse KMO's", "u hebt geen extra medewerker nodig".
- Uitleggen in gevolgen, niet in techniek: "een aanvraag komt binnen, upgrAIde leest ze,
  vult uw CRM aan en zet de volgende stap".

## Vaste regels

- De scanformules in `lib/scan.ts` en de zin in `DISCLAIMER` liggen vast. Niet wijzigen.
- Geen `any` in TypeScript. `noUncheckedIndexedAccess` staat aan.
- De twee cases blijven gelabeld als "Voorbeeldscenario". Geen verzonnen klantcijfers of logo's.
- Webhook-URL's staan nooit onder `NEXT_PUBLIC_` en worden enkel in `app/api/scan/route.ts`
  gelezen.
- Geen extra animatiebibliotheken naast Framer Motion. Geen UI-kit.

## Lettertype

Satoshi komt van Fontshare via een stylesheet in `app/layout.tsx`. Plus Jakarta Sans staat
eronder als zelfgehoste terugval, zodat er geen onzichtbare tekst of layoutsprong is wanneer
Fontshare traag of onbereikbaar is. Zodra de Satoshi-woff2-bestanden in de repo staan, kan de
stack overschakelen op `next/font/local` en mag de externe stylesheet weg.
