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

- De actie puur navigatie is zonder bijeffecten: gebruik dan de [Link](/docs/components-link--docs) component.
- Het element inline in een tekst staat: gebruik dan de `link` variant of de Link component.
- Je een toggle of selectie nodig hebt: overweeg een checkbox, switch of toggle button pattern.
- De pagina meer dan twee `strong` buttons naast elkaar bevat: dit verzwakt de visuele hiërarchie.

## Best practices

- **Eén primaire actie per context.** Gebruik maximaal één `strong` button per sectie of dialoog. Ondersteunende acties gebruiken `default` of `subtle`.
- **Gebruik duidelijke, actieve labels.** Schrijf labels als werkwoorden: "Opslaan", "Verwijderen", "Volgende". Vermijd vage labels als "OK" of "Klik hier".
- **Gebruik sentiment-varianten bewust.** Reserveer `strong-negative` voor destructieve acties (verwijderen, annuleren) en `strong-positive` voor bevestigende acties (goedkeuren, voltooien).
- **Iconen verduidelijken, niet versieren.** Voeg alleen een icoon toe als het de betekenis van de actie versterkt. Gebruik `iconStart` voor acties (bijv. prullenbak + "Verwijderen") en `iconEnd` voor richtingen (bijv. "Volgende" + pijl).
- **Icon-only buttons vereisen een toegankelijke tekstlabel.** Geef de tekst mee als `children`: de button verbergt dit visueel via `dsn-button__label`, maar schermlezers lezen het voor. Gebruik `iconStart` of `iconEnd` voor het icoon. Gebruik geen `aria-label` op de button: dit wordt niet vertaald door browser-vertaaltools.
- **Gebruik `loading` voor asynchrone acties.** Toon de loading state wanneer de actie tijd kost (bijv. formulier versturen). De button wordt automatisch `disabled` tijdens loading.
- **Respecteer minimale aanraakdoelen.** De button garandeert een minimale touch target van 48×48px (WCAG 2.5.5).

## Design tokens

<!-- tokens: button --dsn-focus-background-color --dsn-focus-color --dsn-focus-outline-width --dsn-focus-outline-style --dsn-focus-outline-color --dsn-focus-outline-offset --dsn-focus-inverse-outline-color -->
