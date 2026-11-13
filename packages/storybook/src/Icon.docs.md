# Icon

Een visueel symbool afkomstig van Tabler Icons, gebruikt om acties, objecten, of concepten weer te geven.

## Doel

De Icon component biedt een consistente, toegankelijke manier om iconen te gebruiken binnen de interface. Iconen worden automatisch gekoppeld aan typografische groottes (sm, md, lg, xl, 2xl, 3xl, 4xl) en schalen mee met de interface. De iconen staan als inline SVG in het package, dus er is geen SVG-loader of svgr-configuratie nodig om ze te gebruiken. De Icon garandeert correcte toegankelijkheid door automatisch `aria-hidden` toe te voegen voor decoratieve iconen of `role="img"` voor standalone iconen.

<!-- VOORBEELD -->

## Wel gebruiken als...

- Je een visuele indicatie wilt geven bij acties (bijv. een prullenbak-icoon bij "Verwijderen").
- Je een object of concept visueel wilt representeren (bijv. een map-icoon voor een folder).
- Je een status wilt communiceren (bijv. een vinkje voor succes, een driehoek voor waarschuwing).
- Het icoon de herkenbaarheid van een UI-element verhoogt (bijv. een tandwiel-icoon bij instellingen).

## Niet gebruiken als...

- Het icoon de enige visuele indicatie is zonder duidelijke betekenis: voeg altijd een `aria-label` toe voor standalone iconen.
- Je complexe illustraties of logo's wilt tonen: gebruik dan een afbeelding of SVG.
- Het icoon puur decoratief is en geen betekenis toevoegt aan de interface.

## Goed gebruik

- **Decoratieve vs standalone iconen.** Iconen die naast tekst staan zijn decoratief (geen `aria-label` nodig). Standalone iconen (zonder tekst) hebben altijd een `aria-label` nodig voor toegankelijkheid.
- **Gebruik iconen consequent.** Gebruik hetzelfde icoon voor dezelfde actie door de hele interface (bijv. altijd een prullenbak voor verwijderen).
- **Kies de juiste size.** Gebruik iconen die passen bij de omliggende tekst: `sm` bij kleine tekst, `md` bij normale tekst, `lg` en groter voor standalone iconen.
- **Vermijd te veel iconen.** Teveel iconen zorgen voor visuele ruis. Gebruik iconen alleen waar ze echte waarde toevoegen.
- **Test met gebruikers.** Niet alle iconen zijn universeel begrijpelijk. Test of gebruikers de betekenis begrijpen, vooral bij abstracte concepten.
- **Weet dat de hele set meekomt.** `Icon` zoekt de naam op runtime op in `iconMap`, dus tree-shaking per icoon is niet mogelijk: alle 51 iconen komen in de bundle. Gemeten aan `dist/Icon/icon-registry.generated.mjs`: 23.998 bytes, 3.128 gzipped. Heb je maar een handvol iconen nodig, pak dan de losse SVG's uit `@dsn-starter-kit/components-html/assets/icons/`.

## Design tokens

<!-- tokens: --dsn-icon-size-sm --dsn-icon-size-md --dsn-icon-size-lg --dsn-icon-size-xl --dsn-icon-size-2xl --dsn-icon-size-3xl --dsn-icon-size-4xl -->

## Toegankelijkheid

- Decoratieve iconen (naast tekst): automatisch `aria-hidden="true"`.
- Standalone iconen (zonder tekst): vereist `aria-label` en krijgt `role="img"`.
- Iconen binnen buttons of links: markeer als decoratief, de button/link heeft al een toegankelijk label.
