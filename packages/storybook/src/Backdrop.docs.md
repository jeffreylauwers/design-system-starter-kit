# Backdrop

Vaste, volledig-scherm overlay die de achtergrondinhoud visueel verhult wanneer een modaal UI-element open is.

## Doel

Backdrop is een puur decoratief component. Het dempt de pagina-achtergrond visueel wanneer een modaal element open is, zodat de gebruiker zijn focus houdt bij het bovenliggende UI-element. De overlay combineert een semi-transparante donkere laag met een optioneel blur-filter dat de onderliggende interface vervaagt.

Het component heeft bewust geen eigen interactie of toegankelijkheidsmechanisme: het is altijd `aria-hidden="true"` en wordt volledig beheerd door de parent: het modale element dat erboven staat.

<!-- VOORBEELD -->

## Wel gebruiken als...

- Je een eigen modaal patroon bouwt zonder `<dialog>` en `showModal()`, en de pagina erachter wilt dempen.
- De gebruiker zijn focus bij het bovenliggende UI-element moet houden en de interface erachter vergrendeld is.
- Het element zelfstandig is en door de parent conditioneel gerenderd wordt.

## Niet gebruiken als...

- Je een Modal Dialog of Drawer gebruikt: die hebben een eigen `::backdrop` met dezelfde tokens.
- Je een visuele scheider of achtergrond zoekt zonder dat er een modaal element boven staat.
- Je een interactief element nodig hebt: gebruik daarvoor een button of overlay met een `onClick` handler op de parent.
- Het om paginaovergangen of laadschermen gaat: gebruik daarvoor een specifiek loading-patroon.

## Goed gebruik

### Conditioneel renderen

Render de Backdrop conditioneel vanuit de parent op basis van de open-staat van het modale element:

```html
<!-- Render alleen wanneer het modale element open is -->
<div class="dsn-backdrop" aria-hidden="true"></div>
<!-- het modale element, boven de Backdrop -->
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

De Backdrop zelf heeft geen `onClick` handler. Sluitgedrag bij klikken buiten een modaal element wordt afgehandeld door de parent, die een transparante kliklaag of de backdrop zelf als trigger kan gebruiken.

### ModalDialog en Drawer

ModalDialog en Drawer renderen deze component niet: ze gebruiken het native `::backdrop` van `<dialog>`. Dat pseudo-element leest dezelfde tokens als Backdrop. Een andere kleur, dekking of vervaging geldt dus voor alle drie.

### Blur-effect

Het blur-effect gebruikt `backdrop-filter: blur()` en valt gracefully weg in omgevingen zonder support (~6% van browsers). De overlay blijft volledig functioneel als semi-transparante laag zonder blur.

### Z-index afstemming

Backdrop ligt op de stapellaag van `--dsn-backdrop-z-index`. Het modale element erboven heeft een hogere `z-index` nodig, anders valt het onder de verduistering. ModalDialog en Drawer staan in de top layer van de browser en hebben geen `z-index` nodig.

### Animatie (toekomstige iteratie)

Conditioneel renderen biedt geen ruimte voor fade-in/out. Als animatie later gewenst is, kan een `visible` prop toegevoegd worden die een CSS-transitie aanstuurt via een `dsn-backdrop--visible` modifier.

## Design tokens

<!-- tokens: backdrop -->

## Toegankelijkheid

- Backdrop heeft altijd `aria-hidden="true"`: schermlezers nemen dit element niet waar.
- Geen `role` attribuut nodig: het component is puur decoratief.
- Geen toetsenbordinteractie: het component vangt geen focus en heeft geen klikgedrag.
- Focus management en het blokkeren van toetsenbordnavigatie naar de achtergrond is de verantwoordelijkheid van de parent (via `inert` of een focus trap).
