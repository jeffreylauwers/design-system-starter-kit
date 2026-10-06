# @dsn-starter-kit/design-tokens

Design tokens for the design system: the single source of truth for colors, typography, spacing, sizing, borders, shadows, and more.

## Architecture

Tokens are organized in a **three-axis configuration model**:

| Axis             | Values                         | Affects                                                  |
| ---------------- | ------------------------------ | -------------------------------------------------------- |
| **Theme**        | `start`, `wireframe`, ...      | All tokens (typography, spacing, borders, focus, colors) |
| **Mode**         | `light`, `dark`                | Only color tokens                                        |
| **Project Type** | `default`, `information-dense` | Only font-size tokens                                    |

This creates a matrix of configurations: **Theme × Mode × Project Type**.

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

## Folder Structure

```
src/tokens/
├── themes/
│   ├── start/                    # Default theme
│   │   ├── base.json             # Typography (excl font-size), spacing, sizing, borders, focus
│   │   ├── colors-light.json     # Light mode colors
│   │   └── colors-dark.json      # Dark mode colors
│   └── wireframe/                # Wireframe/prototype theme
│       ├── base.json             # System fonts, minimal borders
│       ├── colors-light.json     # Grayscale palette
│       └── colors-dark.json      # Inverted grayscale
├── project-types/
│   ├── default/
│   │   └── typography.json       # Fluid clamp() font-sizes
│   └── information-dense/
│       └── typography.json       # Fixed font-sizes
└── components/
    └── form-control.json         # Component-level semantic tokens
```

## Token Categories

### In Theme Base (`themes/*/base.json`)

- **Typography**: Font families, weights, line heights
- **Spacing**: 5 concepts (block, inline, text, column, row)
- **Sizing**: Icon sizes (coupled to typography)
- **Borders**: Radius and width values
- **Focus States**: Accessible focus indicators
- **Form Controls**: Structural tokens (spacing, borders)

### In Theme Colors (`themes/*/colors-*.json`)

- **Colors**: 10 semantic color sets with full state coverage
  - Neutral, Accent 1-3, Action 1-2, Positive, Negative, Warning, Info
  - Each with: bg, border, color × document, subtle, default, hover, active
  - Plus inverse variants for dark backgrounds

### In Project Type (`project-types/*/typography.json`)

- **Font Sizes**: sm, md, lg, xl, 2xl, 3xl, 4xl
  - `default`: Fluid sizes using `clamp()` for responsive scaling
  - `information-dense`: Fixed rem sizes for data-heavy UIs

## Installation

```bash
pnpm add @dsn-starter-kit/design-tokens
```

## Usage

### CSS Custom Properties

```css
/* Full configuration (recommended) */
@import '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css';

/* Or use backward-compatible aliases */
@import '@dsn-starter-kit/design-tokens/css'; /* → start-light-default */
@import '@dsn-starter-kit/design-tokens/css/dark'; /* → start-dark-default */
```

### Available Configurations

| Configuration                       | Description                                   |
| ----------------------------------- | --------------------------------------------- |
| `start-light-default`               | Start theme, light mode, fluid typography     |
| `start-light-information-dense`     | Start theme, light mode, fixed typography     |
| `start-dark-default`                | Start theme, dark mode, fluid typography      |
| `start-dark-information-dense`      | Start theme, dark mode, fixed typography      |
| `wireframe-light-default`           | Wireframe theme, light mode, fluid typography |
| `wireframe-light-information-dense` | Wireframe theme, light mode, fixed typography |
| `wireframe-dark-default`            | Wireframe theme, dark mode, fluid typography  |
| `wireframe-dark-information-dense`  | Wireframe theme, dark mode, fixed typography  |

### SCSS

```scss
@import '@dsn-starter-kit/design-tokens/dist/scss/start-light-default';

/* Or backward-compatible */
@import '@dsn-starter-kit/design-tokens/scss';
```

### JavaScript / TypeScript

```ts
import tokens from '@dsn-starter-kit/design-tokens/dist/js/start-light-default';

// Or backward-compatible
import tokens from '@dsn-starter-kit/design-tokens';
```

### Runtime Theme Switching

For applications that need to switch themes at runtime, import the full configuration CSS files dynamically:

```ts
function loadTheme(theme: string, mode: string, projectType: string) {
  const configName = `${theme}-${mode}-${projectType}`;

  // Remove existing theme stylesheet
  document.querySelector('[data-dsn-theme]')?.remove();

  // Load new configuration
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `/path/to/design-tokens/dist/css/${configName}.css`;
  link.setAttribute('data-dsn-theme', configName);
  document.head.appendChild(link);
}

// Example: Switch to wireframe dark mode
loadTheme('wireframe', 'dark', 'default');
```

## Output Formats

Built with [Style Dictionary](https://amzn.github.io/style-dictionary/), tokens are exported as:

| Format                 | Path Pattern                                   |
| ---------------------- | ---------------------------------------------- |
| CSS Custom Properties  | `dist/css/{theme}-{mode}-{projectType}.css`    |
| SCSS Variables         | `dist/scss/_{theme}-{mode}-{projectType}.scss` |
| JavaScript module      | `dist/js/{theme}-{mode}-{projectType}.js`      |
| TypeScript definitions | `dist/js/{theme}-{mode}-{projectType}.d.ts`    |
| JSON                   | `dist/json/{theme}-{mode}-{projectType}.json`  |

### Backward Compatibility Aliases

For existing consumers, these aliases are maintained:

| Alias                            | Points To                   |
| -------------------------------- | --------------------------- |
| `dist/css/variables.css`         | `start-light-default.css`   |
| `dist/css/variables-dark.css`    | `start-dark-default.css`    |
| `dist/scss/_variables.scss`      | `_start-light-default.scss` |
| `dist/scss/_variables-dark.scss` | `_start-dark-default.scss`  |
| `dist/js/tokens.js`              | `start-light-default.js`    |
| `dist/js/tokens-dark.js`         | `start-dark-default.js`     |

## Adding a New Theme

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
   pnpm build
   ```

## Adding a New Project Type

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
           ...
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

## Theme Comparison

### Start Theme

- **Font**: Fira Sans / Fira Mono
- **Border radius**: 4px (sm), 8px (md), 16px (lg)
- **Colors**: Full brand palette with blues, greens, reds, oranges
- **Focus**: Yellow background with dashed outline (GOV.UK style)

### Wireframe Theme

- **Font**: System UI stack (system-ui, -apple-system, etc.)
- **Border radius**: 2px (sm), 4px (md), 8px (lg): more minimal
- **Colors**: Grayscale only: all semantic colors alias to neutral/accent-1
- **Focus**: Blue outline (standard browser style)

### Default vs Information-Dense

| Size | Default (Fluid)                                  | Information-Dense (Fixed) |
| ---- | ------------------------------------------------ | ------------------------- |
| sm   | `clamp(0.875rem, 0.75rem + 0.25vw, 1.0625rem)`   | `0.875rem`                |
| md   | `clamp(1rem, 0.875rem + 0.375vw, 1.28125rem)`    | `1rem`                    |
| lg   | `clamp(1.25rem, 1.125rem + 0.375vw, 1.53125rem)` | `1.125rem`                |
| xl   | `clamp(1.5rem, 1.25rem + 0.625vw, 1.9375rem)`    | `1.25rem`                 |
| 2xl  | `clamp(2rem, 1.75rem + 0.75vw, 2.5625rem)`       | `1.5rem`                  |
| 3xl  | `clamp(2.5rem, 2.125rem + 1.125vw, 3.3125rem)`   | `1.875rem`                |
| 4xl  | `clamp(3rem, 2.5rem + 1.5vw, 4.125rem)`          | `2.25rem`                 |

## Building

```bash
pnpm --filter @dsn-starter-kit/design-tokens build
```

## Storybook Integration

Storybook is configured with three toolbar controls:

- **Theme**: Switch between Start and Wireframe
- **Mode**: Switch between Light and Dark
- **Density**: Switch between Default (Fluid) and Information Dense (Fixed)

The TokenTable component shows live computed CSS values that update when you change these settings.

## License

MIT
