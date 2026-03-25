# Backdrop

Vaste, volledig-scherm overlay die de achtergrondinhoud visueel verhult wanneer een modaal UI-element open is.

## Doel

Backdrop is een puur decoratief component. Het dempt de pagina-achtergrond visueel wanneer een Modal Dialog of Drawer open is, zodat de gebruiker zijn focus houdt bij het bovenliggende UI-element. De overlay combineert een semi-transparante donkere laag met een optioneel blur-filter dat de onderliggende interface vervaagt.

Het component heeft bewust geen eigen interactie of toegankelijkheidsmechanisme — het is altijd `aria-hidden="true"` en wordt volledig beheerd door de parent (Modal, Drawer).

<!-- VOORBEELD -->

## Use when

- Als visuele achtergrond achter een Modal Dialog om de pagina op de achtergrond te dempen.
- Als visuele achtergrond achter een Drawer (zijpaneel) om context te bieden dat de interface vergrendeld is.
- Als onderdeel van elk modaal patroon waarbij de gebruiker zijn focus bij het bovenliggende UI-element moet houden.
- Als zelfstandig element dat door de parent conditioneel gerenderd wordt.

## Don't use when

- Als visuele scheider of achtergrond zonder dat er een modaal element boven staat.
- Als interactief element — gebruik daarvoor een button of overlay met een `onClick` handler op de parent.
- Voor paginaovergangen of laadschermen — gebruik daarvoor een specifiek loading-patroon.

## Best practices

### Conditioneel renderen

Render de Backdrop conditioneel vanuit de parent op basis van de open-staat van het modale element:

```html
<!-- Render alleen wanneer de modal open is -->
<div class="dsn-backdrop" aria-hidden="true"></div>
<dialog class="dsn-modal" open>
  <!-- modal-inhoud -->
</dialog>
```

```tsx
// React
{
  isOpen && <Backdrop />;
}
{
  isOpen && <Backdrop blur={false} />;
}
```

### Klik-gedrag

De Backdrop zelf heeft geen `onClick` handler. Sluitgedrag bij klikken buiten een modaal element wordt afgehandeld door de parent (Modal/Drawer), die een transparante kliklaag of de backdrop zelf als trigger kan gebruiken.

### Blur-effect

Het blur-effect gebruikt `backdrop-filter: blur()` en valt gracefully weg in omgevingen zonder support (~6% van browsers). De overlay blijft volledig functioneel als semi-transparante laag zonder blur.

### Z-index afstemming

De `z-index` van Backdrop (`400`) is lager dan die van Modal Dialog en Drawer. Stem de waarden af wanneer die componenten gedefinieerd worden.

### Animatie (toekomstige iteratie)

Conditioneel renderen biedt geen ruimte voor fade-in/out. Als animatie later gewenst is, kan een `visible` prop toegevoegd worden die een CSS-transitie aanstuurt via een `dsn-backdrop--visible` modifier.

## Design tokens

| Token                             | Beschrijving                                                                                       |
| --------------------------------- | -------------------------------------------------------------------------------------------------- |
| `--dsn-backdrop-background-color` | Basiskleur van de overlay — altijd donker, ongeacht light/dark mode (per thema apart gedefinieerd) |
| `--dsn-backdrop-opacity`          | Transparantie van de overlay — gebruikt in `color-mix()` (standaard: `50%`)                        |
| `--dsn-backdrop-blur`             | Intensiteit van het blur-filter (standaard: `4px`)                                                 |
| `--dsn-backdrop-z-index`          | Stapelvolgorde — moet lager zijn dan Modal/Drawer z-index (standaard: `400`)                       |

## Accessibility

- Backdrop heeft altijd `aria-hidden="true"` — schermlezers nemen dit element niet waar.
- Geen `role` attribuut nodig — het component is puur decoratief.
- Geen toetsenbordinteractie — het component vangt geen focus en heeft geen klikgedrag.
- Focus management en het blokkeren van toetsenbordnavigatie naar de achtergrond is de verantwoordelijkheid van de parent (Modal/Drawer via `inert` of focus trap).
