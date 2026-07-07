# SkipLink

Een toegankelijkheidskoppeling waarmee toetsenbordgebruikers herhalende navigatie kunnen overslaan.

## Doel

De SkipLink is het **eerste focusbare element** op elke pagina. Het is standaard onzichtbaar, maar wordt zichtbaar wanneer de gebruiker er met Tab op focust. Door op Enter te drukken springt de gebruiker direct naar de hoofdinhoud, zonder alle navigatie-elementen (header, menu, breadcrumbs) te hoeven doorlopen.

De component voldoet aan WCAG 2.2 succescriterium **2.4.1 Bypass Blocks (Level A)**: pagina's moeten een mechanisme bieden waarmee blokken die op meerdere pagina's terugkeren overgeslagen kunnen worden.

<!-- VOORBEELD -->

## Use when

- Op elke pagina met herhalende navigatieblokken vóór de hoofdinhoud (header, menu, breadcrumbs).
- Je wilt voldoen aan WCAG 2.4.1 (Bypass Blocks, Level A).
- Je een toetsenbordvriendelijke pagina-navigatie wilt bouwen.

## Don't use when

- De pagina geen herhalende navigatie heeft vóór de hoofdinhoud.
- De hoofdinhoud al het eerste focusbare element is (bijv. een eenvoudige landingspagina zonder header-navigatie).

## Best practices

### Positionering in de DOM

Plaats de SkipLink als **allereerste element** in de `<body>`, vóór de `<header>`. Zo is het de eerste Tab-stop voor toetsenbordgebruikers.

```html
<!-- ✅ Correct -->
<body>
  <a href="#main-content" class="dsn-skip-link"
    >Ga direct naar de hoofdinhoud</a
  >
  <header>...</header>
  <main id="main-content" tabindex="-1">...</main>
</body>
```

### Doelelement moet focusbaar zijn

Het element met het doel-ID moet focusbaar zijn. Native interactieve elementen (`<a>`, `<button>`, `<input>`) zijn dat al. Voor niet-interactieve elementen zoals `<main>` of `<div>` is `tabindex="-1"` vereist.

```html
<!-- ✅ tabindex="-1" op het doelelement -->
<main id="main-content" tabindex="-1">
  <h1>Pagina titel</h1>
</main>
```

### Gebruik beschrijvende linktekst

De standaardtekst "Ga direct naar de hoofdinhoud" is bruikbaar voor de meeste pagina's. Pas de tekst aan als er meerdere skip-links zijn (bijv. naar zoekformulier, navigatie, of footer).

```html
<a href="#search" class="dsn-skip-link">Ga direct naar zoeken</a>
<a href="#main-content" class="dsn-skip-link">Ga direct naar de hoofdinhoud</a>
```

## Design tokens

| Token                                 | Beschrijving                                         |
| ------------------------------------- | ---------------------------------------------------- |
| `--dsn-skip-link-z-index`             | Z-index (600): boven modals en backdrop              |
| `--dsn-skip-link-padding-block`       | Verticale padding bij focus                          |
| `--dsn-skip-link-padding-inline`      | Horizontale padding bij focus                        |
| `--dsn-skip-link-border-radius`       | Afgeronde hoeken bij focus                           |
| `--dsn-skip-link-offset-block-start`  | Afstand van boven het viewport bij focus             |
| `--dsn-skip-link-offset-inline-start` | Afstand van de linkerkant van het viewport bij focus |

## Accessibility

- De SkipLink gebruikt het semantische `<a>` element: screenreaders kondigen het aan als "link" en nemen het op in de linklijst (NVDA: `R`; VoiceOver: `Control+Option+U`).
- De link is standaard verborgen via `clip-path: inset(50%)`: dit is de voorkeursmethode boven `display: none` of `visibility: hidden`, omdat die elementen uit de accessibility tree verwijderen.
- Bij `:focus-visible` wordt de clip verwijderd en wordt de link zichtbaar met de standaard focus-stijlen van het design system.
- De link moet het **eerste** element in de DOM zijn, zodat het de eerste Tab-stop is.
- Het doelelement moet `tabindex="-1"` hebben als het niet natively focusbaar is, anders werkt de focus-sprong niet in alle browsers (met name Safari/iOS).
