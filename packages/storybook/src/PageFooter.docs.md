# PageFooter

Paginavoettekst met accent-1 achtergrond, dikke topborder en een 4-koloms grid.

## Doel

`PageFooter` is het afsluitende onderdeel van een pagina. Het component draagt de huisstijlkleur (`accent-1`) als achtergrond en heeft een dikke `border-block-start` die visueel aansluit bij de `border-block-end` van de `PageHeader`. Binnenin bevindt zich een 4-koloms grid met vier vrije slots (`slot1`–`slot4`). Wat erin gaat, bepaalt de implementatie: logo, navigatielinks, juridische links, tekst of een combinatie daarvan.

Op kleine viewports stapelen alle slots verticaal. Op grote viewports (≥ 64em) staan de vier slots naast elkaar in gelijke kolommen.

<!-- VOORBEELD -->

## Use when

- Je een globale paginavoettekst nodig hebt als huisstijldrager met organisatielogo.
- Juridische en organisatorische links aanwezig moeten zijn op elke pagina (privacyverklaring, cookies, toegankelijkheid, contact).
- Een korte contextuele tekst met verwijzing naar relevante informatie gewenst is.

## Don't use when

- Je een eenvoudige linkenlijst midden op een pagina wilt tonen: gebruik in dat geval een `UnorderedList` of `Menu`.
- Je enkel een footer nodig hebt zonder huisstijlkleuren: pas dan de tokens aan of gebruik een andere container.

## Best practices

### Slot 1 (inline-start)

Doorgaans het organisatielogo. Wikkel het altijd in een `<a>` met een visueel verborgen tekst zodat screenreaders de bestemming voorlezen:

```html
<a href="/">
  <svg class="dsn-logo" aria-hidden="true"><!-- paden --></svg>
  <span class="dsn-visually-hidden"
    >Naam organisatie — terug naar homepage</span
  >
</a>
```

### Slot 2 (optioneel)

`slot2` is optioneel. Als je het weglaat, wordt de grid-kolom niet gerenderd en ontstaat er geen onnodige `row-gap` op mobiel.

### Slot 3 en slot 4

Vrije inhoud. Gebruik een `<UnorderedList>` met `<Link>`-items voor navigatie- of juridische links. Zorg voor beschrijvende linkteksten die buiten context begrijpelijk zijn:

### Inverse colorScheme

De `inverse` kleurvariant schakelt naar de `accent-1-inverse` kleurenschaal voor een donkere footer. Tekst- en linkkleuren worden via CSS custom property overrides automatisch omgeschakeld:

```html
<footer class="dsn-page-footer dsn-page-footer--inverse">
  <!-- zelfde interne structuur -->
</footer>
```

## Design tokens

<!-- tokens: page-footer -->

## Accessibility

### Landmark

Het `<footer>` element als directe afstammeling van `<body>` heeft impliciet `role="contentinfo"`. Screenreadergebruikers kunnen er direct naartoe navigeren via landmark-navigatie. Voeg geen extra `role`-attribuut toe.

### Logo-anker

Het logo-anker in slot 1 heeft een visueel verborgen tekst via `dsn-visually-hidden`. Zo weet een screenreadergebruiker de bestemming van de link ook zonder het logo te zien.

### Linkteksten

Links in `slot2`, `slot3` en `slot4` moeten beschrijvende teksten hebben die buiten context begrijpelijk zijn (WCAG 2.4.6). Vermijd generieke teksten zoals "Klik hier" of "Lees meer".
