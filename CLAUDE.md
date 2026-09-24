# CLAUDE.md

Tahle appka je záměrně primitivní. Přečti si [motivace.md](motivace.md)
než cokoliv navrhneš nebo změníš.

## ⚠️ Než přidáš cokoliv nového

Appka má JEDEN účel: otevřít appku → rovnou vidím formulář (typ
stolice, jídelní tagy, čas, poznámka) → Uložit → formulář se vyprázdní.
Plus Přehled (grafy, tabulka záznamů, editace) a minimální Nastavení
(export/import dat, editace názvů/popisků škály konzistence stolice,
jídelních tagů a doplňků). To je vše.

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
- Editace názvů a popisků 7 úrovní škály konzistence v Nastavení
  (výjimka odsouhlasená uživatelem 2026-09-22 — jde nad rámec čistého
  export/import, ale zůstává to textová úprava jednoho existujícího
  popisu, ne nová obrazovka/tok).
- Editace ikony/názvu/popisku jídelních tagů a doplňků v Nastavení,
  stejným způsobem jako škála konzistence — jeden řádek na položku,
  formát `ikona;název;popis` (výjimka odsouhlasená uživatelem
  2026-09-24). Počet a pořadí položek zůstává pevné (žádné přidávání/
  mazání, žádná nová obrazovka/tok), mění se jen jejich popisné texty.

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
- Uživatel appku testuje výhradně přes nasazenou GitHub Pages URL na
  reálném zařízení, ne lokálně. Bez úspěšně dokončeného deploye nemá
  jak změny ověřit — po merge vždy počkej a potvrď, že deploy run
  doběhl (`conclusion: success`), než úkol označíš za hotový.
- Po vytvoření draft PR se vždy rovnou zeptej na merge přímou otázkou
  (ne jen popiš změny a čekej) — ať stačí odpovědět jedním slovem
  ("jj"/"jo"/"merge").
