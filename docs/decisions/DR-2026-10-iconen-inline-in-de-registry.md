# DR-2026-10: Iconen inline in de registry, geen `.svg`-imports

**ID:** DR-2026-10
**Datum:** Augustus 2026
**Status:** Accepted
**Auteurs:** Jeffrey Lauwers

---

## Context

`Icon` rendert 51 Tabler-iconen. De oorspronkelijke opzet importeerde elk icoon als React-component uit zijn `.svg`-bestand:

```ts
import EditIcon from '../../../components-html/assets/icons/edit.svg?react';
```

Dat werkt binnen de monorepo, omdat Vite daar met `vite-plugin-svgr` draait. Buiten de monorepo werkt het niet, en wel om twee onafhankelijke redenen:

- Het pad wijst naar `packages/components-html/assets/`, buiten het gepubliceerde package. Een consument die `@dsn-starter-kit/components-react` van npm installeert, krijgt `Module not found`.
- De `?react`-suffix is een svgr-conventie. Elke consument zou svgr moeten installeren én configureren, ongeacht welke bundler hij gebruikt.

Net als bij DR-2026-07 was hier binnen de repo niets van te zien: Storybook en vitest resolven de bron via Vite-aliassen en raken `dist/` nooit aan. CI was groen terwijl het package voor een buitenstaander stuk was.

---

## Opties overwogen

### Optie 1: De assets meepubliceren en de imports laten staan

`components-html/assets/icons/` meeleveren in het gepubliceerde package en de import-paden verleggen.

**Voordeel:** Kleine wijziging, de generator kan blijven zoals hij is.
**Nadeel:** Lost maar de helft op. Het pad klopt dan, maar `?react` blijft een svgr-suffix. Elke consument moet nog steeds een loader configureren, en bij een andere bundler dan Vite is dat een ander verhaal.

### Optie 2: SVG's op runtime ophalen

De iconen als losse bestanden uitleveren en op runtime laden via `fetch` of een `<img>`.

**Voordeel:** De bundle blijft klein, en alleen wat je gebruikt gaat over de lijn.
**Nadeel:** Een netwerkverzoek per icoon, een flash of missing icon bij server-side rendering, en `currentColor` werkt niet meer in een `<img>`. Iconen zouden hun kleur niet meer van de knop erven, wat het hele `dsn-icon`-patroon breekt.

### Optie 3: SVG-inhoud inline in een gegenereerde registry (gekozen)

De generator schrijft de paden van elk icoon als `React.createElement`-aanroepen in `icon-registry.generated.ts`. Er wordt geen `.svg`-bestand geïmporteerd.

**Voordeel:**

- `dist/` is zelfstandig: de enige import in de registry is `react`.
- Werkt in Vite, webpack, Next.js, Rspack en kaal Node, zonder loader-configuratie.
- Server-side rendering werkt, en `currentColor` blijft doen wat het moet doen.

**Nadeel:**

- De volledige set komt in de bundle van de consument, ook als hij twee iconen gebruikt. Zie de impact-tabel voor wat dat kost.
- De registry is gegenereerde code die niet met de hand bewerkt mag worden.

---

## Beslissing

**De SVG-inhoud staat inline in `icon-registry.generated.ts`, als `React.createElement`-aanroepen. Er wordt nergens een `.svg`-bestand geïmporteerd.**

De reden is dat een design system dat een specifieke bundler met een specifieke plugin vereist, geen herbruikbaar package is. Bundler-onafhankelijkheid weegt hier zwaarder dan bundle-grootte, temeer omdat de hele set gzipped ruim 3 KB is.

De trade-off die we accepteren: geen tree-shaking per icoon. `Icon` zoekt de naam op runtime op in `iconMap`, dus de bundler kan niet zien welke iconen ongebruikt zijn. Dat is inherent aan een component met een `name`-prop en geen bug.

---

## Impact

| Dimensie                              | Meting                                 |
| ------------------------------------- | -------------------------------------- |
| Iconen in de registry                 | 51                                     |
| Iconregistry in `dist`                | 23.998 bytes, 3.128 gzipped            |
| Imports in de gegenereerde registry   | 1 (`react`)                            |
| Loader-configuratie voor de consument | geen                                   |
| Verwijderde build-afhankelijkheden    | 2 (`vite-plugin-svgr`, `src/svg.d.ts`) |

---

## Gevolgen

**Wat makkelijker wordt:**

- Een consument installeert het package en het werkt, ongeacht zijn bundler.
- Server-side rendering werkt zonder configuratie.

**Wat moeilijker wordt:**

- Wie maar een handvol iconen nodig heeft, betaalt toch voor de hele set. Het alternatief voor die situatie: pak de losse SVG's uit `@dsn-starter-kit/components-html/assets/icons/` en zet ze zelf inline.

**Nieuwe verplichting voor contributors:**
Bewerk `icon-registry.generated.ts` nooit met de hand. Zet een nieuw icoon in `packages/components-html/assets/icons/` en draai de generator:

```bash
pnpm --filter @dsn-starter-kit/components-react generate:icons
```

De generator faalt hard op SVG-markup die hij niet kan verwerken (geneste elementen, `<title>`, tekst), zodat een afwijkend icoon opvalt tijdens de build in plaats van stil verkeerd te renderen.

---

## Supersedes / superseded by

Herzie dit besluit wanneer `Icon` een import-per-icoon-API krijgt naast de `name`-prop. Pas dan is tree-shaking per icoon mogelijk, en verandert de afweging tussen bundle-grootte en gebruiksgemak.

---

## Gerelateerde records

- DR-2026-07 (CSS los van de JavaScript-bundel) — hetzelfde grondpatroon: de monorepo verbergt dat het gepubliceerde artifact stuk is
- Zie ook: `packages/storybook/src/Icon.docs.md` voor de consumentenkant
