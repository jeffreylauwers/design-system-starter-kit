# Kandidaat-componenten

Componenten die de theme configurator nodig heeft en die de starter kit nog niet heeft. Ze staan hier, niet in `components-html` en `components-react`, totdat ze als volwaardig component zijn uitgewerkt (#529): met component-tokens in `design-tokens`, een manifest, een Figma-matrix en Storybook-docs.

Wat er nu al is, per kandidaat:

- de definitieve `dsn-`-klassen (BEM, zie `docs/06-css-naming-conventions.md`);
- een HTML/CSS-laag (`{naam}.css`) en een React-wrapper (`{Naam}.tsx`);
- alleen tokens: de lokale tokens staan op het block en verwijzen naar semantische tokens, omdat er nog geen component-tokens zijn;
- minimaal pointer target en geen afhankelijkheid van hover;
- tests en een README.

| Kandidaat                                        | Waarvoor in de configurator                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| [SegmentedControl](./SegmentedControl/README.md) | Modus, viewport, dichtheid, weergave van waarden, Instellen of Voorbeeld |
| [Tabs](./Tabs/README.md)                         | De onderdelen van het thema: Kleur, Typografie, Ruimte, Vorm, Schaduw    |
| [ColorInput](./ColorInput/README.md)             | De basiskleur van een kleurgroep                                         |
| [ColorSwatch](./ColorSwatch/README.md)           | Elke schakering van een kleurgroep, met contrast en kopiëren             |
