# PopoverMenu

Lijst met acties of links in een zwevend paneel, geopend vanuit een triggerknop.

<!-- VOORBEELD -->

## Doel

PopoverMenu toont een korte lijst knoppen of links die bij één trigger horen, zoals de acties voor een tabelrij of de accountnavigatie onder een gebruikersnaam. Het paneel ziet eruit als een [Popover](?path=/docs/components-popover--docs), maar is géén dialoogvenster: er is geen rol, geen heading en geen sluitknop, alleen een gewone lijst met `MenuButton`- en `MenuLink`-items.

Het menu sluit bij Escape, bij een klik buiten het paneel, en zodra de gebruiker een item kiest.

**Implementatiekeuze:** net als de Popover gebruikt PopoverMenu de HTML Popover API (`popover="auto"`) voor light dismiss en top-layer gedrag, met positionering via JavaScript. Dat gedrag delen de twee componenten; alleen de semantiek verschilt.

## Use when

- Een actiemenu per tabelrij (Bewerken, Dupliceren, Verwijderen).
- Accountnavigatie onder de gebruikersnaam in de PageHeader.
- Een "Meer acties"-knop waarachter secundaire acties staan.
- Elke korte lijst knoppen of links die bij één trigger hoort.

## Don't use when

- Het paneel een heading, formulier of andere controls bevat (bijv. filters): gebruik dan **Popover**, een niet-modale dialog.
- Er maar één actie is: gebruik dan een gewone **Button**.
- De lijst hoofdnavigatie is die altijd zichtbaar moet zijn: gebruik dan **Menu** in een `<nav>`.

## Best practices

### PopoverMenu vs. Popover

| Inhoud van het paneel                    | Component       |
| ---------------------------------------- | --------------- |
| Lijst met acties (knoppen)               | **PopoverMenu** |
| Lijst met links                          | **PopoverMenu** |
| Heading met tekst, formulier of controls | **Popover**     |
| Bevestiging die de hele pagina blokkeert | **ModalDialog** |

Een actielijst is geen dialoogvenster. Zit een lijst in een `Popover`, dan kondigt een screenreader hem aan als "dialoog", wat de gebruiker op het verkeerde been zet.

### Trigger en context

Het menu heeft zelf geen naam. De context komt uit het label van de trigger, dus maak dat label specifiek genoeg. Bij een actiemenu per tabelrij hoort de rij in het label, visueel verborgen:

```tsx
<Button
  ref={triggerRef}
  variant="subtle"
  size="small"
  iconOnly
  iconStart={<Icon name="dots-vertical" aria-hidden />}
  onClick={() => setIsOpen((v) => !v)}
>
  Toon acties
  <span className="dsn-visually-hidden"> voor Laptop Pro</span>
</Button>
```

De trigger krijgt via `triggerRef` automatisch `aria-expanded="true/false"`.

### Sluiten na een keuze

Het menu sluit zichzelf zodra een `MenuButton` of `MenuLink` wordt geactiveerd, en roept dan `onClose` aan. Het eigen `onClick` van het item is op dat moment al uitgevoerd. Schrijf dus geen `onClick={close}` op de items; gebruik `onClick` alleen voor de actie zelf.

De uitklapknop van een `MenuLink` met sub-items sluit het menu niet: die toont meer items en is geen keuze.

### Plaatsing

- `bottom` (standaard): het menu opent onder de trigger.
- `top`: gebruik wanneer de trigger laag op de pagina staat.
- `end`: rechts van de trigger (links in RTL).
- `start`: links van de trigger (rechts in RTL).

Het menu wordt automatisch binnen het viewport gehouden.

### Inverse context

In een inverse `PageHeader` heeft het paneel altijd een lichte achtergrond. De PageHeader zet de menu-kleuren binnen `.dsn-popover-menu` terug naar de standaardkleuren, net als bij `.dsn-popover`.

## Design tokens

Alle tokens delegeren naar de Popover, zodat beide panelen gelijk ogen: dezelfde stijl en dezelfde binnenruimte als de body van een Popover.

| Token                                 | Standaardwaarde                     | Beschrijving                      |
| ------------------------------------- | ----------------------------------- | --------------------------------- |
| `--dsn-popover-menu-background-color` | `{dsn.popover.background-color}`    | Achtergrondkleur                  |
| `--dsn-popover-menu-border-width`     | `{dsn.popover.border-width}`        | Randbreedte                       |
| `--dsn-popover-menu-border-color`     | `{dsn.popover.border-color}`        | Randkleur                         |
| `--dsn-popover-menu-border-radius`    | `{dsn.popover.border-radius}`       | Hoekafronding                     |
| `--dsn-popover-menu-box-shadow`       | `{dsn.popover.box-shadow}`          | Schaduw                           |
| `--dsn-popover-menu-min-width`        | `{dsn.popover.min-width}`           | Minimale breedte                  |
| `--dsn-popover-menu-max-width`        | `{dsn.popover.max-width}`           | Maximale breedte                  |
| `--dsn-popover-menu-z-index`          | `{dsn.popover.z-index}`             | Z-index                           |
| `--dsn-popover-menu-padding-block`    | `{dsn.popover.body.padding-block}`  | Verticale padding rond de lijst   |
| `--dsn-popover-menu-padding-inline`   | `{dsn.popover.body.padding-inline}` | Horizontale padding rond de lijst |

## Accessibility

### Structuur

- Het paneel heeft **geen** `role`, geen `aria-modal` en geen `aria-label`: het is geen dialoogvenster.
- De inhoud is een `<ul class="dsn-menu" role="list">`. De `role="list"` is nodig omdat `.dsn-menu` de lijstmarkering verbergt, en Safari/VoiceOver de lijst dan anders niet meer aankondigt.
- **Geen `role="menu"` of `menuitem`.** Die rollen beloven navigatie met de pijltjestoetsen en zetten screenreaders in een applicatiemodus. Half geïmplementeerd is dat slechter dan een gewone lijst.
- De trigger krijgt `aria-expanded="true/false"`, synchroon met de open-staat.
- De trigger volgt de button-regel: een `dsn-button__label` span, nooit `aria-label`.

### Toetsenbord

- Bij openen gaat de focus naar het eerste item.
- `Tab` en `Shift+Tab` lopen door de items. Er is geen focus-trap: Tab mag het menu uit.
- `Escape` sluit het menu en zet de focus terug op de trigger.
- Een item kiezen sluit het menu en zet de focus terug op de trigger. Bij een link navigeert de browser weg.
- Een klik buiten het menu sluit het; de focus blijft dan waar de gebruiker klikte.

### Schermlezers

- Bij openen leest een screenreader het eerste item voor, binnen een lijst ("lijst, 3 items"). Er is geen aankondiging als dialoogvenster.
- Voor welke rij of welk onderwerp de acties gelden, hoort in het label van de trigger.
