# Components

**Last Updated:** April 4, 2026

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

Layout components bieden structuur voor paginalayouts. ActionGroup groepeert gerelateerde acties; Body stelt document-level cascade stijlen in; Container heeft een visuele stijl; Grid en Stack zijn pure CSS-utilities.

### ActionGroup

Groepeert gerelateerde acties en verzorgt de lay-out van Buttons en Links. Horizontale richting (default) wraps automatisch bij smalle viewports; verticale richting via modifier.

**HTML/CSS:**

```html
<!-- Horizontaal (default) -->
<div class="dsn-action-group">
  <button class="dsn-button dsn-button--strong dsn-button--size-default">
    <span class="dsn-button__label">Opslaan</span>
  </button>
  <button class="dsn-button dsn-button--subtle dsn-button--size-default">
    <span class="dsn-button__label">Annuleren</span>
  </button>
</div>

<!-- Verticaal -->
<div class="dsn-action-group dsn-action-group--vertical">
  <button class="dsn-button dsn-button--strong dsn-button--size-default">
    <span class="dsn-button__label">Primaire actie</span>
  </button>
  <button class="dsn-button dsn-button--subtle dsn-button--size-default">
    <span class="dsn-button__label">Secundaire actie</span>
  </button>
</div>
```

**React:**

```tsx
// Horizontaal (default)
<ActionGroup>
  <Button variant="strong">Opslaan</Button>
  <Button variant="subtle">Annuleren</Button>
</ActionGroup>

// Verticaal
<ActionGroup direction="vertical">
  <Button variant="strong">Primaire actie</Button>
  <Button variant="subtle">Secundaire actie</Button>
</ActionGroup>
```

**Props:** `direction` (`'horizontal'` | `'vertical'`, default `'horizontal'`), `children`.

**Location:** `packages/components-{html|react}/src/ActionGroup/`

**Design tokens:** `--dsn-action-group-column-gap` (12px — horizontale ruimte tussen acties), `--dsn-action-group-row-gap` (4px — ruimte tussen gewrapte rijen).

---

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
- `text-wrap: balance` op de heading-basis-klasse — verdeelt regeleinden evenwichtig voor meerdere korte regels

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

### Image Component

**Status:** Complete (HTML/CSS, React)

**Location:** `packages/components-{html|react}/src/image/` / `packages/components-react/src/Image/`

**Component Tokens:** `tokens/components/image.json`

**Features:**

- Semantische `<figure>` + `<img>` structuur — altijd correct HTML
- Verplichte `width` en `height` props — browser reserveert ruimte vooraf, voorkomt CLS
- `loading="lazy"` + `decoding="async"` standaard — laadt afbeeldingen buiten de viewport pas wanneer nodig
- `priority` prop — `loading="eager"` + `fetchpriority="high"` voor de primaire LCP-afbeelding (max. één per pagina)
- `ratio` prop — CSS `aspect-ratio` met drie opties: `16:9`, `4:3`, `1:1`
- `objectFit` prop — `cover` (default, bijsnijden) of `contain` (volledig zichtbaar)
- `caption` prop — optioneel `<figcaption>` bijschrift
- `srcSet` / `sizes` pass-through — voor responsive afbeeldingen
- `alt=""` activeert automatisch `aria-hidden="true"` op de `<figure>` voor decoratieve afbeeldingen

**CSS klassen:**

| Klasse                          | Beschrijving                         |
| ------------------------------- | ------------------------------------ |
| `dsn-image`                     | Root `<figure>` container            |
| `dsn-image__img`                | Native `<img>` element               |
| `dsn-image__caption`            | `<figcaption>` bijschrift            |
| `dsn-image--ratio-16-9`         | Beeldverhouding 16:9                 |
| `dsn-image--ratio-4-3`          | Beeldverhouding 4:3                  |
| `dsn-image--ratio-1-1`          | Beeldverhouding 1:1 (vierkant)       |
| `dsn-image--object-fit-contain` | Volledig zichtbaar zonder bijsnijden |

**HTML/CSS:**

```html
<!-- Basis -->
<figure class="dsn-image">
  <img
    class="dsn-image__img"
    src="foto.jpg"
    alt="Beschrijving"
    width="800"
    height="600"
    loading="lazy"
    decoding="async"
  />
</figure>

<!-- Met vaste beeldverhouding -->
<figure class="dsn-image dsn-image--ratio-16-9">
  <img
    class="dsn-image__img"
    src="hero.jpg"
    alt="Hero"
    width="1600"
    height="900"
    loading="lazy"
    decoding="async"
  />
</figure>

<!-- LCP-afbeelding -->
<figure class="dsn-image dsn-image--ratio-16-9">
  <img
    class="dsn-image__img"
    src="hero.jpg"
    alt="Pagina hero"
    width="1600"
    height="900"
    loading="eager"
    fetchpriority="high"
    decoding="async"
  />
</figure>

<!-- Met bijschrift -->
<figure class="dsn-image">
  <img
    class="dsn-image__img"
    src="foto.jpg"
    alt="Beschrijving"
    width="800"
    height="600"
    loading="lazy"
    decoding="async"
  />
  <figcaption class="dsn-image__caption">
    Bijschrift bij de afbeelding
  </figcaption>
</figure>

<!-- Decoratief -->
<figure class="dsn-image" aria-hidden="true">
  <img
    class="dsn-image__img"
    src="decoratief.jpg"
    alt=""
    width="800"
    height="600"
    loading="lazy"
    decoding="async"
  />
</figure>
```

**React:**

```tsx
<Image src="foto.jpg" alt="Beschrijving" width={800} height={600} />
<Image src="hero.jpg" alt="Hero" width={1600} height={900} ratio="16:9" />
<Image src="hero.jpg" alt="Pagina hero" width={1600} height={900} ratio="16:9" priority />
<Image src="foto.jpg" alt="Beschrijving" width={800} height={600} caption="Bijschrift" />
<Image src="decoratief.jpg" alt="" width={800} height={600} />
```

**Tests:** React (27 tests)

---

## Display & Feedback Components

**Status:** Complete (HTML/CSS, React) — 11 components total

### Backdrop

**Status:** Complete (HTML/CSS, React)

**Location:** `packages/components-{html|react}/src/backdrop/` / `packages/components-react/src/Backdrop/`

**Tokens:** `tokens/components/backdrop.json` + `tokens/themes/start/colors-light.json` / `colors-dark.json`

**Features:**

- `position: fixed; inset: 0` — bedekt het volledige viewport
- Semi-transparante overlay via `color-mix(in srgb, var(--dsn-backdrop-background-color) var(--dsn-backdrop-opacity), transparent)` — kleur en transparantie via losse tokens
- `backdrop-filter: blur()` — valt gracefully weg bij browsers zonder support (~6%); fallback via `dsn-backdrop--no-blur` modifier of `blur={false}` prop
- Altijd `aria-hidden="true"` — puur decoratief, geen ARIA-rol
- `background-color` per thema apart gedefinieerd zodat overlay altijd donker is, ongeacht light/dark mode (patroon identiek aan box-shadow kleurtokens)
- `blur` prop (boolean, default `true`) — togglet `dsn-backdrop--no-blur` modifier

**CSS klassen:**

| Klasse                  | Element | Beschrijving                                                           |
| ----------------------- | ------- | ---------------------------------------------------------------------- |
| `dsn-backdrop`          | `<div>` | Vaste overlay over het volledige viewport; semi-transparante blur-laag |
| `dsn-backdrop--no-blur` | `<div>` | Modifier — schakelt backdrop-filter uit (fallback)                     |

**Props (React):**

| Prop   | Type                        | Default | Beschrijving                                                     |
| ------ | --------------------------- | ------- | ---------------------------------------------------------------- |
| `blur` | `boolean`                   | `true`  | Schakelt blur-filter in/uit via `dsn-backdrop--no-blur` modifier |
| `ref`  | `React.Ref<HTMLDivElement>` | —       | Doorgegeven via `React.forwardRef`                               |

**Gebruik:**

```html
<!-- HTML/CSS — basis -->
<div class="dsn-backdrop" aria-hidden="true"></div>

<!-- HTML/CSS — zonder blur (fallback) -->
<div class="dsn-backdrop dsn-backdrop--no-blur" aria-hidden="true"></div>
```

```tsx
// React — conditioneel renderen vanuit parent
{
  isOpen && <Backdrop />;
}
{
  isOpen && <Backdrop blur={false} />;
}
```

### Card

**Status:** Complete (HTML/CSS, React)

**Location:** `packages/components-{html|react}/src/card/` / `packages/components-react/src/Card/`

**Tokens:** `tokens/components/card.json`

**Sub-components:** `Card`, `CardHeader`, `CardBody`, `CardHeading`, `CardFooter`, `CardGroup`

**Features:**

- Root is `<article>` — semantisch zelfstandig inhoudsblok, navigeerbaar via schermlezer-sneltoets
- Stretched-link techniek: `::before` pseudo-element van `dsn-card-heading__link` dekt de volledige card (`position: absolute; inset: 0; z-index: 1`)
- `CardHeader` toont automatisch een afbeeldingsplaceholder (`dsn-card__image-placeholder`) wanneer geen children aanwezig zijn
- `CardBody` groeit via `flex: 1` — footer uitlijnt altijd onderaan
- `CardHeading` ontvangt `href` via React context van parent `Card` en wraps children in een `<a class="dsn-card-heading__link">`
- Footer-kinderen staan boven de stretched link via `z-index: 2` in CSS
- `CardGroup` rendert als `<ul role="list">` (standaard) of `<div>` via `as` prop
- Standaard geen box-shadow (`none`); hover verhoogt achtergrond naar `bg-elevated` + box-shadow `md` — overgang via CSS `transition` (background-color + box-shadow)
- Focus: focus-ring rondom de gehele card via CSS `:has(.dsn-card-heading__link:focus-visible)` — zelfde tokens als Button en Link
- Alle spacing via component-tokens (`dsn.card.body.padding-*`, `dsn.card.footer.padding-*`)
- Standaard `background: bg-document`; hover `background: bg-elevated` voor elevatie-effect

**CSS klassen:**

| Klasse                        | Element          | Beschrijving                                                                         |
| ----------------------------- | ---------------- | ------------------------------------------------------------------------------------ |
| `dsn-card`                    | `<article>`      | Root container; `position: relative`, `display: flex; flex-direction: column`        |
| `dsn-card__header`            | `<div>`          | Header-sectie; geen padding, afbeelding edge-to-edge                                 |
| `dsn-card__body`              | `<div>`          | Body-sectie; `flex: 1` zodat body groeit en footer onderaan blijft                   |
| `dsn-card__footer`            | `<div>`          | Footer-sectie; directe kinderen krijgen `position: relative; z-index: 2`             |
| `dsn-card__image-placeholder` | `<div>`          | Decoratieve placeholder met `aspect-ratio: 16 / 9`; altijd `aria-hidden="true"`      |
| `dsn-card-heading`            | `<h2>`–`<h4>`    | Heading sub-component; typography via eigen tokens                                   |
| `dsn-card-heading__link`      | `<a>`            | Stretched link; `::before` met `position: absolute; inset: 0; z-index: 1`            |
| `dsn-card-group`              | `<ul>` / `<div>` | Flexbox wrapper; gelijke hoogte via `flex: 1 1 var(--dsn-card-group-item-min-width)` |

**HTML/CSS:**

```html
<!-- Basis — card met afbeelding en stretched link -->
<article class="dsn-card">
  <div class="dsn-card__header">
    <figure class="dsn-image dsn-image--ratio-16-9" aria-hidden="true">
      <img
        class="dsn-image__img"
        src="/foto.jpg"
        alt=""
        width="800"
        height="450"
        loading="lazy"
        decoding="async"
      />
    </figure>
  </div>
  <div class="dsn-card__body">
    <h2 class="dsn-card-heading">
      <a href="/artikel/slug" class="dsn-card-heading__link">Artikeltitel</a>
    </h2>
    <p class="dsn-paragraph">Korte beschrijving.</p>
  </div>
  <div class="dsn-card__footer">
    <a href="/artikel/slug" class="dsn-link" aria-hidden="true" tabindex="-1"
      >Lees meer</a
    >
  </div>
</article>

<!-- Card zonder afbeelding — placeholder via lege header -->
<article class="dsn-card">
  <div class="dsn-card__header">
    <div class="dsn-card__image-placeholder" aria-hidden="true"></div>
  </div>
  <!-- ... -->
</article>

<!-- CardGroup -->
<ul class="dsn-card-group" role="list">
  <li>
    <article class="dsn-card"><!-- ... --></article>
  </li>
  <li>
    <article class="dsn-card"><!-- ... --></article>
  </li>
</ul>
```

**React:**

```tsx
// Basis
<Card href="/artikel/slug">
  <CardHeader>
    <Image src="/foto.jpg" alt="" width={800} height={450} ratio="16:9" />
  </CardHeader>
  <CardBody>
    <CardHeading level={2}>Artikeltitel</CardHeading>
    <Paragraph>Korte beschrijving.</Paragraph>
  </CardBody>
  <CardFooter>
    <Link href="/artikel/slug" aria-hidden tabIndex={-1}>Lees meer</Link>
  </CardFooter>
</Card>

// Zonder afbeelding — lege CardHeader toont automatisch placeholder
<Card href="/artikel/slug">
  <CardHeader />
  <CardBody>
    <CardHeading level={2}>Artikeltitel</CardHeading>
    <Paragraph>Beschrijving.</Paragraph>
  </CardBody>
  <CardFooter>
    <Link href="/artikel/slug" aria-hidden tabIndex={-1}>Lees meer</Link>
  </CardFooter>
</Card>

// CardGroup
<CardGroup>
  <li><Card href="/1"><!-- ... --></Card></li>
  <li><Card href="/2"><!-- ... --></Card></li>
</CardGroup>
```

**Props:**

| Component     | Prop       | Type            | Default | Beschrijving                                                          |
| ------------- | ---------- | --------------- | ------- | --------------------------------------------------------------------- |
| `Card`        | `href`     | `string`        | —       | URL voor de stretched link; doorgegeven via context aan `CardHeading` |
| `CardHeader`  | `children` | `ReactNode`     | —       | Afbeelding; zonder children → placeholder                             |
| `CardHeading` | `level`    | `2 \| 3 \| 4`   | `2`     | Semantisch heading-niveau                                             |
| `CardGroup`   | `as`       | `'ul' \| 'div'` | `'ul'`  | Container-element; `ul` rendert `role="list"`                         |

**Tests:** React (43 tests)

---

### DotBadge

**Status:** Complete (HTML/CSS, React)

**Location:** `packages/components-{html|react}/src/DotBadge/`

**Tokens:** `tokens/components/dot-badge.json`

**Variants (5 total):** `negative` (default), `positive`, `warning`, `info`, `neutral`

**Props:** `variant`, `pulse`

**Features:**

- Kleine gekleurde stip die `position: absolute` staat t.o.v. de parent-wrapper
- Altijd `aria-hidden="true"` — toegankelijke context via `dsn-visually-hidden` in de parent
- `pulse` modifier voegt herhalend ring-effect toe via `::before` pseudo-element
- Logische properties (`inset-block-start`, `inset-inline-end`) voor RTL-correctheid
- Pulse-animatie respecteert `prefers-reduced-motion: reduce`

**HTML klassen:**

```html
<span class="dsn-dot-badge dsn-dot-badge--negative" aria-hidden="true"></span>
<span
  class="dsn-dot-badge dsn-dot-badge--negative dsn-dot-badge--pulse"
  aria-hidden="true"
></span>
```

**Tests:** React (14 tests)

### NumberBadge

**Status:** Complete (HTML/CSS, React)

**Location:** `packages/components-{html|react}/src/number-badge/` / `packages/components-react/src/NumberBadge/`

**Tokens:** `tokens/components/number-badge.json`

**Variants (5 total):** `negative` (default), `positive`, `warning`, `info`, `neutral`

**Props:** `variant`, `maxCount`, `children`

**Features:**

- Compact inline pill-badge voor gebruik binnen een Button of Menu-item (via `iconEnd`)
- Altijd `aria-hidden="true"` — toegankelijke context via `dsn-visually-hidden` in de parent
- `maxCount` prop kapt het getal af: toont `{maxCount}+` als `children` groter is (werkt op zowel `number` als numerieke strings)
- `min-inline-size: calc(1lh + 2 * padding-block)` — badge blijft cirkelrond bij 1–2 cijfers, schaalt mee met de fluid type scale
- Inverse kleuren: witte tekst op volle signaalachtergrond (`*-inverse-bg-default` + `*-inverse-color-default`)
- Transparante border voor Windows High Contrast mode ondersteuning

**HTML klassen:**

```html
<!-- Standalone -->
<span class="dsn-number-badge dsn-number-badge--negative" aria-hidden="true"
  >5</span
>

<!-- In een Button (buiten het label, als iconEnd) -->
<button type="button" class="dsn-button dsn-button--subtle">
  <svg class="dsn-icon" aria-hidden="true"><!-- inbox --></svg>
  <span class="dsn-button__label">Inbox</span>
  <span class="dsn-number-badge dsn-number-badge--negative" aria-hidden="true"
    >5</span
  >
</button>
```

**Tests:** React (12 tests)

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

### ModalDialog

**Status:** Complete (HTML/CSS, React)

**Location:** `packages/components-{html|react}/src/modal-dialog/` / `packages/components-react/src/ModalDialog/`

**Tokens:** `tokens/components/modal-dialog.json`

**Sub-components:** `ModalDialog`, `ModalDialogHeader`, `ModalDialogHeading`, `ModalDialogBody`, `ModalDialogFooter`

**Features:**

- Gebaseerd op het native `<dialog>` element met `.showModal()` — ingebakken focus-trap, `aria-modal`, `inert`-attribuut op de achtergrond
- Compound component patroon met React Context — `headingId` en `onClose` automatisch doorgegeven aan sub-componenten
- `aria-labelledby` automatisch gekoppeld aan `ModalDialogHeading` via `React.useId()` — geen handmatige ID nodig
- Sluitknop (`dsn-button--icon-only`) altijd aanwezig in de header — nooit `aria-label`; tekst via `dsn-button__label`
- Escape sluit via native `cancel`-event (`handleCancel` roept `onClose` aan)
- Scroll-affordance schaduw in body (Lea Verou verticale techniek)
- Open/sluitanimatie via `@starting-style`, `opacity`, `transform` en `allow-discrete`
- `display: flex` alleen op `[open]` staat — UA `display: none` blijft van kracht wanneer gesloten
- `flex-direction: column` op de basis-selector — voorkomt layout-glitch tijdens sluitanimatie
- Reduceer-motie-ondersteuning via `prefers-reduced-motion: reduce`
- `level` prop op `ModalDialogHeading` (1–6, default `2`) — visueel uiterlijk altijd gelijk

**CSS klassen:**

| Klasse                     | Element    | Beschrijving                                                  |
| -------------------------- | ---------- | ------------------------------------------------------------- |
| `dsn-modal-dialog`         | `<dialog>` | Root — native dialog; `display: flex` alleen bij `[open]`     |
| `dsn-modal-dialog__header` | `<div>`    | Flexbox header met heading + sluitknop; border-block-end      |
| `dsn-modal-dialog-heading` | `<h2>`     | Heading sub-component; `flex: 1`; typografie via eigen tokens |
| `dsn-modal-dialog__body`   | `<div>`    | Scrollbare inhoud; scroll-affordance schaduwen via background |
| `dsn-modal-dialog__footer` | `<div>`    | Actiesectie; border-block-start; `flex-shrink: 0`             |

**Props (React — ModalDialog):**

| Prop       | Type                           | Default | Beschrijving                                             |
| ---------- | ------------------------------ | ------- | -------------------------------------------------------- |
| `isOpen`   | `boolean`                      | —       | Bepaalt of het dialoogvenster getoond wordt              |
| `onClose`  | `() => void`                   | —       | Callback bij sluiten (sluitknop, Escape, buiten klikken) |
| `children` | `React.ReactNode`              | —       | Sub-componenten: Header, Body, Footer                    |
| `ref`      | `React.Ref<HTMLDialogElement>` | —       | Doorgegeven via `React.forwardRef`                       |

**HTML/CSS:**

```html
<button
  type="button"
  class="dsn-button dsn-button--default dsn-button--size-medium"
  onclick="this.nextElementSibling.showModal()"
>
  <span class="dsn-button__label">Dialoogvenster openen</span>
</button>
<dialog class="dsn-modal-dialog" aria-labelledby="dialog-title">
  <div class="dsn-modal-dialog__header">
    <h2 class="dsn-modal-dialog-heading" id="dialog-title">
      Bevestig verwijderen
    </h2>
    <button
      type="button"
      class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only"
      onclick="this.closest('dialog').close()"
    >
      <svg class="dsn-icon" aria-hidden="true"><!-- x --></svg>
      <span class="dsn-button__label">Sluiten</span>
    </button>
  </div>
  <div class="dsn-modal-dialog__body">
    <p class="dsn-paragraph">Weet u zeker dat u dit item wilt verwijderen?</p>
  </div>
  <div class="dsn-modal-dialog__footer">
    <div class="dsn-action-group">
      <button
        type="button"
        class="dsn-button dsn-button--strong dsn-button--size-medium"
        onclick="this.closest('dialog').close()"
      >
        <span class="dsn-button__label">Verwijderen</span>
      </button>
      <button
        type="button"
        class="dsn-button dsn-button--default dsn-button--size-medium"
        onclick="this.closest('dialog').close()"
      >
        <span class="dsn-button__label">Annuleren</span>
      </button>
    </div>
  </div>
</dialog>
```

**React:**

```tsx
const [isOpen, setIsOpen] = React.useState(false);

<Button variant="default" onClick={() => setIsOpen(true)}>
  Dialoogvenster openen
</Button>
<ModalDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <ModalDialogHeader>
    <ModalDialogHeading>Bevestig verwijderen</ModalDialogHeading>
  </ModalDialogHeader>
  <ModalDialogBody>
    <Paragraph>Weet u zeker dat u dit item wilt verwijderen?</Paragraph>
  </ModalDialogBody>
  <ModalDialogFooter>
    <ActionGroup>
      <Button variant="strong" onClick={() => setIsOpen(false)}>Verwijderen</Button>
      <Button variant="default" onClick={() => setIsOpen(false)}>Annuleren</Button>
    </ActionGroup>
  </ModalDialogFooter>
</ModalDialog>
```

**Tests:** React (16 tests)

### Drawer

**Status:** Complete (HTML/CSS, React)

**Location:** `packages/components-{html|react}/src/drawer/` / `packages/components-react/src/Drawer/`

**Tokens:** `tokens/components/drawer.json`

**Sub-components:** `Drawer`, `DrawerHeader`, `DrawerHeading`, `DrawerBody`, `DrawerFooter`

**Features:**

- Gebaseerd op het native `<dialog>` element — `modal` prop bepaalt `.showModal()` (focus-trap, backdrop, `aria-modal`) of `.show()` (niet-modaal, achtergrond blijft interactief)
- `side` prop (`'right'` | `'left'`, default `'right'`) — positioneert het paneel aan de juiste of linker zijkant van het scherm
- Compound component patroon met React Context — `headingId` en `onClose` automatisch doorgegeven aan sub-componenten
- `aria-labelledby` automatisch gekoppeld aan `DrawerHeading` via `React.useId()` — geen handmatige ID nodig
- Sluitknop (`dsn-button--icon-only`) altijd aanwezig in de header — nooit `aria-label`; tekst via `dsn-button__label`
- Modal variant: Escape sluit via native `cancel`-event; niet-modaal variant: handmatige `keydown`-listener op Escape
- Slide-in animatie via `@starting-style` en `translateX` (rechts: van `100%`; links: van `-100%`)
- `::backdrop` met opacity-transitie voor de modal variant
- Scroll-affordance schaduw in body (Lea Verou verticale techniek)
- Border alleen aan de binnenzijde — `border-inline-start` voor rechts, `border-inline-end` voor links; geen border-radius
- `max-width` begrensd via token; `min-gap` garandeert dat de achtergrondpagina zichtbaar blijft
- Reduceer-motie-ondersteuning via `prefers-reduced-motion: reduce`
- `level` prop op `DrawerHeading` (1–6, default `2`) — visueel uiterlijk altijd gelijk

**CSS klassen:**

| Klasse                   | Element    | Beschrijving                                                  |
| ------------------------ | ---------- | ------------------------------------------------------------- |
| `dsn-drawer`             | `<dialog>` | Root — native dialog; `position: fixed; inset-block: 0`       |
| `dsn-drawer--side-right` | `<dialog>` | Positioneert rechts; slide-in van rechts; border links        |
| `dsn-drawer--side-left`  | `<dialog>` | Positioneert links; slide-in van links; border rechts         |
| `dsn-drawer__header`     | `<div>`    | Flexbox header met heading + sluitknop; border-block-end      |
| `dsn-drawer-heading`     | `<h2>`     | Heading sub-component; `flex: 1`; typografie via eigen tokens |
| `dsn-drawer__body`       | `<div>`    | Scrollbare inhoud; scroll-affordance schaduwen via background |
| `dsn-drawer__footer`     | `<div>`    | Actiesectie; border-block-start; `flex-shrink: 0`             |

**Props (React — Drawer):**

| Prop       | Type                           | Default   | Beschrijving                                       |
| ---------- | ------------------------------ | --------- | -------------------------------------------------- |
| `isOpen`   | `boolean`                      | —         | Bepaalt of het zijpaneel getoond wordt             |
| `onClose`  | `() => void`                   | —         | Callback bij sluiten (sluitknop, Escape)           |
| `modal`    | `boolean`                      | `true`    | Modal (focus-trap, backdrop) of niet-modaal        |
| `side`     | `'right' \| 'left'`            | `'right'` | Zijde van het scherm waaraan het paneel verschijnt |
| `children` | `React.ReactNode`              | —         | Sub-componenten: Header, Body, Footer              |
| `ref`      | `React.Ref<HTMLDialogElement>` | —         | Doorgegeven via `React.forwardRef`                 |

**HTML/CSS:**

```html
<button
  type="button"
  class="dsn-button dsn-button--default dsn-button--size-medium"
  onclick="this.nextElementSibling.showModal()"
>
  <span class="dsn-button__label">Zijpaneel openen</span>
</button>
<dialog
  class="dsn-drawer dsn-drawer--side-right"
  aria-labelledby="drawer-title"
>
  <div class="dsn-drawer__header">
    <h2 class="dsn-drawer-heading" id="drawer-title">Zijpaneel titel</h2>
    <button
      type="button"
      class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only"
      onclick="this.closest('dialog').close()"
    >
      <svg class="dsn-icon" aria-hidden="true"><!-- x --></svg>
      <span class="dsn-button__label">Sluiten</span>
    </button>
  </div>
  <div class="dsn-drawer__body">
    <p class="dsn-paragraph">Inhoud van het zijpaneel.</p>
  </div>
  <div class="dsn-drawer__footer">
    <div class="dsn-action-group">
      <button
        type="button"
        class="dsn-button dsn-button--strong dsn-button--size-medium"
        onclick="this.closest('dialog').close()"
      >
        <span class="dsn-button__label">Toepassen</span>
      </button>
      <button
        type="button"
        class="dsn-button dsn-button--default dsn-button--size-medium"
        onclick="this.closest('dialog').close()"
      >
        <span class="dsn-button__label">Annuleren</span>
      </button>
    </div>
  </div>
</dialog>
```

**React:**

```tsx
const [isOpen, setIsOpen] = React.useState(false);

<Button variant="default" onClick={() => setIsOpen(true)}>
  Zijpaneel openen
</Button>
<Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} side="right">
  <DrawerHeader>
    <DrawerHeading>Zijpaneel titel</DrawerHeading>
  </DrawerHeader>
  <DrawerBody>
    <Paragraph>Inhoud van het zijpaneel.</Paragraph>
  </DrawerBody>
  <DrawerFooter>
    <ActionGroup>
      <Button variant="strong" onClick={() => setIsOpen(false)}>Toepassen</Button>
      <Button variant="default" onClick={() => setIsOpen(false)}>Annuleren</Button>
    </ActionGroup>
  </DrawerFooter>
</Drawer>
```

**Tests:** React (20 tests)

---

## Navigation Components

**Status:** Complete (HTML/CSS, React) — 3 components total

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

### MenuLink

**Status:** Complete (HTML/CSS, React)

**Location:** `packages/components-{html|react}/src/MenuLink/`

**Tokens:** `tokens/components/menu-item.json` (gedeeld) + `tokens/components/menu-link.json` (MenuLink-specifiek)

**Props:** `href`, `level` (1–4), `current`, `iconStart`, `iconEnd`, `numberBadge`, `subItems`, `expanded`, `onExpandToggle`, `children`, `className`

**Features:**

- Semantisch een `<a>`, visueel consistent met MenuButton — gebruik voor URL-navigatie
- Rendeert als `<li class="dsn-menu-link">` — altijd in een `<ul>` plaatsen
- `level` prop (1–4) stelt hiërarchische inspringing in via `margin-inline-start` op de link
- `current` prop voegt `aria-current="page"` toe en toont een `border-inline-start` indicator (3px)
- `subItems` prop toont een uitklapknop naast de link; `expanded` beheert de open/dichte staat
- `numberBadge` slot voor een `<NumberBadge>` rechts van het label
- Gedeelde visuele stijl via `--dsn-menu-item-*` tokens; current-staat via `--dsn-menu-link-current-*`

**CSS-klassen:**

| Klasse                         | Element    | Beschrijving                                              |
| ------------------------------ | ---------- | --------------------------------------------------------- |
| `dsn-menu-link`                | `<li>`     | Basiscomponent — altijd aanwezig                          |
| `dsn-menu-link--level-2`       | `<li>`     | Inspringing: 1× `level-indent`                            |
| `dsn-menu-link--level-3`       | `<li>`     | Inspringing: 2× `level-indent`                            |
| `dsn-menu-link--level-4`       | `<li>`     | Inspringing: 3× `level-indent`                            |
| `dsn-menu-link__link`          | `<a>`      | De navigatielink — bevat icoon, label, badge              |
| `dsn-menu-link__label`         | `<span>`   | Zichtbare linktekst                                       |
| `dsn-menu-link__divider`       | `<span>`   | Decoratieve scheidingslijn tussen link en uitklapknop     |
| `dsn-menu-link__expand-button` | `<button>` | Uitklapknop; `aria-expanded` toggle; chevron roteert 180° |

**Usage:**

```html
<!-- HTML/CSS — level 1, standaard -->
<ul style="list-style: none; margin: 0; padding: 0;">
  <li class="dsn-menu-link">
    <a class="dsn-menu-link__link" href="/dashboard">
      <svg class="dsn-icon" aria-hidden="true"><!-- home --></svg>
      <span class="dsn-menu-link__label">Dashboard</span>
    </a>
  </li>
  <!-- level 2, actieve pagina -->
  <li class="dsn-menu-link dsn-menu-link--level-2">
    <a class="dsn-menu-link__link" href="/rapporten" aria-current="page">
      <span class="dsn-menu-link__label">Rapporten</span>
    </a>
  </li>
</ul>
```

```tsx
// React
<MenuLink href="/dashboard" iconStart={<Icon name="home" aria-hidden />}>
  Dashboard
</MenuLink>
<MenuLink href="/rapporten" level={2} current>
  Rapporten
</MenuLink>
<MenuLink href="/inbox" numberBadge={<NumberBadge variant="negative">5</NumberBadge>}>
  Inbox
</MenuLink>
```

**Tests:** React (27 tests)

---

### MenuButton

**Status:** Complete (HTML/CSS, React)

**Location:** `packages/components-{html|react}/src/MenuButton/`

**Tokens:** `tokens/components/menu-item.json` (gedeeld met MenuLink)

**Props:** `iconStart`, `iconEnd`, `dotBadge`, `children`, `className` + alle native `<button>` attributen

**Features:**

- Semantisch een `<button>`, visueel consistent met MenuLink — gebruik voor JS-acties (uitloggen, modal openen, etc.)
- Rendeert als `<li class="dsn-menu-button">` — altijd in een `<ul>` plaatsen
- `dotBadge` slot voor een `<DotBadge>` die rechtsboven de tekst zweeft (gerenderd in de label-span, `position: relative`)
- Geen disabled state — niet van toepassing in navigatiecontext
- Volledig gedeelde visuele stijl via `--dsn-menu-item-*` tokens

**CSS-klassen:**

| Klasse                    | Element    | Beschrijving                                                             |
| ------------------------- | ---------- | ------------------------------------------------------------------------ |
| `dsn-menu-button`         | `<li>`     | Basiscomponent — altijd aanwezig                                         |
| `dsn-menu-button__button` | `<button>` | De knop — button-reset + volledige breedte, flexbox layout               |
| `dsn-menu-button__label`  | `<span>`   | Zichtbare knoptekst; `flex: 1`; `position: relative` voor dotBadge anker |

**Usage:**

```html
<!-- HTML/CSS -->
<ul style="list-style: none; margin: 0; padding: 0;">
  <li class="dsn-menu-button">
    <button type="button" class="dsn-menu-button__button">
      <svg class="dsn-icon" aria-hidden="true"><!-- settings --></svg>
      <span class="dsn-menu-button__label">Instellingen</span>
    </button>
  </li>
  <!-- met DotBadge -->
  <li class="dsn-menu-button">
    <button type="button" class="dsn-menu-button__button">
      <svg class="dsn-icon" aria-hidden="true"><!-- bell --></svg>
      <span class="dsn-menu-button__label">
        Meldingen
        <span class="dsn-visually-hidden">, nieuwe meldingen beschikbaar</span>
        <span
          class="dsn-dot-badge dsn-dot-badge--negative"
          aria-hidden="true"
        ></span>
      </span>
    </button>
  </li>
</ul>
```

```tsx
// React
<MenuButton iconStart={<Icon name="settings" aria-hidden />}>
  Instellingen
</MenuButton>
<MenuButton
  iconStart={<Icon name="bell" aria-hidden />}
  dotBadge={<DotBadge variant="negative" />}
>
  Meldingen
  <span className="dsn-visually-hidden">, nieuwe meldingen beschikbaar</span>
</MenuButton>
```

**Tests:** React (13 tests)

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

**Total Components:** 47

**Implementations:**

- **HTML/CSS:** 47 components
- **React:** 47 components (1149 tests total, 56 test suites)
- **Web Component:** 7 components (Button, Heading, Icon, Link, OrderedList, Paragraph, UnorderedList)

**Test Coverage:** 1149 tests across 56 test suites

---

## Related Documentation

- **[Architecture](./01-architecture.md)** - Token architecture
- **[Design Tokens Reference](./02-design-tokens-reference.md)** - All token values
- **[Development Workflow](./04-development-workflow.md)** - Adding components
- **[Storybook Configuration](./05-storybook-configuration.md)** - Component documentation
