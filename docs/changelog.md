# Changelog

**Design System Starter Kit Version History**

All notable changes to this project are documented in this file.

---

## Version 5.1.0 (March 5, 2026)

### Grid en GridItem layout componenten met 12 kolommen (PR #71, issue #21)

- **Grid component** (`dsn-grid`) — 12-koloms CSS Grid container met `padding-inline` voor outer margin en `column-gap` voor gutter
- **GridItem component** — directe child met `colSpan` (1–12), responsive `colSpanSm/Md/Lg` props en `fullBleed` prop
- `dsn-col-{1-12}` CSS utility klassen met `grid-column: span N`
- Responsive varianten: `dsn-col-sm/md/lg-{n}` met respectievelijk 36em/44em/64em breakpoints
- `dsn-full-bleed` CSS klasse: breekt visueel uit tot container-rand via `margin-inline: calc(-1 * var(--dsn-grid-margin))`
- `:where(.dsn-grid) > *` default rule (zero specificity) zodat items standaard volle breedte beslaan
- **Nieuwe design tokens**: `--dsn-grid-gutter` (16px default; 8px in information-dense), `--dsn-grid-margin` (24px), `--dsn-grid-max-width` (74rem)
- **Breakpoint-referentietokens**: `--dsn-breakpoint-sm/md/lg/xl` — beschikbaar als CSS custom property voor JS/tooling; niet te gebruiken in CSS `@media` regels
- `config.js`: source volgorde aangepast (components vóór project-types) zodat project-type overrides altijd winnen
- 66 nieuwe tests — totaal 962 tests

---

## Version 5.0.0 (March 5, 2026)

### Stack layout component met space-row varianten (PR #70, issue #17)

- **Stack component** (`dsn-stack`) — verticale stapeling met consistente ruimte via `flexbox + gap`
- 9 space-varianten: `sm` (4px), `md` (8px), `lg` (12px), `xl` (16px), `2xl` (20px), `3xl` (24px), `4xl` (32px), `5xl` (64px), `6xl` (160px)
- Intern `--dsn-stack-space` CSS custom property met fallback naar `--dsn-space-row-md`
- Default `md` voegt geen modifier-klasse toe aan de DOM (consistent met andere componenten)
- Nieuwe Storybook-categorie **Layout Components** toegevoegd — staat tussen Foundations en Components in sidebar
- `storyOrder` key: `'layout components'` (met spatie, lowercase) — spaties worden niet vervangen door koppeltekens door `storybook-multilevel-sort`

---

## Version 4.9.0 (March 5, 2026)

### Component-level tokens: kleur-tokens Alert en Note gepubliceerd (PR #68, issue #67)

- **Alert:** 16 nieuwe component-level kleur-tokens toegevoegd aan `alert.json` — 4 varianten (info, negative, positive, warning) × 4 eigenschappen (background-color, border-color, color, icon-color)
- **Note:** 20 nieuwe component-level kleur-tokens toegevoegd aan `note.json` — 5 varianten (info, negative, neutral, positive, warning) × 4 eigenschappen (background-color, border-inline-start-color, color, icon-color)
- `alert.css` en `note.css`: intermediate lokale CSS properties verwijzen nu naar de gepubliceerde JSON token variabelen in plaats van rechtstreeks naar semantische tokens
- `Alert.docs.md` en `Note.docs.md`: twee tabellen (layout + kleur) samengevoegd tot één uniforme tokentabel conform StatusBadge patroon; disclaimer "lokale CSS custom properties" verwijderd
- Variant kleur-tokens zijn nu overschrijfbaar per thema via CSS custom properties

---

## Version 4.8.0 (March 4, 2026)

### Component-level tokens: Button, FormFieldStatus, Alert, Note, StatusBadge (PR #66, issue #65)

**Toegevoegde tokens Button**

- `dsn.button.border-radius` → `{dsn.border.radius.md}`
- `dsn.button.border-width` → `{dsn.border.width.thin}`
- `dsn.button.font-family` → `{dsn.text.font-family.default}`
- `dsn.button.font-weight` → `{dsn.text.font-weight.bold}`
- `dsn.button.line-height` → `{dsn.text.line-height.md}`
- `dsn.button.min-block-size` → `{dsn.pointer-target.min-block-size}`
- `dsn.button.min-inline-size` → `{dsn.pointer-target.min-inline-size}`
- `dsn.button.size.small.min-block-size` → `2.5rem` (kleinere touch target voor small variant)
- `button.css`: 7 semantische tokens + 1 hardcoded waarde vervangen door component-level tokens

**Toegevoegde tokens FormFieldStatus**

- `dsn.form-field-status.gap` → `{dsn.space.text.sm}`
- `dsn.form-field-status.icon-size` → `{dsn.icon.size.md}`
- `dsn.form-field-status.positive-color` → `{dsn.color.positive.color-default}`
- `dsn.form-field-status.warning-color` → `{dsn.color.warning.color-default}`

**Toegevoegde icon-size tokens (Alert, Note, StatusBadge)**

- `dsn.alert.icon-size` → `{dsn.icon.size.xl}` (ook breedte eerste grid-kolom)
- `dsn.note.icon-size` → `{dsn.icon.size.xl}` (ook breedte eerste grid-kolom)
- `dsn.status-badge.icon-size` → `{dsn.icon.size.sm}`

**Docs**

- `Button.docs.md`: 7 verouderde semantische token-rijen vervangen door 8 component-level token-rijen
- `Button.docs.md`: 9 verouderde `--dsn-button-link-*` tokens verwijderd (link-variant bestaat niet meer; vervangen door LinkButton component)
- `FormFieldStatus.docs.md`, `Alert.docs.md`, `Note.docs.md`, `StatusBadge.docs.md`: tokentabellen bijgewerkt

---

**Session 8 werk (PR's #43–#64)**

### LinkButton en ButtonLink componenten (PR #43, issue #41 / PR #44, issue #42)

**LinkButton**

- **LinkButton component** — semantisch `<button>`, visueel als een Link — voor JS-acties met lage attentiewaarde
- CSS: erft `dsn-link` en `dsn-link-button` klassen
- `disabled`: native `<button disabled>` + CSS `.dsn-link.dsn-link-button:disabled`
- `font: inherit` bewust weggelaten uit `dsn-link-button` — `dsn-link` zet dit al; herhalen overschrijft `font-size` van size-klassen
- Storybook: Default, Disabled, All states, alle size-varianten, Long text, RTL

**ButtonLink**

- **ButtonLink component** — semantisch `<a>`, visueel als een Button — voor navigatieacties met hoge attentiewaarde
- CSS: `dsn-button dsn-button--{variant} dsn-button--size-{size} dsn-button-link`
- `disabled`: `aria-disabled="true"` + `tabIndex={-1}` + `pointer-events: none` (`:disabled` pseudo-class werkt niet op `<a>`)
- `external`: auto `target="_blank"` + `rel="noopener noreferrer"` + zichtbare "(opent nieuw tabblad)" tekst
- `children` altijd gewrapt in `<span class="dsn-button__label">` — zelfde patroon als Button
- Storybook: Default, alle varianten, Disabled, External, Long text, RTL

### Storybook TypeScript fixes (PR's #51, #52, #53)

- `#51` — Ambient module declaration toegevoegd voor `*.mdx` imports (TypeScript kende het type niet)
- `#52` — Subpath export geconfigureerd voor `icon-registry.generated` in `components-react`
- `#53` — `TS7053` opgelost voor `globalThis` string-index in `preview.ts`

### Token key ordering (PR #57, issue #56 / PR #64, issue #63)

- `#56` — Consistente sleutelvolgorde doorgevoerd in alle token JSON bestanden: depth-first, alphabetisch, states → variants → sub-componenten
- `#63` — Follow-up: tokenvolgorde ook doorgevoerd in alle `.docs.md` tabellen in Storybook

---

## Version 4.7.0 (March 3, 2026)

### Note component + Alert/Note polish

**Note component (PR #48)**

- **Note component** — Visueel uitgelicht bericht voor aanvullende of belangrijke informatie; passieve tegenhanger van Alert (geen `role="alert"`, geen live region)
- 5 varianten: `neutral` (default), `info`, `positive`, `negative`, `warning` — elk met eigen signaalkleur en icoon
- CSS grid layout identiek aan Alert: icoon + heading in rij 1, content in rij 2
- `border-inline-start` (niet rondom zoals Alert) als visuele markering
- `dsn-note--no-heading` modifier: icoon overspant beide rijen (`grid-row: 1 / span 2`)
- `as` prop: `div` (default), `aside`, `nav`, `section` — semantiek losgekoppeld van stijl
- Automatische `aria-labelledby` voor landmark-elementen (`nav`, `aside`, `section`) met heading via `useId()`
- `iconStart` prop: `undefined` = voorkeurspicoon per variant, `null` = geen icoon, `ReactNode` = aangepast icoon
- Storybook: Default, Info, Positive, Negative, Warning, All states, Without heading, With list, As nav, Long text, RTL, RTL long text

**Paragraph refactoring**

- `dsn-paragraph--default` alias volledig verwijderd — geen backward compatibility meer nodig
- Default-stijlen zitten nu direct op `.dsn-paragraph` base class
- `class="dsn-paragraph"` is voldoende; geen modifier class voor de standaard variant
- React component: `dsn-paragraph--${variant}` alleen toegevoegd voor `lead` en `small-print`
- Web Component: zelfde logica in `_updateClasses()`
- Tests bijgewerkt in beide packages

**Alert & Note design polish**

- `padding-block` token: `space.block.lg` → `space.block.xl` (meer ademruimte)
- `row-gap` token: `space.row.xs` → `space.row.md` (heading heeft geen margin-block-end meer)
- `Icon size="xl"` toegevoegd — ontbrak bij handmatig opgegeven `iconStart` via argTypes mapping
- `<Paragraph>` in alle stories — geen kale tekst-strings meer als `children`
- `children` argType: `control: false` (React node, niet stuurbaar via tekstveld)
- Semantische heading tags in HTML-templates: `<strong>` vervangen door `<h2>` (Alert) en `<h3>` (Note)
- `htmlTemplate` dynamisch op `headingLevel` — HTML-tab past mee als Controls panel wijzigt

---

## Version 4.6.0 (March 2, 2026)

### StatusBadge & Alert components

**StatusBadge component (PR #46)**

- **StatusBadge component** — Compact label dat een status communiceert met een signaalkleur
- 5 varianten: `neutral`, `info`, `positive`, `negative`, `warning`
- Optioneel `iconStart` prop voor een icoon vóór het label
- Storybook: Default, alle varianten, All states, With icon, RTL

**Alert component (PR #47)**

- **Alert component** — Belangrijk bericht dat de gebruiker informeert over de huidige activiteit of toestand
- 4 varianten: `info` (default), `positive`, `negative`, `warning`
- CSS grid layout: icoon + heading naast elkaar in rij 1, content in rij 2 (`grid-template-columns: icon-size 1fr`)
- `role="alert"` voor live region — schermlezer kondigt wijzigingen automatisch aan
- Voorkeurspicoon per variant; overschrijfbaar via `iconStart` prop (`null` = geen icoon)
- `heading` (verplicht) + optionele `children` voor body content
- `headingLevel` prop voor semantisch heading-niveau (default `h2`, visueel als `heading-3`)
- Volledige border rondom (niet alleen inline-start)
- `@import` fix: React CSS haalt stijlen op via `components-html`
- Storybook: Default, Positive, Negative, Warning, All states, With list (validation), No icon, Long text, RTL, RTL long text

---

## Version 4.5.0 (February 24, 2026)

### Storybook: Dynamic Code Tabs & PreviewFrame

**PreviewFrame component**

- **PreviewFrame UI component** — Visueel kader rondom story previews op docs pagina's
- Token-based achtergrond via `--dsn-color-neutral-bg-document` (reageert op dark mode en themaswitch)
- Subtiele border (`--dsn-color-neutral-border-subtle`), border-radius bovenaan, geen onderkant border (verbindt met CodeTabs)
- Locatie: `packages/storybook/src/components/PreviewFrame.tsx`

**CodeTabs component**

- **CodeTabs UI component** — Twee tabs (React en HTML/CSS) met syntax highlighting onder elke story preview
- Beide tabs zijn volledig **dynamisch** — code werkt bij als de gebruiker props aanpast via het Controls panel
- **React tab** — `Source of={story}` subscribet op `STORY_ARGS_UPDATED` en toont live de gegenereerde React code
- **HTML/CSS tab** — `Source of={story} transform={...}` leest `parameters.dsn.htmlTemplate` en genereert HTML op basis van live args; valt terug op statische `html` prop als er geen template is
- Active tab styling via `--dsn-link-color`; tab bar verbindt visueel met PreviewFrame erboven
- Locatie: `packages/storybook/src/components/CodeTabs.tsx`
- Barrel export via `packages/storybook/src/components/index.ts`

**`htmlTemplate` patroon in story files**

- **27 story files** bijgewerkt met `parameters.dsn.htmlTemplate` — functie `(args: any) => string` die HTML genereert op basis van de huidige story args
- Wrapper componenten zonder `htmlTemplate` (CheckboxGroup, RadioGroup, DateInputGroup) gebruiken de statische `html` prop uit `.docs.mdx`
- Pattern:

```tsx
parameters: {
  docs: { page: DocsPage },
  dsn: {
    htmlTemplate: (args: any) => {
      const cls = ['dsn-button', `dsn-button--${args.variant ?? 'strong'}`].join(' ');
      return `<button class="${cls}">${args.children}</button>`;
    },
  },
},
```

**MDX structuur bijgewerkt (alle 32 component docs)**

```mdx
import { PreviewFrame, CodeTabs } from './components';

<PreviewFrame>
  <Story of={ComponentStories.Default} />
</PreviewFrame>

<CodeTabs
  of={ComponentStories.Default}
  html={`<div class="dsn-component">...</div>`}
/>
```

**Bekende beperking (issue #28)**

- DateInputGroup HTML/CSS tab toont momenteel dezelfde code als de React tab — regressie van de `parameters.docs.source.code` workaround. Fix: `react` prop toevoegen aan CodeTabs (zie issue #28).

---

## Version 4.4.0 (February 19, 2025)

### New Components: Select, DateInput, DateInputGroup + FormFieldset fix

**Select Component**

- **Select component** — Dropdown select with a custom `chevron-down` icon at inline-end
- Wrapper `dsn-select-wrapper` handles width variants (same pattern as SearchInput)
- Native browser select arrow hidden via `appearance: none`
- Icon disappears when `disabled`
- Props: `invalid`, `width`, and all native `<select>` attributes
- Storybook documentation with Default, Invalid, Disabled, Width Variants, and WithFormField stories

**DateInput Component**

- **DateInput component** — Date input (`type="date"`) with an interactive calendar button at inline-end
- Same pattern as TimeInput: `<Button variant="subtle" size="small" iconOnly>` with `calendar-event` icon
- Fixed width (no `width` prop) — date inputs have a predictable content width
- `showPicker()` triggered via internal ref + `handleRef` merge pattern
- Native browser calendar icon hidden via `::-webkit-calendar-picker-indicator { display: none }`
- Button disappears when `disabled` or `readOnly`
- Props: `invalid`, and all native date input attributes
- Storybook documentation with Default, WithValue, Invalid, Disabled, ReadOnly, and WithFormField stories

**DateInputGroup Component**

- **DateInputGroup component** — Three separate NumberInputs for day, month, and year
- More accessible than native date picker: works consistently across all browsers and allows partial input
- Day and month fields: width `xs`; year field: width `sm`
- Inline labels above each field using `dsn-date-input-group__label`
- `id` prop auto-generates `{id}-dag`, `{id}-maand`, `{id}-jaar` for accessible label association
- `onChange` always returns the full `{ day, month, year }` object
- `invalid` prop propagates to all three NumberInputs
- Wrap in `FormFieldset` for a complete form field with legend and error message
- Storybook documentation with Default, Controlled, Invalid, Disabled, and WithFormFieldset stories

**FormFieldset Fix**

- **Red left border in invalid state** — `FormFieldset` now shows a red left border when the `error` prop is set, consistent with `FormField`

**Statistics**

- **32 total components** (7 content + 25 form)
- **733 tests** across 38 test suites — all passing

---

## Version 4.3.0 (February 17, 2025)

### CI/CD Fixes & Interactive Design Token Explorer

**CI/CD Test Fixes**

- **FormField tests rewritten** — Tests updated to match refactored architecture: `FormField` always renders div/label, removed all `isGroup` test cases
- **CheckboxGroup tests rewritten** — Tests updated to match refactored component: renders div container (not fieldset), removed `legend`/`hideLegend` prop tests
- **RadioGroup tests rewritten** — Tests updated to match refactored component: renders div container (not fieldset), removed `legend`/`hideLegend` prop tests
- **All 613 tests passing** across 35 test suites (down from 628 due to removed tests for deleted API surface)

**Architecture Clarification (documented in tests)**

The component architecture was refactored in v4.2.0 but tests weren't updated:

| Component       | Old API (removed)            | New API                                         |
| --------------- | ---------------------------- | ----------------------------------------------- |
| `FormField`     | `isGroup`, `hideLabel` props | Always div/label; use `FormFieldset` for groups |
| `CheckboxGroup` | `legend`, `hideLegend` props | Simple div container only                       |
| `RadioGroup`    | `legend`, `hideLegend` props | Simple div container only                       |

**Interactive Design Token Explorer**

- **TokenControls component** added to Design Tokens documentation page
- **Three selectors** for live token exploration: Theme, Mode, and Project Type
- **Theme options**: Start, Wireframe (matches actual available token files)
- **Mode options**: Light, Dark
- **Project Type options**: Default, Information Dense (from `project-types/` folder)
- **Live updates**: Selecting a configuration dynamically loads the corresponding CSS file and refreshes all TokenTable values on the page
- All 8 configurations available: 2 themes × 2 modes × 2 project types

**Documentation Updates**

- README component composition examples updated to use new `FormFieldset` API
- Test counts updated to 613

---

## Version 4.2.0 (February 16, 2025)

### GitHub Pages Deployment & Storybook Improvements

**GitHub Pages Setup**

- **Automated Storybook deployment** — GitHub Actions workflow deploys Storybook to GitHub Pages on every push to main
- **Live Storybook URL** — [https://jeffreylauwers.github.io/design-system-starterkit/](https://jeffreylauwers.github.io/design-system-starterkit/)
- **Base path configuration** — Vite base path configured via `STORYBOOK_BASE_PATH` environment variable
- **Relative asset paths** — Design tokens use relative paths (`./design-tokens/dist/css`) for GitHub Pages compatibility

**Introduction Page**

- **Welcome page added** — Comprehensive introduction page as Storybook landing page
- **Navigation ordering** — Introduction appears first in sidebar, before Foundations and Components
- **Design tokens preload** — Default tokens (start-light-default) loaded immediately on Storybook start
- **Quick start guide** — Installation instructions, usage examples, component overview included

**Form Field Container Components**

- **FormFieldLegend component** — Legend element component for fieldset/legend structure, reuses FormFieldLabel CSS
- **FormFieldset component** — Container component for group controls (checkbox groups, radio groups)
- **FormField invalid state** — Red left border when error prop is present
- **Design tokens for invalid state** — form-field.json extended with invalid border styling

**FormFieldStatus Enhancements**

- **Three-variant system** — default (subtle info), positive (success with check icon), warning (caution with alert-triangle icon)
- **Icon support** — Conditional icons for positive and warning variants
- **showIcon prop** — Allows disabling icons on positive/warning variants

**Bug Fixes & Improvements**

- **ESLint errors fixed** — Unescaped quotes in JSX replaced with HTML entities (&ldquo;/&rdquo;/&rsquo;)
- **Prettier formatting** — All 81 files formatted consistently
- **TypeScript exports** — FormFieldStatusVariant type properly exported
- **Component index files** — Added missing index.ts for FormFieldLegend and FormFieldset

**Component Count**

- **21 form components** — FormFieldLegend and FormFieldset added to form component collection
- **25 total components** — 7 content components + 18 form components (Priority 1-4 complete)

---

## Version 4.1.0 (February 14, 2026)

### Build Pipeline & Module System Improvements

**Build Pipeline Enhancement**

- **Explicit build ordering** — Root build script now executes in explicit dependency order: `tokens → core → components → storybook`
- **Granular build commands** — New scripts: `build:tokens`, `build:core`, `build:components`, `build:storybook`
- **Icon generation automation** — Icon registry generation automatically included in `components-react` build step
- **Build dependency guarantee** — No more race conditions; dependencies always build before dependents

**Module System & Imports**

- **Barrel exports** — New `/packages/components-react/src/index.ts` exports all components for convenient importing
- **Clean import syntax** — `import { Button, TextInput } from '@dsn/components-react'` now supported
- **Package exports** — `components-html` package.json extended with granular exports for individual CSS files
- **Vitest config enhancement** — Added `@dsn/components-html` alias for proper CSS module resolution

**Import Patterns:**

```tsx
// ✅ New: Barrel export (recommended)
import { Button, TextInput, Heading } from '@dsn/components-react';

// ✅ Still supported: Individual imports
import { Button } from '@dsn/components-react/Button';
```

**CSS Module Resolution:**

```tsx
// React components now use relative imports for CSS
import './Button.css';
// → @import '../../../components-html/src/button/button.css';

// This ensures compatibility with PostCSS/Vite CSS bundling
```

**Package Structure:**

- **components-html exports** — 14 individual CSS file exports (`./button`, `./icon`, `./text-input`, etc.)
- **Barrel export grouping** — Components organized by category (Typography, Form Inputs, Form Options, Form Field)

**Documentation Updates**

- README.md updated with build pipeline diagram and import examples
- Development Workflow docs enhanced with import patterns section
- Components docs updated with barrel export usage
- Package READMEs created/updated with export documentation

**Testing**

- **All 628 tests passing** across 35 test suites
- CSS import path changes verified in test environment
- Build pipeline tested end-to-end

---

## Version 4.0.0 (February 13, 2026)

### Form Components - Complete Release

- **TextInput component** — Complete (HTML/CSS, React) with size variants (default, large) and states (disabled, invalid, read-only)
- **TextArea component** — Complete (HTML/CSS, React) with size variants and states
- **NumberInput component** — Complete (HTML/CSS, React) with min/max/step props and size variants
- **PasswordInput component** — Complete (HTML/CSS, React) extends TextInput with type="password"
- **EmailInput component** — Complete (HTML/CSS, React) extends TextInput with type="email"
- **TelephoneInput component** — Complete (HTML/CSS, React) extends TextInput with type="tel"
- **SearchInput component** — Complete (HTML/CSS, React) with search icon on the left
- **TimeInput component** — Complete (HTML/CSS, React) with type="time" for native time picker
- **Checkbox component** — Complete (HTML/CSS, React) with checked, indeterminate, disabled states
- **Radio component** — Complete (HTML/CSS, React) with checked, disabled states
- **CheckboxOption component** — Complete (HTML/CSS, React) combines Checkbox + Label with accessible touch targets
- **RadioOption component** — Complete (HTML/CSS, React) combines Radio + Label with accessible touch targets
- **CheckboxGroup component** — Complete (HTML/CSS, React) div container for CheckboxOption items; pair with FormFieldset for accessible grouping
- **RadioGroup component** — Complete (HTML/CSS, React) div container for RadioOption items; pair with FormFieldset for accessible grouping
- **FormField component** — Complete (HTML/CSS, React) div/label container for single-value inputs (TextInput, TextArea, etc.)
- **FormFieldset component** — Complete (HTML/CSS, React) fieldset/legend container for group controls (CheckboxGroup, RadioGroup)
- **FormFieldLabel component** — Complete (HTML/CSS, React) with required indicator and suffix support
- **FormFieldDescription component** — Complete (HTML/CSS, React) for help text
- **FormFieldErrorMessage component** — Complete (HTML/CSS, React) for validation errors
- **FormFieldStatus component** — Complete (HTML/CSS, React) for status messages

### Form Components - Technical Improvements

- **Fluid checkbox/radio sizing** — Size scales with typography using `calc(var(--dsn-text-font-size-md) * var(--dsn-text-line-height-md))`
- **Checkbox icons** — Uses `check.svg` for checked state, `minus.svg` for indeterminate state
- **Radio disabled checked** — Inner circle uses white color for proper contrast against disabled background
- **Touch target accessibility** — CheckboxOption/RadioOption use `padding-block` instead of `min-block-size` for WCAG 2.5.5 compliance
- **Legend token optimization** — CheckboxGroup/RadioGroup legend tokens reference FormFieldLabel tokens (DRY principle)
- **Form field invalid state tokens** — Created `form-field.json` with red left border styling for invalid fields
- **19 form component token files** — Complete design token coverage for all form components

### Testing

- React Checkbox tests (7 tests), React Radio tests (7 tests)
- React CheckboxOption tests (13 tests), React RadioOption tests (13 tests)
- React CheckboxGroup tests (8 tests), React RadioGroup tests (9 tests)
- React FormField tests (11 tests), React TextInput tests (9 tests), React TextArea tests (9 tests)
- **396 tests** across 24 test suites

---

## Version 3.9.0 (February 9, 2026)

### Button & Link Enhancements

- **Button loading state** — Animated loader icon replaces `iconStart` when `loading` is true, uses `loader.svg` from icon set
- **Button loading CSS** — `::after` pseudo-element spinner replaced with real `<Icon name="loader">` element and `dsn-button-spin` keyframe animation
- **Link external prop** — `external` prop/attribute adds `target="_blank"`, `rel="noopener noreferrer"`, and visible "(opens in new tab)" hint text
- **Link external — no icon** — Follows GOV.UK pattern: no visual icon for external links, plain text hint instead

### Icon System & CSS Quality

- **Icon expansion** — 45 Tabler icons (was 20), Storybook Icon stories now dynamically generated from `iconMap`
- **Storybook Icon stories fix** — Hardcoded icon array replaced with dynamic `Object.keys(iconMap)` export
- **CSS anti-patterns fixed** — `transition: all` replaced with specific properties in Button and Link
- **Focus-visible deduplication** — 9 identical `:focus-visible` blocks consolidated into single shared rule (420 → 351 lines in button.css)
- **Loading spinner scaling** — Fixed `rem` → `em` units so spinner scales with button size

### Utilities & Accessibility

- **Utilities hardcoded values fixed** — Gap, font-weight, and container utilities now use design tokens
- **sr-only utility** — Available in `@dsn/core` utilities for visually hiding content while keeping it accessible to screen readers

### Testing

- React Button tests (25 tests, +2 new), React Link tests (32 tests, +7 new)
- **317 tests** across 15 test suites

---

## Version 3.8.0 (February 7, 2026)

### List Components

- **UnorderedList component** — Complete (HTML/CSS, React, Web Component) with accent-colored bullet markers
- **OrderedList component** — Complete (HTML/CSS, React, Web Component) with `start` prop support
- **UnorderedList component tokens** — `unordered-list.json` with font-family, font-weight, color, font-size, line-height, padding, margin, gap, marker-color
- **OrderedList component tokens** — `ordered-list.json` with font-family, font-weight, color, font-size, line-height, padding, margin, gap, marker-color
- **ListCombinations stories** — Mixed list compositions with Heading, Paragraph, and Link components

### Storybook Documentation Overhaul

- **Storybook documentation overhaul** — All component docs rewritten in Dutch with consistent structure
- **Docs page structure** — Doel, Voorbeeld (live Story + Controls), Use when, Don't use when, Best practices, Design tokens
- **MDX files updated** — `ArgsTable` (deprecated) replaced with `Controls` from `@storybook/blocks`
- **Docs split-import pattern** — Markdown split on `<!-- VOORBEELD -->` marker; intro before live example, rest after
- **Sidebar ordering fixed** — `storybook-multilevel-sort` plugin installed; Docs entry now appears first per component
- **Storybook main.ts** — `configureSort()` with `typeOrder: ['docs', 'story']` for docs-first ordering

### Testing

- React UnorderedList tests (7 tests), Web Component UnorderedList tests (7 tests)
- React OrderedList tests (8 tests), Web Component OrderedList tests (11 tests)
- **308 tests** across 15 test suites

---

## Version 3.7.0 (February 6, 2026)

### Link Component

- **Link component** — Complete (HTML/CSS, React, Web Component) with icon support and 3 size variants
- **Link size variants** — `small`, `default`, `large` with size-specific font-size, gap, and icon-size tokens
- **Link inline behavior** — Without explicit size, link inherits font from parent (`font: inherit`) for seamless inline usage in paragraphs
- **Link component tokens** — `link.json` with color, text-decoration, gap, icon-size, hover/active/disabled states, and size variants
- **Link Storybook stories** — Default, WithIconStart, WithIconEnd, WithBothIcons, Disabled, CurrentPage, InlineWithText, Sizes, SizesWithIcons, InlineWithParagraphVariants

### Icon & Focus Improvements

- **Icon size scale updated** — Consistent across Button and Link: small → `icon.size.sm`, default → `icon.size.md`, large → `icon.size.lg`
- **Focus indicator dual outline** — `box-shadow` added for inverse outline behind the primary outline, ensuring visibility on all backgrounds
- **Focus inverse outline token** — `dsn.focus.inverse.outline-color` added for the secondary box-shadow outline

### Wireframe Theme

- **Wireframe theme overhaul** — Comic Sans font, pure black/white neutral colors, all color scales alias to neutral, yellow (#ffdd00) focus background
- **Button small min-block-size** — Changed from pointer-target token to hardcoded `2.5rem`
- **Link text-underline-offset** — Set to `4px` for improved readability

### Testing

- React Link tests (25 tests), Web Component Link tests (38 tests)
- **275 tests** across 11 test suites

---

## Version 3.6.0 (February 5, 2026)

### Runtime Theme Switching

- **Runtime theme switching in Storybook** — Full support for theme/mode/density switching on both Stories and Docs pages
- **Dynamic CSS loading** — Tokens loaded at runtime via fetch(), not bundled statically
- **CSS cascade fix** — Dynamic tokens use `:root:root` selector for higher specificity
- **MutationObserver** — Ensures dynamic token styles stay at end of `<head>` for cascade priority
- **Web Components registration** — Removed auto-registration side effects, added `defineAllComponents()` helper
- **TokenTable improvements** — Live computed CSS values update correctly on theme changes
- **Storybook preview-head.html** — New file for iframe-level token loading
- **Fixed invalid icon reference** — Changed `external-link` to `arrow-right` in Button stories

---

## Version 3.5.0 (February 5, 2026)

### Three-Axis Token Architecture

- **Three-axis token architecture** — Theme × Mode × Project Type configuration model
- **Theme axis** — `start` (default) and `wireframe` themes, each defining ALL tokens
- **Mode axis** — `light` and `dark` modes, affecting ONLY color tokens
- **Project Type axis** — `default` (fluid clamp) and `information-dense` (fixed) typography
- New folder structure: `themes/{name}/base.json`, `colors-light.json`, `colors-dark.json`
- New folder structure: `project-types/{name}/typography.json`
- 8 full configurations generated (2 themes × 2 modes × 2 project types)
- Dynamic build system with configuration matrix
- Storybook toolbar controls for Theme, Mode, and Density switching
- TokenTable component shows live computed CSS values
- Backward compatibility aliases maintained (`variables.css` → `start-light-default.css`)
- Wireframe theme: system fonts, grayscale colors, minimal border-radius
- Removed old core/ folder and themes/light.json, themes/dark.json

---

## Version 3.4.0 (January 30, 2026)

### Button Icon Support

- Button `iconStart` and `iconEnd` props (React) — both can be used simultaneously
- Button Web Component named slots `icon-start` and `icon-end`
- Button icon-size tokens per button size (updated in v3.7.0: small → `dsn.icon.size.sm`, default → `dsn.icon.size.md`, large → `dsn.icon.size.lg`)
- Button icon-only-padding tokens per button size — replaces hardcoded `--dsn-space-inline-*`
- CSS icon sizing in button context (`.dsn-button--size-* > .dsn-icon`)
- New Storybook stories: WithIconStart, WithIconEnd, WithIconStartAndEnd, IconSizes
- React Button tests (23 tests, +4 new)
- Web Component Button tests (53 tests, +3 new)

---

## Version 3.3.0 (January 29, 2026)

### Heading Component

- Heading component with 6 appearances: heading-1 through heading-6
- Independent `level` (semantic h1–h6) and `appearance` (visual style) props
- Heading component tokens with full set per level (font-family, font-weight, color, font-size, line-height, margin-block-end)
- Token namespace `dsn.heading.level-{1-6}.*` — avoids collision with core `dsn.heading.*` tokens
- Each level references semantic heading tokens (`dsn.heading.font-family`, `dsn.heading.font-weight`, `dsn.heading.color`) but can be overridden individually
- Font-size scale shifted one level down: heading-1 = 3xl, heading-2 = 2xl, ... heading-6 = sm
- Heading HTML/CSS component (`@dsn/components-html`)
- Heading React component with forwardRef (`@dsn/components-react`)
- Heading Web Component (`<dsn-heading>`) with Shadow DOM and dynamic element swapping
- Heading React tests (13 tests)
- Heading Web Component tests (24 tests)
- Heading Storybook stories (Default, Heading1, Heading2, Heading3, AppearanceOverride, AllLevels)

---

## Version 3.2.0 (January 29, 2026)

### Paragraph Token Refactoring

- Paragraph token architecture refactored to base/variant pattern
- Shared properties (font-family, font-weight, color, max-inline-size) on base class `.dsn-paragraph`
- Variant modifiers only define differences (font-size, line-height, margin-block-end)
- IBM Plex Sans font loaded via Google Fonts import in reset.css
- Body font-family now references `var(--dsn-text-font-family-default)` with system fallback

---

## Version 3.1.0 (January 29, 2026)

### Paragraph Component

- Paragraph component with 3 variants: default, lead, small-print
- Paragraph component tokens (font-size, line-height, font-weight, color, margin, max-inline-size)
- Paragraph HTML/CSS component (`@dsn/components-html`)
- Paragraph React component (`@dsn/components-react`)
- Paragraph Web Component (`<dsn-paragraph>`) with Shadow DOM
- Paragraph Web Component tests
- Paragraph React component tests
- Paragraph Storybook stories (Default, Lead, SmallPrint, AllVariants)

---

## Version 3.0.0 (January 29, 2026)

### Storybook & Documentation

- Storybook dark mode toggle via `@storybook/addon-themes`
- Custom `css/variables-scoped` Style Dictionary format for class-scoped dark CSS
- Design token reference page (Foundations/Design Tokens) with visual previews
- `@storybook/addon-a11y` for accessibility testing in every story
- Story background color responds to theme switching via `dsn.color.neutral.bg-document`
- TokenTable helper component for token documentation

---

## Version 2.9.0 (January 29, 2026)

### Icon System

- Fluid icon sizes — `calc(font-size × line-height)` with CSS variable references
- Icon Web Component (`<dsn-icon>`) with Shadow DOM and inline SVG rendering
- Icon HTML/CSS component added to `@dsn/components-html`
- Shared icon CSS: `components-html/src/icon/icon.css` as single source of truth
- Icon path registry auto-generated from SVG files for Web Components
- `build-css.js` extended to generate icon styles and icon path data
- Icon Web Component tests (48 tests covering all icons, sizes, accessibility)
- Storybook: Button + Icon composition stories (With icon, Icon only)
- `@dsn/components-html` build updated to include icon CSS
- SVG assets included in published `@dsn/components-html` package

---

## Version 2.8.0 (January 29, 2026)

### Development Infrastructure

- TypeScript type checking across all packages (`pnpm type-check`)
- CI workflow updated with type-check step
- Modern `exports` fields added to all package.json files
- Husky + lint-staged pre-commit hooks (ESLint + Prettier)
- Web Component tests for DsnButton (50 tests)
- ESLint ignorePatterns for auto-generated files (`*.generated.*`)
- Design tokens watch mode fixed (`node --watch-path`)
- Icon generation script error handling improved
- Design tokens TypeScript declarations now export typed constants (520+)
- Package READMEs added for all packages
- Storybook tsconfig.json created
- components-web tsconfig.json refactored to extend root
- `.gitignore` updated for generated files

---

## Version 2.7.0 (January 28, 2026)

### Form Control Tokens

- Form control tokens added for input, select, textarea, checkbox, radio components
- Tokens split across core files (non-color) and theme files (color)
- Core tokens: borders.json, spacing.json, typography.json, sizing.json
- Theme tokens: light.json, dark.json (color tokens only)
- Heading color token added to themes
- All form control states covered: default, hover, focus, active, disabled, invalid, read-only

---

## Version 2.6.0 (January 28, 2026)

### Web Components Foundation

- React Button component verified - already using correct class names
- Web Button component created (`<dsn-button>` custom element)
- Web Component package (@dsn/components-web) set up with TypeScript
- Web Button demo page created
- Consistent API across HTML, React, and Web Component implementations

---

## Version 2.5.0 (January 28, 2026)

### Component Token Architecture

- Component token architecture fully implemented and documented
- Button component tokens created (90+ tokens)
- Button CSS refactored to use component tokens
- Light and dark theme build pipeline working
- Colors.json added for universal color tokens (transparent)
- Mobile-first CSS methodology documented
- Token file organization improved (core/ and components/ folders)

---

## Version 2.4.0 (January 27, 2026)

### Component Standards

- Component token workflow documented and established
- Component naming conventions finalized (strong, default, subtle + sentiments)
- Size naming conventions finalized (small, default, large)
- Explicit CSS class approach documented

---

## Version 2.3.0 (January 22, 2026)

### Foundation Complete

- Phase 1-5 COMPLETE: Repository, tokens, core, Icon, and Button components
- 376 semantic tokens generating successfully
- Build pipeline verified and working

---

**Built by Jeffrey Lauwers**
