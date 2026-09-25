> **⚠️ Archivováno** — Modul Zápisky stolice byl přesunut jako integrovaná součást aplikace [My.Code.App.Stop](https://github.com/jankoweb-org/My.Code.App.Stop). Toto repo slouží jako archiv původní samostatné appky. Data uložená v `localStorage` pod klíčem `shit-app-entries` jsou kompatibilní s novou appkou.

# Aplikace na 💩

Rychlá PWA appka na záznam typu stolice a souvisejícího jídla. Otevřeš
appku a rovnou vidíš formulář — žádné úvodní tlačítko.

## Instalace na telefon

1. Otevři na telefonu: **https://jankoweb.github.io/My.Code.App.Shit/**
2. **Android (Chrome):** menu (⋮) → „Přidat na plochu" / „Nainstalovat
   aplikaci".
3. **iPhone (Safari):** tlačítko sdílení (□↑) → „Přidat na plochu".

Appka pak funguje jako samostatná ikona, offline, bez adresního řádku
prohlížeče.

## Vývoj

Viz [motivace.md](motivace.md) a [CLAUDE.md](CLAUDE.md) pro záměr a
pravidla, než cokoliv přidáváš.

Čistý HTML/CSS/JS, žádný build krok, žádné závislosti. Data se ukládají
lokálně do `localStorage` (nikam se neodesílají). Appka se nasazuje
automaticky na GitHub Pages přes `.github/workflows/pages.yml` při
každém pushi do hlavní větve.

Lokální spuštění (kvůli service workeru potřeba přes HTTP, ne `file://`):

```
python3 -m http.server 8000
```

a otevřít `http://localhost:8000/`.
