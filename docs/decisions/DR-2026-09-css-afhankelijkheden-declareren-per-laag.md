# DR-2026-09: CSS-afhankelijkheden per laag declareren, niet centraal oplossen

**ID:** DR-2026-09
**Datum:** September 2026
**Status:** Accepted
**Auteurs:** Jeffrey Lauwers

---

## Context

Een component zet soms klassen van een ánder component in zijn eigen markup. De sorteerknop in een Table-kolomkop draagt `dsn-button`, een ButtonLink draagt `dsn-button`, een LinkButton draagt `dsn-link`, MenuLink heeft een uitklapknop, File rendert een downloadlink, HeadingGroup rendert `dsn-heading` en `dsn-pre-heading`.

In geen van die gevallen laadde iets die CSS. `Table.css` importeerde alleen `table.css`, `ButtonLink.css` alleen `button-link.css`.

Dat viel jarenlang niet op. Zolang alle component-CSS in één bundel belandde was `button.css` er toch wel, ongeacht wie hem aanwees. Zodra de bundler per component een CSS-chunk maakt, laadt die chunk alleen wat de modulegraaf aanwijst, en verdwijnt de styling stil. Geen foutmelding, geen waarschuwing: het component rendert, alleen zonder de helft van zijn regels.

Gemeten op de gepubliceerde Storybook, op de Table-pagina:

| Meting                                         | Uitkomst                         |
| ---------------------------------------------- | -------------------------------- |
| `.dsn-button`-regels in het document           | geen enkele                      |
| `.dsn-button__label` (hoort verborgen te zijn) | `position: static`, 42,8px breed |
| ButtonLink `background-color`                  | `rgba(0, 0, 0, 0)`               |
| ButtonLink `padding`                           | `0px`                            |

ButtonLink raakte daarmee ook consumenten van het npm-package, niet alleen Storybook. Wie `ButtonLink` importeerde kreeg een kale linktekst waar een knop hoorde te staan.

Dit is de tweede keer dat dezelfde onderliggende breuk toesloeg. Twee dagen eerder ging het om volgorde in plaats van aanwezigheid: `.dsn-select` overschreef `.dsn-text-input` op gelijke specificiteit, wat alleen werkte zolang `text-input.css` eerder in het document stond. Dat is opgelost met compound selectors. Beide keren was de aanleiding hetzelfde: de aanname dat alle CSS in één document staat, in een voorspelbare volgorde.

Er bestond al een mechanisme voor de volgordekant, `@dsn-depends-on`, gebruikt door vier formuliervelden en gelezen door `packages/components-html/scripts/build.js`. De aanwezigheidskant had niets.

---

## Opties overwogen

### Optie 1: `@import` in de components-html CSS

Het meest voor de hand liggend: laat `table.css` gewoon `@import '../button/button.css'` doen.

**Voordeel:** Eén declaratie, die zowel aanwezigheid als volgorde regelt, op de laag waar de afhankelijkheid thuishoort.
**Nadeel:** Breekt `dist/components.css`. `build.js` concateneert de bronbestanden en strípt alleen package-imports; een relatieve `@import` blijft letterlijk in het midden van de gebundelde CSS staan. Daar is hij twee keer ongeldig: `@import` mag alleen vóór elke regel staan, en het pad wijst vanaf `dist/` nergens op. Bovendien zou de bundler van een consumerend package hetzelfde bestand een tweede keer inlinen, ná de overschrijvende regels.

Dit is precies de reden waarom `@dsn-depends-on` destijds een comment werd en geen `@import`.

### Optie 2: alle component-CSS altijd samen laden

Eén stylesheet met alles erin, ook in de React-laag. Dan is elk probleem van dit type per definitie weg.

**Voordeel:** Onmogelijk om nog stil te breken.
**Nadeel:** Elke consument betaalt voor elk component, ook wie er drie gebruikt. En het maskeert echte packagefouten: ButtonLink was kapot in het gepubliceerde package, en juist de chunking maakte dat zichtbaar. Dit alternatief zou die bug hebben verborgen in plaats van opgelost.

### Optie 3: de afhankelijkheid in het `.tsx`-bestand

`import '../Button/Button.css'` bovenaan `ButtonLink.tsx`. Dit gebeurde al: de vier formuliervelden deden precies dat met `import '../TextInput/TextInput.css'`.

**Voordeel:** Werkt, en het is de kortste ingreep.
**Nadeel:** Zet de afhankelijkheid op de verkeerde laag. HTML/CSS is de bron van waarheid; als de React-wrapper de enige plek is waar staat dat Table een knop nodig heeft, dan is de HTML/CSS-laag niet zelfvoorzienend en weet een consument die alleen `components-html` gebruikt van niets. Daarbij ligt de volgorde ten opzichte van de eigen regels niet vast: twee side-effect imports in een `.tsx` zeggen niets over welke CSS eerst in het document belandt.

### Optie 4: declareren in de HTML/CSS-laag, ophalen in de React-laag

`@dsn-depends-on` in de components-html CSS, en een `@import` van diezelfde afhankelijkheid in het React CSS-bestand, vóór de eigen import.

**Voordeel:** De declaratie staat op de bron-van-waarheid-laag en is leesbaar voor wie alleen `components-html` gebruikt. `build.js` gebruikt hem al voor de volgorde in `dist/components.css`. De React-laag is er letterlijk van afgeleid, wat het twee-lagenpatroon uit [DR-2026-02](DR-2026-02-twee-lagenpatroon-html-css-plus-react.md) volgt. En omdat het in het CSS-bestand staat en niet in de `.tsx`, ligt de volgorde ten opzichte van de eigen regels vast.
**Nadeel:** De afhankelijkheid staat op twee plekken, dus die kunnen uit elkaar lopen.

---

## Besluit

**Optie 4**, met een test die het tweede nadeel wegneemt.

De HTML/CSS-laag declareert:

```css
/* packages/components-html/src/table/table.css */
/* @dsn-depends-on: button */
```

De React-laag haalt op, vóór de eigen import:

```css
/* packages/components-react/src/Table/Table.css */
@import '../../../components-html/src/button/button.css';

@import '../../../components-html/src/table/table.css';
```

`tests/css-dependencies.test.ts` bewaakt beide kanten en laat de twee plekken niet uit elkaar lopen:

1. Elke `dsn-*` klasse die een React-component rendert, moet gedefinieerd zijn in CSS die bereikbaar is via zijn imports.
2. Elke `@dsn-depends-on` in de components-html CSS van een component moet bereikbaar zijn vanuit de React-CSS van datzelfde component.

De test leidt beide kanten af uit de bestanden zelf, dus een nieuw component dat de regel overtreedt faalt zonder dat iemand een lijst hoeft bij te werken.

Bij de vier formuliervelden is de bestaande `import '../TextInput/TextInput.css'` uit het `.tsx` verplaatst naar het CSS-bestand, zodat alle tien de componenten hetzelfde patroon volgen.

---

## Gevolgen

**Bewust geaccepteerd:** de afhankelijkheid staat op twee plekken. Zonder de test zou dat een slecht idee zijn. Met de test is het een declaratie op de juiste laag plus een afgeleide, en dat is precies wat het twee-lagenpatroon overal doet.

**Niet doen:** de `@import`-regels in de React-CSS weghalen omdat ze dubbelop lijken met `@dsn-depends-on`. Ze doen iets anders. De comment regelt volgorde in `dist/components.css`, de `@import` regelt aanwezigheid in de React-chunk. Haal je de tweede weg, dan faalt `css-dependencies.test.ts` en dat is de bedoeling.

**Niet doen:** `@dsn-depends-on` vervangen door een `@import` in de components-html CSS, hoe verleidelijk het ook is om één mechanisme over te houden. Zie optie 1 voor wat er dan met `dist/components.css` gebeurt.

**Specificiteit blijft de regel bij overschrijven.** Deze beslissing gaat over aanwezigheid. Overschrijft een component een ander op gelijke specificiteit, dan hoort dat nog steeds met een compound selector (`.dsn-text-input.dsn-select`), niet met volgorde. Zie [CSS Naming Conventions](../06-css-naming-conventions.md).

**Deze fout is niet zichtbaar in de Storybook dev-server.** Vite serveert in dev uit één modulegraaf en splitst niet per chunk. Verifieer dit soort wijzigingen tegen een productiebuild.

---

## Gerelateerd

- [DR-2026-02](DR-2026-02-twee-lagenpatroon-html-css-plus-react.md): HTML/CSS als bron van waarheid, React als wrapper
- [DR-2026-07](DR-2026-07-css-los-van-de-javascript-bundel.md): CSS los van de JavaScript-bundel
- [CSS Naming Conventions](../06-css-naming-conventions.md): het patroon dat hieruit volgt
- PR #378, issue #376
