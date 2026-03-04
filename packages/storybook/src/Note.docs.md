# Note

Visueel uitgelicht bericht voor aanvullende of belangrijke informatie binnen de content-flow.

## Doel

De Note component plaatst extra context of een tip op een opvallende maar niet-urgente manier in de pagina. Het is de passieve tegenhanger van Alert: screenreaders lezen de Note alleen bij navigatie — niet spontaan. Vijf varianten — **neutral**, **info**, **positive**, **negative** en **warning** — geven elk een eigen signaalkleur en linkerborder. Een decoratief icoon versterkt de variant visueel.

<!-- VOORBEELD -->

## Use when

- Aanvullende context geven bij een formulierveld, een processtap of een sectie.
- Een tip, best practice of aanbeveling tonen die niet blokkerend is.
- Een inhoudsopgave ("Op deze pagina") met ankerlinks tonen bovenaan een lange pagina (`as="nav"`).
- Tangentieel aanvullende informatie naast de hoofdcontent plaatsen (`as="aside"`).

## Don't use when

- Het bericht urgent is of na een gebruikersactie verschijnt — gebruik een **Alert**.
- De informatie één zin is zonder visuele nadruk — gebruik een **Paragraph** of **FormFieldDescription**.
- Je een interactief label wilt — gebruik een **StatusBadge** of **Button**.

## Best practices

### Variantkeuze

- **Neutral** — standaard, voor algemene tips en aanvullende context.
- **Info** — informatieve berichten die extra aandacht verdienen.
- **Positive** — aanmoediging of bevestiging van een goede keuze.
- **Negative** — kritische aanvulling, risico of fout in context.
- **Warning** — waarschuwing die de gebruiker moet lezen vóór hij verder gaat.

### `as` prop

| Waarde            | Wanneer                                                              |
| ----------------- | -------------------------------------------------------------------- |
| `'div'` (default) | Inline tip, aanvullende context — de meeste gevallen                 |
| `'aside'`         | Echt tangentieel aanvullende content in een artikel of lang document |
| `'nav'`           | Inhoudsopgave met ankerlinks (`"Op deze pagina"`)                    |
| `'section'`       | Zelfstandige, benoemde inhoudssectie met heading als label           |

### Heading

- De heading is optioneel. Zonder heading overspant het icoon beide rijen.
- Houd de heading beknopt — één of twee woorden.
- Pas `headingLevel` aan op de documenthiërarchie (standaard `h3`).

### Landmark semantiek

Bij `as="nav"`, `as="aside"` of `as="section"` + een `heading` prop: de Note koppelt automatisch `aria-labelledby` aan de heading via een intern id. Geen handmatige koppeling nodig.

### Icoon

- Gebruik de aanbevolen iconen per variant voor consistentie:
  - **neutral** → `info-circle`
  - **info** → `info-circle`
  - **positive** → `circle-check`
  - **negative** → `exclamation-circle`
  - **warning** → `alert-triangle`
- Gebruik `iconStart={null}` om het icoon te onderdrukken.

## Design tokens

| Token                                  | Beschrijving                  |
| -------------------------------------- | ----------------------------- |
| `--dsn-note-border-inline-start-width` | Breedte van de linkerborder   |
| `--dsn-note-column-gap`                | Ruimte tussen icoon en tekst  |
| `--dsn-note-padding-block`             | Verticale padding             |
| `--dsn-note-padding-inline-end`        | Horizontale padding rechts    |
| `--dsn-note-padding-inline-start`      | Horizontale padding links     |
| `--dsn-note-row-gap`                   | Ruimte tussen heading en body |

De kleur-tokens zijn lokale CSS custom properties per variant:

| Lokale property                        | Beschrijving                       |
| -------------------------------------- | ---------------------------------- |
| `--dsn-note-icon-color`                | Kleur van het icoon (signaalkleur) |
| `--dsn-note-color`                     | Tekstkleur                         |
| `--dsn-note-background-color`          | Achtergrondkleur                   |
| `--dsn-note-border-inline-start-color` | Kleur van de linkerborder          |

## Accessibility

- Het icoon heeft altijd `aria-hidden="true"` — de heading (of body) is de informatiedrager.
- Geen live region — de Note heeft geen `role="alert"` en wordt niet spontaan voorgelezen.
- Bij `as="nav"`, `as="aside"` of `as="section"` + `heading`: automatisch `aria-labelledby` gekoppeld.
- Pas `headingLevel` aan op de documenthiërarchie zodat de heading in de juiste nesting valt.
- Note is niet klikbaar — voor interactieve berichten: voeg links of knoppen toe via `children`.
