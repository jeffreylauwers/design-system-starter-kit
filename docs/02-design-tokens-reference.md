# Design Tokens Reference

**Last Updated:** March 15, 2026

Complete reference for all design tokens in the Design System Starter Kit.

---

## Table of Contents

1. [Typography](#typography)
2. [Spacing](#spacing)
3. [Sizing](#sizing)
4. [Colors](#colors)
5. [Borders](#borders)
6. [Focus States](#focus-states)
7. [Motion](#motion)

---

## Typography

### Font Family

#### Start Theme

```json
{
  "dsn": {
    "text": {
      "font-family": {
        "default": "IBM Plex Sans, sans-serif",
        "monospace": "IBM Plex Mono, monospace"
      }
    },
    "heading": {
      "font-family": "IBM Plex Sans, sans-serif"
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

### Font Size (Project Type: Default - Fluid)

**Base:** `clamp(min, preferred, max)`

**Viewport range:** 400px → 1200px

| Token | Min (400px) | Preferred          | Max (1200px) |
| ----- | ----------- | ------------------ | ------------ |
| `sm`  | 14px        | 0.75rem + 0.25vw   | 17px         |
| `md`  | 16px        | 0.875rem + 0.375vw | 20.5px       |
| `lg`  | 20px        | 1.125rem + 0.375vw | 24.5px       |
| `xl`  | 24px        | 1.25rem + 0.625vw  | 31px         |
| `2xl` | 32px        | 1.75rem + 0.75vw   | 41px         |
| `3xl` | 40px        | 2.125rem + 1.125vw | 53px         |
| `4xl` | 48px        | 2.5rem + 1.5vw     | 66px         |

### Font Size (Project Type: Information-Dense - Fixed)

| Token | Value           | Comment             |
| ----- | --------------- | ------------------- |
| `sm`  | 0.875rem (14px) | Small text - fixed  |
| `md`  | 1rem (16px)     | Medium text - fixed |
| `lg`  | 1.125rem (18px) | Large text - fixed  |
| `xl`  | 1.25rem (20px)  | Extra large - fixed |
| `2xl` | 1.5rem (24px)   | 2x large - fixed    |
| `3xl` | 1.875rem (30px) | 3x large - fixed    |
| `4xl` | 2.25rem (36px)  | 4x large - fixed    |

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

### Spacing Concepts

**5 Concepts:**

1. **Block** - Vertical spacing within components
2. **Inline** - Horizontal spacing within components
3. **Text** - Spacing between text and icons
4. **Column** - Horizontal spacing between components
5. **Row** - Vertical spacing between components

### Spacing Scale

**All values calculated from `space-base` (0.5rem = 8px)**

| Token | Multiplier | Value      | Use Case            |
| ----- | ---------- | ---------- | ------------------- |
| `2xs` | 0.125      | 1px        | Hairline spacing    |
| `xs`  | 0.25       | 2px        | Minimal spacing     |
| `sm`  | 0.5        | 4px        | Tight spacing       |
| `md`  | 1          | 8px        | Default spacing     |
| `lg`  | 1.5        | 12px       | Comfortable spacing |
| `xl`  | 2          | 16px       | Loose spacing       |
| `2xl` | 2.5        | 20px       | Section spacing     |
| `3xl` | 3          | 24px       | Large spacing       |
| `4xl` | 4          | 32px       | Extra large spacing |
| `5xl` | 6/8        | 48px/64px  | Section breaks      |
| `6xl` | 8/20       | 64px/160px | Major sections      |

---

## Sizing

### Icon Sizes

**Fluid, coupled to typography** (`font-size × line-height`)

Icon sizes scale fluidly with the viewport because they reference the fluid `clamp()` font-size tokens:

```css
--dsn-icon-size-md: calc(
  var(--dsn-text-font-size-md) * var(--dsn-text-line-height-md)
);
```

| Token | Calculation                       | Approx. at 400px | Approx. at 1200px |
| ----- | --------------------------------- | ---------------- | ----------------- |
| `sm`  | `font-size.sm × line-height.sm`   | 21px             | 25.5px            |
| `md`  | `font-size.md × line-height.md`   | 24px             | 30.75px           |
| `lg`  | `font-size.lg × line-height.lg`   | 25px             | 30.6px            |
| `xl`  | `font-size.xl × line-height.xl`   | 30px             | 38.75px           |
| `2xl` | `font-size.2xl × line-height.2xl` | 40px             | 51.25px           |
| `3xl` | `font-size.3xl × line-height.3xl` | 50px             | 66.25px           |
| `4xl` | `font-size.4xl × line-height.4xl` | 52.8px           | 72.6px            |

### Pointer Target (WCAG)

- **min-block-size:** 3rem (48px)
- **min-inline-size:** 3rem (48px)
- **Rationale:** WCAG 2.5.5 Target Size compliance

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

- `sm`: 4px
- `md`: 8px
- `lg`: 16px
- `round`: 999px

#### Wireframe Theme

- `sm`: 2px
- `md`: 4px
- `lg`: 8px
- `round`: 999px

### Border Width

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

**Reduced motion:** All duration tokens resolve to `0ms` via a central `@media (prefers-reduced-motion: reduce)` block appended to every full CSS configuration — no component-level media queries needed.

---

## Token Statistics

**Total Tokens (as of v4.9.0):**

- Semantic tokens: ~400 per configuration
- Component tokens: ~700 (30 component JSON files — 9 content + 3 display/feedback + 25 form, incl. variant kleur-tokens Alert/Note/StatusBadge)
- **Total: ~1100+ tokens per full configuration**
- **Total configurations: 8** (2 themes × 2 modes × 2 project types)

---

## Related Documentation

- **[Architecture](./01-architecture.md)** - Token architecture and three-axis model
- **[Components](./03-components.md)** - How components use tokens
- **[Development Workflow](./04-development-workflow.md)** - Adding and updating tokens
