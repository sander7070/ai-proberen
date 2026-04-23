#!/usr/bin/env python3
"""
AI Screen Reader — laat Claude meekijken op je scherm en corrigeren waar nodig.

Gebruik:
  python screen_reader.py                   # Interactieve modus
  python screen_reader.py --monitor         # Continue bewakingsmodus
  python screen_reader.py --vraag "..."     # Stel een directe vraag over het scherm
  python screen_reader.py --auto            # Volautomatische correctiemodus
"""

import argparse
import base64
import io
import json
import sys
import time
from typing import Optional

import mss
import mss.tools
from PIL import Image

import anthropic
import config
from actions import TOOL_DEFINITIES, voer_tool_uit

client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)

SYSTEEM_PROMPT = """Je bent een AI-assistent die meekijkt op het scherm van de gebruiker.
Je analyseert schermafbeeldingen en helpt de gebruiker door:
- Fouten, problemen of verbeteringen te signaleren
- Op verzoek acties uit te voeren via de beschikbare tools
- Vragen te beantwoorden over wat er op het scherm staat

Wees beknopt in je uitleg. Als je een actie uitvoert, leg kort uit waarom.
Gebruik tools alleen als dat echt nodig of gevraagd is.
Spreek Nederlands tenzij de gebruiker een andere taal gebruikt."""


def maak_screenshot(monitor_index: int = 1) -> tuple[Image.Image, str]:
    """Maak een screenshot en geef het als PIL Image en base64-string terug."""
    with mss.mss() as sct:
        monitors = sct.monitors
        if monitor_index >= len(monitors):
            monitor_index = 1
        scherm = sct.grab(monitors[monitor_index])
        img = Image.frombytes("RGB", scherm.size, scherm.bgra, "raw", "BGRX")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG", optimize=True)
    buffer.seek(0)

    # Verklein als afbeelding te groot is (max 1568px breed voor API)
    if img.width > 1568:
        verhouding = 1568 / img.width
        nieuw = (1568, int(img.height * verhouding))
        img = img.resize(nieuw, Image.LANCZOS)
        buffer = io.BytesIO()
        img.save(buffer, format="PNG", optimize=True)
        buffer.seek(0)

    b64 = base64.standard_b64encode(buffer.getvalue()).decode("utf-8")
    return img, b64


def analyseer_scherm(
    b64_screenshot: str,
    vraag: str = "",
    geschiedenis: Optional[list] = None,
    auto_act: bool = False,
) -> tuple[str, list]:
    """
    Stuur screenshot naar Claude en verwerk tool-aanroepen als die terugkomen.
    Geeft (antwoord_tekst, bijgewerkte_geschiedenis) terug.
    """
    if geschiedenis is None:
        geschiedenis = []

    gebruiker_bericht = {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": b64_screenshot,
                },
            },
            {
                "type": "text",
                "text": vraag or "Analyseer het scherm. Zijn er problemen of verbeterpunten? "
                "Voer alleen acties uit als dat expliciet gevraagd is.",
            },
        ],
    }

    geschiedenis.append(gebruiker_bericht)

    antwoord_tekst = ""

    while True:
        response = client.messages.create(
            model=config.MODEL,
            max_tokens=config.MAX_TOKENS,
            system=SYSTEEM_PROMPT,
            tools=TOOL_DEFINITIES,
            messages=geschiedenis,
        )

        # Verwerk alle content-blokken
        assistant_blokken = []
        voor_tool_tekst = ""

        for blok in response.content:
            assistant_blokken.append(blok)
            if blok.type == "text":
                voor_tool_tekst += blok.text
                antwoord_tekst += blok.text

        geschiedenis.append({"role": "assistant", "content": response.content})

        if response.stop_reason != "tool_use":
            break

        # Verwerk tool-aanroepen
        tool_resultaten = []
        for blok in response.content:
            if blok.type != "tool_use":
                continue

            tool_naam = blok.name
            tool_invoer = blok.input

            print(f"\n[TOOL] {tool_naam}({json.dumps(tool_invoer, ensure_ascii=False)})")

            if not auto_act and not config.AUTO_ACT:
                bevestig = input("Uitvoeren? [j/n]: ").strip().lower()
                if bevestig not in ("j", "ja", "y", "yes"):
                    resultaat = "Actie geannuleerd door gebruiker."
                    print(f"[GEANNULEERD] {tool_naam}")
                else:
                    resultaat = voer_tool_uit(tool_naam, tool_invoer)
                    print(f"[KLAAR] {resultaat}")
            else:
                resultaat = voer_tool_uit(tool_naam, tool_invoer)
                print(f"[AUTO] {resultaat}")

            tool_resultaten.append({
                "type": "tool_result",
                "tool_use_id": blok.id,
                "content": resultaat,
            })

        if tool_resultaten:
            geschiedenis.append({"role": "user", "content": tool_resultaten})

    return antwoord_tekst, geschiedenis


def interactieve_modus():
    """Conversatie-interface waarbij de gebruiker vragen kan stellen over het scherm."""
    print("=" * 60)
    print("  AI Screen Reader — Interactieve modus")
    print("  Typ 'stop' om te beëindigen")
    print("  Typ 'scherm' voor een nieuw screenshot")
    print("=" * 60)

    geschiedenis: list = []
    laatste_b64: Optional[str] = None

    while True:
        try:
            vraag = input("\nVraag: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nAfsluiten...")
            break

        if vraag.lower() in ("stop", "exit", "quit", "q"):
            print("Tot ziens!")
            break

        if not vraag or vraag.lower() in ("scherm", "screenshot", "s"):
            print("[Screenshot maken...]")
            _, laatste_b64 = maak_screenshot(config.MONITOR_INDEX)
            if not vraag or vraag.lower() in ("scherm", "screenshot", "s"):
                vraag = "Wat zie je op het scherm?"

        if laatste_b64 is None:
            print("[Screenshot maken...]")
            _, laatste_b64 = maak_screenshot(config.MONITOR_INDEX)

        print("[Analyseren...]")
        antwoord, geschiedenis = analyseer_scherm(laatste_b64, vraag, geschiedenis)
        print(f"\nClaude: {antwoord}")


def bewakings_modus():
    """Voortdurend scherm monitoren en problemen rapporteren."""
    print("=" * 60)
    print(f"  AI Screen Reader — Bewakingsmodus (interval: {config.SCREENSHOT_INTERVAL}s)")
    print("  Druk op Ctrl+C om te stoppen")
    print("=" * 60)

    vorige_analyse = ""
    teller = 0

    try:
        while True:
            teller += 1
            print(f"\n[#{teller}] Screenshot maken...")
            _, b64 = maak_screenshot(config.MONITOR_INDEX)

            vraag = (
                "Analyseer het scherm. Meld alleen als er duidelijke problemen, fouten, "
                "of iets opvallends is. Als alles normaal is, zeg dan enkel 'Alles in orde.'"
            )

            antwoord, _ = analyseer_scherm(b64, vraag, auto_act=False)

            if antwoord.strip() != vorige_analyse.strip():
                print(f"Claude: {antwoord}")
                vorige_analyse = antwoord
            else:
                print("(Geen wijzigingen)")

            time.sleep(config.SCREENSHOT_INTERVAL)

    except KeyboardInterrupt:
        print("\nBewaking gestopt.")


def directe_vraag_modus(vraag: str):
    """Eenmalig een vraag stellen over het scherm."""
    print(f"[Screenshot maken voor vraag: {vraag!r}]")
    _, b64 = maak_screenshot(config.MONITOR_INDEX)
    antwoord, _ = analyseer_scherm(b64, vraag)
    print(antwoord)


def auto_modus():
    """Volledig automatische modus: analyseer en handel onmiddellijk."""
    print("=" * 60)
    print("  AI Screen Reader — Volautomatische modus")
    print("  LET OP: Claude voert acties UIT zonder bevestiging!")
    print("  Druk op Ctrl+C om te stoppen")
    print("=" * 60)

    bevestig = input("Weet je het zeker? Typ 'ja' om te starten: ").strip().lower()
    if bevestig not in ("ja", "j"):
        print("Geannuleerd.")
        return

    try:
        while True:
            print("\n[Screenshot maken...]")
            _, b64 = maak_screenshot(config.MONITOR_INDEX)

            vraag = (
                "Bekijk het scherm aandachtig. Als je een fout, probleem of iets ziet "
                "dat gecorrigeerd moet worden, doe dat dan direct met de beschikbare tools. "
                "Als alles goed is, zeg dan enkel 'Alles in orde.'"
            )

            antwoord, _ = analyseer_scherm(b64, vraag, auto_act=True)
            print(f"Claude: {antwoord}")

            time.sleep(config.SCREENSHOT_INTERVAL)

    except KeyboardInterrupt:
        print("\nAutomatische modus gestopt.")


def main():
    parser = argparse.ArgumentParser(
        description="AI Screen Reader — Claude kijkt mee op je scherm"
    )
    parser.add_argument(
        "--monitor",
        action="store_true",
        help="Start continue bewakingsmodus",
    )
    parser.add_argument(
        "--vraag",
        type=str,
        help="Stel een directe vraag over het huidige scherm",
    )
    parser.add_argument(
        "--auto",
        action="store_true",
        help="Volautomatische correctiemodus (geen bevestiging vereist)",
    )
    parser.add_argument(
        "--monitor-nr",
        type=int,
        default=config.MONITOR_INDEX,
        help=f"Monitor-nummer om te gebruiken (standaard: {config.MONITOR_INDEX})",
    )

    args = parser.parse_args()
    config.MONITOR_INDEX = args.monitor_nr

    if args.vraag:
        directe_vraag_modus(args.vraag)
    elif args.monitor:
        bewakings_modus()
    elif args.auto:
        auto_modus()
    else:
        interactieve_modus()


if __name__ == "__main__":
    main()
