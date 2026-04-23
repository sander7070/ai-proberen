#!/usr/bin/env python3
"""
Tests voor de AI Screen Reader widget.
Runt ZONDER display (headless) — test logica, niet de GUI zelf.

Gebruik: python test_widget.py
"""

import base64
import io
import json
import sys
import unittest
from unittest.mock import MagicMock, patch


# ── 1. Config laden ───────────────────────────────────────────────────────────

class TestConfig(unittest.TestCase):

    def test_missing_api_key_raises(self):
        """Zonder API-sleutel moet config een fout gooien."""
        import importlib
        import config
        with patch.dict("os.environ", {"ANTHROPIC_API_KEY": ""}, clear=False):
            with self.assertRaises(EnvironmentError):
                importlib.reload(config)

    def test_defaults(self):
        """Standaardwaarden moeten kloppen."""
        with patch.dict("os.environ", {"ANTHROPIC_API_KEY": "sk-test"}, clear=False):
            import importlib
            import config
            importlib.reload(config)
            self.assertEqual(config.MONITOR_INDEX, 1)
            self.assertGreater(config.SCREENSHOT_INTERVAL, 0)
            self.assertGreater(config.MAX_TOKENS, 0)


# ── 2. Actions (tool-uitvoering) ──────────────────────────────────────────────

class TestActions(unittest.TestCase):

    def setUp(self):
        # Vervang pyautogui en pyperclip door mocks zodat er geen echte acties
        # op het systeem worden uitgevoerd tijdens het testen.
        self.patcher_pag = patch.dict("sys.modules", {
            "pyautogui": MagicMock(),
            "pyperclip": MagicMock(),
        })
        self.patcher_pag.start()
        import importlib
        import actions
        importlib.reload(actions)
        self.actions = actions

    def tearDown(self):
        self.patcher_pag.stop()

    def test_klik_geeft_tekst_terug(self):
        resultaat = self.actions.klik(100, 200)
        self.assertIn("100", resultaat)
        self.assertIn("200", resultaat)

    def test_dubbelklik(self):
        resultaat = self.actions.klik(50, 50, dubbel=True)
        self.assertIn("Dubbelklik", resultaat)

    def test_typ_tekst(self):
        resultaat = self.actions.typ_tekst("hallo")
        self.assertIn("hallo", resultaat)

    def test_plak_tekst(self):
        resultaat = self.actions.plak_tekst("plaktekst")
        self.assertIn("plaktekst", resultaat)

    def test_druk_toets(self):
        resultaat = self.actions.druk_toets("ctrl", "z")
        self.assertIn("ctrl", resultaat.lower())

    def test_scroll_omhoog(self):
        resultaat = self.actions.scroll(300, 300, 3)
        self.assertIn("omhoog", resultaat)

    def test_scroll_omlaag(self):
        resultaat = self.actions.scroll(300, 300, -3)
        self.assertIn("omlaag", resultaat)

    def test_sleep(self):
        import time
        start = time.time()
        resultaat = self.actions.sleep(0.05)
        elapsed = time.time() - start
        self.assertGreaterEqual(elapsed, 0.04)
        self.assertIn("0.05", resultaat)

    def test_voer_opdracht_uit_echo(self):
        resultaat = self.actions.voer_opdracht_uit("echo hallo")
        self.assertIn("hallo", resultaat)

    def test_voer_opdracht_uit_timeout(self):
        # sleep 999 moet een timeout geven (timeout staat op 30s in code,
        # maar we patchen subprocess zodat het snel faalt)
        with patch("subprocess.run", side_effect=__import__("subprocess").TimeoutExpired("sleep", 30)):
            resultaat = self.actions.voer_opdracht_uit("sleep 999")
            self.assertIn("timeout", resultaat.lower())

    def test_onbekende_tool(self):
        resultaat = self.actions.voer_tool_uit("bestaat_niet", {})
        self.assertIn("Onbekende tool", resultaat)

    def test_alle_tool_namen_aanwezig(self):
        namen = {t["name"] for t in self.actions.TOOL_DEFINITIES}
        verwacht = {"klik", "rechter_klik", "beweeg_muis", "typ_tekst",
                    "plak_tekst", "druk_toets", "scroll",
                    "voer_opdracht_uit", "sleep"}
        self.assertEqual(namen, verwacht)

    def test_tool_definities_hebben_schema(self):
        for tool in self.actions.TOOL_DEFINITIES:
            self.assertIn("name", tool)
            self.assertIn("description", tool)
            self.assertIn("input_schema", tool)


# ── 3. Screenshot-logica ──────────────────────────────────────────────────────

class TestScreenshot(unittest.TestCase):
    """Test screenshot + base64-encodering zonder echte schermopname."""

    def test_base64_encodering_geldig(self):
        """Synthetisch PNG → base64 moet decodeerbaar zijn."""
        img = io.BytesIO()
        from PIL import Image
        Image.new("RGB", (10, 10), color=(255, 0, 0)).save(img, format="PNG")
        b64 = base64.standard_b64encode(img.getvalue()).decode()
        decoded = base64.standard_b64decode(b64)
        self.assertTrue(decoded.startswith(b"\x89PNG"))

    def test_afbeelding_verkleinen(self):
        """Afbeelding breder dan 1568px moet verkleind worden."""
        from PIL import Image
        groot = Image.new("RGB", (2000, 1000))
        if groot.width > 1568:
            groot.thumbnail((1568, 9999), Image.LANCZOS)
        self.assertLessEqual(groot.width, 1568)


# ── 4. Widget-structuur (headless, geen display nodig) ───────────────────────

class TestWidgetStructuur(unittest.TestCase):
    """
    Test de widget-klasse zonder een echte display te openen.
    We mocken tkinter zodat er geen venster verschijnt.
    """

    def test_widget_importeerbaar(self):
        """widget.py moet importeerbaar zijn (ook zonder display)."""
        # Vervang tkinter volledig door een mock
        tk_mock = MagicMock()
        tk_mock.Tk = MagicMock(return_value=MagicMock())
        with patch.dict("sys.modules", {"tkinter": tk_mock, "tkinter.ttk": MagicMock()}):
            try:
                import importlib
                import widget
                importlib.reload(widget)
                geslaagd = True
            except Exception as e:
                geslaagd = False
                print(f"  Import fout: {e}")
        self.assertTrue(geslaagd)

    def test_kleuren_zijn_hex(self):
        """Alle kleurconstanten moeten geldige hex-codes zijn."""
        import importlib, sys
        with patch.dict("sys.modules", {"tkinter": MagicMock(), "tkinter.ttk": MagicMock()}):
            import widget
            importlib.reload(widget)
            for naam in ["BG", "BG2", "ACCENT", "GREEN", "RED", "YELLOW", "TEXT"]:
                waarde = getattr(widget, naam)
                self.assertTrue(waarde.startswith("#"), f"{naam} = {waarde!r}")
                self.assertEqual(len(waarde), 7, f"{naam} heeft geen 6-cijferige hex")

    def test_widget_afmetingen(self):
        """Widget-constanten moeten redelijke afmetingen hebben."""
        import importlib
        with patch.dict("sys.modules", {"tkinter": MagicMock(), "tkinter.ttk": MagicMock()}):
            import widget
            importlib.reload(widget)
            self.assertGreater(widget.WIDGET_W, 200)
            self.assertGreater(widget.BAR_H, 20)
            self.assertGreater(widget.PANEL_H, 200)


# ── 5. API-aanroep simulatie ──────────────────────────────────────────────────

class TestAPISimulatie(unittest.TestCase):
    """Test de analyseer-functie zonder echte API-aanroepen."""

    def test_analyseer_roept_client_aan(self):
        """analyseer_scherm moet messages.create aanroepen."""
        mock_response = MagicMock()
        mock_response.stop_reason = "end_turn"
        mock_response.content = [MagicMock(type="text", text="Alles in orde.")]

        mock_client = MagicMock()
        mock_client.messages.create.return_value = mock_response

        mocks = {
            **sys.modules,
            "pyautogui": MagicMock(),
            "pyperclip": MagicMock(),
        }
        with patch.dict("sys.modules", mocks), \
             patch("anthropic.Anthropic", return_value=mock_client), \
             patch.dict("os.environ", {"ANTHROPIC_API_KEY": "sk-test"}):
            import importlib, config, actions, screen_reader
            importlib.reload(config)
            importlib.reload(actions)
            importlib.reload(screen_reader)
            screen_reader.client = mock_client

            antwoord, _ = screen_reader.analyseer_scherm("nep_b64", "test vraag")

        self.assertIn("Alles in orde", antwoord)
        mock_client.messages.create.assert_called_once()

    def test_analyseer_verwerkt_tool_aanroep(self):
        """Als stop_reason=tool_use moet de tool worden uitgevoerd."""
        tool_blok = MagicMock()
        tool_blok.type = "tool_use"
        tool_blok.name = "sleep"
        tool_blok.input = {"seconden": 0.01}
        tool_blok.id = "tool_123"

        eind_blok = MagicMock()
        eind_blok.type = "text"
        eind_blok.text = "Klaar."

        resp1 = MagicMock(stop_reason="tool_use", content=[tool_blok])
        resp2 = MagicMock(stop_reason="end_turn",  content=[eind_blok])

        mock_client = MagicMock()
        mock_client.messages.create.side_effect = [resp1, resp2]

        with patch("anthropic.Anthropic", return_value=mock_client), \
             patch.dict("os.environ", {"ANTHROPIC_API_KEY": "sk-test"}), \
             patch("sys.modules", {**sys.modules,
                                   "pyautogui": MagicMock(),
                                   "pyperclip": MagicMock()}):
            import importlib, config, actions, screen_reader
            importlib.reload(config)
            importlib.reload(actions)
            importlib.reload(screen_reader)
            screen_reader.client = mock_client

            antwoord, _ = screen_reader.analyseer_scherm(
                "nep_b64", "doe iets", auto_act=True)

        self.assertEqual(mock_client.messages.create.call_count, 2)


# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 55)
    print("  AI Screen Reader — Test suite")
    print("=" * 55)
    loader = unittest.TestLoader()
    suite  = loader.loadTestsFromModule(__import__("__main__"))
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
