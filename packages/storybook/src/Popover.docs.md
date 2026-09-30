# Popover

Lichtgewicht, contextgebonden overlay verankerd aan een triggerelement.

<!-- VOORBEELD -->

## Doel

Het Popover component toont een zwevend paneel dat verankerd is aan een triggerelement. In tegenstelling tot `ModalDialog` en `Drawer` blokkeert een Popover de rest van de pagina niet: de gebruiker kan op de achtergrond blijven interacteren. De overlay sluit automatisch bij klik buiten de overlay (light-dismiss) of bij Escape.

Het component ondersteunt een composable structuur met `PopoverHeader`, `PopoverBody` en `PopoverFooter`, waardoor willekeurige content: waaronder het `Menu`-component: als slot kan worden meegegeven.

**Implementatiekeuze:** De React-implementatie gebruikt de HTML Popover API (`popover="auto"`) voor ingebakken light-dismiss en top-layer gedrag. Positionering vindt plaats via JavaScript (`getBoundingClientRect`).

## Use when

- Contextmenu's verankerd aan een knop (bijv. een `Menu` met acties voor een tabelrij).
- Beknopte aanvullende informatie bij een UI-element.
- Kleine formulieren of keuze-UI's die tijdelijk naast een triggerpunt verschijnen.
- Navigatie-dropdowns of "quick actions" die vanuit een icon-button openen.

## Don't use when

- De content de volledige aandacht van de gebruiker vereist of interactie met de achtergrond niet toegestaan mag zijn: gebruik dan **ModalDialog**.
- De gebruiker de achtergrondpagina voor context nodig heeft terwijl hij een uitgebreid formulier invult: gebruik dan **Drawer**.
- De content een volwaardige werkstroom is die een eigen URL rechtvaardigt: gebruik dan een aparte pagina.

## Best practices

### Popover vs. ModalDialog vs. Drawer

| Situatie                                            | Component       |
| --------------------------------------------------- | --------------- |
| Contextmenu of quick action bij een knop            | **Popover**     |
| Bevestiging of korte gefocuste keuze                | **ModalDialog** |
| Rij- of itemdetails naast een lijst bekijken        | **Drawer**      |
| Volledige aandacht vereist, achtergrond geblokkeerd | **ModalDialog** |

### Toegankelijke naamgeving

- Gebruik `PopoverHeading` + `PopoverHeader` wanneer de popover een duidelijke titel heeft (bijv. "Filters"). De `aria-labelledby` koppeling verloopt automatisch via de context.
- Gebruik de `label` prop wanneer de popover geen visuele heading heeft (bijv. een acties-menu). Dit stelt `aria-label` op de popover container.
- **Nooit** beide tegelijk gebruiken: kies één van de twee patronen.

### Plaatsing

Kies de plaatsing (`placement`) op basis van de beschikbare ruimte:

- `bottom` (standaard): meest gebruikelijk, de popover opent onder de trigger.
- `top`: gebruik wanneer de trigger laag op de pagina staat.
- `end`: rechts van de trigger (of links in RTL).
- `start`: links van de trigger (of rechts in RTL).

De React-implementatie klampt de popover automatisch binnen het viewport bij overschrijding van de randen.

### Trigger-element

Het triggerelement (bijv. `Button`) krijgt automatisch `aria-expanded="true/false"` via de `triggerRef` prop. Zorg dat het triggerelement via `ref` beschikbaar is voor de `Popover`.

## Design tokens

| Token                                      | Standaardwaarde                     | Beschrijving                      |
| ------------------------------------------ | ----------------------------------- | --------------------------------- |
| `--dsn-popover-background-color`           | `{dsn.color.neutral.bg-elevated}`   | Achtergrondkleur                  |
| `--dsn-popover-border-width`               | `{dsn.border.width.thin}`           | Randbreedte                       |
| `--dsn-popover-border-color`               | `{dsn.color.neutral.border-subtle}` | Randkleur                         |
| `--dsn-popover-border-radius`              | `{dsn.border.radius.md}`            | Hoekafronding                     |
| `--dsn-popover-box-shadow`                 | `{dsn.box-shadow.md}`               | Schaduw (md-elevatie)             |
| `--dsn-popover-max-width`                  | `25rem`                             | Maximale breedte (400px)          |
| `--dsn-popover-min-width`                  | `12.5rem`                           | Minimale breedte (200px)          |
| `--dsn-popover-z-index`                    | `300`                               | Z-index (lager dan modals: 500)   |
| `--dsn-popover-heading-font-family`        | `{dsn.heading.font-family}`         | Lettertype heading                |
| `--dsn-popover-heading-font-weight`        | `{dsn.heading.font-weight}`         | Gewicht heading                   |
| `--dsn-popover-heading-color`              | `{dsn.heading.color}`               | Kleur heading                     |
| `--dsn-popover-heading-font-size`          | `{dsn.text.font-size.md}`           | Tekstgrootte heading              |
| `--dsn-popover-heading-line-height`        | `{dsn.text.line-height.md}`         | Regelafstand heading              |
| `--dsn-popover-header-padding-block-start` | `{dsn.space.block.xl}`              | Boven-padding header (16px)       |
| `--dsn-popover-header-padding-block-end`   | `{dsn.space.block.xl}`              | Onder-padding header (16px)       |
| `--dsn-popover-header-padding-inline`      | `{dsn.space.inline.xl}`             | Horizontale padding header (16px) |
| `--dsn-popover-body-padding-block`         | `{dsn.space.block.xl}`              | Verticale padding body (16px)     |
| `--dsn-popover-body-padding-inline`        | `{dsn.space.inline.xl}`             | Horizontale padding body (16px)   |
| `--dsn-popover-footer-padding-block-start` | `{dsn.space.block.xl}`              | Boven-padding footer (16px)       |
| `--dsn-popover-footer-padding-block-end`   | `{dsn.space.block.xl}`              | Onder-padding footer (16px)       |
| `--dsn-popover-footer-padding-inline`      | `{dsn.space.inline.xl}`             | Horizontale padding footer (16px) |

## Accessibility

### Structuur

- De popover container heeft `role="dialog"` en `aria-modal="false"`: niet-modaal: de achtergrond blijft interactief en er is geen focus-trap.
- Popovers met `PopoverHeader`/`PopoverHeading` gebruiken `aria-labelledby` naar de heading-ID (via context, identiek aan het `ModalDialog`-patroon).
- Popovers zonder heading gebruiken `aria-label` op de popover container (via de `label` prop).
- Het triggerelement krijgt `aria-expanded="true/false"` die synchroon loopt met de open-staat.

### Toetsenbord

- `Escape` sluit de popover en zet focus terug op het triggerelement.
- Klik buiten de popover (light-dismiss via Popover API) sluit de popover. De focus blijft dan waar de gebruiker klikte en springt niet terug naar de trigger.
- Bij openen: focus springt naar het eerste interactieve element in de popover.
- Tab-volgorde blijft lineair: focus mag buiten de popover bewegen (geen focus-trap).
- Bij sluiten gaat de focus alleen terug naar de trigger als die op dat moment nog in de popover stond (Escape, de sluitknop, een actie in de popover). Stond de focus al ergens anders, dan blijft hij daar.

### Schermlezers

- Schermlezers kondigen de dialoogrol aan bij openen: bijv. "Acties, dialoog".
- De sluitknop in `PopoverHeader` gebruikt altijd een `dsn-button__label` span: nooit `aria-label` op de button zelf.
