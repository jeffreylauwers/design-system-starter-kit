# Note

Visueel uitgelicht bericht voor aanvullende of belangrijke informatie binnen de content-flow.

## Doel

De Note component plaatst extra context of een tip op een opvallende maar niet-urgente manier in de pagina. Het is de passieve tegenhanger van Alert: screenreaders lezen de Note alleen bij navigatie: niet spontaan. Vijf varianten: **neutral**, **info**, **positive**, **negative** en **warning**: geven elk een eigen signaalkleur en linkerborder. Een decoratief icoon versterkt de variant visueel; bij de niet-neutrale varianten maakt een visueel verborgen variant-label de variant ook voor screenreadergebruikers expliciet.

<!-- VOORBEELD -->

## Wel gebruiken als...

- Je aanvullende context wilt geven bij een formulierveld, een processtap of een sectie.
- Je een tip, best practice of aanbeveling wilt tonen die niet blokkerend is.
- Je zijdelings aanvullende informatie naast de hoofdcontent wilt plaatsen (`as="aside"`).
- Je een eigenstandige, benoemde navigatiesectie wilt labelen (`as="nav"`) die geen inhoudsopgave is: gebruik voor een pagina-inhoudsopgave het **TableOfContents** component.

## Niet gebruiken als...

- Het bericht urgent is of na een gebruikersactie verschijnt: gebruik een **Alert**.
- De informatie één zin is zonder visuele nadruk: gebruik een **Paragraph** of **FormFieldDescription**.
- Je een interactief label wilt: gebruik een **StatusBadge** of **Button**.
- Je een inhoudsopgave ("Op deze pagina") met ankerlinks naar de secties van de pagina wilt tonen: gebruik het **TableOfContents** component.

## Goed gebruik

### Variantkeuze

Een Note wordt bewust door een ontwerper of ontwikkelaar geplaatst. De variant kies je op basis van de intentie van de boodschap: niet op basis van een systeemtoestand. Wanneer een notitie puur aanvullend of contextgevend is, zonder specifieke lading, dan is **neutral** de juiste keuze: de content krijgt visuele nadruk zonder een semantisch signaal te claimen dat er niet is.

- **Neutral**: standaard, voor aanvullende context of tips zonder specifieke lading.
- **Info**: informatieve berichten die extra aandacht verdienen.
- **Positive**: aanmoediging of bevestiging van een goede keuze.
- **Negative**: kritische aanvulling, risico of fout in context.
- **Warning**: waarschuwing die de gebruiker moet lezen vóór hij verder gaat.

### `as` prop

| Waarde            | Wanneer                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| `'div'` (default) | Inline tip, aanvullende context: de meeste gevallen                                                    |
| `'aside'`         | Echt tangentieel aanvullende content in een artikel of lang document                                   |
| `'nav'`           | Eigenstandige navigatiesectie; voor een pagina-inhoudsopgave gebruik je **TableOfContents**, niet Note |
| `'section'`       | Zelfstandige, benoemde inhoudssectie met heading als label                                             |

### Heading

- De heading is optioneel. Zonder heading overspant het icoon beide rijen.
- Houd de heading beknopt: één of twee woorden.
- Pas `headingLevel` aan op de documenthiërarchie (standaard `h3`).

### Variant-label (screenreaders)

- De varianten **info**, **positive**, **negative** en **warning** krijgen automatisch een visueel verborgen tekst: `Informatie: `, `Succes: `, `Foutmelding: ` en `Let op: `. **Neutral** heeft geen label: die variant claimt bewust geen semantisch signaal.
- Met heading komt het label vóór de heading-tekst; zonder heading staat het als losse `<span class="dsn-visually-hidden">` vóór de content.
- Benoemt de heading de variant zelf al (bijv. `"Waarschuwing"`)? Onderdruk het label dan met `variantLabel=""` om een dubbele aankondiging te voorkomen.
- Gebruik `variantLabel` met eigen tekst voor anderstalige interfaces, bijv. `variantLabel="Warning: "`. Neem het scheidingsteken en de spatie op in de waarde.

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

<!-- tokens: note -->

## Toegankelijkheid

- Het icoon heeft altijd `aria-hidden="true"`: de heading (of body) is de informatiedrager.
- Een visueel verborgen variant-label benoemt de niet-neutrale varianten voor screenreadergebruikers (`Informatie: `, `Succes: `, `Foutmelding: `, `Let op: `). Aanpasbaar of te onderdrukken via de `variantLabel` prop. Er is bewust gekozen voor echte (verborgen) tekst in plaats van een `aria-label` op het icoon: tekst wordt wél meevertaald door vertaaltools, werkt in braille-weergave en blijft beschikbaar wanneer het icoon wordt onderdrukt via `iconStart={null}`.
- Bij landmark-gebruik (`as="nav"` etc.) met heading wordt het variant-label onderdeel van de landmark-naam via `aria-labelledby`.
- Geen live region: de Note heeft geen `role="alert"` en wordt niet spontaan voorgelezen.
- Bij `as="nav"`, `as="aside"` of `as="section"` + `heading`: automatisch `aria-labelledby` gekoppeld.
- Pas `headingLevel` aan op de documenthiërarchie zodat de heading in de juiste nesting valt.
- Note is niet klikbaar: voor interactieve berichten: voeg links of knoppen toe via `children`.
