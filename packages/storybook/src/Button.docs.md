# Button

Een interactief besturingselement dat een actie triggert wanneer het wordt geactiveerd.

## Doel

De Button component biedt een consistente, toegankelijke manier om acties te triggeren binnen de interface. Hij ondersteunt meerdere visuele varianten om hiërarchie en intentie uit te drukken, drie formaten voor verschillende contexten, en optionele iconen voor extra visuele ondersteuning. De button garandeert een minimale touch target van 48×48px (WCAG 2.5.5) en biedt volledige keyboard- en screenreader-ondersteuning.

<!-- VOORBEELD -->

## Use when

- De gebruiker een actie moet uitvoeren, zoals opslaan, verwijderen of navigeren naar een volgende stap.
- Je visuele hiërarchie wilt aanbrengen tussen primaire (`strong`), secundaire (`default`), en tertiaire (`subtle`) acties.
- Je sentiment wilt communiceren, zoals een destructieve actie (`strong-negative`) of een bevestiging (`strong-positive`).
- Een icoon de betekenis van de actie kan verduidelijken (bijv. een prullenbak-icoon bij "Verwijderen").

## Don't use when

- De actie puur navigatie is zonder bijeffecten — gebruik dan de [Link](/docs/components-link--docs) component.
- Het element inline in een tekst staat — gebruik dan de `link` variant of de Link component.
- Je een toggle of selectie nodig hebt — overweeg een checkbox, switch of toggle button pattern.
- De pagina meer dan twee `strong` buttons naast elkaar bevat — dit verzwakt de visuele hiërarchie.

## Best practices

- **Eén primaire actie per context.** Gebruik maximaal één `strong` button per sectie of dialoog. Ondersteunende acties gebruiken `default` of `subtle`.
- **Gebruik duidelijke, actieve labels.** Schrijf labels als werkwoorden: "Opslaan", "Verwijderen", "Volgende". Vermijd vage labels als "OK" of "Klik hier".
- **Gebruik sentiment-varianten bewust.** Reserveer `strong-negative` voor destructieve acties (verwijderen, annuleren) en `strong-positive` voor bevestigende acties (goedkeuren, voltooien).
- **Iconen verduidelijken, niet versieren.** Voeg alleen een icoon toe als het de betekenis van de actie versterkt. Gebruik `iconStart` voor acties (bijv. prullenbak + "Verwijderen") en `iconEnd` voor richtingen (bijv. "Volgende" + pijl).
- **Icon-only buttons vereisen een toegankelijke tekstlabel.** Geef de tekst mee als `children` — de button verbergt dit visueel via `dsn-button__label`, maar schermlezers lezen het voor. Gebruik `iconStart` of `iconEnd` voor het icoon. Gebruik geen `aria-label` op de button — dit wordt niet vertaald door browser-vertaaltools.
- **Gebruik `loading` voor asynchrone acties.** Toon de loading state wanneer de actie tijd kost (bijv. formulier versturen). De button wordt automatisch `disabled` tijdens loading.
- **Respecteer minimale aanraakdoelen.** De button garandeert een minimale touch target van 48×48px (WCAG 2.5.5).

## Design tokens

| Token                                                   | Beschrijving                                    |
| ------------------------------------------------------- | ----------------------------------------------- |
| `--dsn-button-border-radius`                            | Hoekafronding (8px)                             |
| `--dsn-button-border-width`                             | Dikte van de border (1px)                       |
| `--dsn-button-font-family`                              | Lettertypefamilie                               |
| `--dsn-button-font-weight`                              | Font weight (bold)                              |
| `--dsn-button-line-height`                              | Regelhoogte                                     |
| `--dsn-button-min-block-size`                           | Minimale hoogte voor touch target (48px)        |
| `--dsn-button-min-inline-size`                          | Minimale breedte voor touch target (48px)       |
| `--dsn-button-size-small-min-block-size`                | Minimale hoogte small button (40px)             |
| `--dsn-button-default-background-color`                 | Achtergrondkleur default variant                |
| `--dsn-button-default-border-color`                     | Borderkleur default variant                     |
| `--dsn-button-default-color`                            | Tekstkleur default variant                      |
| `--dsn-button-default-active-background-color`          | Achtergrondkleur default active                 |
| `--dsn-button-default-active-border-color`              | Borderkleur default active                      |
| `--dsn-button-default-active-color`                     | Tekstkleur default active                       |
| `--dsn-button-default-hover-background-color`           | Achtergrondkleur default hover                  |
| `--dsn-button-default-hover-border-color`               | Borderkleur default hover                       |
| `--dsn-button-default-hover-color`                      | Tekstkleur default hover                        |
| `--dsn-button-default-negative-background-color`        | Achtergrondkleur default-negative variant       |
| `--dsn-button-default-negative-border-color`            | Borderkleur default-negative variant            |
| `--dsn-button-default-negative-color`                   | Tekstkleur default-negative variant             |
| `--dsn-button-default-negative-active-background-color` | Achtergrondkleur default-negative active        |
| `--dsn-button-default-negative-active-border-color`     | Borderkleur default-negative active             |
| `--dsn-button-default-negative-active-color`            | Tekstkleur default-negative active              |
| `--dsn-button-default-negative-hover-background-color`  | Achtergrondkleur default-negative hover         |
| `--dsn-button-default-negative-hover-border-color`      | Borderkleur default-negative hover              |
| `--dsn-button-default-negative-hover-color`             | Tekstkleur default-negative hover               |
| `--dsn-button-default-positive-background-color`        | Achtergrondkleur default-positive variant       |
| `--dsn-button-default-positive-border-color`            | Borderkleur default-positive variant            |
| `--dsn-button-default-positive-color`                   | Tekstkleur default-positive variant             |
| `--dsn-button-default-positive-active-background-color` | Achtergrondkleur default-positive active        |
| `--dsn-button-default-positive-active-border-color`     | Borderkleur default-positive active             |
| `--dsn-button-default-positive-active-color`            | Tekstkleur default-positive active              |
| `--dsn-button-default-positive-hover-background-color`  | Achtergrondkleur default-positive hover         |
| `--dsn-button-default-positive-hover-border-color`      | Borderkleur default-positive hover              |
| `--dsn-button-default-positive-hover-color`             | Tekstkleur default-positive hover               |
| `--dsn-button-strong-background-color`                  | Achtergrondkleur strong variant                 |
| `--dsn-button-strong-border-color`                      | Borderkleur strong variant                      |
| `--dsn-button-strong-color`                             | Tekstkleur strong variant                       |
| `--dsn-button-strong-active-background-color`           | Achtergrondkleur strong active                  |
| `--dsn-button-strong-active-border-color`               | Borderkleur strong active                       |
| `--dsn-button-strong-active-color`                      | Tekstkleur strong active                        |
| `--dsn-button-strong-hover-background-color`            | Achtergrondkleur strong hover                   |
| `--dsn-button-strong-hover-border-color`                | Borderkleur strong hover                        |
| `--dsn-button-strong-hover-color`                       | Tekstkleur strong hover                         |
| `--dsn-button-strong-negative-background-color`         | Achtergrondkleur strong-negative variant        |
| `--dsn-button-strong-negative-border-color`             | Borderkleur strong-negative variant             |
| `--dsn-button-strong-negative-color`                    | Tekstkleur strong-negative variant              |
| `--dsn-button-strong-negative-active-background-color`  | Achtergrondkleur strong-negative active         |
| `--dsn-button-strong-negative-active-border-color`      | Borderkleur strong-negative active              |
| `--dsn-button-strong-negative-active-color`             | Tekstkleur strong-negative active               |
| `--dsn-button-strong-negative-hover-background-color`   | Achtergrondkleur strong-negative hover          |
| `--dsn-button-strong-negative-hover-border-color`       | Borderkleur strong-negative hover               |
| `--dsn-button-strong-negative-hover-color`              | Tekstkleur strong-negative hover                |
| `--dsn-button-strong-positive-background-color`         | Achtergrondkleur strong-positive variant        |
| `--dsn-button-strong-positive-border-color`             | Borderkleur strong-positive variant             |
| `--dsn-button-strong-positive-color`                    | Tekstkleur strong-positive variant              |
| `--dsn-button-strong-positive-active-background-color`  | Achtergrondkleur strong-positive active         |
| `--dsn-button-strong-positive-active-border-color`      | Borderkleur strong-positive active              |
| `--dsn-button-strong-positive-active-color`             | Tekstkleur strong-positive active               |
| `--dsn-button-strong-positive-hover-background-color`   | Achtergrondkleur strong-positive hover          |
| `--dsn-button-strong-positive-hover-border-color`       | Borderkleur strong-positive hover               |
| `--dsn-button-strong-positive-hover-color`              | Tekstkleur strong-positive hover                |
| `--dsn-button-subtle-background-color`                  | Achtergrondkleur subtle variant                 |
| `--dsn-button-subtle-border-color`                      | Borderkleur subtle variant                      |
| `--dsn-button-subtle-color`                             | Tekstkleur subtle variant                       |
| `--dsn-button-subtle-active-background-color`           | Achtergrondkleur subtle active                  |
| `--dsn-button-subtle-active-border-color`               | Borderkleur subtle active                       |
| `--dsn-button-subtle-active-color`                      | Tekstkleur subtle active                        |
| `--dsn-button-subtle-hover-background-color`            | Achtergrondkleur subtle hover                   |
| `--dsn-button-subtle-hover-border-color`                | Borderkleur subtle hover                        |
| `--dsn-button-subtle-hover-color`                       | Tekstkleur subtle hover                         |
| `--dsn-button-subtle-negative-background-color`         | Achtergrondkleur subtle-negative variant        |
| `--dsn-button-subtle-negative-border-color`             | Borderkleur subtle-negative variant             |
| `--dsn-button-subtle-negative-color`                    | Tekstkleur subtle-negative variant              |
| `--dsn-button-subtle-negative-active-background-color`  | Achtergrondkleur subtle-negative active         |
| `--dsn-button-subtle-negative-active-border-color`      | Borderkleur subtle-negative active              |
| `--dsn-button-subtle-negative-active-color`             | Tekstkleur subtle-negative active               |
| `--dsn-button-subtle-negative-hover-background-color`   | Achtergrondkleur subtle-negative hover          |
| `--dsn-button-subtle-negative-hover-border-color`       | Borderkleur subtle-negative hover               |
| `--dsn-button-subtle-negative-hover-color`              | Tekstkleur subtle-negative hover                |
| `--dsn-button-subtle-positive-background-color`         | Achtergrondkleur subtle-positive variant        |
| `--dsn-button-subtle-positive-border-color`             | Borderkleur subtle-positive variant             |
| `--dsn-button-subtle-positive-color`                    | Tekstkleur subtle-positive variant              |
| `--dsn-button-subtle-positive-active-background-color`  | Achtergrondkleur subtle-positive active         |
| `--dsn-button-subtle-positive-active-border-color`      | Borderkleur subtle-positive active              |
| `--dsn-button-subtle-positive-active-color`             | Tekstkleur subtle-positive active               |
| `--dsn-button-subtle-positive-hover-background-color`   | Achtergrondkleur subtle-positive hover          |
| `--dsn-button-subtle-positive-hover-border-color`       | Borderkleur subtle-positive hover               |
| `--dsn-button-subtle-positive-hover-color`              | Tekstkleur subtle-positive hover                |
| `--dsn-button-disabled-background-color`                | Achtergrondkleur disabled state (neutral scale) |
| `--dsn-button-disabled-color`                           | Tekstkleur disabled state (neutral scale)       |
| `--dsn-button-disabled-border-color`                    | Borderkleur disabled state (neutral scale)      |
| `--dsn-button-size-default-font-size`                   | Font size default variant                       |
| `--dsn-button-size-default-gap`                         | Ruimte tussen icoon en tekst default variant    |
| `--dsn-button-size-default-icon-only-padding`           | Padding voor icon-only default variant          |
| `--dsn-button-size-default-icon-size`                   | Icoonformaat default variant                    |
| `--dsn-button-size-default-padding-block`               | Verticale padding default variant               |
| `--dsn-button-size-default-padding-inline`              | Horizontale padding default variant             |
| `--dsn-button-size-large-font-size`                     | Font size large variant                         |
| `--dsn-button-size-large-gap`                           | Ruimte tussen icoon en tekst large variant      |
| `--dsn-button-size-large-icon-only-padding`             | Padding voor icon-only large variant            |
| `--dsn-button-size-large-icon-size`                     | Icoonformaat large variant                      |
| `--dsn-button-size-large-padding-block`                 | Verticale padding large variant                 |
| `--dsn-button-size-large-padding-inline`                | Horizontale padding large variant               |
| `--dsn-button-size-small-font-size`                     | Font size small variant                         |
| `--dsn-button-size-small-gap`                           | Ruimte tussen icoon en tekst small variant      |
| `--dsn-button-size-small-icon-only-padding`             | Padding voor icon-only small variant            |
| `--dsn-button-size-small-icon-size`                     | Icoonformaat small variant                      |
| `--dsn-button-size-small-padding-block`                 | Verticale padding small variant                 |
| `--dsn-button-size-small-padding-inline`                | Horizontale padding small variant               |
| `--dsn-focus-background-color`                          | Achtergrondkleur bij focus                      |
| `--dsn-focus-color`                                     | Tekstkleur bij focus                            |
| `--dsn-focus-outline-width`                             | Dikte van de focus outline                      |
| `--dsn-focus-outline-style`                             | Stijl van de focus outline (dashed)             |
| `--dsn-focus-outline-color`                             | Kleur van de focus outline                      |
| `--dsn-focus-outline-offset`                            | Afstand van de focus outline                    |
| `--dsn-focus-inverse-outline-color`                     | Kleur van de inverse focus outline (box-shadow) |
