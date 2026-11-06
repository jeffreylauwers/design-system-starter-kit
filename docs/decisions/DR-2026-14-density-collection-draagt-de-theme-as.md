# DR-2026-14: De Density-collection in Figma draagt ook de theme-as

**ID:** DR-2026-14
**Datum:** November 2026
**Status:** Accepted
**Auteurs:** Jeffrey Lauwers

---

## Context

In Figma kan een variable alleen variëren over de modes van zijn eigen collection. Tot nu toe waren er drie collections met elk één as:

| Collection       | Modes                                      | As                      |
| ---------------- | ------------------------------------------ | ----------------------- |
| `dsn/Primitives` | `start-light`, `start-dark`, `wireframe-…` | theme × light/dark      |
| `dsn/Density`    | `default-mobile`, `default-desktop`, …     | project-type × viewport |
| `dsn/Components` | `default`                                  | geen, alleen aliassen   |

Vijftien fluid waarden pasten nergens in, omdat ze van theme **én** viewport **én** density afhangen. Een icoongrootte is de fluid font-size (viewport en density) maal de line-height van het theme (1,5 in Start, 1,4 in Wireframe). `form-control/padding-block-*` verwijst in Start naar een andere spacing-maat dan in Wireframe. En component-tokens die daarmee rekenen, zoals `select/padding-inline-end-with-icon`, erven alle drie de assen.

Die vijftien stonden vastgeprikt op 1440px. Het zichtbare gevolg: de matrices meten mobile-first op 360px, de verificatie uit [DR-2026-06](DR-2026-06-figma-bindingen-meten-plus-cssom.md) zag dat het token (50) niet overeenkwam met de meting (40), en weigerde terecht te binden. Bij DateInput, TimeInput, SearchInput en Select bleef de padding naast het icoon daardoor een vaste waarde, 165 keer over alle varianten.

Gemeten op `icon/size/md`, op `vp-large` (1440px):

| theme     | default | default-fixed-space | information-dense |
| --------- | ------- | ------------------- | ----------------- |
| Start     | 30      | 30                  | 24                |
| Wireframe | 28      | 28                  | 22,4              |

De density-as doet er dus echt toe, niet alleen theme en viewport.

---

## Opties overwogen

### Optie 1: Een nieuwe collection met theme × viewport (4 modes)

Een vierde collection naast Density, alleen voor deze waarden.

**Voordeel:** `dsn/Density` blijft ongewijzigd, en er is ruimte voor groei (4 van de 10 modes).
**Nadeel:** Negeert de density-as. In `information-dense` en `default-fixed-space` tonen deze waarden de maat van `default`, bijvoorbeeld een icoon van 30 in plaats van 24 op een dense artboard van 1440px. En de designer zet een derde schakelaar die volledig volgt uit de andere twee.

### Optie 2: Een nieuwe collection met theme × density × viewport (10 modes)

**Voordeel:** Exact in elke combinatie, en `dsn/Density` blijft ongewijzigd.
**Nadeel:** Drie schakelaars waarvan de derde volledig afgeleid is. Elke combinatie die niet klopt levert een maat op die nergens bestaat.

### Optie 3: `dsn/Density` krijgt de theme-as erbij (10 modes, gekozen)

De modes worden `start-default-vp-small`, `start-default-vp-large`, …, `wireframe-information-dense`. Alle fluid waarden, ook de theme-afhankelijke, komen in deze collection.

**Voordeel:** Exact in elke combinatie, geen vierde collection, en de designer houdt twee schakelaars.
**Nadeel:** De theme staat op twee plekken (`dsn/Primitives` en `dsn/Density`) en die moeten overeenkomen. Tien modes is precies het maximum van Figma Professional, dus een derde theme of density past niet meer zonder een duurder plan of een andere indeling.

---

## Beslissing

**`dsn/Density` krijgt een mode per theme × project-type × viewport, en elke fluid waarde komt in die collection.**

Twee schakelaars waarvan er één de theme herhaalt is minder foutgevoelig dan drie, en een waarde die in een density-mode niet klopt is precies het soort stille afwijking dat de bindingverificatie moet voorkomen.

Drie regels die hieruit volgen:

1. **Een alias alleen als elk theme naar hetzelfde token wijst.** Een Figma-alias geldt voor alle modes tegelijk. `form-control/padding-inline-start` wijst in elk theme naar `space/inline/lg` en wordt een alias; `form-control/padding-block-*` wijst per theme naar een andere maat en krijgt eigen waarden.
2. **Oude modes worden hernoemd, niet vervangen.** De payload geeft per oude naam de nieuwe (`renamedModes`: `default-mobile` naar `start-default-vp-small`). De plugin hernoemt de mode, zodat de modeId gelijk blijft en een frame waar een designer al een Density-mode op koos die keuze houdt. Toevoegen naast de oude zou bovendien 15 modes opleveren.
3. **Boven de 10 modes, of bij een mode-naam van meer dan 40 tekens, stopt de build.** Figma weigert beide. De 40 tekens zijn de reden dat de viewports `vp-small` en `vp-large` heten: met `viewport-large` werd `wireframe-default-fixed-space-viewport-large` 44 tekens. Figma weigert `addMode` boven de planlimiet, en een half geïmporteerde collection is erger dan een duidelijke foutmelding in de build.

---

## Consequenties

- `viewportPinned` in `variables-report.json` is leeg. De vier formuliervelden met een icoon binden hun padding nu aan `dsn/Density` en volgen de artboard-schakelaar.
- Een derde theme of een vierde density past niet binnen Figma Professional. Dan moet deze beslissing opnieuw: bijvoorbeeld de theme-as hier weer weghalen en per theme een eigen Density-collection maken, of naar Organization (20 modes).
- Een designer moet het theme in twee collections gelijk zetten. Dat staat in de README van `figma-sync`.

---

## Gerelateerd

- [DR-2026-05](DR-2026-05-figma-genereren-uit-code-via-plugin.md): Figma-library genereren uit code
- [DR-2026-06](DR-2026-06-figma-bindingen-meten-plus-cssom.md): bindingen worden pas gelegd als het token de meting reproduceert
- [DR-2026-13](DR-2026-13-fluid-schaal-met-min-max-per-maat.md): de fluid schaal zelf
- Issue #328
