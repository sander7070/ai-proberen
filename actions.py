"""
Schermbesturing: muis, toetsenbord en klembord acties.
"""

import time
import subprocess
import platform
import pyautogui
import pyperclip

pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0.3


def klik(x: int, y: int, knop: str = "left", dubbel: bool = False) -> str:
    if dubbel:
        pyautogui.doubleClick(x, y, button=knop)
        return f"Dubbelklik op ({x}, {y})"
    pyautogui.click(x, y, button=knop)
    return f"Klik op ({x}, {y})"


def rechter_klik(x: int, y: int) -> str:
    pyautogui.rightClick(x, y)
    return f"Rechterklik op ({x}, {y})"


def beweeg_muis(x: int, y: int) -> str:
    pyautogui.moveTo(x, y, duration=0.3)
    return f"Muis bewogen naar ({x}, {y})"


def typ_tekst(tekst: str) -> str:
    pyautogui.typewrite(tekst, interval=0.04)
    return f"Getypt: {tekst!r}"


def plak_tekst(tekst: str) -> str:
    pyperclip.copy(tekst)
    time.sleep(0.1)
    pyautogui.hotkey("ctrl", "v")
    return f"Geplakt: {tekst!r}"


def druk_toets(*toetsen: str) -> str:
    pyautogui.hotkey(*toetsen)
    return f"Toetscombinatie: {'+'.join(toetsen)}"


def scroll(x: int, y: int, stappen: int) -> str:
    pyautogui.scroll(stappen, x=x, y=y)
    richting = "omhoog" if stappen > 0 else "omlaag"
    return f"Gescrolld {richting} op ({x}, {y})"


def sleep(seconden: float) -> str:
    time.sleep(seconden)
    return f"Gewacht {seconden}s"


def voer_opdracht_uit(opdracht: str) -> str:
    """Voert een shell-opdracht uit en geeft de uitvoer terug."""
    try:
        result = subprocess.run(
            opdracht,
            shell=True,
            capture_output=True,
            text=True,
            timeout=30,
        )
        output = result.stdout.strip() or result.stderr.strip()
        return f"Opdracht '{opdracht}' uitgevoerd. Uitvoer:\n{output}"
    except subprocess.TimeoutExpired:
        return f"Opdracht '{opdracht}' duurde te lang (timeout 30s)"
    except Exception as e:
        return f"Fout bij uitvoeren van '{opdracht}': {e}"


def kopieer_scherminhoud() -> str:
    """Selecteer alles en kopieer naar klembord."""
    pyautogui.hotkey("ctrl", "a")
    time.sleep(0.1)
    pyautogui.hotkey("ctrl", "c")
    time.sleep(0.1)
    return pyperclip.paste()


TOOL_DEFINITIES = [
    {
        "name": "klik",
        "description": "Klik met de muis op een positie op het scherm.",
        "input_schema": {
            "type": "object",
            "properties": {
                "x": {"type": "integer", "description": "X-coördinaat"},
                "y": {"type": "integer", "description": "Y-coördinaat"},
                "knop": {"type": "string", "enum": ["left", "right", "middle"], "default": "left"},
                "dubbel": {"type": "boolean", "default": False, "description": "Dubbelklik"},
            },
            "required": ["x", "y"],
        },
    },
    {
        "name": "rechter_klik",
        "description": "Rechtsklik op een positie op het scherm.",
        "input_schema": {
            "type": "object",
            "properties": {
                "x": {"type": "integer", "description": "X-coördinaat"},
                "y": {"type": "integer", "description": "Y-coördinaat"},
            },
            "required": ["x", "y"],
        },
    },
    {
        "name": "beweeg_muis",
        "description": "Beweeg de muis naar een positie zonder te klikken.",
        "input_schema": {
            "type": "object",
            "properties": {
                "x": {"type": "integer"},
                "y": {"type": "integer"},
            },
            "required": ["x", "y"],
        },
    },
    {
        "name": "typ_tekst",
        "description": "Typ tekst via het toetsenbord (voor korte teksten).",
        "input_schema": {
            "type": "object",
            "properties": {
                "tekst": {"type": "string", "description": "Te typen tekst"},
            },
            "required": ["tekst"],
        },
    },
    {
        "name": "plak_tekst",
        "description": "Kopieer tekst naar klembord en plak het (voor langere teksten).",
        "input_schema": {
            "type": "object",
            "properties": {
                "tekst": {"type": "string", "description": "Te plakken tekst"},
            },
            "required": ["tekst"],
        },
    },
    {
        "name": "druk_toets",
        "description": "Druk een toets of toetscombinatie in (bijv. ctrl+z, enter, escape).",
        "input_schema": {
            "type": "object",
            "properties": {
                "toetsen": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Lijst van toetsen, bijv. ['ctrl', 'z'] of ['enter']",
                },
            },
            "required": ["toetsen"],
        },
    },
    {
        "name": "scroll",
        "description": "Scroll op het scherm. Positieve stappen = omhoog, negatief = omlaag.",
        "input_schema": {
            "type": "object",
            "properties": {
                "x": {"type": "integer"},
                "y": {"type": "integer"},
                "stappen": {"type": "integer", "description": "Scroll-stappen (pos=omhoog, neg=omlaag)"},
            },
            "required": ["x", "y", "stappen"],
        },
    },
    {
        "name": "voer_opdracht_uit",
        "description": "Voer een shell-opdracht uit op het systeem.",
        "input_schema": {
            "type": "object",
            "properties": {
                "opdracht": {"type": "string", "description": "Shell-opdracht om uit te voeren"},
            },
            "required": ["opdracht"],
        },
    },
    {
        "name": "sleep",
        "description": "Wacht een aantal seconden voordat de volgende actie wordt uitgevoerd.",
        "input_schema": {
            "type": "object",
            "properties": {
                "seconden": {"type": "number", "description": "Wachttijd in seconden"},
            },
            "required": ["seconden"],
        },
    },
]


def voer_tool_uit(naam: str, invoer: dict) -> str:
    """Roept de juiste actiefunctie aan op basis van naam."""
    mapping = {
        "klik": lambda i: klik(i["x"], i["y"], i.get("knop", "left"), i.get("dubbel", False)),
        "rechter_klik": lambda i: rechter_klik(i["x"], i["y"]),
        "beweeg_muis": lambda i: beweeg_muis(i["x"], i["y"]),
        "typ_tekst": lambda i: typ_tekst(i["tekst"]),
        "plak_tekst": lambda i: plak_tekst(i["tekst"]),
        "druk_toets": lambda i: druk_toets(*i["toetsen"]),
        "scroll": lambda i: scroll(i["x"], i["y"], i["stappen"]),
        "voer_opdracht_uit": lambda i: voer_opdracht_uit(i["opdracht"]),
        "sleep": lambda i: sleep(i["seconden"]),
    }
    fn = mapping.get(naam)
    if fn is None:
        return f"Onbekende tool: {naam}"
    return fn(invoer)
