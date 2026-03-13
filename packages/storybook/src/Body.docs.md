# Body

Stelt document-level CSS stijlen in zodat alle child-elementen via cascade de juiste typografie, kleur en achtergrond erven.

## Doel

Body definieert zes CSS properties op document-niveau: achtergrondkleur, tekstkleur, lettertype, lettergrootte, regelafstand en lettergewicht. Componenten die zelf geen specifieke waarden definiëren erven deze defaults automatisch via de CSS cascade.

In een applicatie zet je de `dsn-body` class op het `<body>` element van je HTML, of gebruik je het React `<Body>` component als root-wrapper.

In Storybook is `dsn-body` als global decorator toegepast op alle stories en 'Voorbeeld'-secties, zodat componenten altijd in de juiste omgeving worden getoond.

<!-- VOORBEELD -->

## Use when

- Je de juiste document-level stijlen wilt instellen voor een pagina of applicatie.
- Je in Storybook een geïsoleerde preview wilt wrappen met de juiste omgevingsstijlen.

## Don't use when

- Je de stijlen voor een specifieke sectie wilt overschrijven — gebruik dan component-specifieke klassen of CSS custom properties.
- Je een ander thema of een andere modus per sectie wilt toepassen — dit is een document-level wrapper, geen theming-component.

## Best practices

- **Pas `dsn-body` toe op `<body>`**: dit is de bedoelde use case. De CSS cascade werkt dan door voor de hele pagina.
- **Gebruik `<Body>` als React-wrapper** wanneer je geen controle hebt over het `<body>` element (bijv. in geïsoleerde previews of micro-frontends).
- **Voeg geen extra stijlen toe aan `dsn-body`**: de class dient uitsluitend als cascade-startpunt. Paginaspecifieke stijlen horen in layout-componenten.

## Accessibility

Body heeft geen directe invloed op toegankelijkheid. De tokens die het instelt — met name kleur en achtergrond — zijn afgestemd op een voldoende contrastverhouding volgens WCAG 2.1 AA.

## Design tokens

| CSS property       | Token                                | Beschrijving                      |
| ------------------ | ------------------------------------ | --------------------------------- |
| `background-color` | `--dsn-color-neutral-bg-document`    | Achtergrondkleur van het document |
| `color`            | `--dsn-color-neutral-color-document` | Standaard tekstkleur              |
| `font-family`      | `--dsn-text-font-family-default`     | Standaard lettertype              |
| `font-size`        | `--dsn-text-font-size-md`            | Standaard lettergrootte           |
| `line-height`      | `--dsn-text-line-height-md`          | Standaard regelafstand            |
| `font-weight`      | `--dsn-text-font-weight-default`     | Standaard lettergewicht           |
