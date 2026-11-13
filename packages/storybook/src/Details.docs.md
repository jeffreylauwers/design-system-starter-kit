# Details

Uitvouwbare inhoudsaanwijzer voor aanvullende informatie die niet iedereen nodig heeft.

## Doel

De Details component biedt een semantisch correcte uitvouwbare sectie op basis van het native `<details>`/`<summary>` element. Gebruik het om aanvullende context, uitleg of informatie beschikbaar te maken zonder de pagina te belasten. De inhoud is verborgen totdat de gebruiker actief kiest om die te zien.

<!-- VOORBEELD -->

## Wel gebruiken als...

- Je aanvullende informatie hebt die niet iedereen nodig heeft (uitleg, toelichting, achtergrondinformatie).
- De inhoud het scannen van de pagina voor de meeste gebruikers belemmert.
- De inhoud alleen relevant is voor een specifieke doelgroep.
- Je een FAQ-patroon bouwt waarbij meerdere Details-componenten onder elkaar staan.

## Niet gebruiken als...

- De meerderheid van gebruikers de informatie nodig heeft: verberg geen essentiële inhoud.
- De inhoud cruciaal is voor het voltooien van een taak: toon het altijd zichtbaar.
- Er een urgente melding nodig is: gebruik een **Alert**.

## Goed gebruik

### Summarylabel

- Houd het summarylabel bondig en beschrijvend: gebruikers beslissen op basis van dit label of ze klikken.
- Gebruik een actieve formulering die duidelijk maakt wat er achter zit (bijv. "Welke documenten heb ik nodig?" in plaats van "Meer informatie").

### Meerdere Details onder elkaar

- Gebruik meerdere afzonderlijke Details-componenten voor FAQ-patronen: niet genest.
- Voeg consistente spacing toe via een Stack of een eigen wrapper.

### Standaard open

- Gebruik `defaultOpen` alleen als er een goede reden is om de inhoud direct zichtbaar te maken (bijv. na een fout of wanneer de context dit vereist).

## Design tokens

<!-- tokens: details -->

## Toegankelijkheid

- Het native `<details>`/`<summary>` element heeft een impliciete ARIA-rol `group`: geen extra `role` attribuut nodig.
- De `<summary>` is volledig toetsenbordtoegankelijk: Tab om te focussen, Spatiebalk of Enter om te togglen.
- Het chevron-icoon heeft `aria-hidden="true"`: de zichtbare tekst in de summarylabel is de toegankelijke naam.
- Gebruik **nooit** `aria-label` op de `<summary>`: de zichtbare tekst is de toegankelijke naam.
- De native browser-aanwijzer is verborgen via `list-style: none` en `summary::-webkit-details-marker { display: none }`.
- Het chevron-icoon roteert 180° via CSS bij de open staat: geen JavaScript nodig.
