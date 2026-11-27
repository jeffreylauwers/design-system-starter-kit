# @dsn-starter-kit/design-tokens

Design tokens for the design system: the single source of truth for colors, typography, spacing, sizing, borders, shadows, and more.

## Architecture

Tokens are organized in a **three-axis configuration model**:

| Axis             | Values                         | Affects                                                  |
| ---------------- | ------------------------------ | -------------------------------------------------------- |
| **Theme**        | `start`, `wireframe`, ...      | All tokens (typography, spacing, borders, focus, colors) |
| **Mode**         | `light`, `dark`                | Only color tokens                                        |
| **Project Type** | `default`, `information-dense` | Which scales are fluid: font sizes and spacing           |

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
- **Project Type**: Density. `default` lets font sizes and spacing grow with the viewport, and `information-dense` (dashboards, data tables) keeps both fixed.

## Folder Structure

```
src/tokens/
├── themes/
│   ├── start/                    # Default theme
│   │   ├── base.json             # Typography, min/max font sizes and spacing, sizing, borders, focus
│   │   ├── theme.config.json     # Base color per color group, source of the color groups
│   │   ├── colors-light.json     # Light mode colors (color groups generated)
│   │   └── colors-dark.json      # Dark mode colors (color groups generated)
│   └── wireframe/                # Wireframe/prototype theme
│       ├── base.json             # System fonts, minimal borders
│       ├── colors-light.json     # Grayscale palette
│       └── colors-dark.json      # Inverted grayscale
├── project-types/
│   ├── default/
│   │   ├── typography.json       # fluid() font sizes
│   │   └── space.json            # fluid() spacing
│   └── information-dense/
│       ├── typography.json       # Fixed font sizes (the min values)
│       └── grid.json             # Compact grid gutter
└── components/
    └── form-control.json         # Component-level semantic tokens
```

## Token Categories

### In Theme Base (`themes/*/base.json`)

- **Viewport**: `dsn.viewport.min-inline-size` (360px) and `max-inline-size` (1440px), the range of the fluid scale
- **Typography**: Font families, weights, line heights, and per font size a min and max value (`dsn.text.font-size.min.*` / `max.*`)
- **Spacing**: 5 concepts (block, inline, text, column, row), each size with a min and max value (`dsn.space.*.min.*` / `max.*`). The size itself (`dsn.space.block.md`) refers to the min value, so it is fixed unless a project type makes it fluid
- **Sizing**: Icon sizes (coupled to typography)
- **Borders**: Radius and width values
- **Focus States**: Accessible focus indicators
- **Form Controls**: Structural tokens (spacing, borders)

### In Theme Colors (`themes/*/colors-*.json`)

- **Colors**: 10 semantic color sets with full state coverage
  - Neutral, Accent 1-3, Action 1-2, Positive, Negative, Warning, Info
  - Each with: bg, border, color × document, subtle, default, hover, active
  - Plus inverse variants for dark backgrounds

### Generated Color Groups (`themes/*/theme.config.json`)

The color groups of Start are not written by hand. `theme.config.json` sets one base color per group, or a reference to another group, and [`@dsn-starter-kit/theme-engine`](../theme-engine) derives all 30 tokens per group and mode from it, with the WCAG contrast rules (text 4.5:1, borders 3:1, inverse text 4.5:1 on all six inverse backgrounds):

```json
{
  "colors": {
    "intensity": 1,
    "groups": {
      "neutral": { "base": "#595959" },
      "accent-1": { "base": "oklch(0.468 0.164 255.8)" },
      "accent-2": { "alias": "accent-1" },
      "info": { "alias": "accent-1" }
    }
  }
}
```

- `base` is any CSS color. Start uses `oklch()` for the colored groups: in hex the hue of the reds and oranges shifts noticeably
- `alias` makes the group refer to another group token for token, inverse group included. In Start, accent-2, accent-3, action-1, action-2 and info refer to accent-1
- `intensity` scales the chroma of every group

To change a color, edit `theme.config.json` and run:

```bash
pnpm --filter @dsn-starter-kit/design-tokens generate:colors
```

The script only writes `$value` in `dsn.color.{group}` and `dsn.color.{group}-inverse`. `$type`, `$description`, the key order and every other token in `colors-*.json` (shadow, transparent, focus, form-control, heading, backdrop) stay as they are, so those you edit in the JSON itself. The build runs the script too; in CI it only checks (`validate:colors`) and fails when the JSON does not match the config. The generated JSON is checked in, so the published package does not depend on the engine.

A theme without `theme.config.json`, such as Wireframe, keeps hand-written colors.

### In Project Type (`project-types/*/`)

A project type decides per size whether it grows with the viewport. `fluid({min}, {max})` grows from the min value at 360px to the max value at 1440px; the `dsn/fluid` transform in `src/config/config.js` turns it into a `clamp()`. A plain reference to the min value stays fixed.

```json
"md": { "$value": "fluid({dsn.text.font-size.min.md}, {dsn.text.font-size.max.md})" }
```

| Project type        | Font sizes  | Spacing     |
| ------------------- | ----------- | ----------- |
| `default`           | fluid       | fluid       |
| `information-dense` | fixed (min) | fixed (min) |

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

| Configuration                       | Description                                         |
| ----------------------------------- | --------------------------------------------------- |
| `start-light-default`               | Start theme, light mode, fluid text and spacing     |
| `start-light-information-dense`     | Start theme, light mode, fixed text and spacing     |
| `start-dark-default`                | Start theme, dark mode, fluid text and spacing      |
| `start-dark-information-dense`      | Start theme, dark mode, fixed text and spacing      |
| `wireframe-light-default`           | Wireframe theme, light mode, fluid text and spacing |
| `wireframe-light-information-dense` | Wireframe theme, light mode, fixed text and spacing |
| `wireframe-dark-default`            | Wireframe theme, dark mode, fluid text and spacing  |
| `wireframe-dark-information-dense`  | Wireframe theme, dark mode, fixed text and spacing  |

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

4. Customize the token values in your new theme files. Keep `theme.config.json` to generate the color groups from base colors (see "Generated Color Groups"), or delete it to write them by hand.

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

2. Define all font sizes (sm, md, lg, xl, 2xl, 3xl, 4xl). Refer to the min and max tokens of the theme: `fluid({min}, {max})` grows with the viewport, a single reference stays fixed:

   ```json
   {
     "dsn": {
       "text": {
         "font-size": {
           "sm": { "$value": "fluid({dsn.text.font-size.min.sm}, {dsn.text.font-size.max.sm})" },
           "md": { "$value": "{dsn.text.font-size.min.md}" },
           ...
         }
       }
     }
   }
   ```

   Spacing works the same way (see `project-types/default/space.json`). Without a spacing file, spacing stays at the fixed min values of the theme.

3. Update `src/config/config.js`: add the name to `projectTypes`, its files to `projectTypeSources` and a class to `densitySelectors`:

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

### Font sizes per project type

| Size | Min (360px) | Max (1440px) | `default`        | `information-dense` |
| ---- | ----------- | ------------ | ---------------- | ------------------- |
| sm   | 14px        | 17.5px       | fluid, min → max | 14px                |
| md   | 16px        | 20px         | fluid, min → max | 16px                |
| lg   | 20px        | 25px         | fluid, min → max | 20px                |
| xl   | 24px        | 30px         | fluid, min → max | 24px                |
| 2xl  | 32px        | 40px         | fluid, min → max | 32px                |
| 3xl  | 40px        | 50px         | fluid, min → max | 40px                |
| 4xl  | 48px        | 60px         | fluid, min → max | 48px                |

Spacing follows the same pattern with max = min × 1.25 (sizes of 1px and 2px stay fixed). See `docs/02-design-tokens-reference.md` for the full scale.

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
