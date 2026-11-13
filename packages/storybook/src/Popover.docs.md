# Popover

Niet-modaal dialoogvenster verankerd aan een triggerelement.

<!-- VOORBEELD -->

## Doel

Het Popover component toont een zwevend paneel dat verankerd is aan een triggerelement. In tegenstelling tot `ModalDialog` en `Drawer` blokkeert een Popover de rest van de pagina niet: de gebruiker kan op de achtergrond blijven interacteren. De overlay sluit automatisch bij klik buiten de overlay (light-dismiss) of bij Escape.

De Popover is semantisch een niet-modale dialog (`role="dialog"`, `aria-modal="false"`). Het component heeft een composable structuur met `PopoverHeader`, `PopoverBody` en `PopoverFooter`.

Voor een lijst met acties of links is er [PopoverMenu](?path=/docs/components-popovermenu--docs): een lijst is geen dialoogvenster, en een screenreader zou hem in een Popover als "dialoog" aankondigen.

**Implementatiekeuze:** De React-implementatie gebruikt de HTML Popover API (`popover="auto"`) voor ingebakken light-dismiss en top-layer gedrag. Positionering vindt plaats via JavaScript (`getBoundingClientRect`). Dit gedrag deelt de Popover met PopoverMenu.

## Wel gebruiken als...

- Een klein formulier of keuze-UI tijdelijk naast een triggerpunt moet verschijnen (bijv. filters).
- Je beknopte aanvullende informatie met een heading bij een UI-element wilt tonen.
- De achtergrond interactief moet blijven terwijl de inhoud zichtbaar is.

## Niet gebruiken als...

- Het paneel alleen een lijst met acties of links bevat (bijv. acties voor een tabelrij of accountnavigatie): gebruik dan **PopoverMenu**.
- De content de volledige aandacht van de gebruiker vereist of interactie met de achtergrond niet toegestaan mag zijn: gebruik dan **ModalDialog**.
- De gebruiker de achtergrondpagina voor context nodig heeft terwijl hij een uitgebreid formulier invult: gebruik dan **Drawer**.
- De content een volwaardige werkstroom is die een eigen URL rechtvaardigt: gebruik dan een aparte pagina.

## Goed gebruik

### Popover vs. ModalDialog vs. Drawer

| Situatie                                            | Component       |
| --------------------------------------------------- | --------------- |
| Kleine keuze-UI of filters bij een knop             | **Popover**     |
| Lijst met acties of links bij een knop              | **PopoverMenu** |
| Bevestiging of korte gefocuste keuze                | **ModalDialog** |
| Rij- of itemdetails naast een lijst bekijken        | **Drawer**      |
| Volledige aandacht vereist, achtergrond geblokkeerd | **ModalDialog** |

### Toegankelijke naamgeving

- Gebruik `PopoverHeading` + `PopoverHeader` wanneer de popover een duidelijke titel heeft (bijv. "Filters"). De `aria-labelledby` koppeling verloopt automatisch via de context.
- Een zichtbare heading heeft de voorkeur. Heeft de popover er geen, gebruik dan de `label` prop; die stelt `aria-label` op de popover container.
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

### Zonder JavaScript (HTML/CSS-laag)

Gebruik je alleen de HTML/CSS-laag, dan opent en sluit de popover zonder eigen JavaScript:

- Trigger: `popovertarget="popover-id"`. De browser geeft de uitgevouwen-status van die knop zelf door; zet er dus geen vaste `aria-expanded` op.
- Sluitknop: `popovertarget="popover-id" popovertargetaction="hide"`.
- Heading: `autofocus` naast `tabindex="-1"`, zodat de focus bij openen op de titel komt.

Escape, sluiten bij een klik buiten de popover en het terugzetten van de focus bij sluiten doet de browser zelf. Alleen de plaatsing bij de trigger vraagt JavaScript of CSS Anchor Positioning; zonder blijft de popover gecentreerd.

`popovertarget` werkt vanaf Chrome 114, Firefox 125 en Safari 17, dezelfde browsers als de Popover API zelf. Een terugval met JavaScript levert dus niets op.

**React.** Het React-component gebruikt `popovertarget` bewust niet. De open-staat zit in `isOpen`, en React is daarvan de bron; een invoker zou de browser de popover laten openen of sluiten buiten die staat om. De positionering bij de trigger vraagt bovendien toch JavaScript. Het component regelt hetzelfde gedrag zelf, inclusief `aria-expanded` op de trigger.

## Design tokens

<!-- tokens: popover -->

## Toegankelijkheid

### Structuur

- De popover container heeft `role="dialog"` en `aria-modal="false"`: niet-modaal: de achtergrond blijft interactief en er is geen focus-trap.
- Popovers met `PopoverHeader`/`PopoverHeading` gebruiken `aria-labelledby` naar de heading-ID (via context, identiek aan het `ModalDialog`-patroon).
- Popovers zonder heading gebruiken `aria-label` op de popover container (via de `label` prop).
- Het triggerelement krijgt `aria-expanded="true/false"` die synchroon loopt met de open-staat.

### Toetsenbord

- `Escape` sluit de popover en zet focus terug op het triggerelement.
- Klik buiten de popover (light-dismiss via Popover API) sluit de popover. De focus blijft dan waar de gebruiker klikte en springt niet terug naar de trigger.
- Bij openen krijgt de `PopoverHeading` de focus (die heeft `tabindex="-1"`), niet de sluitknop. Zo wordt de titel als eerste voorgelezen, net als bij ModalDialog en Drawer. Zonder heading krijgt de popover zelf de focus. De focusomtrek op de heading verschijnt alleen bij toetsenbordgebruik.
- Tab-volgorde blijft lineair: focus mag buiten de popover bewegen (geen focus-trap).
- Bij sluiten gaat de focus alleen terug naar de trigger als die op dat moment nog in de popover stond (Escape, de sluitknop, een actie in de popover). Stond de focus al ergens anders, dan blijft hij daar.

### Schermlezers

- Schermlezers kondigen de dialoogrol aan bij openen: bijv. "Filters, dialoog".
- De sluitknop in `PopoverHeader` gebruikt altijd een `dsn-button__label` span: nooit `aria-label` op de button zelf.
