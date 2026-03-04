# StatusBadge

Compact label dat de status van een item communiceert met een signaalkleur en optioneel een icoon.

## Doel

De StatusBadge component toont een statusaanduiding naast tabelrijen, koppen of formuliervelden (bijv. "Actief", "In behandeling", "Afgewezen"). Vijf varianten — **neutral**, **info**, **positive**, **negative** en **warning** — geven elk een eigen signaalkleur en achtergrond. Een optioneel decoratief icoon versterkt de status visueel, zonder dat kleur als enige informatiedrager dient.

<!-- VOORBEELD -->

## Use when

- De status van een item compact weergeven (bijv. "Actief", "In behandeling", "Afgewezen").
- Statusaanduidingen in een tabel, naast een koptekst of naast een formulierveld.
- Visuele nadruk op de huidige toestand nodig is zonder dat er een actie aan hangt.

## Don't use when

- De status een actie vereist — gebruik een **Button** of **Link**.
- Je een langere toelichting wilt geven — gebruik een **Alert** of **Note**.
- De badge interactief moet zijn — gebruik een **Link** of **Button** met gepaste styling.

## Best practices

### Variantkeuze

- **Neutral** — standaard, voor neutrale of onbekende statussen ("In behandeling", "Concept").
- **Info** — informatieve statussen die aandacht vragen maar niet urgent zijn ("Nieuw", "Bijgewerkt").
- **Positive** — successtatussen ("Actief", "Goedgekeurd", "Voltooid").
- **Negative** — fout- of afwijzingsstatussen ("Afgewezen", "Verlopen", "Geblokkeerd").
- **Warning** — waarschuwingsstatussen die aandacht vragen ("Let op", "Bijna verlopen").

### Icoon

- Gebruik de aanbevolen iconen per variant voor consistentie:
  - **info** → `info-circle`
  - **positive** → `circle-check`
  - **negative** → `exclamation-circle`
  - **warning** → `alert-triangle`
- Het icoon is altijd decoratief (`aria-hidden="true"`) — de tekst draagt de betekenis.
- Bij minimale badges (bijv. in een smalle tabelcel) kan het icoon worden weggelaten.

### Content

- Houd de badge-tekst kort: één of twee woorden volstaan ("Actief", "In behandeling").
- Vertrouw nooit alleen op kleur — combineer altijd met een leesbaar label.

## Design tokens

| Token                                          | Beschrijving                                                 |
| ---------------------------------------------- | ------------------------------------------------------------ |
| `--dsn-status-badge-border-color`              | Border color (transparent — zichtbaar in High Contrast mode) |
| `--dsn-status-badge-border-radius`             | Border radius (sm — 4px)                                     |
| `--dsn-status-badge-border-width`              | Border width (thin — 1px)                                    |
| `--dsn-status-badge-font-size`                 | Font size (sm)                                               |
| `--dsn-status-badge-gap`                       | Ruimte tussen icoon en tekst                                 |
| `--dsn-status-badge-line-height`               | Line height (sm)                                             |
| `--dsn-status-badge-padding-block`             | Verticale padding                                            |
| `--dsn-status-badge-padding-inline`            | Horizontale padding                                          |
| `--dsn-status-badge-text-transform`            | Text transform (none — thema-overschrijfbaar)                |
| `--dsn-status-badge-info-background-color`     | Achtergrond info variant                                     |
| `--dsn-status-badge-info-color`                | Tekstkleur info variant                                      |
| `--dsn-status-badge-negative-background-color` | Achtergrond negative variant                                 |
| `--dsn-status-badge-negative-color`            | Tekstkleur negative variant                                  |
| `--dsn-status-badge-neutral-background-color`  | Achtergrond neutral variant                                  |
| `--dsn-status-badge-neutral-color`             | Tekstkleur neutral variant                                   |
| `--dsn-status-badge-positive-background-color` | Achtergrond positive variant                                 |
| `--dsn-status-badge-positive-color`            | Tekstkleur positive variant                                  |
| `--dsn-status-badge-warning-background-color`  | Achtergrond warning variant                                  |
| `--dsn-status-badge-warning-color`             | Tekstkleur warning variant                                   |

## Accessibility

- `<strong>` geeft screenreaders semantisch gewicht aan de status.
- Het icoon heeft altijd `aria-hidden="true"` — de tekst is de informatiedrager.
- Bij dynamische statuswijzigingen: omsluit de parent met `aria-live="polite" aria-atomic="true"`.
- StatusBadge is niet klikbaar — voor interactieve statuslabels gebruik een **Link** of **Button**.
