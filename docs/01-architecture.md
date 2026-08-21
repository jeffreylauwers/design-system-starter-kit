# Architecture

**Last Updated:** March 5, 2026

This document describes the architecture of the Design System Starter Kit, including the token system, configuration model, and repository structure.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Token Architecture](#token-architecture)
4. [Three-Axis Configuration Model](#three-axis-configuration-model)
5. [Themes](#themes)
6. [Token Naming Convention](#token-naming-convention)

---

## Project Overview

### Repository Details

- **Name:** `design-system-starter-kit`
- **Package Scope:** `@dsn-starter-kit/*` (customizable per organization when forking)
- **Package Manager:** PNPM (with workspaces)
- **License:** MIT
- **Purpose:** Production-ready design system starter kit for organizations

### Key Principles

- **Scalable:** Built for growth from day one
- **Themeable:** Full multi-theme and light/dark mode support
- **Accessible:** WCAG compliant from the start
- **Framework Agnostic:** Tokens work everywhere
- **Developer Friendly:** Clear naming, good DX
- **Mobile-First:** Responsive design from smallest screens up

---

## Repository Structure

```
design-system-starter-kit/
├── .github/
│   └── workflows/
│       ├── ci.yml                # Lint, type-check, test, build
│       └── release.yml
├── .husky/
│   └── pre-commit               # Runs lint-staged
├── packages/
│   ├── design-tokens/           # @dsn-starter-kit/design-tokens
│   │   └── src/
│   │       ├── config/
│   │       │   ├── build.js     # Multi-config build script
│   │       │   ├── build-figma.js # Schrijft dist/figma/variables.json
│   │       │   ├── figma.js     # Token -> Figma variable conversie
│   │       │   └── config.js    # Configuration matrix
│   │       └── tokens/
│   │           ├── themes/
│   │           │   ├── start/
│   │           │   │   ├── base.json          # Typography, spacing, sizing, borders, focus
│   │           │   │   ├── colors-light.json  # Light mode colors
│   │           │   │   └── colors-dark.json   # Dark mode colors
│   │           │   └── wireframe/
│   │           │       ├── base.json          # System fonts, minimal borders
│   │           │       ├── colors-light.json  # Grayscale colors
│   │           │       └── colors-dark.json   # Inverted grayscale
│   │           ├── project-types/
│   │           │   ├── default/
│   │           │   │   └── typography.json    # Fluid clamp() font-sizes
│   │           │   └── information-dense/
│   │           │       └── typography.json    # Fixed font-sizes
│   │           └── components/
│   │               ├── alert.json
│   │               ├── button.json
│   │               ├── checkbox.json
│   │               ├── checkbox-group.json
│   │               ├── checkbox-option.json
│   │               ├── date-input.json
│   │               ├── date-input-group.json
│   │               ├── form-field.json
│   │               ├── form-field-description.json
│   │               ├── form-field-error-message.json
│   │               ├── form-field-label.json
│   │               ├── form-field-label-suffix.json
│   │               ├── form-field-status.json
│   │               ├── heading.json
│   │               ├── link.json
│   │               ├── note.json
│   │               ├── option-label.json
│   │               ├── ordered-list.json
│   │               ├── paragraph.json
│   │               ├── password-input.json
│   │               ├── radio.json
│   │               ├── radio-group.json
│   │               ├── radio-option.json
│   │               ├── search-input.json
│   │               ├── select.json
│   │               ├── status-badge.json
│   │               ├── text-area.json
│   │               ├── text-input.json
│   │               ├── time-input.json
│   │               └── unordered-list.json
│   ├── core/                    # @dsn-starter-kit/core
│   ├── components-html/         # @dsn-starter-kit/components-html
│   │   ├── manifest.json        # Framework-agnostic component manifest (AI + tooling)
│   │   └── manifest.d.ts        # TypeScript types for manifest.json
│   ├── components-react/        # @dsn-starter-kit/components-react
│   │   └── scripts/
│   │       └── generate-icons.js # Icon registry generator
│   ├── components-web/          # @dsn-starter-kit/components-web
│   ├── figma-sync/              # Genereert Figma node specs uit de HTML/CSS-laag
│   │   └── src/
│   │       ├── extract.js       # Headless render, leest computed styles
│   │       ├── to-figma.js      # Computed DOM -> Figma node spec
│   │       └── matrices/        # Variant-matrix per component
│   ├── figma-plugin/            # Schrijft de gegenereerde JSON naar Figma
│   │   ├── manifest.json        # Plugin-manifest (importeren in Figma Desktop)
│   │   ├── scripts/             # Mock van de Plugin API + smoke test
│   │   └── src/
│   └── storybook/               # Documentation site
│       ├── .storybook/
│       │   ├── main.ts          # Storybook config + multilevel-sort
│       │   ├── preview.ts       # Decorator, toolbar controls, storySort
│       │   ├── preview-head.html # Dynamic token loading script
│       │   └── preview-body.css # Preview iframe styles
│       └── src/
│           ├── {Component}.stories.tsx  # Stories per component
│           ├── {Component}.docs.mdx     # MDX docs page (attached to stories)
│           └── {Component}.docs.md      # Dutch documentation content
├── docs/
│   ├── README.md                # This documentation index
│   ├── 01-architecture.md       # This file
│   ├── 02-design-tokens-reference.md
│   ├── 03-components.md
│   ├── 04-development-workflow.md
│   ├── 05-storybook-configuration.md
│   ├── decisions/               # Decision records (DR-YYYY-NN)
│   └── changelog.md
├── .eslintrc.js                 # ESLint config (ignores *.generated.*)
├── tsconfig.json                # Root TypeScript config
├── vitest.config.ts             # Test configuration
├── package.json
├── pnpm-workspace.yaml
└── LICENSE (MIT)
```

---

## Token Architecture

### Three-Tier Structure

#### 1. Primitive Level (REMOVED)

**Decision:** No primitive color layer. Hardcoded hex values directly in semantic tokens.

**Rationale:** Simplicity for v1. Future feature will generate color palettes programmatically.

#### 2. Semantic Level (`dsn.*`)

**Purpose:** Brand-agnostic, meaningful tokens

**Prefix:** `dsn` (Design System Name)

**Examples:** `dsn.color.neutral.*`, `dsn.space.block.*`, `dsn.text.font-size.*`

#### 3. Component Level (`dsn.button.*`, etc.)

**Purpose:** Component-specific tokens

**Reference:** Semantic tokens only

**Examples:** `dsn.button.strong.background-color`, `dsn.button.size.small.font-size`

### Token Hierarchy

```
Component CSS → Component Tokens → Semantic Tokens → Values
```

**Why Component Tokens:**

- Central definition of component styling
- Easy theming (change tokens, not CSS)
- Multi-brand support
- Consistent with design token standards
- Scalable architecture

---

## Three-Axis Configuration Model

### Overview

Tokens are organized in a **three-axis configuration model** that enables flexible theming:

| Axis             | Values                         | Affects                                                  |
| ---------------- | ------------------------------ | -------------------------------------------------------- |
| **Theme**        | `start`, `wireframe`, ...      | All tokens (typography, spacing, borders, focus, colors) |
| **Mode**         | `light`, `dark`                | Only color tokens                                        |
| **Project Type** | `default`, `information-dense` | Only font-size tokens                                    |

This creates a matrix of configurations: **Theme × Mode × Project Type = 8 combinations**

```
start-light-default
start-light-information-dense
start-dark-default
start-dark-information-dense
wireframe-light-default
wireframe-light-information-dense
wireframe-dark-default
wireframe-dark-information-dense
```

### Why Three Axes?

- **Theme**: Defines the visual identity/branding. Different clients or products can have their own theme while sharing the same component library.
- **Mode**: Light/dark color schemes. Users can switch modes without changing the theme.
- **Project Type**: Typography density. Information-dense applications (dashboards, data tables) use fixed font sizes, while marketing sites use fluid typography.

### Token File Distribution

| Token Category                                | Location                               | Axis                   |
| --------------------------------------------- | -------------------------------------- | ---------------------- |
| Typography (font-family, weight, line-height) | `themes/{name}/base.json`              | Theme                  |
| Spacing                                       | `themes/{name}/base.json`              | Theme                  |
| Sizing                                        | `themes/{name}/base.json`              | Theme                  |
| Borders                                       | `themes/{name}/base.json`              | Theme                  |
| Focus                                         | `themes/{name}/base.json`              | Theme                  |
| Colors                                        | `themes/{name}/colors-{mode}.json`     | Theme + Mode           |
| Font sizes                                    | `project-types/{name}/typography.json` | Project Type           |
| Component tokens                              | `components/*.json`                    | N/A (references above) |

### Build System

The build system generates all configurations automatically:

```javascript
// config.js
const themes = ['start', 'wireframe'];
const modes = ['light', 'dark'];
const projectTypes = ['default', 'information-dense'];

// Generates 8 full configurations
for (const theme of themes) {
  for (const mode of modes) {
    for (const projectType of projectTypes) {
      buildConfig(`${theme}-${mode}-${projectType}`, {
        sources: [
          `themes/${theme}/base.json`,
          `themes/${theme}/colors-${mode}.json`,
          `project-types/${projectType}/typography.json`,
          'components/*.json',
        ],
      });
    }
  }
}
```

**Output:**

- `dist/css/{theme}-{mode}-{projectType}.css` (8 files)
- `dist/scss/_{theme}-{mode}-{projectType}.scss` (8 files)
- `dist/js/{theme}-{mode}-{projectType}.js` (8 files)
- `dist/js/{theme}-{mode}-{projectType}.d.ts` (8 files)
- `dist/json/{theme}-{mode}-{projectType}.json` (8 files)
- Plus backward compatibility aliases

### Backward Compatibility

For existing consumers, these aliases are maintained:

| Alias                            | Points To                   |
| -------------------------------- | --------------------------- |
| `dist/css/variables.css`         | `start-light-default.css`   |
| `dist/css/variables-dark.css`    | `start-dark-default.css`    |
| `dist/scss/_variables.scss`      | `_start-light-default.scss` |
| `dist/scss/_variables-dark.scss` | `_start-dark-default.scss`  |
| `dist/js/tokens.js`              | `start-light-default.js`    |
| `dist/js/tokens-dark.js`         | `start-dark-default.js`     |

---

## Themes

### Available Themes

#### Start Theme (Default)

The full-featured default theme with brand colors and polished styling.

- **Font**: IBM Plex Sans / IBM Plex Mono
- **Border radius**: 4px (sm), 8px (md), 16px (lg)
- **Colors**: Full brand palette with blues, greens, reds, oranges
- **Focus**: Yellow background with dashed outline (GOV.UK style)

#### Wireframe Theme

A minimal theme for prototyping and development.

- **Font**: Comic Sans MS (for clear wireframe distinction)
- **Border radius**: 2px (sm), 4px (md), 8px (lg): more minimal
- **Border width**: 2px (thin), 4px (medium), 8px (thick): thicker than start
- **Colors**: Pure black & white: all color scales (accent, action, info, positive, negative, warning) alias to neutral
- **Light mode**: backgrounds #FFFFFF, text/borders #000000
- **Dark mode**: backgrounds #000000, text/borders #FFFFFF
- **Focus**: Yellow (#ffdd00) background with solid black/white outline

### Adding a New Theme

1. Create a new folder under `src/tokens/themes/`:

   ```
   src/tokens/themes/my-theme/
   ├── base.json
   ├── colors-light.json
   └── colors-dark.json
   ```

2. Copy an existing theme as a starting point:

   ```bash
   cp -r src/tokens/themes/start src/tokens/themes/my-theme
   ```

3. Update `src/config/config.js` to include your theme:

   ```js
   const themes = ['start', 'wireframe', 'my-theme'];
   ```

4. Customize the token values in your new theme files.

5. Build:
   ```bash
   pnpm --filter @dsn-starter-kit/design-tokens build
   ```

### Adding a New Project Type

1. Create a new folder under `src/tokens/project-types/`:

   ```
   src/tokens/project-types/my-density/
   └── typography.json
   ```

2. Define font-size tokens (must include all sizes: sm, md, lg, xl, 2xl, 3xl, 4xl):

   ```json
   {
     "dsn": {
       "text": {
         "font-size": {
           "sm": { "value": "0.75rem" },
           "md": { "value": "0.875rem" },
           "lg": { "value": "1rem" },
           "xl": { "value": "1.125rem" },
           "2xl": { "value": "1.25rem" },
           "3xl": { "value": "1.5rem" },
           "4xl": { "value": "1.875rem" }
         }
       }
     }
   }
   ```

3. Update `src/config/config.js`:

   ```js
   const projectTypes = ['default', 'information-dense', 'my-density'];
   ```

4. Build.

### Runtime Theme Switching

For applications that need to switch themes at runtime, use fetch + style injection for reliable CSS cascade:

```ts
let currentStyleElement: HTMLStyleElement | null = null;

async function loadTheme(theme: string, mode: string, projectType: string) {
  const configName = `${theme}-${mode}-${projectType}`;
  const url = `/path/to/design-tokens/dist/css/${configName}.css`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load: ${url}`);
    const cssText = await response.text();

    // Remove existing dynamic style
    if (currentStyleElement?.parentNode) {
      currentStyleElement.remove();
    }

    // Create new style element with higher specificity
    currentStyleElement = document.createElement('style');
    currentStyleElement.setAttribute('data-dsn-tokens', configName);
    // Use :root:root for higher specificity to override bundled CSS
    currentStyleElement.textContent = cssText.replace(':root', ':root:root');

    // Append to end of head for cascade priority
    document.head.appendChild(currentStyleElement);

    // Dispatch event for components that need to react
    window.dispatchEvent(
      new CustomEvent('dsn-theme-changed', {
        detail: { theme, mode, projectType, configName },
      })
    );
  } catch (error) {
    console.error('Theme load error:', error);
  }
}

// Examples:
loadTheme('start', 'dark', 'default'); // Dark mode
loadTheme('wireframe', 'light', 'default'); // Wireframe theme
loadTheme('start', 'light', 'information-dense'); // Dense typography
```

#### Why fetch + style injection?

Using `<link>` tags for runtime theme switching can cause CSS cascade issues when the application also bundles token CSS via build tools (Vite, webpack). The bundled CSS may load after the dynamic `<link>`, causing the wrong values to win.

**Solution:**

1. **fetch()** the CSS file as text
2. **Inject as `<style>`** element at the end of `<head>`
3. **Use `:root:root`** selector for higher specificity
4. **MutationObserver** (optional) to ensure style stays last if other scripts add styles

This pattern is used in the Storybook configuration (`preview-head.html`) and ensures reliable theme switching.

---

## Token Naming Convention

### Pattern

```
{prefix}.{category}.{concept}.{property}.{state}.{variant}
```

### Ordering Rules

1. Nesting depth (general → specific)
2. States (active, checked, disabled, focus, focus-visible, hover, visited)
3. Variants (inverse, sizes)
4. Alphabetical within same level

### Examples

```
dsn.color.neutral.bg-default
dsn.color.neutral.bg-hover
dsn.color.neutral.bg-active
dsn.button.strong.background-color
dsn.button.strong.hover.background-color
dsn.button.size.small.font-size
```

---

## Related Documentation

- **[Design Tokens Reference](./02-design-tokens-reference.md)** - All token values and scales
- **[Components](./03-components.md)** - Component specifications
- **[Development Workflow](./04-development-workflow.md)** - Token update workflow
