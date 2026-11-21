# Design Tokens Reference

**Last Updated:** May 1, 2026

Complete reference for all design tokens in the Design System Starter Kit.

---

## Table of Contents

1. [Typography](#typography)
2. [Spacing](#spacing)
3. [Sizing](#sizing)
4. [Colors](#colors)
5. [Borders](#borders)
6. [Focus States](#focus-states)
7. [Box Shadows](#box-shadows)
8. [Z-Index](#z-index)
9. [Motion](#motion)
10. [Breakpoints](#breakpoints)

---

## Typography

### Font Family

#### Start Theme

```json
{
  "dsn": {
    "text": {
      "font-family": {
        "default": "Fira Sans, sans-serif",
        "monospace": "Fira Mono, monospace"
      }
    },
    "heading": {
      "font-family": "Fira Sans, sans-serif"
    }
  }
}
```

#### Wireframe Theme

```json
{
  "dsn": {
    "text": {
      "font-family": {
        "default": "'Comic Sans MS', 'Comic Sans', 'Comic Neue', cursive",
        "monospace": "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, monospace"
      }
    }
  }
}
```

### Font Weight

- `default`: 400
- `bold`: 700

### Fluid scale and densities

Font sizes and spacing grow with the viewport between `dsn.viewport.min-inline-size` (360px) and `dsn.viewport.max-inline-size` (1440px). Below 360px a token stays at its **min** value, above 1440px at its **max** value, and in between it grows in a straight line. 1440 / 360 = 4, the same factor as the 400% zoom from WCAG 1.4.10.

Every size has its own min and max token in the theme (`themes/*/base.json`), so a white-label organisation can deviate per size. By default every max is the min × 1.25.

```json
"font-size": {
  "min": { "md": { "$value": "1rem" } },
  "max": { "md": { "$value": "calc(1rem * 1.25)" } }
}
```

A project type decides per size whether it is fluid, with `fluid({min}, {max})`. The build (`dsn/fluid` transform in `src/config/config.js`) turns that into a `clamp()`:

```json
// project-types/default/typography.json
"md": { "$value": "fluid({dsn.text.font-size.min.md}, {dsn.text.font-size.max.md})" }
```

```css
--dsn-text-font-size-md: clamp(1rem, 0.91667rem + 0.37037vw, 1.25rem);
```

| Density (project type) | Font sizes         | Spacing            |
| ---------------------- | ------------------ | ------------------ |
| `default`              | fluid              | fluid              |
| `information-dense`    | fixed (min values) | fixed (min values) |

Not scaled on purpose: spacing sizes of 1px and 2px (min = max), the pointer target (3rem), borders and layout widths.

### Font Size

| Token | Min (360px) | Max (1440px) | Information-dense |
| ----- | ----------- | ------------ | ----------------- |
| `sm`  | 14px        | 17.5px       | 14px              |
| `md`  | 16px        | 20px         | 16px              |
| `lg`  | 20px        | 25px         | 20px              |
| `xl`  | 24px        | 30px         | 24px              |
| `2xl` | 32px        | 40px         | 32px              |
| `3xl` | 40px        | 50px         | 40px              |
| `4xl` | 48px        | 60px         | 48px              |

### Line Height

**Coupled to font-size** (percentage-based)

| Token | Value | Use Case       |
| ----- | ----- | -------------- |
| `sm`  | 150%  | Small text     |
| `md`  | 150%  | Body text      |
| `lg`  | 125%  | Large text     |
| `xl`  | 125%  | Headings       |
| `2xl` | 125%  | Large headings |
| `3xl` | 125%  | Display text   |
| `4xl` | 110%  | Hero text      |

---

## Spacing

### Base Unit

- **Value:** 0.5rem (8px)
- **Purpose:** Base unit for 8pt grid system

### None

- `none`: 0px — Explicitly no spacing; use instead of hardcoded `0` in component tokens.

### Spacing Concepts

**5 Concepts:**

1. **Block** - Vertical spacing within components
2. **Inline** - Horizontal spacing within components
3. **Text** - Spacing between text and icons
4. **Column** - Horizontal spacing between components
5. **Row** - Vertical spacing between components

### Spacing Scale

**Min values calculated from `space-base` (0.5rem = 8px); max = min × 1.25.** In the `default` density the value grows from min to max; in `information-dense` it stays at min. Tokens: `dsn.space.{block,inline,text,column,row}.{size}`, with `.min.{size}` and `.max.{size}` in the theme.

| Token | Multiplier | Min (360px) | Max (1440px) | Use Case            |
| ----- | ---------- | ----------- | ------------ | ------------------- |
| `2xs` | 0.125      | 1px         | 1px (fixed)  | Hairline spacing    |
| `xs`  | 0.25       | 2px         | 2px (fixed)  | Minimal spacing     |
| `sm`  | 0.5        | 4px         | 5px          | Tight spacing       |
| `md`  | 1          | 8px         | 10px         | Default spacing     |
| `lg`  | 1.5        | 12px        | 15px         | Comfortable spacing |
| `xl`  | 2          | 16px        | 20px         | Loose spacing       |
| `2xl` | 2.5        | 20px        | 25px         | Section spacing     |
| `3xl` | 3          | 24px        | 30px         | Large spacing       |
| `4xl` | 4          | 32px        | 40px         | Extra large spacing |
| `5xl` | 6/8        | 48px/64px   | 60px/80px    | Section breaks      |
| `6xl` | 8/20       | 64px/160px  | 80px/200px   | Major sections      |

`5xl` and `6xl` differ per concept: block and inline use 6 and 8, column and row use 8 and 20. Text spacing runs from `3xs` (1px) to `3xl`.

---

## Sizing

### Icon Sizes

**Fluid, coupled to typography** (`font-size × line-height`)

Icon sizes scale fluidly with the viewport because they reference the fluid font-size tokens. Checkbox and radio sizes use the same calculation, so they scale along:

```css
--dsn-icon-size-md: calc(
  var(--dsn-text-font-size-md) * var(--dsn-text-line-height-md)
);
```

| Token | Calculation                       | Start at 360px | Start at 1440px |
| ----- | --------------------------------- | -------------- | --------------- |
| `sm`  | `font-size.sm × line-height.sm`   | 21px           | 26.25px         |
| `md`  | `font-size.md × line-height.md`   | 24px           | 30px            |
| `lg`  | `font-size.lg × line-height.lg`   | 25px           | 31.25px         |
| `xl`  | `font-size.xl × line-height.xl`   | 30px           | 37.5px          |
| `2xl` | `font-size.2xl × line-height.2xl` | 40px           | 50px            |
| `3xl` | `font-size.3xl × line-height.3xl` | 50px           | 62.5px          |
| `4xl` | `font-size.4xl × line-height.4xl` | 52.8px         | 66px            |

### Pointer Target (WCAG)

- **min-block-size:** 3rem (48px)
- **min-inline-size:** 3rem (48px)
- **Rationale:** WCAG 2.5.5 Target Size compliance

### Content Sizing

Maximum width constraints for page layout and readable text lines.

| Token                      | CSS Variable                 | Value | Purpose                                            |
| -------------------------- | ---------------------------- | ----- | -------------------------------------------------- |
| `dsn.page.max-inline-size` | `--dsn-page-max-inline-size` | 75rem | Maximum content width within page-level components |
| `dsn.text.max-inline-size` | `--dsn-text-max-inline-size` | 65ch  | Maximum line length for readable body text         |

### Form Control Sizing

Inline-size presets based on expected character count, and a default maximum inline-size cap. Not every form control offers every preset: TextArea, EmailInput, PasswordInput, TelephoneInput and SearchInput leave out `xs` and `sm`.

| Token                               | CSS Variable                          | Value | Purpose                                            |
| ----------------------------------- | ------------------------------------- | ----- | -------------------------------------------------- |
| `dsn.form-control.max-inline-size`  | `--dsn-form-control-max-inline-size`  | 25rem | Default maximum inline-size when no preset applies |
| `dsn.form-control.inline-size.xs`   | `--dsn-form-control-inline-size-xs`   | 10ch  | Very short inputs (postal code, year, CVV)         |
| `dsn.form-control.inline-size.sm`   | `--dsn-form-control-inline-size-sm`   | 14ch  | Short inputs (time HH:MM, short codes)             |
| `dsn.form-control.inline-size.md`   | `--dsn-form-control-inline-size-md`   | 20ch  | Medium inputs (date, phone number)                 |
| `dsn.form-control.inline-size.lg`   | `--dsn-form-control-inline-size-lg`   | 32ch  | Standard inputs (name, email) — default            |
| `dsn.form-control.inline-size.xl`   | `--dsn-form-control-inline-size-xl`   | 48ch  | Longer inputs (URL)                                |
| `dsn.form-control.inline-size.full` | `--dsn-form-control-inline-size-full` | 100%  | Full inline-size, responsive to container          |

---

## Colors

### Color Sets (14 total)

**Base Sets:**

1. `neutral` - Interface grays
2. `accent-1` - Primary accent (for primary brand color)
3. `accent-2` - Secondary accent (for secondary brand color)
4. `accent-3` - Tertiary accent (for tertiary brand color)
5. `action-1` - Primary actions (buttons)
6. `action-2` - Secondary actions (links, navigation)
7. `info` - Informational messages
8. `negative` - Errors, destructive actions
9. `positive` - Success, confirmation
10. `warning` - Warnings

**Inverse Variants:**

11. `neutral-inverse`
12. `accent-1-inverse`, `accent-2-inverse`, `accent-3-inverse`
13. `action-1-inverse`, `action-2-inverse`
14. `info-inverse`, `negative-inverse`, `positive-inverse`, `warning-inverse`

### Color Properties (per set)

Each color set has 14 properties:

**Backgrounds:**

- `bg-document` - Document/page background
- `bg-subtle` - Subtle background
- `bg-default` - Default background
- `bg-hover` - Hover state background
- `bg-active` - Active state background

**Borders:**

- `border-subtle` - Subtle border
- `border-default` - Default border
- `border-hover` - Hover state border
- `border-active` - Active state border

**Text/Foreground:**

- `color-default` - Default text color
- `color-hover` - Hover state text
- `color-active` - Active state text
- `color-subtle` - Subtle text color
- `color-document` - Document/body text color

### Example Usage

```css
/* Using neutral color set */
background-color: var(--dsn-color-neutral-bg-default);
border-color: var(--dsn-color-neutral-border-default);
color: var(--dsn-color-neutral-color-default);

/* Hover state */
.button:hover {
  background-color: var(--dsn-color-action-1-bg-hover);
  color: var(--dsn-color-action-1-color-hover);
}
```

---

## Borders

### Border Radius

#### Start Theme

- `square`: 0px — Explicitly no border radius; used for alerts, checkboxes, form controls
- `sm`: 4px
- `md`: 8px
- `lg`: 16px
- `round`: 999px

#### Wireframe Theme

- `square`: 0px
- `sm`: 2px
- `md`: 4px
- `lg`: 8px
- `round`: 999px

### Border Width

- `none`: 0px — Explicitly no border; used to reset fieldset borders (checkbox-group, radio-group)
- `thin`: 1px
- `medium`: 2px
- `thick`: 4px

---

## Focus States

**Universal focus indicators for accessibility**

Focus indicators use a dual-outline technique: a primary `outline` for the main indicator and a `box-shadow` for an inverse outline behind it, ensuring visibility on all background colors.

```css
/* Focus pattern used by all interactive components */
.component:focus-visible {
  background-color: var(--dsn-focus-background-color);
  color: var(--dsn-focus-color);
  outline: var(--dsn-focus-outline-width) var(--dsn-focus-outline-style)
    var(--dsn-focus-outline-color);
  outline-offset: var(--dsn-focus-outline-offset);
  box-shadow: 0 0 0
    calc(var(--dsn-focus-outline-offset) + var(--dsn-focus-outline-width))
    var(--dsn-focus-inverse-outline-color);
}
```

### Start Theme (GOV.UK style)

- `background-color`: #ffdd00 (yellow)
- `color`: #0b0c0c (black)
- `outline-color`: #0b0c0c (black)
- `inverse.outline-color`: #ffdd00 (yellow)
- `outline-offset`: 0px
- `outline-style`: dashed
- `outline-width`: 2px

### Wireframe Theme (black & white + yellow focus)

- `background-color`: #ffdd00 (yellow)
- `color`: #000000 (black)
- `outline-color`: #000000 / #FFFFFF (light/dark)
- `inverse.outline-color`: #FFFFFF / #000000 (light/dark)
- `outline-offset`: 2px
- `outline-style`: solid
- `outline-width`: 2px

---

## Box Shadows

Elevation shadows communicate depth. Each shadow is composed of two drop shadow layers (direct + ambient) and a spread-only outline layer (highlight). Only the color tokens differ between light and dark mode.

| Token                 | CSS Variable            | Start Theme                  | Wireframe Theme |
| --------------------- | ----------------------- | ---------------------------- | --------------- |
| `dsn.box-shadow.none` | `--dsn-box-shadow-none` | `none`                       | `none`          |
| `dsn.box-shadow.sm`   | `--dsn-box-shadow-sm`   | 2-layer shadow + 1px outline | `none` (flat)   |
| `dsn.box-shadow.md`   | `--dsn-box-shadow-md`   | 2-layer shadow + 1px outline | `none` (flat)   |
| `dsn.box-shadow.lg`   | `--dsn-box-shadow-lg`   | 2-layer shadow + 1px outline | `none` (flat)   |

**Usage:** `sm` for cards/chips, `md` for dropdowns/tooltips, `lg` for modals/dialogs. The wireframe theme intentionally flattens all elevation to `none`.

---

## Z-Index

Z-index tokens define the stacking order of UI layers. The token name matches its numeric value, leaving room to insert intermediate levels.

| Token             | CSS Variable        | Value | Used by                          |
| ----------------- | ------------------- | ----- | -------------------------------- |
| `dsn.z-index.300` | `--dsn-z-index-300` | 300   | PageHeader (sticky/auto-hide)    |
| `dsn.z-index.350` | `--dsn-z-index-350` | 350   | Popover, tooltips, dropdowns     |
| `dsn.z-index.400` | `--dsn-z-index-400` | 400   | Backdrop (behind modals/drawers) |
| `dsn.z-index.500` | `--dsn-z-index-500` | 500   | ModalDialog, Drawer              |
| `dsn.z-index.600` | `--dsn-z-index-600` | 600   | SkipLink (always on top — a11y)  |

Z-index tokens are identical across all themes and modes.

---

## Motion

### Transition Duration

Five semantic durations for UI transitions. All are set to `0ms` under `@media (prefers-reduced-motion: reduce)`.

| Token   | CSS Variable                        | Value |
| ------- | ----------------------------------- | ----- |
| instant | `--dsn-transition-duration-instant` | 0ms   |
| fast    | `--dsn-transition-duration-fast`    | 100ms |
| normal  | `--dsn-transition-duration-normal`  | 200ms |
| slow    | `--dsn-transition-duration-slow`    | 350ms |
| slower  | `--dsn-transition-duration-slower`  | 500ms |

### Transition Easing

Five semantic easing curves for consistent motion feel.

| Token   | CSS Variable                      | Value                              |
| ------- | --------------------------------- | ---------------------------------- |
| default | `--dsn-transition-easing-default` | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| enter   | `--dsn-transition-easing-enter`   | `cubic-bezier(0, 0, 0.2, 1)`       |
| exit    | `--dsn-transition-easing-exit`    | `cubic-bezier(0.4, 0, 1, 1)`       |
| move    | `--dsn-transition-easing-move`    | `cubic-bezier(0.4, 0, 0.2, 1)`     |
| linear  | `--dsn-transition-easing-linear`  | `linear`                           |

**Usage in components:**

```css
.dsn-button {
  transition:
    background-color var(--dsn-transition-duration-normal)
      var(--dsn-transition-easing-default),
    color var(--dsn-transition-duration-normal)
      var(--dsn-transition-easing-default),
    border-color var(--dsn-transition-duration-normal)
      var(--dsn-transition-easing-default);
}
```

**Reduced motion:** All duration tokens resolve to `0ms` via a central `@media (prefers-reduced-motion: reduce)` block appended to every full CSS configuration: no component-level media queries needed.

---

## Token Statistics

**Total Tokens (as of v5.34.0):**

- Semantic tokens: ~435 per configuration (incl. content sizing, form control sizing, box shadows, z-index, breakpoints)
- Component tokens: ~700 (component JSON files per categorie: layout, content, display/feedback, navigation, branding, form)
- **Total: ~1135+ tokens per full configuration**
- **Total configurations: 12** (2 themes × 2 modes × 3 project types)

---

## Breakpoints

Reference breakpoints for responsive design. Available as CSS custom properties for JavaScript use, but **cannot be used inside CSS `@media` rules** — browsers do not resolve custom properties in media queries. Use the hardcoded `em` values directly in CSS.

| Token               | CSS Variable          | Value | Approx. px |
| ------------------- | --------------------- | ----- | ---------- |
| `dsn.breakpoint.sm` | `--dsn-breakpoint-sm` | 36em  | ~576px     |
| `dsn.breakpoint.md` | `--dsn-breakpoint-md` | 44em  | ~704px     |
| `dsn.breakpoint.lg` | `--dsn-breakpoint-lg` | 64em  | ~1024px    |
| `dsn.breakpoint.xl` | `--dsn-breakpoint-xl` | 74em  | ~1184px    |

---

## Related Documentation

- **[Architecture](./01-architecture.md)** - Token architecture and three-axis model
- **[Components](./03-components.md)** - How components use tokens
- **[Development Workflow](./04-development-workflow.md)** - Adding and updating tokens
