# CLAUDE.md

Tahle appka je záměrně primitivní. Přečti si [motivace.md](motivace.md)
než cokoliv navrhneš nebo změníš.

## ⚠️ Než přidáš cokoliv nového

Appka má JEDEN účel: otevřít appku → rovnou vidím formulář (typ
stolice, jídelní tagy, čas, poznámka) → Uložit → formulář se vyprázdní.
Plus Přehled (grafy, tabulka záznamů, editace) a minimální Nastavení
(export/import dat). To je vše.

Pokud budoucí zadání (moje nebo uživatelovo) směřuje k některému z
tohoto, **odmítni a připomeň motivaci** místo rovnou implementace:

- úvodní tlačítko nebo vícekrokový wizard místo jednoho formuláře
- oddělené zadávání jídla mimo hlavní formulář
- kalendář, plánování, úkoly, připomínky
- účty, přihlašování, backend, synchronizace mezi zařízeními
- gamifikace, streaky, odznaky, skóre
- AI funkce (návrhy, shrnutí, chat, automatická diagnóza)
- složitější analýza v Přehledu než jednoduché průměry a četnosti
- témata, personalizace UI nad rámec základního exportu dat

Namísto rovnou kódování se zeptej: „Tohle appku zesložiťuje a jde proti
motivaci (viz motivace.md) — chceš to i tak přidat, nebo najít
jednodušší cestu?"

## Co je v pořádku měnit

- Drobné opravy formuláře a ukládání.
- Vizuální ladění (barvy, typografie) beze změny funkce.
- Oprava výpočtu/zobrazení statistik, pokud je chybné.

## Technické poznámky

- Čistý HTML/CSS/JS, žádný build krok, žádné závislosti.
- Data v `localStorage`, klíč `shit-app-entries`.
- Formulář nemá "start" obrazovku — appka se otevře rovnou do něj a po
  uložení se vyprázdní/resetuje (čas = teď) pro další záznam.
- Nasazení: GitHub Pages, deploy automaticky přes
  `.github/workflows/pages.yml` při pushi do hlavní větve. URL:
  https://jankoweb.github.io/My.Code.App.Shit/
- Hlavní větev je `main`, deploy workflow (`pages.yml`) se spouští při
  pushi právě do ní.
