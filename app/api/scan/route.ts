import { NextResponse } from "next/server";
import { serverConfig } from "@/lib/config";
import { berekenScan } from "@/lib/scan";
import { leesAanvraag } from "@/lib/scanAanvraag";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIJDSLIMIET = 8000;

/** Faalt stil: een trage webhook mag de bezoeker nooit ophouden. */
async function stuurDoor(url: string, lading: unknown): Promise<void> {
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(lading),
      signal: AbortSignal.timeout(TIJDSLIMIET),
    });
  } catch {
    // Bewust ingeslikt. De bezoeker heeft zijn resultaat al.
  }
}

/**
 * Neemt de scan aan en zet ze door naar n8n en het CRM. De webhook-URL's
 * worden hier gelezen en staan niet onder NEXT_PUBLIC_, zodat ze de browser
 * nooit bereiken. Zonder ingevulde URL's werkt de scan gewoon door.
 */
export async function POST(request: Request) {
  let ruw: unknown;
  try {
    ruw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, fout: "onleesbaar" }, { status: 400 });
  }

  const aanvraag = leesAanvraag(ruw);
  if (!aanvraag) {
    return NextResponse.json({ ok: false, fout: "onvolledig" }, { status: 400 });
  }

  // Opnieuw berekenen op de server: de uitkomst van de client is niet leidend.
  const resultaat = berekenScan(aanvraag.antwoorden);
  if (!resultaat) {
    return NextResponse.json({ ok: false, fout: "onvolledig" }, { status: 400 });
  }

  const { webhookUrl, crmWebhookUrl } = serverConfig();
  const lading = {
    bron: "automatisatiescan",
    ontvangen: new Date().toISOString(),
    contact: aanvraag.contact,
    antwoorden: aanvraag.antwoorden,
    resultaat,
  };

  await Promise.allSettled([stuurDoor(webhookUrl, lading), stuurDoor(crmWebhookUrl, lading)]);

  return NextResponse.json({ ok: true, resultaat });
}
