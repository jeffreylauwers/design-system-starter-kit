# Hero

Prominente introductiecomponent die direct onder de PageHeader verschijnt en de volledige paginabreedte beslaat.

## Doel

Hero is de primaire introductiesectie bovenaan een pagina. Het beslaat de volledige viewportbreedte via het BreakoutSection-patroon (`margin-inline: calc(50% - 50vw)`) en biedt een gestructureerde slot voor een kop, beschrijvende tekst en een call-to-action of zoekfunctie.

De component ondersteunt vier achtergrondvarianten — licht blauw, donker blauw, achtergrondafbeelding en afbeelding met kleur-blend — en twee uitlijningsopties voor de inhoud.

<!-- VOORBEELD -->

## Use when

- De pagina een prominente introductiesectie nodig heeft direct onder de header (landingspagina's, startpagina's, campagnepagina's).
- U een kernboodschap wilt presenteren met één of twee calls-to-action.
- U een zoekfunctie aanbiedt als primaire pagina-actie.
- U de begininhoud visueel wilt onderscheiden via een gekleurde of beeldachtergrond.

## Don't use when

- De sectie verderop op de pagina staat: gebruik dan BreakoutSection als basis voor een eigen sectie.
- U een carrousel wilt bouwen: dit schaadt toegankelijkheid en gebruikersbetrokkenheid.
- De pagina geen duidelijke primaire boodschap heeft: een Hero zonder inhoudelijk doel leidt af en voegt geen waarde toe.

## Best practices

### Kop en beschrijving

Gebruik altijd een `Heading` met `level={1}` als de Hero de eerste kop op de pagina is. Geef de kop een uniek `id` en koppel dit via `aria-labelledby` op het `<section>` element. De beschrijvende tekst werkt het beste als korte lead-alinea van één of twee zinnen.

### Calls-to-action

Gebruik maximaal twee prominente knoppen in een ActionGroup. De primaire actie krijgt `variant="strong"`, de secundaire actie `variant="subtle"`. Gebruik `size="large"` voor beide om de Hero-hoogte visueel te complementeren.

### Achtergrondafbeelding

Bij `variant="image"` of `"image-blend"` levert u de afbeelding via de `backgroundImage` prop (React) of het CSS custom property `--dsn-hero-bg-image` (HTML/CSS). Achtergrondafbeeldingen zijn decoratief en vereisen geen alt-tekst. Als de afbeelding informatieve waarde heeft, voeg dan een tekstuele beschrijving toe in de Hero-inhoud zelf.

Gebruik bij voorkeur `variant="image-blend"` boven `variant="image"`: de kleur-overlay verbetert de kans op voldoende contrast en geeft de Hero een consistentere uitstraling bij wisselende afbeeldingen.

### Dark mode

De `image` en `image-blend` varianten renderen altijd in light-mode kleuren, ook als de pagina in dark mode staat. Een foto-achtergrond vereist lichte tekst en een donkere overlay ongeacht de kleurmodus — de semantische "inverse" kleuren van de donkere kleurschaal zijn hier niet bruikbaar.

Dit gedrag is ingebakken via gegenereerde scoped CSS (per thema): het component overschrijft lokaal de dark-mode `:root`-variabelen. U hoeft hier als gebruiker van het component niets voor te doen.

De `default` en `inverse` varianten volgen wél de actieve kleurmodus.

### Hoogte

De standaardhoogte is `70svh` met een minimum van `400px`. Overschrijf `--dsn-hero-block-size` via een inline stijl om de hoogte per instantie aan te passen:

```html
<section class="dsn-hero" style="--dsn-hero-block-size: 50svh;">...</section>
```

## Design tokens

| Token                                 | Beschrijving                                                                       |
| ------------------------------------- | ---------------------------------------------------------------------------------- |
| `--dsn-hero-block-size`               | Hoogte van de Hero (`70svh` standaard); aanpasbaar per instantie                   |
| `--dsn-hero-min-block-size`           | Minimale hoogte (`400px`); vloer zodat de Hero niet te klein wordt                 |
| `--dsn-hero-padding-block`            | Verticale padding van de inhoud                                                    |
| `--dsn-hero-padding-inline`           | Horizontale padding van de inner wrapper                                           |
| `--dsn-hero-background-color-default` | Achtergrondkleur standaard variant (licht blauw)                                   |
| `--dsn-hero-background-color-inverse` | Achtergrondkleur inverse variant (donker blauw)                                    |
| `--dsn-hero-color-default`            | Tekstkleur standaard variant                                                       |
| `--dsn-hero-color-inverse`            | Tekstkleur inverse variant (licht op donker)                                       |
| `--dsn-hero-image-blend-color`        | Blendkleur voor de image-blend variant                                             |
| `--dsn-hero-bg-image`                 | CSS custom property voor de achtergrondafbeelding (niet in tokens — per instantie) |

## Accessibility

### Sectie-landmark

Het `<section>` element krijgt een toegankelijke naam via `aria-labelledby` gekoppeld aan de kop binnen de Hero. Screenreaders kondigen de Hero aan als een named landmark, waardoor toetsenbordgebruikers er direct naartoe kunnen navigeren.

```html
<section class="dsn-hero" aria-labelledby="hero-heading">
  <div class="dsn-hero__inner">
    <div class="dsn-hero__content">
      <h1 id="hero-heading">Paginatitel</h1>
      ...
    </div>
  </div>
</section>
```

### Contrast

- **Default variant**: tekst op lichtblauwe achtergrond — voldoet aan WCAG 4.5:1 voor kleine tekst.
- **Inverse variant**: witte tekst op donkerblauwe achtergrond — voldoet aan WCAG 4.5:1.
- **Image variant (zonder blend)**: contrast is afhankelijk van de afbeelding en **kan niet worden gegarandeerd** — gebruik deze variant alleen als de afbeelding licht genoeg is of de tekst een extra contrastlaag krijgt.
- **Image-blend variant**: de kleur-overlay verhoogt de kans op voldoende contrast, maar geeft geen garantie bij elke afbeelding.

### Achtergrondafbeeldingen

Achtergrondafbeeldingen zijn CSS `background-image` en worden door screenreaders genegeerd. Als de afbeelding inhoudelijke waarde heeft die niet in de tekst staat, voeg dan een beschrijving toe in de zichtbare Hero-inhoud.
