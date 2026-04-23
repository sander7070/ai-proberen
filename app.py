#!/usr/bin/env python3
"""
AI Screen Reader — GUI applicatie
Start met: python app.py
"""

import base64
import io
import json
import os
import queue
import threading
import time
import tkinter as tk
from tkinter import scrolledtext, ttk

import mss
from PIL import Image, ImageTk

import anthropic
from actions import TOOL_DEFINITIES, voer_tool_uit

# ── Kleuren ────────────────────────────────────────────────────────────────────
BG       = "#1e1e2e"
BG2      = "#181825"
ACCENT   = "#cba6f7"  # paars
GREEN    = "#a6e3a1"
RED      = "#f38ba8"
YELLOW   = "#f9e2af"
TEXT     = "#cdd6f4"
SUBTEXT  = "#6c7086"
BTN_BG   = "#313244"
BTN_ACT  = "#45475a"

SYSTEEM_PROMPT = """Je bent een AI-assistent die meekijkt op het scherm van de gebruiker.
Analyseer schermafbeeldingen en help de gebruiker door:
- Fouten of problemen te signaleren
- Acties uit te voeren via de beschikbare tools als gevraagd
- Vragen te beantwoorden over het scherm
Wees beknopt. Spreek Nederlands."""


class ScreenReaderApp(tk.Tk):
    def __init__(self):
        super().__init__()

        self.title("AI Screen Reader")
        self.configure(bg=BG)
        self.geometry("480x720")
        self.resizable(True, True)
        # Altijd bovenaan
        self.attributes("-topmost", True)

        self.api_key = tk.StringVar(value=os.getenv("ANTHROPIC_API_KEY", ""))
        self.status = tk.StringVar(value="Klaar")
        self.auto_act = tk.BooleanVar(value=False)
        self.monitor_actief = False
        self.monitor_interval = tk.DoubleVar(value=5.0)
        self.geschiedenis: list = []
        self.laatste_b64: str | None = None
        self.wachtrij: queue.Queue = queue.Queue()

        self._bouw_ui()
        self.after(100, self._verwerk_wachtrij)

    # ── UI bouwen ──────────────────────────────────────────────────────────────

    def _bouw_ui(self):
        # ── Titelbalk ──
        titelbalk = tk.Frame(self, bg=BG2, pady=8)
        titelbalk.pack(fill="x")
        tk.Label(
            titelbalk, text="👁  AI Screen Reader",
            bg=BG2, fg=ACCENT, font=("Helvetica", 14, "bold")
        ).pack(side="left", padx=12)
        tk.Label(
            titelbalk, textvariable=self.status,
            bg=BG2, fg=SUBTEXT, font=("Helvetica", 9)
        ).pack(side="right", padx=12)

        # ── API sleutel ──
        api_frame = tk.Frame(self, bg=BG, pady=4)
        api_frame.pack(fill="x", padx=10)
        tk.Label(api_frame, text="API sleutel:", bg=BG, fg=SUBTEXT,
                 font=("Helvetica", 9)).pack(side="left")
        self.api_entry = tk.Entry(
            api_frame, textvariable=self.api_key, show="*",
            bg=BTN_BG, fg=TEXT, insertbackground=TEXT,
            relief="flat", font=("Helvetica", 9)
        )
        self.api_entry.pack(side="left", fill="x", expand=True, padx=(4, 0))

        # ── Screenshot preview ──
        preview_frame = tk.Frame(self, bg=BG2, pady=4)
        preview_frame.pack(fill="x", padx=10, pady=(6, 0))
        tk.Label(preview_frame, text="Scherm preview", bg=BG2, fg=SUBTEXT,
                 font=("Helvetica", 9)).pack(anchor="w", padx=6)
        self.preview_label = tk.Label(
            preview_frame, bg="#0d0d1a", cursor="hand2",
            text="(nog geen screenshot)", fg=SUBTEXT, font=("Helvetica", 9)
        )
        self.preview_label.pack(fill="x", padx=6, pady=4)
        self.preview_label.bind("<Button-1>", lambda _: self._screenshot_thread())

        # ── Knoppen rij 1 ──
        rij1 = tk.Frame(self, bg=BG)
        rij1.pack(fill="x", padx=10, pady=(8, 2))
        self._knop(rij1, "📸 Screenshot", self._screenshot_thread, ACCENT).pack(
            side="left", fill="x", expand=True, padx=(0, 4))
        self._knop(rij1, "🗑 Wis chat", self._wis_chat, RED).pack(
            side="left", fill="x", expand=True)

        # ── Knoppen rij 2 ──
        rij2 = tk.Frame(self, bg=BG)
        rij2.pack(fill="x", padx=10, pady=2)
        self.monitor_knop = self._knop(
            rij2, "▶ Start bewaking", self._toggle_monitor, GREEN)
        self.monitor_knop.pack(side="left", fill="x", expand=True, padx=(0, 4))

        interval_frame = tk.Frame(rij2, bg=BG)
        interval_frame.pack(side="left", fill="x", expand=True)
        tk.Label(interval_frame, text="Interval (s):", bg=BG, fg=SUBTEXT,
                 font=("Helvetica", 9)).pack(side="left")
        tk.Spinbox(
            interval_frame, from_=1, to=60, increment=1,
            textvariable=self.monitor_interval, width=4,
            bg=BTN_BG, fg=TEXT, buttonbackground=BTN_ACT,
            relief="flat", font=("Helvetica", 9)
        ).pack(side="left", padx=4)

        # ── Auto-act toggle ──
        auto_frame = tk.Frame(self, bg=BG)
        auto_frame.pack(fill="x", padx=10, pady=2)
        tk.Checkbutton(
            auto_frame, text="⚡ Automatisch acties uitvoeren (zonder bevestiging)",
            variable=self.auto_act,
            bg=BG, fg=YELLOW, selectcolor=BTN_BG, activebackground=BG,
            font=("Helvetica", 9)
        ).pack(anchor="w")

        # ── Chat log ──
        log_frame = tk.Frame(self, bg=BG2)
        log_frame.pack(fill="both", expand=True, padx=10, pady=(6, 0))
        tk.Label(log_frame, text="Analyse / Chat", bg=BG2, fg=SUBTEXT,
                 font=("Helvetica", 9)).pack(anchor="w", padx=6, pady=(4, 0))
        self.chat_log = scrolledtext.ScrolledText(
            log_frame, bg=BG2, fg=TEXT, insertbackground=TEXT,
            relief="flat", font=("Consolas", 9), wrap="word",
            state="disabled"
        )
        self.chat_log.pack(fill="both", expand=True, padx=6, pady=(2, 6))
        self.chat_log.tag_config("gebruiker", foreground=ACCENT, font=("Consolas", 9, "bold"))
        self.chat_log.tag_config("claude",    foreground=GREEN)
        self.chat_log.tag_config("tool",      foreground=YELLOW)
        self.chat_log.tag_config("fout",      foreground=RED)
        self.chat_log.tag_config("systeem",   foreground=SUBTEXT)

        # ── Invoerveld ──
        invoer_frame = tk.Frame(self, bg=BG, pady=6)
        invoer_frame.pack(fill="x", padx=10)
        self.invoer = tk.Entry(
            invoer_frame, bg=BTN_BG, fg=TEXT, insertbackground=TEXT,
            relief="flat", font=("Helvetica", 10)
        )
        self.invoer.pack(side="left", fill="x", expand=True)
        self.invoer.bind("<Return>", lambda _: self._stuur_vraag())
        self._knop(invoer_frame, "Stuur", self._stuur_vraag, ACCENT).pack(
            side="left", padx=(6, 0))

        # Statusbalk onderin
        tk.Label(self, text="Klik de preview om een screenshot te maken • Ctrl+C = stop bewaking",
                 bg=BG2, fg=SUBTEXT, font=("Helvetica", 8)).pack(
            fill="x", side="bottom")

    def _knop(self, ouder, tekst, commando, kleur=BTN_BG):
        return tk.Button(
            ouder, text=tekst, command=commando,
            bg=BTN_BG, fg=kleur, activebackground=BTN_ACT, activeforeground=kleur,
            relief="flat", font=("Helvetica", 9, "bold"),
            padx=8, pady=4, cursor="hand2"
        )

    # ── Logging ───────────────────────────────────────────────────────────────

    def _log(self, tekst: str, tag: str = ""):
        def _doe():
            self.chat_log.config(state="normal")
            if tag:
                self.chat_log.insert("end", tekst + "\n", tag)
            else:
                self.chat_log.insert("end", tekst + "\n")
            self.chat_log.see("end")
            self.chat_log.config(state="disabled")
        self.after(0, _doe)

    def _stel_status(self, tekst: str):
        self.after(0, lambda: self.status.set(tekst))

    # ── Wachtrij (thread-safe UI updates) ─────────────────────────────────────

    def _verwerk_wachtrij(self):
        try:
            while True:
                taak = self.wachtrij.get_nowait()
                taak()
        except queue.Empty:
            pass
        self.after(100, self._verwerk_wachtrij)

    # ── Screenshot ────────────────────────────────────────────────────────────

    def _screenshot_thread(self):
        threading.Thread(target=self._maak_screenshot, daemon=True).start()

    def _maak_screenshot(self):
        self._stel_status("Screenshot maken...")
        try:
            with mss.mss() as sct:
                scherm = sct.grab(sct.monitors[1])
                img = Image.frombytes("RGB", scherm.size, scherm.bgra, "raw", "BGRX")

            # Preview (max 460px breed)
            preview = img.copy()
            preview.thumbnail((460, 200))
            foto = ImageTk.PhotoImage(preview)

            def _update_preview():
                self.preview_label.config(image=foto, text="")
                self.preview_label.image = foto  # referentie bewaren

            self.wachtrij.put(_update_preview)

            # Verklein voor API (max 1568px)
            if img.width > 1568:
                img.thumbnail((1568, 9999), Image.LANCZOS)
            buf = io.BytesIO()
            img.save(buf, format="PNG", optimize=True)
            self.laatste_b64 = base64.standard_b64encode(buf.getvalue()).decode()
            self._stel_status("Screenshot klaar")
        except Exception as e:
            self._log(f"Screenshot fout: {e}", "fout")
            self._stel_status("Fout")

    # ── Vragen stellen ────────────────────────────────────────────────────────

    def _stuur_vraag(self):
        vraag = self.invoer.get().strip()
        if not vraag:
            return
        self.invoer.delete(0, "end")
        self._log(f"Jij: {vraag}", "gebruiker")
        threading.Thread(
            target=self._analyseer,
            args=(vraag,),
            daemon=True
        ).start()

    def _analyseer(self, vraag: str):
        if not self.api_key.get():
            self._log("Vul eerst je API sleutel in!", "fout")
            return

        if self.laatste_b64 is None:
            self._maak_screenshot()
            if self.laatste_b64 is None:
                return

        self._stel_status("Claude analyseert...")

        try:
            client = anthropic.Anthropic(api_key=self.api_key.get())

            gebruiker_bericht = {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": self.laatste_b64,
                        },
                    },
                    {"type": "text", "text": vraag},
                ],
            }
            self.geschiedenis.append(gebruiker_bericht)

            while True:
                response = client.messages.create(
                    model="claude-opus-4-7",
                    max_tokens=1024,
                    system=SYSTEEM_PROMPT,
                    tools=TOOL_DEFINITIES,
                    messages=self.geschiedenis,
                )

                antwoord_tekst = ""
                for blok in response.content:
                    if blok.type == "text":
                        antwoord_tekst += blok.text

                self.geschiedenis.append({"role": "assistant", "content": response.content})

                if antwoord_tekst:
                    self._log(f"Claude: {antwoord_tekst}", "claude")

                if response.stop_reason != "tool_use":
                    break

                # Verwerk tools
                tool_resultaten = []
                for blok in response.content:
                    if blok.type != "tool_use":
                        continue

                    naam = blok.name
                    invoer = blok.input
                    self._log(f"[TOOL] {naam}({json.dumps(invoer, ensure_ascii=False)})", "tool")

                    if self.auto_act.get():
                        resultaat = voer_tool_uit(naam, invoer)
                        self._log(f"[KLAAR] {resultaat}", "tool")
                    else:
                        resultaat = self._vraag_bevestiging(naam, invoer)

                    tool_resultaten.append({
                        "type": "tool_result",
                        "tool_use_id": blok.id,
                        "content": resultaat,
                    })

                if tool_resultaten:
                    self.geschiedenis.append({"role": "user", "content": tool_resultaten})

            self._stel_status("Klaar")

        except Exception as e:
            self._log(f"Fout: {e}", "fout")
            self._stel_status("Fout")

    def _vraag_bevestiging(self, tool_naam: str, tool_invoer: dict) -> str:
        """Toont een bevestigingsdialoog in de UI thread en wacht op antwoord."""
        antwoord = threading.Event()
        resultaat_holder = ["Actie geannuleerd."]

        def _toon_dialoog():
            dialoog = tk.Toplevel(self)
            dialoog.title("Bevestig actie")
            dialoog.configure(bg=BG)
            dialoog.attributes("-topmost", True)
            dialoog.grab_set()

            tk.Label(
                dialoog,
                text=f"Claude wil uitvoeren:\n\n{tool_naam}\n{json.dumps(tool_invoer, indent=2, ensure_ascii=False)}",
                bg=BG, fg=TEXT, font=("Consolas", 9), justify="left", padx=12, pady=8
            ).pack()

            knop_frame = tk.Frame(dialoog, bg=BG)
            knop_frame.pack(pady=8)

            def _ja():
                resultaat_holder[0] = voer_tool_uit(tool_naam, tool_invoer)
                self._log(f"[KLAAR] {resultaat_holder[0]}", "tool")
                dialoog.destroy()
                antwoord.set()

            def _nee():
                self._log("[GEANNULEERD]", "systeem")
                dialoog.destroy()
                antwoord.set()

            self._knop(knop_frame, "✓ Uitvoeren", _ja, GREEN).pack(side="left", padx=6)
            self._knop(knop_frame, "✗ Annuleer", _nee, RED).pack(side="left", padx=6)

        self.wachtrij.put(_toon_dialoog)
        antwoord.wait(timeout=60)
        return resultaat_holder[0]

    # ── Bewakingsmodus ────────────────────────────────────────────────────────

    def _toggle_monitor(self):
        if self.monitor_actief:
            self.monitor_actief = False
            self.monitor_knop.config(text="▶ Start bewaking", fg=GREEN)
            self._log("--- Bewaking gestopt ---", "systeem")
            self._stel_status("Klaar")
        else:
            self.monitor_actief = True
            self.monitor_knop.config(text="⏹ Stop bewaking", fg=RED)
            self._log("--- Bewaking gestart ---", "systeem")
            threading.Thread(target=self._bewaking_loop, daemon=True).start()

    def _bewaking_loop(self):
        while self.monitor_actief:
            self._maak_screenshot()
            if self.laatste_b64:
                vraag = (
                    "Analyseer het scherm kort. Zijn er fouten, problemen of iets opvallends? "
                    "Als alles normaal is, zeg enkel: Alles in orde."
                )
                self._analyseer(vraag)
            time.sleep(self.monitor_interval.get())

    # ── Overig ────────────────────────────────────────────────────────────────

    def _wis_chat(self):
        self.chat_log.config(state="normal")
        self.chat_log.delete("1.0", "end")
        self.chat_log.config(state="disabled")
        self.geschiedenis.clear()
        self._log("--- Chat gewist ---", "systeem")


if __name__ == "__main__":
    app = ScreenReaderApp()
    app.mainloop()
