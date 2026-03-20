# DotBadge

Kleine gekleurde stip die bij een Button of Link wordt geplaatst om zonder label of getal de aandacht te trekken bij een statuswijziging.

## Doel

DotBadge is een puur visueel indicator-component. Het trekt de aandacht op een discrete statuswijziging — zoals ongelezen berichten bij een inbox-icoon of nieuwe updates achter een navigatielink — zonder dat er een getal of label voor nodig is. Via de `pulse`-modifier kan de stip pulseren voor extra urgentie.

De component heeft bewust geen eigen toegankelijkheidsmechanisme. De verantwoordelijkheid voor toegankelijke context ligt bij de implementerende code via `dsn-visually-hidden`.

<!-- VOORBEELD -->

## Use when

- Een gebruiker subtiel moet worden gewezen op een statuswijziging zonder dat een getal of label nodig is.
- Ongelezen berichten of notificaties bij een inbox- of bell-icoon.
- Nieuwe updates achter een navigatielink.
- Urgente, tijdkritische statuswijzigingen waarbij de `pulse`-modifier extra aandacht trekt.

## Don't use when

- Je een getal wilt tonen (bijv. "3 ongelezen") — gebruik dan een **StatusBadge** of een badge met getal.
- Je een statustoestand wilt communiceren met een label — gebruik **StatusBadge**.
- De dot op zichzelf staat zonder parent Button of Link — de dot heeft altijd context nodig.

## Best practices

### Variantkeuze

- **Negative** — standaard, voor foutmeldingen en ongelezen berichten.
- **Positive** — voor succesvolle statuswijzigingen.
- **Warning** — voor waarschuwingen die aandacht vragen.
- **Info** — voor informatieve updates.
- **Neutral** — voor neutrale statuswijzigingen.

### Parent-wrapper

DotBadge is `position: absolute`. De parent-wrapper heeft altijd `position: relative` nodig. Gebruik `display: inline-flex` om de wrapper zo klein mogelijk te houden rond de parent Button of Link:

```html
<div style="position: relative; display: inline-flex;">
  <!-- Button of Link -->
  <span class="dsn-dot-badge dsn-dot-badge--negative" aria-hidden="true"></span>
</div>
```

### Toegankelijkheid

DotBadge heeft altijd `aria-hidden="true"` — screenreaders negeren de dot volledig. Voeg altijd een `dsn-visually-hidden` span toe in de parent Button of Link om de context te beschrijven:

```html
<!-- Icon-only button met inbox-dot -->
<div style="position: relative; display: inline-flex;">
  <button
    class="dsn-button dsn-button--subtle dsn-button--size-default dsn-button--icon-only"
  >
    <svg class="dsn-icon" aria-hidden="true"><!-- mail --></svg>
    <span class="dsn-button__label">
      Inbox
      <span class="dsn-visually-hidden">, 3 ongelezen berichten</span>
    </span>
  </button>
  <span class="dsn-dot-badge dsn-dot-badge--negative" aria-hidden="true"></span>
</div>
```

### Pulse-effect

Gebruik de `pulse`-modifier alleen voor urgente, tijdkritische statuswijzigingen. De animatie respecteert `prefers-reduced-motion: reduce` — bij verminderde bewegingsvoorkeur vervalt de animatie maar blijft de dot zichtbaar.

```html
<span
  class="dsn-dot-badge dsn-dot-badge--negative dsn-dot-badge--pulse"
  aria-hidden="true"
></span>
```

### Dynamische updates

Bij dynamisch bijwerken van de dot (bijv. nieuwe berichten binnenkomen): voeg `aria-live="polite"` toe op een hoger niveau zodat screenreaders de wijziging aankondigen via de toegankelijke tekst in de Button of Link.

## Design tokens

| Token                               | Beschrijving                                      |
| ----------------------------------- | ------------------------------------------------- |
| `--dsn-dot-badge-size`              | Diameter van de dot (8px)                         |
| `--dsn-dot-badge-color`             | Achtergrondkleur — wordt per variant ingesteld    |
| `--dsn-dot-badge-inset-block-start` | Verticale offset t.o.v. rechterbovenhoek parent   |
| `--dsn-dot-badge-inset-inline-end`  | Horizontale offset t.o.v. rechterbovenhoek parent |
| `--dsn-dot-badge-pulse-duration`    | Duur van de pulse-animatie                        |
| `--dsn-dot-badge-pulse-easing`      | Easing van de pulse-animatie                      |

## Accessibility

- DotBadge heeft altijd `aria-hidden="true"` — geen semantische betekenis op zichzelf.
- Context via `dsn-visually-hidden` span in de parent Button of Link — **verplicht**.
- Gebruik nooit `aria-label` op DotBadge zelf.
- Bij dynamisch bijwerken: voeg `aria-live="polite"` toe op een hoger niveau.
- Pulse-animatie respecteert `prefers-reduced-motion: reduce` — animatie vervalt, dot blijft zichtbaar.
