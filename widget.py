#!/usr/bin/env python3
"""
AI Screen Reader — Compact widget skelet (geen API calls)
Start met: python widget.py
"""

import tkinter as tk
from tkinter import ttk

# ── Kleuren ────────────────────────────────────────────────────────────────────
BG       = "#1e1e2e"
BG2      = "#181825"
BG3      = "#11111b"
ACCENT   = "#cba6f7"
GREEN    = "#a6e3a1"
RED      = "#f38ba8"
YELLOW   = "#f9e2af"
BLUE     = "#89b4fa"
TEXT     = "#cdd6f4"
SUBTEXT  = "#6c7086"
BTN      = "#313244"
BTN_HOV  = "#45475a"

WIDGET_W  = 420
BAR_H     = 48
PANEL_H   = 560


class Toast(tk.Toplevel):
    """Kleine melding die na 4 seconden verdwijnt."""

    def __init__(self, master, tekst: str, kleur: str = GREEN):
        super().__init__(master)
        self.overrideredirect(True)
        self.attributes("-topmost", True)
        self.configure(bg=BG2)

        tk.Label(
            self, text=tekst, bg=BG2, fg=kleur,
            font=("Segoe UI", 9), padx=14, pady=8, wraplength=320
        ).pack()

        # Positie: rechtsonder scherm
        sw = self.winfo_screenwidth()
        sh = self.winfo_screenheight()
        self.update_idletasks()
        w = self.winfo_reqwidth()
        h = self.winfo_reqheight()
        self.geometry(f"{w}x{h}+{sw - w - 16}+{sh - h - 60}")

        self.after(4000, self.destroy)


class WidgetBar(tk.Tk):
    """
    Compacte zwevende balk. Klik op de balk om het paneel
    uit te klappen of in te klappen.
    """

    def __init__(self):
        super().__init__()
        self.title("AI Screen Reader")
        self.configure(bg=BG3)
        self.overrideredirect(True)          # Geen titelbalk van OS
        self.attributes("-topmost", True)

        self.uitgevouwen = False
        self._sleep_pos = None               # Positie voor slepen

        # Begin rechtsboven
        sw = self.winfo_screenwidth()
        self.geometry(f"{WIDGET_W}x{BAR_H}+{sw - WIDGET_W - 10}+10")

        self._bouw_balk()
        self._bouw_paneel()

    # ── Balk (altijd zichtbaar) ───────────────────────────────────────────────

    def _bouw_balk(self):
        self.balk = tk.Frame(self, bg=BG3, height=BAR_H)
        self.balk.pack(fill="x")
        self.balk.pack_propagate(False)

        # Sleep-grip
        self.balk.bind("<ButtonPress-1>",   self._sleep_start)
        self.balk.bind("<B1-Motion>",       self._sleep_beweeg)

        # Icoon + naam
        tk.Label(
            self.balk, text="👁  AI Assistant",
            bg=BG3, fg=ACCENT, font=("Segoe UI", 10, "bold")
        ).pack(side="left", padx=10)

        # Status-pill
        self.status_var = tk.StringVar(value="● Klaar")
        self.status_lbl = tk.Label(
            self.balk, textvariable=self.status_var,
            bg=BG3, fg=GREEN, font=("Segoe UI", 8)
        )
        self.status_lbl.pack(side="left", padx=4)

        # Knoppen rechts
        self._icoknop(self.balk, "✕", self.destroy,       RED).pack(side="right", padx=2)
        self._icoknop(self.balk, "⇕", self._toggle_paneel, SUBTEXT).pack(side="right", padx=2)
        self._icoknop(self.balk, "🔔", self._test_toast,  YELLOW).pack(side="right", padx=2)

    def _icoknop(self, ouder, tekst, cmd, kleur):
        return tk.Button(
            ouder, text=tekst, command=cmd,
            bg=BG3, fg=kleur, activebackground=BTN, activeforeground=kleur,
            relief="flat", font=("Segoe UI", 10), width=2, cursor="hand2",
            bd=0
        )

    # ── Paneel (uitklapbaar) ──────────────────────────────────────────────────

    def _bouw_paneel(self):
        self.paneel = tk.Frame(self, bg=BG, width=WIDGET_W)

        # ── Tabs ──
        tab_balk = tk.Frame(self.paneel, bg=BG2)
        tab_balk.pack(fill="x")

        self.tabs: dict[str, tk.Frame] = {}
        self.tab_knoppen: dict[str, tk.Button] = {}
        self.actieve_tab = tk.StringVar(value="monitor")

        for naam, label in [
            ("monitor",   "👁 Monitor"),
            ("prompt",    "✏️ Prompt"),
            ("tips",      "💡 Tips"),
            ("acties",    "🖱 Acties"),
        ]:
            knop = tk.Button(
                tab_balk, text=label,
                command=lambda n=naam: self._wissel_tab(n),
                bg=BG2, fg=SUBTEXT, relief="flat",
                font=("Segoe UI", 9), padx=8, pady=6, cursor="hand2"
            )
            knop.pack(side="left")
            self.tab_knoppen[naam] = knop

            frame = tk.Frame(self.paneel, bg=BG)
            self.tabs[naam] = frame

        self._bouw_tab_monitor()
        self._bouw_tab_prompt()
        self._bouw_tab_tips()
        self._bouw_tab_acties()

        self._wissel_tab("monitor")

    def _wissel_tab(self, naam: str):
        for n, f in self.tabs.items():
            f.pack_forget()
        self.tabs[naam].pack(fill="both", expand=True)
        for n, k in self.tab_knoppen.items():
            k.config(fg=ACCENT if n == naam else SUBTEXT,
                     bg=BTN if n == naam else BG2)
        self.actieve_tab.set(naam)

    # ── Tab: Monitor ──────────────────────────────────────────────────────────

    def _bouw_tab_monitor(self):
        f = self.tabs["monitor"]

        # Preview placeholder
        preview = tk.Label(
            f, text="[ Klik 📸 voor screenshot ]",
            bg="#0d0d1a", fg=SUBTEXT, font=("Segoe UI", 9),
            height=8, cursor="hand2"
        )
        preview.pack(fill="x", padx=10, pady=(10, 4))
        self.preview_lbl = preview

        # Knoppen
        knoprij = tk.Frame(f, bg=BG)
        knoprij.pack(fill="x", padx=10, pady=4)
        self._knop(knoprij, "📸 Screenshot", lambda: self._melding("Screenshot → TODO"), ACCENT).pack(
            side="left", fill="x", expand=True, padx=(0, 4))
        self._knop(knoprij, "🗑 Wis", lambda: self._wis_log(), RED).pack(
            side="left", fill="x", expand=True)

        # Bewaking
        bew_rij = tk.Frame(f, bg=BG)
        bew_rij.pack(fill="x", padx=10, pady=(0, 4))
        self.bewaking_knop = self._knop(
            bew_rij, "▶ Start bewaking",
            lambda: self._melding("Bewaking → TODO"), GREEN)
        self.bewaking_knop.pack(side="left", fill="x", expand=True, padx=(0, 4))
        tk.Label(bew_rij, text="Interval:", bg=BG, fg=SUBTEXT,
                 font=("Segoe UI", 8)).pack(side="left")
        tk.Spinbox(
            bew_rij, from_=1, to=60, width=3,
            bg=BTN, fg=TEXT, buttonbackground=BTN_HOV,
            relief="flat", font=("Segoe UI", 8)
        ).pack(side="left", padx=4)
        tk.Label(bew_rij, text="s", bg=BG, fg=SUBTEXT,
                 font=("Segoe UI", 8)).pack(side="left")

        # Auto-act
        self.auto_var = tk.BooleanVar(value=False)
        tk.Checkbutton(
            f, text="⚡ Muis overnemen bij acties",
            variable=self.auto_var,
            bg=BG, fg=YELLOW, selectcolor=BTN, activebackground=BG,
            font=("Segoe UI", 8)
        ).pack(anchor="w", padx=10)

        # Log
        tk.Label(f, text="Analyse log", bg=BG, fg=SUBTEXT,
                 font=("Segoe UI", 8)).pack(anchor="w", padx=10, pady=(6, 0))
        self.log_vak = tk.Text(
            f, bg=BG2, fg=TEXT, relief="flat",
            font=("Consolas", 8), height=8, wrap="word",
            state="disabled"
        )
        self.log_vak.pack(fill="both", expand=True, padx=10, pady=(2, 6))
        self.log_vak.tag_config("claude", foreground=GREEN)
        self.log_vak.tag_config("tool",   foreground=YELLOW)
        self.log_vak.tag_config("fout",   foreground=RED)
        self.log_vak.tag_config("sys",    foreground=SUBTEXT)

        self._log_toevoegen("--- Klaar om te starten ---", "sys")

    # ── Tab: Prompt optimizer ─────────────────────────────────────────────────

    def _bouw_tab_prompt(self):
        f = self.tabs["prompt"]

        tk.Label(f, text="Jouw ruwe prompt:", bg=BG, fg=SUBTEXT,
                 font=("Segoe UI", 8)).pack(anchor="w", padx=10, pady=(10, 0))

        self.prompt_invoer = tk.Text(
            f, bg=BG2, fg=TEXT, insertbackground=TEXT,
            relief="flat", font=("Segoe UI", 9), height=5, wrap="word"
        )
        self.prompt_invoer.pack(fill="x", padx=10, pady=4)
        self.prompt_invoer.insert("1.0", "Typ hier je prompt die je wil verbeteren...")
        self.prompt_invoer.bind("<FocusIn>", self._wis_placeholder)

        knoprij = tk.Frame(f, bg=BG)
        knoprij.pack(fill="x", padx=10, pady=(0, 4))
        self._knop(knoprij, "✨ Optimaliseer prompt",
                   lambda: self._melding("Optimizer → TODO"), ACCENT).pack(
            side="left", fill="x", expand=True, padx=(0, 4))
        self._knop(knoprij, "📋 Kopieer",
                   lambda: self._melding("Kopieer → TODO"), BLUE).pack(side="left")

        tk.Label(f, text="Geoptimaliseerde prompt:", bg=BG, fg=SUBTEXT,
                 font=("Segoe UI", 8)).pack(anchor="w", padx=10)

        self.prompt_uitvoer = tk.Text(
            f, bg=BG2, fg=GREEN, relief="flat",
            font=("Consolas", 8), height=8, wrap="word",
            state="disabled"
        )
        self.prompt_uitvoer.pack(fill="both", expand=True, padx=10, pady=(2, 4))

        tk.Label(
            f,
            text="💡 Tip: beschrijf DOEL + CONTEXT + VERWACHT RESULTAAT",
            bg=BG, fg=YELLOW, font=("Segoe UI", 7), wraplength=380
        ).pack(padx=10, pady=(0, 6))

    def _wis_placeholder(self, _evt):
        if self.prompt_invoer.get("1.0", "end-1c") == "Typ hier je prompt die je wil verbeteren...":
            self.prompt_invoer.delete("1.0", "end")

    # ── Tab: Tips ─────────────────────────────────────────────────────────────

    def _bouw_tab_tips(self):
        f = self.tabs["tips"]

        tips = [
            ("Claude Code slash-commands",  ACCENT, [
                "/clear          — Wis context, begin fris",
                "/compact        — Comprimeer lange sessie",
                "/cost           — Bekijk token-gebruik",
                "/doctor         — Check je installatie",
            ]),
            ("Betere prompts schrijven", GREEN, [
                "✓ Geef CONTEXT: wat heb je al geprobeerd?",
                "✓ Geef DOEL: wat moet het eindresultaat zijn?",
                "✓ Geef BEPERKINGEN: taal, framework, stijl",
                "✓ Vraag om STAP-VOOR-STAP uitleg",
            ]),
            ("Claude Code efficiënter", YELLOW, [
                "Gebruik CLAUDE.md voor projectregels",
                "Zet /permissions voor veilige auto-acties",
                "Beschrijf bugs met: verwacht vs werkelijk gedrag",
                "Gebruik 'denk na over...' voor complexe taken",
            ]),
        ]

        canvas = tk.Canvas(f, bg=BG, highlightthickness=0)
        scroll = ttk.Scrollbar(f, orient="vertical", command=canvas.yview)
        canvas.configure(yscrollcommand=scroll.set)
        scroll.pack(side="right", fill="y")
        canvas.pack(side="left", fill="both", expand=True)

        binnen = tk.Frame(canvas, bg=BG)
        canvas.create_window((0, 0), window=binnen, anchor="nw")
        binnen.bind("<Configure>",
                    lambda e: canvas.configure(scrollregion=canvas.bbox("all")))

        for titel, kleur, items in tips:
            tk.Label(binnen, text=titel, bg=BG, fg=kleur,
                     font=("Segoe UI", 9, "bold")).pack(
                anchor="w", padx=10, pady=(10, 2))
            for item in items:
                tk.Label(binnen, text=f"  {item}", bg=BG, fg=TEXT,
                         font=("Consolas", 8), justify="left").pack(
                    anchor="w", padx=10)

    # ── Tab: Acties (muisovername) ────────────────────────────────────────────

    def _bouw_tab_acties(self):
        f = self.tabs["acties"]

        tk.Label(
            f, text="🖱 Muis & Toetsenbord Overname",
            bg=BG, fg=ACCENT, font=("Segoe UI", 10, "bold")
        ).pack(pady=(14, 4))

        tk.Label(
            f,
            text="Als Claude een actie wil uitvoeren, verschijnt\n"
                 "hier een preview met een 3-seconden countdown.\n"
                 "Je kunt altijd annuleren.",
            bg=BG, fg=TEXT, font=("Segoe UI", 9), justify="center"
        ).pack(pady=4)

        # Afteller placeholder
        self.afteller_var = tk.StringVar(value="")
        tk.Label(
            f, textvariable=self.afteller_var,
            bg=BG, fg=YELLOW, font=("Segoe UI", 28, "bold")
        ).pack(pady=8)

        # Actie-beschrijving
        self.actie_var = tk.StringVar(value="Geen actie gepland")
        tk.Label(
            f, textvariable=self.actie_var,
            bg=BG2, fg=TEXT, font=("Consolas", 9),
            wraplength=360, justify="center", padx=10, pady=8
        ).pack(fill="x", padx=10)

        # Knoppen
        knoprij = tk.Frame(f, bg=BG)
        knoprij.pack(pady=12)
        self._knop(knoprij, "✓ Nu uitvoeren",
                   lambda: self._melding("Uitvoeren → TODO"), GREEN).pack(
            side="left", padx=6)
        self._knop(knoprij, "✗ Annuleer",
                   lambda: self._melding("Geannuleerd"), RED).pack(
            side="left", padx=6)

        tk.Label(
            f,
            text="⚠ Zet 'Muis overnemen' aan in Monitor-tab\n"
                 "voor volledig automatische uitvoering.",
            bg=BG, fg=SUBTEXT, font=("Segoe UI", 8), justify="center"
        ).pack(pady=(8, 0))

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _knop(self, ouder, tekst, cmd, kleur=BTN):
        return tk.Button(
            ouder, text=tekst, command=cmd,
            bg=BTN, fg=kleur, activebackground=BTN_HOV, activeforeground=kleur,
            relief="flat", font=("Segoe UI", 9, "bold"),
            padx=8, pady=5, cursor="hand2"
        )

    def _log_toevoegen(self, tekst: str, tag: str = ""):
        self.log_vak.config(state="normal")
        self.log_vak.insert("end", tekst + "\n", tag)
        self.log_vak.see("end")
        self.log_vak.config(state="disabled")

    def _wis_log(self):
        self.log_vak.config(state="normal")
        self.log_vak.delete("1.0", "end")
        self.log_vak.config(state="disabled")
        self._log_toevoegen("--- Log gewist ---", "sys")

    def _melding(self, tekst: str, kleur: str = GREEN):
        Toast(self, tekst, kleur)

    def _test_toast(self):
        Toast(self, "✅ Notificaties werken!", GREEN)

    # ── Uitklappen / inklappen ────────────────────────────────────────────────

    def _toggle_paneel(self):
        if self.uitgevouwen:
            self.paneel.pack_forget()
            self.geometry(f"{WIDGET_W}x{BAR_H}")
            self.uitgevouwen = False
        else:
            self.paneel.pack(fill="both", expand=True)
            self.geometry(f"{WIDGET_W}x{BAR_H + PANEL_H}")
            self.uitgevouwen = True

    # ── Slepen ────────────────────────────────────────────────────────────────

    def _sleep_start(self, evt):
        self._sleep_pos = (evt.x_root - self.winfo_x(),
                           evt.y_root - self.winfo_y())

    def _sleep_beweeg(self, evt):
        if self._sleep_pos:
            x = evt.x_root - self._sleep_pos[0]
            y = evt.y_root - self._sleep_pos[1]
            self.geometry(f"+{x}+{y}")


if __name__ == "__main__":
    app = WidgetBar()
    app.mainloop()
