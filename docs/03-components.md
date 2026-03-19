# Components

**Last Updated:** March 19, 2026

Complete component specifications and guidelines for the Design System Starter Kit.

---

## Table of Contents

1. [Component Guidelines](#component-guidelines)
2. [Layout Components](#layout-components)
3. [Content Components](#content-components)
4. [Display & Feedback Components](#display--feedback-components)
5. [Navigation Components](#navigation-components)
6. [Form Components](#form-components)
7. [Web Components Registration](#web-components-registration)

---

## Component Guidelines

### Importing Components

**React Components** - Use the barrel export for convenience:

```tsx
// ✅ Recommended: Import multiple components at once
import {
  Button,
  TextInput,
  Heading,
  FormField,
  Icon,
} from '@dsn/components-react';

// Also supported: Import individually
import { Button } from '@dsn/components-react/Button';
```

**All React components are fully typed** and include JSDoc documentation with usage examples.

### Component Token Architecture

**CRITICAL:** All components MUST use component tokens, not semantic tokens directly.

#### Token Hierarchy

```
Component CSS → Component Tokens → Semantic Tokens → Values
```

**Why Component Tokens:**

- Central definition of component styling
- Easy theming (change tokens, not CSS)
- Multi-brand support
- Consistent with design token standards
- Scalable architecture

### BEM Naming Convention

**Block Element Modifier**

```css
.dsn-button {
} /* Block */
.dsn-button__icon {
} /* Element */
.dsn-button--strong {
} /* Modifier */
.dsn-button--size-small {
} /* Modifier */
```

### Component Composition

Components are designed to compose together:

**Content Components**

```jsx
// React — Button with icon
<Button variant="strong" size="default">
  <Icon name="check" size="sm" />
  Save Changes
</Button>

// React — Button loading state (animated loader replaces iconStart)
<Button loading>Saving...</Button>

// React — External link (visible hint, no icon)
<Link href="https://example.com" external>Visit example.com</Link>
```

```html
<!-- Web Component — Button with icon -->
<dsn-button variant="strong" size="default">
  <dsn-icon name="check" size="sm"></dsn-icon>
  Save Changes
</dsn-button>

<!-- Web Component — External link -->
<dsn-link href="https://example.com" external>Visit example.com</dsn-link>
```

**Form Components**

```jsx
// React — Complete form field with text input
<FormField
  label="Email address"
  htmlFor="email"
  description="We'll never share your email"
  error={errors.email}
>
  <EmailInput
    id="email"
    invalid={!!errors.email}
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</FormField>

// React — Checkbox group with fieldset/legend
<FormFieldset
  legend="Notification preferences"
  description="Choose how you want to be notified"
>
  <CheckboxGroup>
    <CheckboxOption label="Email notifications" value="email" />
    <CheckboxOption label="SMS notifications" value="sms" />
    <CheckboxOption label="Push notifications" value="push" />
  </CheckboxGroup>
</FormFieldset>

// React — Radio group
<FormFieldset legend="Delivery method">
  <RadioGroup>
    <RadioOption label="Standard shipping" name="delivery" value="standard" />
    <RadioOption label="Express shipping" name="delivery" value="express" />
  </RadioGroup>
</FormFieldset>

// React — Date input group
<FormFieldset legend="Date of birth" description="For example: 15 3 1990">
  <DateInputGroup
    id="dob"
    value={value}
    onChange={setValue}
  />
</FormFieldset>
```

---

## Layout Components

Layout components bieden structuur voor paginalayouts. Body stelt document-level cascade stijlen in; Container heeft een visuele stijl; Grid en Stack zijn pure CSS-utilities.

### Body

Stelt document-level CSS stijlen in zodat alle child-elementen via de CSS cascade automatisch de juiste typografie, kleur en achtergrond erven.

**HTML/CSS:**

```html
<body class="dsn-body">
  <!-- paginainhoud -->
</body>
```

**React:**

```tsx
<Body>{/* paginainhoud */}</Body>
```

**Props:** Geen custom props — `Body` accepteert alle standaard `HTMLDivElement` attributen.

**Gebruik:** Zet `dsn-body` op het `<body>` element in je HTML template, of gebruik de React `<Body>` component als root-wrapper. In Storybook is `dsn-body` via de global decorator automatisch op alle stories van toepassing.

**Design tokens:** Geen component tokens — verwijst rechtstreeks naar globale tokens: `--dsn-color-neutral-bg-document`, `--dsn-color-neutral-color-document`, `--dsn-text-font-family-default`, `--dsn-text-font-size-md`, `--dsn-text-line-height-md`, `--dsn-text-font-weight-default`.

---

### Container

Visueel kader voor het groeperen van gerelateerde content. Voegt achtergrond, border, border-radius en padding toe. De `elevated` variant voegt een lichte `box-shadow.sm` schaduw toe voor kaarten en panelen.

**HTML/CSS:**

```html
<!-- Standaard container -->
<div class="dsn-container">
  <p class="dsn-paragraph">Inhoud van de container.</p>
</div>

<!-- Elevated container (kaart, paneel) -->
<div class="dsn-container dsn-container--elevated">
  <p class="dsn-paragraph">Elevated container.</p>
</div>

<!-- Als semantisch article -->
<article class="dsn-container">
  <p class="dsn-paragraph">Artikel-inhoud.</p>
</article>
```

**React:**

```tsx
// Standaard
<Container>
  <Paragraph>Inhoud van de container.</Paragraph>
</Container>

// Elevated
<Container elevated>
  <Paragraph>Elevated container.</Paragraph>
</Container>

// Met semantisch element
<Container as="article">
  <Paragraph>Artikel-inhoud.</Paragraph>
</Container>

// Als kader rondom Grid-items
<Grid contained>
  <GridItem colSpan={8}><Container>Hoofdinhoud</Container></GridItem>
  <GridItem colSpan={4}><Container>Sidebar</Container></GridItem>
</Grid>
```

**Props:** `as` (`div` | `section` | `article` | `aside`, default `div`), `elevated` (boolean, default `false`).

**Design tokens:** `--dsn-container-background-color`, `--dsn-container-border-color`, `--dsn-container-border-radius`, `--dsn-container-border-width`, `--dsn-container-box-shadow`, `--dsn-container-color`, `--dsn-container-padding-block`, `--dsn-container-padding-inline`, `--dsn-container-elevated-box-shadow`.

---

### Grid

12-koloms CSS Grid layout systeem met gutter, outer margin en optionele max-width.

**HTML/CSS:**

```html
<!-- Standaard grid -->
<div class="dsn-grid">
  <div class="dsn-col-8">Hoofdinhoud</div>
  <div class="dsn-col-4">Sidebar</div>
</div>

<!-- Contained grid met max-width -->
<div class="dsn-grid dsn-grid--contained">
  <div class="dsn-col-12">Full-width sectie</div>
</div>

<!-- Responsive kolommen -->
<div class="dsn-grid dsn-grid--contained">
  <div class="dsn-col-12 dsn-col-md-6 dsn-col-lg-4">Item A</div>
  <div class="dsn-col-12 dsn-col-md-6 dsn-col-lg-4">Item B</div>
  <div class="dsn-col-12 dsn-col-md-12 dsn-col-lg-4">Item C</div>
</div>

<!-- Full-bleed: breekt uit tot container-randen -->
<div class="dsn-grid dsn-grid--contained">
  <div class="dsn-col-8">Normale content</div>
  <div class="dsn-full-bleed">
    <div style="background: var(--dsn-color-neutral-bg-subtle);">
      Edge-to-edge
    </div>
  </div>
</div>
```

**React:**

```tsx
<Grid contained>
  <GridItem colSpan={8}>Hoofdinhoud</GridItem>
  <GridItem colSpan={4}>Sidebar</GridItem>
</Grid>

// Responsive
<Grid contained>
  <GridItem colSpan={12} colSpanMd={6} colSpanLg={4}>Item A</GridItem>
  <GridItem colSpan={12} colSpanMd={6} colSpanLg={4}>Item B</GridItem>
  <GridItem colSpan={12} colSpanMd={12} colSpanLg={4}>Item C</GridItem>
</Grid>

// Full-bleed
<Grid contained>
  <GridItem colSpan={8}>Normale content</GridItem>
  <GridItem fullBleed>
    <div style={{ background: 'var(--dsn-color-neutral-bg-subtle)' }}>Edge-to-edge</div>
  </GridItem>
</Grid>
```

**Props `Grid`:** `contained` (boolean) — voegt max-width toe en centreert horizontaal.

**Props `GridItem`:** `colSpan` (1–12), `colSpanSm`, `colSpanMd`, `colSpanLg` (responsieve varianten), `fullBleed` (breekt uit tot container-rand).

**Breakpoints:** sm (36em), md (44em), lg (64em), xl (74em — grens `contained` max-width).

**Design tokens:** `--dsn-grid-gutter` (16px; 8px in information-dense), `--dsn-grid-margin` (24px), `--dsn-grid-max-width` (74rem).

---

### Stack

Brengt consistente verticale ruimte aan tussen directe child-elementen via `flexbox + gap`.

**HTML/CSS:**

```html
<!-- Default (md = 8px) -->
<div class="dsn-stack">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Grote ruimte -->
<div class="dsn-stack dsn-stack--space-3xl">
  <section>...</section>
  <section>...</section>
</div>
```

**React:**

```tsx
<Stack space="3xl">
  <section>...</section>
  <section>...</section>
</Stack>
```

**Props:** `space` (`sm` | `md` | `lg` | `xl` | `2xl` | `3xl` | `4xl` | `5xl` | `6xl`, default `md`).

---

## Content Components

### Icon Component

**Status:** Complete (HTML/CSS, React, Web Component)

**Location:** `packages/components-{html|react|web}/src/icon/`

**Tokens:** Uses fluid sizing tokens (`calc(font-size × line-height)`)

**Icons:** 45 Tabler Icons (expandable via icon pipeline)

**Sizes:** 7 variants (sm, md, lg, xl, 2xl, 3xl, 4xl)

**Icon pipeline:**

1. Add SVG files to `packages/components-html/assets/icons/`
2. Run `node packages/components-react/scripts/generate-icons.js` (generates `icon-registry.generated.ts`)
3. Run `node packages/components-web/scripts/build-css.js` (generates `icon-paths.generated.ts`)
4. Storybook Icon stories auto-update via exported `iconMap`

### Button Component

**Status:** Complete (HTML, React, Web Component)

**Location:** `packages/components-{html|react|web}/src/button/`

**Component Tokens:** 90+ tokens in `tokens/components/button.json`

**Variants (9 total):**

- Base: `strong`, `default`, `subtle`
- Negative: `strong-negative`, `default-negative`, `subtle-negative`
- Positive: `strong-positive`, `default-positive`, `subtle-positive`

**Sizes (3 total):**

- `small`, `default`, `large`

**Loading state:**

- `loading` prop disables interaction (`pointer-events: none`)
- Replaces `iconStart` with an animated `<Icon name="loader">` that spins (0.8s linear infinite)
- Text remains visible during loading
- Uses `em` units so the spinner scales with button size

**Tests:** React (25 tests), Web Component (53 tests)

### Paragraph Component

**Status:** Complete (HTML/CSS, React, Web Component)

**Location:** `packages/components-{html|react|web}/src/paragraph/`

**Variants (3 total):**

- `default` - Standard body text
- `lead` - Introductory paragraphs
- `small-print` - Disclaimers, footnotes

**Tests:** React (9 tests), Web Component (17 tests)

### Link Component

**Status:** Complete (HTML/CSS, React, Web Component)

**Location:** `packages/components-{html|react|web}/src/link/`

**Component Tokens:** `tokens/components/link.json`

**Features:**

- `disabled` — Disables link (removes href, adds aria-disabled)
- `current` — Marks link as current page (aria-current="page")
- `iconStart` / `iconEnd` — Icon slots before/after text
- `size` — Optional: `small`, `default`, `large` (when omitted, inherits font from parent)
- `external` — Opens in new tab with `target="_blank"`, `rel="noopener noreferrer"`, and visible "(opens in new tab)" hint text (no icon, follows GOV.UK pattern)

**Sizes (3 total):**

- `small` — font-size: sm, icon-size: sm
- `default` — font-size: md, icon-size: md
- `large` — font-size: lg, icon-size: lg

**Inline behavior:** Without an explicit `size` prop/attribute, the Link uses `font: inherit` and flows naturally within paragraphs, inheriting the parent's font size. This makes it ideal for inline usage within Paragraph components.

**Icon size scale (shared with Button):**

| Size variant | Icon token         |
| ------------ | ------------------ |
| `small`      | `dsn.icon.size.sm` |
| `default`    | `dsn.icon.size.md` |
| `large`      | `dsn.icon.size.lg` |

**Tests:** React (32 tests), Web Component (38 tests)

### Heading Component

**Status:** Complete (HTML/CSS, React, Web Component)

**Location:** `packages/components-{html|react|web}/src/heading/`

**Appearances (6 total):**

- `heading-1` through `heading-6`

**Features:**

- Independent `level` (semantic h1–h6) and `appearance` (visual style) props
- Heading component tokens with full set per level (font-family, font-weight, color, font-size, line-height, margin-block-end)
- Token namespace `dsn.heading.level-{1-6}.*` — avoids collision with core `dsn.heading.*` tokens
- Font-size scale shifted one level down: heading-1 = 3xl, heading-2 = 2xl, ... heading-6 = sm

**Tests:** React (13 tests), Web Component (24 tests)

### UnorderedList Component

**Status:** Complete (HTML/CSS, React, Web Component)

**Location:** `packages/components-{html|react|web}/src/unordered-list/`

**Component Tokens:** `tokens/components/unordered-list.json`

**Features:**

- Accent-colored bullet markers via `--dsn-unordered-list-marker-color`
- Consistent typography and spacing via design tokens
- Nesting support (nested `<ul>` elements)

**Tokens:**

- `font-family`, `font-weight`, `color`, `font-size`, `line-height`
- `padding-inline-start`, `margin-block-end`, `gap`
- `marker-color` — accent color for bullet markers

**Tests:** React (7 tests), Web Component (7 tests)

### OrderedList Component

**Status:** Complete (HTML/CSS, React, Web Component)

**Location:** `packages/components-{html|react|web}/src/ordered-list/`

**Component Tokens:** `tokens/components/ordered-list.json`

**Features:**

- `start` prop — allows numbering to begin at a custom number
- Accent-colored number markers via `--dsn-ordered-list-marker-color`
- Consistent typography and spacing via design tokens
- Nesting support (nested `<ol>` elements)

**Tokens:**

- `font-family`, `font-weight`, `color`, `font-size`, `line-height`
- `padding-inline-start`, `margin-block-end`, `gap`
- `marker-color` — accent color for number markers

**Tests:** React (8 tests), Web Component (11 tests)

### LinkButton Component

**Status:** Complete (HTML/CSS, React)

**Location:** `packages/components-{html|react}/src/LinkButton/`

**Component Tokens:** Erft van `tokens/components/link.json` — geen eigen token namespace

**Features:**

- Semantisch `<button>`, visueel als een `Link` — voor JS-acties met lage attentiewaarde
- CSS: `dsn-link dsn-link-button` — erft alle Link-stijlen
- `disabled`: native `<button disabled>` + CSS selector `.dsn-link.dsn-link-button:disabled`
- `font: inherit` bewust weggelaten uit `dsn-link-button` — `dsn-link` regelt dit al; herhalen overschrijft `font-size` van size-klassen
- Zie ook: [De drie-weg keuze (Architecture)](./01-architecture.md)

**Drie-weg keuze:**

| Situatie                                | Component                                  |
| --------------------------------------- | ------------------------------------------ |
| Navigeert naar URL, hoge attentiewaarde | `ButtonLink` — `<a>` visueel als Button    |
| Navigeert naar URL, lage attentiewaarde | `Link` — `<a>` visueel als Link            |
| JS-actie, lage attentiewaarde           | `LinkButton` — `<button>` visueel als Link |
| JS-actie, hoge attentiewaarde           | `Button` — `<button>` visueel als Button   |

**HTML/CSS:**

```html
<button type="button" class="dsn-link dsn-link-button">Label</button>
<button type="button" class="dsn-link dsn-link-button" disabled>
  Uitgeschakeld
</button>
```

**React:**

```tsx
<LinkButton onClick={handleAction}>Actie uitvoeren</LinkButton>
<LinkButton disabled>Uitgeschakeld</LinkButton>
```

**Tests:** React (11 tests)

### ButtonLink Component

**Status:** Complete (HTML/CSS, React)

**Location:** `packages/components-{html|react}/src/ButtonLink/`

**Component Tokens:** Erft van `tokens/components/button.json` — geen eigen token namespace

**Features:**

- Semantisch `<a>`, visueel als een `Button` — voor navigatieacties met hoge attentiewaarde
- CSS: `dsn-button dsn-button--{variant} dsn-button--size-{size} dsn-button-link`
- `disabled`: `aria-disabled="true"` + `tabIndex={-1}` + `pointer-events: none` (`:disabled` pseudo-class werkt niet op `<a>`)
- `external`: auto `target="_blank"` + `rel="noopener noreferrer"` + zichtbare "(opent nieuw tabblad)" tekst
- `children` altijd gewrapt in `<span class="dsn-button__label">` — zelfde patroon als Button

**HTML/CSS:**

```html
<a href="/pagina" class="dsn-button dsn-button--strong dsn-button-link">
  <span class="dsn-button__label">Navigeer naar pagina</span>
</a>

<!-- Disabled -->
<a
  class="dsn-button dsn-button--strong dsn-button-link"
  aria-disabled="true"
  tabindex="-1"
>
  <span class="dsn-button__label">Niet beschikbaar</span>
</a>
```

**React:**

```tsx
<ButtonLink href="/pagina" variant="strong">Navigeer naar pagina</ButtonLink>
<ButtonLink href="https://example.com" external>Externe link</ButtonLink>
<ButtonLink href="/pagina" disabled>Niet beschikbaar</ButtonLink>
```

**Tests:** React (20 tests)

---

## Display & Feedback Components

**Status:** Complete (HTML/CSS, React) — 5 components total

### StatusBadge

**Status:** Complete (HTML/CSS, React)

**Location:** `packages/components-{html|react}/src/StatusBadge/`

**Tokens:** `tokens/components/status-badge.json`

**Variants (5 total):** `neutral`, `info`, `positive`, `negative`, `warning`

**Props:** `variant`, `iconStart`, `children`

**Features:**

- Compact inline label met signaalkleur
- Optioneel `iconStart` prop voor een icoon vóór het label
- Geen eigen afmeting — schaalt mee met de omgevende typografie

**Tests:** React (10 tests)

### Alert

**Status:** Complete (HTML/CSS, React)

**Location:** `packages/components-{html|react}/src/Alert/`

**Tokens:** `tokens/components/alert.json`

**Variants (4 total):** `info` (default), `positive`, `negative`, `warning`

**Props:** `variant`, `heading`, `headingLevel`, `iconStart`, `children`

**Features:**

- `role="alert"` live region — schermlezer kondigt wijzigingen automatisch aan
- CSS grid layout: icoon + heading naast elkaar (rij 1), body content eronder (rij 2)
- `grid-template-columns: var(--dsn-icon-size-xl) 1fr`
- Voorkeurspicoon per variant; overschrijfbaar via `iconStart` (`null` = geen icoon)
- `heading` verplicht; `headingLevel` default `2` (visueel als `heading-3`)
- Volledige border rondom (niet alleen inline-start)
- Body content via `children` — gebruik `<Paragraph>` voor tekst, `<UnorderedList>` voor lijsten

**HTML/CSS:**

```html
<div class="dsn-alert" role="alert">
  <span class="dsn-alert__icon" aria-hidden="true">
    <svg class="dsn-icon" aria-hidden="true"><!-- info-circle --></svg>
  </span>
  <h2 class="dsn-alert__heading dsn-heading dsn-heading--3">Heading</h2>
  <div class="dsn-alert__content">
    <p class="dsn-paragraph">Body content.</p>
  </div>
</div>

<!-- Varianten: dsn-alert--positive / dsn-alert--negative / dsn-alert--warning -->
<!-- Geen icoon: dsn-alert--no-icon (klasse op root, span weglaten) -->
```

**Tests:** React (15 tests)

### Note

**Status:** Complete (HTML/CSS, React)

**Location:** `packages/components-{html|react}/src/Note/`

**Tokens:** `tokens/components/note.json`

**Variants (5 total):** `neutral` (default), `info`, `positive`, `negative`, `warning`

**Props:** `as`, `variant`, `heading`, `headingLevel`, `iconStart`, `children`

**Features:**

- Passieve tegenhanger van Alert — geen `role="alert"`, geen live region
- Schermlezer leest Note alleen bij navigatie, niet spontaan
- `border-inline-start` als visuele markering (niet rondom zoals Alert)
- CSS grid layout identiek aan Alert
- `dsn-note--no-heading` modifier: icoon overspant beide rijen (`grid-row: 1 / span 2`)
- `as` prop: `div` (default), `aside`, `nav`, `section` — semantiek losgekoppeld van visuele stijl
- Automatische `aria-labelledby` via `useId()` voor landmark-elementen met heading
- `heading` optioneel (Alert: verplicht); `headingLevel` default `3`

**HTML/CSS:**

```html
<div class="dsn-note">
  <span class="dsn-note__icon" aria-hidden="true">
    <svg class="dsn-icon" aria-hidden="true"><!-- info-circle --></svg>
  </span>
  <h3 class="dsn-heading dsn-heading--3 dsn-note__heading">Heading</h3>
  <div class="dsn-note__content">
    <p class="dsn-paragraph">Body content.</p>
  </div>
</div>

<!-- Varianten: dsn-note--info / dsn-note--positive / dsn-note--negative / dsn-note--warning -->
<!-- Zonder heading: dsn-note--no-heading -->
<!-- Landmark: <aside>, <nav>, <section> i.p.v. <div> -->
```

**React:**

```tsx
// Standaard note met heading
<Note heading="Let op" variant="warning">
  <Paragraph>Dit heeft gevolgen voor uw aanvraag.</Paragraph>
</Note>

// Zonder heading — icoon overspant beide rijen
<Note variant="info">
  <Paragraph>Extra context zonder titel.</Paragraph>
</Note>

// Als inhoudsopgave (nav landmark)
<Note as="nav" variant="neutral" heading="Op deze pagina" headingLevel={2}>
  <UnorderedList>
    <li><Link href="#sectie-1">Sectie 1</Link></li>
  </UnorderedList>
</Note>
```

**Tests:** React (18 tests)

### Table

**Status:** Complete (HTML/CSS, React)

**Location:** `packages/components-{html|react}/src/Table/`

**Tokens:** `tokens/components/table.json`

**Props:** `caption`, `captionId`, `scrollable`, `children`

**Features:**

- `<caption>` verplicht — zichtbaar bijschrift en toegankelijke naam voor schermlezers
- `scrollable` prop: wikkelt de tabel in een `<div role="region" aria-labelledby="..." tabindex="0">` voor horizontale scrollbaarheid en toetsenbordtoegang
- `<tfoot>` via children — automatisch gestijld met vetgedrukte tekst en sterkere bovenborder
- Sorteerfunctionaliteit via `aria-sort` op `<th>` + CSS-gestuurde iconen (`dsn-table__sort-icon--{none,ascending,descending}`)
- Numerieke kolommen via `dsn-table__cell--numeric` — rechts uitgelijnde tekst + tabular nums
- Selecteerbare rijen via `aria-selected="true"` op `<tr>` — achtergrondkleur via `dsn.color.neutral.bg-active`
- Checkbox- en actiepatronen voor rijselectie en rijacties via standaard Button klassen

**HTML/CSS:**

```html
<!-- Basisstructuur -->
<table class="dsn-table">
  <caption id="caption-id" class="dsn-table__caption">
    Tabelonderschrift
  </caption>
  <thead>
    <tr>
      <th scope="col">Kolom A</th>
      <th scope="col" class="dsn-table__cell--numeric">Bedrag</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Rij 1</th>
      <td class="dsn-table__cell--numeric">€99</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <th scope="row">Totaal</th>
      <td class="dsn-table__cell--numeric">€99</td>
    </tr>
  </tfoot>
</table>

<!-- Scrollable wrapper -->
<div
  class="dsn-table-wrapper"
  role="region"
  aria-labelledby="caption-id"
  tabindex="0"
>
  <table class="dsn-table">
    ...
  </table>
</div>

<!-- Selecteerbare rij -->
<tr aria-selected="true">
  <td>
    <input type="checkbox" class="dsn-checkbox" id="select-1" checked />
    <label for="select-1" class="dsn-visually-hidden"
      >Selecteer Product A</label
    >
  </td>
  <th scope="row">Product A</th>
  <td>...</td>
</tr>

<!-- Sorteerbare kolomkop -->
<th scope="col" aria-sort="ascending">
  <span class="dsn-table__header-content">
    Naam
    <button
      class="dsn-button dsn-button--size-small dsn-button--subtle dsn-button--icon-only dsn-table__sort-button"
      type="button"
    >
      <svg class="dsn-icon dsn-table__sort-icon--none" aria-hidden="true">
        <!-- arrows-sort -->
      </svg>
      <svg class="dsn-icon dsn-table__sort-icon--ascending" aria-hidden="true">
        <!-- sort-ascending -->
      </svg>
      <svg class="dsn-icon dsn-table__sort-icon--descending" aria-hidden="true">
        <!-- sort-descending -->
      </svg>
      <span class="dsn-button__label">Sorteer op Naam</span>
    </button>
  </span>
</th>
```

**React:**

```tsx
// Basisgebruik
<Table caption="Productoverzicht">
  <thead>
    <tr>
      <th scope="col">Product</th>
      <th scope="col" className="dsn-table__cell--numeric">Prijs</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Laptop Pro</th>
      <td className="dsn-table__cell--numeric">€999</td>
    </tr>
  </tbody>
</Table>

// Scrollable
<Table caption="Brede tabel" scrollable>
  ...
</Table>
```

**Tests:** React (22 tests)

### Details

**Status:** Complete (HTML/CSS, React)

**Location:** `packages/components-{html|react}/src/Details/`

**Tokens:** `tokens/components/details.json`

**Props:** `summary`, `defaultOpen`, `onToggle`, `children`

**Features:**

- Gebaseerd op native `<details>`/`<summary>` HTML-elementen — geen JavaScript nodig voor toggle
- `summary` prop: tekst van het klikbare summarylabel
- `defaultOpen` prop: startwaarde voor open/dicht (default: `false`)
- `onToggle` callback: ontvangt `(open: boolean)` bij elke toggle
- Chevron-icoon roteert 180° via CSS bij open staat (`details[open] .dsn-details__icon`)
- Summarylabel volgt Link-stijlen (`action-2` kleurenserie) — hover underline, focus met geel/zwart ring
- Contentborder (`border-inline-start`) gecentreerd op het icoon via `calc(icon-size / 2 - border-width / 2)`
- `width: fit-content` op summary — klikgebied beperkt tot tekst + icoon
- Impliciete ARIA-rol `group` — geen extra `role` attribuut nodig

**HTML/CSS:**

```html
<!-- Standaard (dicht) -->
<details class="dsn-details">
  <summary class="dsn-details__summary">
    <svg class="dsn-icon dsn-details__icon" aria-hidden="true">
      <!-- chevron-down -->
    </svg>
    <span class="dsn-details__summary-label">Label</span>
  </summary>
  <div class="dsn-details__content">
    <p class="dsn-paragraph">Aanvullende informatie.</p>
  </div>
</details>

<!-- Standaard open -->
<details class="dsn-details" open>
  <summary class="dsn-details__summary">
    <svg class="dsn-icon dsn-details__icon" aria-hidden="true">
      <!-- chevron-down -->
    </svg>
    <span class="dsn-details__summary-label">Label</span>
  </summary>
  <div class="dsn-details__content">
    <p class="dsn-paragraph">Inhoud is standaard zichtbaar.</p>
  </div>
</details>
```

**React:**

```tsx
// Standaard
<Details summary="Welke documenten heb ik nodig?">
  <UnorderedList>
    <li>Geldig identiteitsbewijs</li>
    <li>Bankafschrift van de afgelopen 3 maanden</li>
  </UnorderedList>
</Details>

// Standaard open met toggle callback
<Details summary="Uitgebreide toelichting" defaultOpen onToggle={(open) => console.log(open)}>
  <Paragraph>Zichtbare inhoud bij laden.</Paragraph>
</Details>
```

**Tests:** React (19 tests)

---

## Navigation Components

**Status:** Complete (HTML/CSS, React) — 1 component total

### BreadcrumbNavigation

**Status:** Complete (HTML/CSS, React)

**Location:** `packages/components-{html|react}/src/BreadcrumbNavigation/`

**Tokens:** `tokens/components/breadcrumb-navigation.json`

**Variants (2 total):** `default`, `compact`

**Props — BreadcrumbNavigation:** `aria-label`, `variant`, `children`

**Props — BreadcrumbNavigationItem:** `href`, `current`, `children`

**Features:**

- `<nav aria-label>` landmark met `<ol>` voor semantisch geordende hiërarchie
- `aria-current="page"` automatisch op het huidige pagina-item
- `default` variant: items wrappen naar de volgende rij bij weinig ruimte (`flex-wrap`)
- `compact` variant: container query collapst naar enkel het ouder-item met terug-pijl (`← Ouder`) bij smalle container (`max-width: 32rem`)
- Terug-pijl icoon zit binnen de `<a>` — erft linkkleur en hover-stijl automatisch
- Scheidingstekens en terug-icoon zijn decoratief (`aria-hidden="true"`)
- RTL: richtingsgevoelige iconen worden omgedraaid via `transform: scaleX(-1)`
- Font-size, line-height en icoongrootte volgen `sm` tokens — consistent met Link size small

**CSS-klassen:**

| Klasse                                     | Element | Beschrijving                                                                      |
| ------------------------------------------ | ------- | --------------------------------------------------------------------------------- |
| `dsn-breadcrumb-navigation`                | `<nav>` | Basiscomponent                                                                    |
| `dsn-breadcrumb-navigation--compact`       | `<nav>` | Activeert container query responsive collapse                                     |
| `dsn-breadcrumb-navigation__list`          | `<ol>`  | `display: flex; flex-wrap: wrap; align-items: center`                             |
| `dsn-breadcrumb-navigation__item`          | `<li>`  | `display: flex; align-items: center`                                              |
| `dsn-breadcrumb-navigation__item--current` | `<li>`  | Huidige pagina; muted color, geen hover                                           |
| `dsn-breadcrumb-navigation__link`          | `<a>`   | Link met kleur, underline en hover/active/focus stijlen                           |
| `dsn-breadcrumb-navigation__separator`     | `<svg>` | Decoratief scheidingsteken (chevron-right); verborgen op laatste item             |
| `dsn-breadcrumb-navigation__back-icon`     | `<svg>` | Terug-pijl icoon binnen `<a>`; standaard `display: none`; getoond in compact+smal |

**Usage:**

```html
<!-- HTML/CSS — standaard -->
<nav aria-label="Broodkruimelpad" class="dsn-breadcrumb-navigation">
  <ol class="dsn-breadcrumb-navigation__list">
    <li class="dsn-breadcrumb-navigation__item">
      <a href="/home" class="dsn-breadcrumb-navigation__link">Home</a>
      <svg
        class="dsn-icon dsn-breadcrumb-navigation__separator"
        aria-hidden="true"
      >
        <!-- chevron-right -->
      </svg>
    </li>
    <li
      class="dsn-breadcrumb-navigation__item dsn-breadcrumb-navigation__item--current"
    >
      <a
        href="/product"
        class="dsn-breadcrumb-navigation__link"
        aria-current="page"
        >Product</a
      >
      <svg
        class="dsn-icon dsn-breadcrumb-navigation__separator"
        aria-hidden="true"
      >
        <!-- chevron-right -->
      </svg>
    </li>
  </ol>
</nav>
```

```tsx
// React — standaard
<BreadcrumbNavigation aria-label="Broodkruimelpad">
  <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
  <BreadcrumbNavigationItem href="/product" current>Product</BreadcrumbNavigationItem>
</BreadcrumbNavigation>

// React — compact variant
<BreadcrumbNavigation aria-label="Broodkruimelpad" variant="compact">
  <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
  <BreadcrumbNavigationItem href="/categorie">Categorie</BreadcrumbNavigationItem>
  <BreadcrumbNavigationItem href="/product" current>Product</BreadcrumbNavigationItem>
</BreadcrumbNavigation>
```

**Placement:** Vóór `<main>`, na de primaire navigatie — zodat een skip-link alle navigatie in één keer kan overslaan.

**Tests:** React (25 tests)

---

## Form Components

**Status:** Complete (HTML/CSS, React) — 25 components total

**Location:** `packages/components-{html|react}/src/`

### Input Components

#### TextInput

**Tokens:** `tokens/components/text-input.json`, references `form-control.json`

**Sizes:** `default`, `large`

**States:** default, hover, focus, active, disabled, invalid, read-only

**Props:** `disabled`, `invalid`, `readOnly`, `size`, `width`

**Width variants:** `xs`, `sm`, `md`, `lg`, `xl`, `full`

**Tests:** React (9 tests)

#### TextArea

**Tokens:** `tokens/components/text-area.json`, references `form-control.json`

**Sizes:** `default`, `large`

**Props:** `disabled`, `invalid`, `readOnly`, `size`, `rows`, `width`

**Tests:** React (9 tests)

#### NumberInput

**Tokens:** `tokens/components/number-input.json`, extends TextInput tokens

**Props:** `min`, `max`, `step`, `disabled`, `invalid`, `readOnly`, `size`, `width`

**Tests:** React (9 tests)

#### PasswordInput

**Tokens:** `tokens/components/password-input.json`, extends TextInput tokens

**Props:** All TextInput props, type="password"

**Tests:** React (9 tests)

#### EmailInput

**Tokens:** `tokens/components/email-input.json`, extends TextInput tokens

**Props:** All TextInput props, type="email"

**Tests:** React (9 tests)

#### TelephoneInput

**Tokens:** `tokens/components/telephone-input.json`, extends TextInput tokens

**Props:** All TextInput props, type="tel"

**Tests:** React (9 tests)

#### SearchInput

**Tokens:** `tokens/components/search-input.json`, extends TextInput tokens

**Features:** Search icon on the left, calculated padding to accommodate icon

**Props:** All TextInput props, type="search"

**Tests:** React (9 tests)

#### TimeInput

**Tokens:** `tokens/components/time-input.json`, extends TextInput tokens

**Features:** Wrapper with interactive clock button (`Button subtle small iconOnly`) at inline-end. `showPicker()` triggered via internal ref. No `width` prop — fixed `sm` width.

**Props:** `invalid`, `disabled`, `readOnly`, and all native `<input type="time">` attributes

**Tests:** React (9 tests)

#### DateInput

**Tokens:** `tokens/components/date-input.json`, extends TextInput tokens

**Features:** Wrapper with interactive calendar button (`Button subtle small iconOnly`, `calendar-event` icon) at inline-end. Same pattern as TimeInput. `showPicker()` via internal ref + `handleRef` merge. Fixed width — no `width` prop.

**Props:** `invalid`, `disabled`, `readOnly`, and all native `<input type="date">` attributes

**Tests:** React (9 tests)

#### Select

**Tokens:** `tokens/components/select.json`, extends TextInput tokens

**Features:** Wrapper with `chevron-down` icon at inline-end. Native browser arrow hidden via `appearance: none`. Icon disappears when `disabled`. Width variants on wrapper (same pattern as SearchInput).

**Props:** `invalid`, `width`, and all native `<select>` attributes

**Tests:** React (9 tests)

#### DateInputGroup

**Features:** Three separate `NumberInput` fields (dag xs, maand xs, jaar sm) with inline labels. `id` prop auto-generates `{id}-dag`, `{id}-maand`, `{id}-jaar`. `onChange` returns the full `{ day, month, year }` object. Wrap in `FormFieldset` for a complete accessible form field.

**Props:** `value` (`{ day, month, year }`), `onChange`, `invalid`, `disabled`, `id`

**Tests:** React (9 tests)

### Selection Components

#### Checkbox

**Tokens:** `tokens/components/checkbox.json`

**Fluid sizing:** `calc(var(--dsn-text-font-size-md) * var(--dsn-text-line-height-md))`

**Icon size:** 67% of checkbox size

**Icons:** `check.svg` (checked), `minus.svg` (indeterminate)

**States:** default, hover, focus, checked, indeterminate, disabled, checked-disabled

**Props:** `checked`, `indeterminate`, `disabled`

**Tests:** React (7 tests)

#### Radio

**Tokens:** `tokens/components/radio.json`

**Fluid sizing:** `calc(var(--dsn-text-font-size-md) * var(--dsn-text-line-height-md))`

**Icon size:** 33% of radio size (inner circle)

**Checked disabled color:** White for contrast against disabled background

**States:** default, hover, focus, checked, disabled, checked-disabled

**Props:** `checked`, `disabled`

**Tests:** React (7 tests)

#### CheckboxOption

**Tokens:** `tokens/components/checkbox-option.json`

**Features:** Combines Checkbox + Label with accessible touch targets

**Touch targets:** Uses `padding-block` for WCAG 2.5.5 compliance

**Props:** `label`, `checked`, `indeterminate`, `disabled`

**Tests:** React (13 tests)

#### RadioOption

**Tokens:** `tokens/components/radio-option.json`

**Features:** Combines Radio + Label with accessible touch targets

**Touch targets:** Uses `padding-block` for WCAG 2.5.5 compliance

**Props:** `label`, `checked`, `disabled`

**Tests:** React (13 tests)

### Group Components

#### CheckboxGroup

**Tokens:** `tokens/components/checkbox-group.json`

**Features:** Simple div container for `CheckboxOption` items. Fieldset/legend structure lives in `FormFieldset` — always wrap `CheckboxGroup` in a `FormFieldset` for accessible grouping.

**Props:** `children`, standard div attributes

**Tests:** React (8 tests)

#### RadioGroup

**Tokens:** `tokens/components/radio-group.json`

**Features:** Simple div container for `RadioOption` items. Fieldset/legend structure lives in `FormFieldset` — always wrap `RadioGroup` in a `FormFieldset` for accessible grouping.

**Props:** `children`, standard div attributes

**Tests:** React (9 tests)

### Form Field Container & Helper Components

#### FormField

**Tokens:** `tokens/components/form-field.json`

**Features:** div/label container for single-value inputs (TextInput, EmailInput, Select, etc.). Combines Label, Description, Control, Error, and Status with automatic aria-describedby linking.

**Invalid state:** Red left border via `form-field.invalid` tokens

**Props:** `label`, `htmlFor`, `labelSuffix`, `description`, `error`, `status`, `children`

**Tests:** React (11 tests)

#### FormFieldset

**Tokens:** `tokens/components/form-fieldset.json`

**Features:** fieldset/legend container for group controls (CheckboxGroup, RadioGroup, DateInputGroup). Combines FormFieldLegend, FormFieldDescription, FormFieldErrorMessage, and the group control.

**Invalid state:** Red left border when `error` prop is set (same as FormField)

**Props:** `legend`, `hideLegend`, `description`, `error`, `status`, `children`

**Tests:** React (9 tests)

#### FormFieldLabel

**Tokens:** `tokens/components/form-field-label.json`

**Features:** Required indicator, suffix support

**Props:** `htmlFor`, `required`, `suffix`, `children`

**Tests:** React (7 tests)

#### FormFieldDescription

**Tokens:** `tokens/components/form-field-description.json`

**Features:** Help text for form fields

**Props:** `id`, `children`

**Tests:** React (7 tests)

#### FormFieldErrorMessage

**Tokens:** `tokens/components/form-field-error-message.json`

**Features:** Validation error messages

**Props:** `id`, `children`

**Tests:** React (7 tests)

#### FormFieldStatus

**Tokens:** `tokens/components/form-field-status.json`

**Features:** Status messages (e.g., character count)

**Props:** `id`, `children`

**Tests:** React (7 tests)

### Shared Form Control Tokens

**form-control.json**

Base tokens for all input-like controls:

- Properties: font-family, font-size, font-weight, color, background-color, border-color, border-radius, border-width, padding, min-block-size, max-inline-size
- States: default, hover, focus, active, disabled, invalid, read-only
- Size variants: default, large
- Width variants: xs, sm, md, lg, xl, full

---

## Web Components Registration

Web Components are **NOT** auto-registered on import to avoid side effects. You must explicitly register them:

```ts
// Option 1: Register all components at once
import { defineAllComponents } from '@dsn/components-web';
defineAllComponents();

// Option 2: Register specific components
import { defineButton, defineIcon } from '@dsn/components-web';
defineButton();
defineIcon();

// Option 3: Register with custom tag names
import { defineButton } from '@dsn/components-web';
defineButton('my-custom-button');
```

**Default tag names:**

- `dsn-button`
- `dsn-heading`
- `dsn-icon`
- `dsn-link`
- `dsn-ordered-list`
- `dsn-paragraph`
- `dsn-unordered-list`

**Why explicit registration?**

- Avoids side effects on import (better tree-shaking)
- Allows custom tag names per project
- Prevents duplicate registration errors
- Follows Web Component best practices

---

## Component Statistics

**Total Components:** 44

**Implementations:**

- **HTML/CSS:** 44 components
- **React:** 44 components (1033 tests total, 50 test suites)
- **Web Component:** 7 components (Button, Heading, Icon, Link, OrderedList, Paragraph, UnorderedList)

**Test Coverage:** 1033 tests across 50 test suites

---

## Related Documentation

- **[Architecture](./01-architecture.md)** - Token architecture
- **[Design Tokens Reference](./02-design-tokens-reference.md)** - All token values
- **[Development Workflow](./04-development-workflow.md)** - Adding components
- **[Storybook Configuration](./05-storybook-configuration.md)** - Component documentation
