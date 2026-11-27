# DR-2026-18: Scoped token-bestanden herhalen elke token die van hun as afhangt

**ID:** DR-2026-18
**Datum:** November 2026
**Status:** Accepted
**Auteurs:** Jeffrey Lauwers

---

## Context

Er zijn twee manieren om een ander thema, een andere mode of een andere dichtheid te kiezen:

1. **Build-time:** één volledige config op `:root`, bijvoorbeeld `css/dark` (Start dark).
2. **Runtime met klassen:** `css` (Start light op `:root`) plus de bestanden uit `css/scoped/`, met `dsn-theme-{start|wireframe}`, `dsn-mode-dark` en `dsn-density-dense` op een container. Dit is de route uit `docs/00-getting-started.md`.

De tweede route werkte alleen voor de primitieven. Een custom property wordt opgelost op het element waar hij gedeclareerd staat. Een componenttoken als

```css
:root {
  --dsn-button-default-color: var(--dsn-color-action-1-color-default);
}
```

krijgt op `:root` de light-waarde. Een container met `dsn-theme-start dsn-mode-dark` erft die als kant-en-klare kleur. Het scoped bestand overschrijft `--dsn-color-action-1-color-default` wel, maar niets rekent de componenttoken opnieuw uit. Het gevolg: donkere knoptekst op een donkere achtergrond.

Het scoped bestand voor dark bevatte alleen de 337 tokens uit `colors-dark.json`. De dichtheidsbestanden bevatten alleen de font-size- en space-maten. De themabestanden bevatten alleen kleuren, dus `dsn-theme-wireframe` veranderde geen lettertype, radius of lijndikte. Een aparte config voor de thema-basis bestond wel, maar werd nooit gebouwd.

Gemeten in Chromium met `tests/scoped-tokens.test.ts`, die per scenario elke custom property vergelijkt met de volledige config van dezelfde combinatie:

| Scenario               | Afwijkende tokens | Zichtbaar                                          |
| ---------------------- | ----------------- | -------------------------------------------------- |
| Start dark             | 324 van 1485      | knoptekst `oklch(0.4 …)` in plaats van `0.72`      |
| Wireframe light        | 571 van 1484      | lettertype, radii en lijnen blijven Start          |
| dense                  | 272 van 1485      | koppen, marges en paddings blijven fluid           |
| Wireframe dark + dense | 796 van 1484      | alle drie de problemen tegelijk                    |
| default binnen dense   | 51 van 1485       | `dsn-density-default` bestond niet, alleen `:root` |

Binnen de monorepo viel dit niet op. Storybook laadt de volledige config van de gekozen combinatie op `:root:root`, en gebruikt de scoped bestanden niet.

---

## Opties overwogen

### Optie 1: Componenttokens op het component declareren in plaats van op `:root`

`.dsn-button { --dsn-button-default-color: var(--dsn-color-action-1-color-default); }`. Dan lost elke knop zijn token zelf op, onder elke scope.

**Voordeel:** Werkt voor elke scope zonder dat de build iets hoeft te weten.
**Nadeel:** Breekt het overschrijven van componenttokens op `:root`, en dat is juist hoe een project een component aanpast: de declaratie op het component wint altijd. Daarnaast verandert de token-output van elk component.

### Optie 2: De volledige config onder elke klasse herhalen

Elk scoped bestand is de complete config van zijn combinatie, onder de klasse in plaats van `:root`.

**Voordeel:** Eenvoudig, en per bestand gegarandeerd compleet.
**Nadeel:** De assen overschrijven elkaar. Het dark-bestand zet dan ook alle space-maten terug naar default, dus `dsn-theme-start dsn-mode-dark dsn-density-dense` op één element is niet meer dense (de dark-selector is specifieker). Per bestand 215 kB in plaats van een fractie daarvan.

### Optie 3: Per as de tokens die verschillen, plus alles wat ernaar verwijst (gekozen)

De build vergelijkt de volledige configs. Wat op een as verschilt, en elke token die daar rechtstreeks of via andere tokens met `var()` naar verwijst, komt in het scoped bestand van die as. De declaraties komen letterlijk uit de volledige config.

**Voordeel:** De klassenroute geeft exact dezelfde waarden als de volledige config, en de assen blijven los combineerbaar. Een nieuw componenttoken komt vanzelf mee.
**Nadeel:** Grotere bestanden (zie consequenties). Een token waarvan de declaratie op beide assen verschilt kan niet in deze vorm (zie regel 4).

---

## Beslissing

**Elk scoped bestand herhaalt de tokens die op zijn as verschillen en alle tokens die daarvan afhangen, met de declaratie uit de volledige config.** De logica staat in `packages/design-tokens/src/config/scoped.js` en draait na de volledige configs.

Vijf regels die hieruit volgen:

1. **De vier thema x mode-bestanden bevatten dezelfde set tokens** (nu 906), ook tokens die in hun eigen combinatie toevallig gelijk zijn aan `:root`. Zo zet elke container alles terug wat een andere container veranderde, hoe ze ook genest zijn.
2. **De declaratie komt uit `dist/css/{thema}-{mode}-{density}.css`, niet opnieuw uit Style Dictionary.** Dan is de verwijzingsvorm (`var()` of een uitgerekende `clamp()`) dezelfde als op `:root`, en kan de klassenroute niet stil afwijken van de build-time route.
3. **Een declaratie die per waarde van de andere as verschilt, krijgt specificiteit 0.** Dat zijn er nu twee: `--dsn-form-control-padding-block-start` en `-end` wijzen in Start naar `space-block-md` en in Wireframe naar `space-block-lg`, net als in Figma (zie [DR-2026-14](DR-2026-14-density-collection-draagt-de-theme-as.md)). In het dichtheidsbestand staan ze onder `:where(.dsn-density-dense)` met de declaratie van `:root`, zodat de themaklasse op hetzelfde element wint, plus een regel `:where(.dsn-theme-wireframe) :where(.dsn-density-dense)` voor een dichtheidsklasse binnen een Wireframe-container. Zo maakt de importvolgorde niet uit.
4. **Verschilt een declaratie op beide assen tegelijk, dan stopt de build.** Dan is er op één element geen regel die wint, en een fout in de build is beter dan een stil verkeerde waarde.
5. **`density-default` krijgt de klasse `.dsn-density-default` naast `:root`.** De documentatie noemde die klasse al, maar hij bestond niet, waardoor je binnen een dense container niet terug kon naar default.

---

## Consequenties

- **Groter:** een themabestand gaat van 25 kB naar 68 kB (gzip 2,3 naar 6,1 kB), een dichtheidsbestand van 4 kB naar 23 kB (gzip 0,6 naar 2,7 kB). De volledige config is 216 kB (gzip 20,7 kB).
- **Drie tokens vallen weg uit de themabestanden:** `--dsn-color-transparent`, `--dsn-focus-background-color` en `--dsn-form-control-read-only-border-color` zijn in alle vier de combinaties gelijk en hoeven niet gescoopt te worden.
- **De output op `:root` is ongewijzigd.** Alleen `dist/css/scoped/{thema}-{mode}.css`, `density-*.css` en de alias `variables-dark-scoped.css` veranderen. De hero-image-bestanden blijven zoals ze waren.
- **Een browsertest bewaakt het:** `tests/scoped-tokens.test.ts` draait in Chromium (Playwright) en vergelijkt veertien scenario's, in twee importvolgordes, met de volledige config van dezelfde combinatie. De CI-job die `pnpm test` draait installeert daarvoor Chromium.
- **Een thema met een eigen fluid schaal stopt de build.** Een fluid maat is in default een uitgerekende `clamp()` met de min- en max-waarden van het thema ([DR-2026-13](DR-2026-13-fluid-schaal-met-min-max-per-maat.md)), en in information-dense een `var()` naar de min-waarde. Wijken die per thema af, dan verschilt de declaratie op beide assen (regel 4). Start en Wireframe delen hun schaal, dus nu speelt het niet. Komt er een thema met een eigen schaal, dan moet deze beslissing opnieuw, bijvoorbeeld met regels per combinatie van thema en dichtheid.
- **Bekende grenzen:**
  - Light binnen dark kan niet: `.dsn-mode-dark .dsn-theme-start` geldt voor elke Start-container onder een dark ouder, en er is geen `dsn-mode-light`-selector die dat terugzet. Dat was al zo.
  - Staan er twee verschillende thema's genest boven een dichtheidsklasse op een dieper element, dan volgt de padding van formuliervelden het Wireframe-thema, ook als het binnenste thema Start is. Zet de dichtheidsklasse op hetzelfde element als de themaklasse, of erboven.
  - `--dsn-backdrop-background-color` bestaat in Wireframe niet. De build meldt dat en slaat hem over in de Wireframe-bestanden; binnen een Wireframe-container onder Start blijft de backdrop van Start staan.

---

## Gerelateerd

- [DR-2026-13](DR-2026-13-fluid-schaal-met-min-max-per-maat.md): de fluid schaal, waarom een maat in default een uitgerekende `clamp()` is
- [DR-2026-14](DR-2026-14-density-collection-draagt-de-theme-as.md): dezelfde form-control-padding, in Figma
- `docs/00-getting-started.md`, sectie Theming
