# @dsn-starter-kit/theme-engine

The calculations behind the themes: color groups in OKLCH with WCAG 2 contrast rules, and generating a theme's color tokens from its `theme.config.json`.

Private package. It is not published; it is used by:

- `@dsn-starter-kit/design-tokens`: `generate:colors` writes `colors-light.json` and `colors-dark.json` of every theme that has a `theme.config.json`
- `@dsn-starter-kit/theme-configurator`: the interactive configurator

## No build step

The package ships its TypeScript source (`exports` points at `src/index.ts`). Vite and Vitest read it as is, and Node runs it directly through type stripping. Two rules keep that working:

- Relative imports carry the `.ts` extension
- Only syntax that type stripping can erase: no `enum`, `namespace` or parameter properties. `erasableSyntaxOnly` in `tsconfig.json` enforces this

## Color groups

`buildColorGroup()` turns one base color into 15 tokens plus 15 inverse tokens, for light or dark mode, along three tracks:

| Track       | Tokens                                            | Rule                                                 |
| ----------- | ------------------------------------------------- | ---------------------------------------------------- |
| Backgrounds | `bg-document` … `bg-active`                       | Fixed lightness per step, barely tinted              |
| Borders     | `border-subtle` … `border-active`                 | `border-default`, `-hover`, `-active` reach 3:1      |
| Text        | `color-subtle` … `color-document`                 | Every text color reaches 4.5:1 on its own background |
| Inverse     | the same steps, dark in light mode and vice versa | Text reaches 4.5:1 on all six inverse backgrounds    |

Lightness is adjusted until a rule is met, on the value as generated and on the value rounded to the precision of the `oklch()` export. `src/palette.test.ts` checks every rule on 30 base colors, both modes and three intensities.

## Fluid scale

`fluid.ts` holds the calculation behind `fluid({min}, {max})` (DR-2026-13): `toPx`, `splitTopLevel`, `fluidClamp` and `readFluidViewport`. The `dsn/fluid` transform in design-tokens' `config.js` and the theme configurator both use it, so a preview shows exactly the clamp() the build writes.

## Token trees to CSS

`mergeTokenTrees()` merges token JSON the way Style Dictionary merges source files: a later tree wins per token. `flattenTokens()` turns the result into CSS custom properties as the build writes them with `outputReferences`: a reference stays a `var()`, a fluid token becomes a clamp(), and `transparent` becomes `rgba(0, 0, 0, 0)` like Style Dictionary's color transform. For Start, all 600 semantic tokens per mode match `dist/css` (tested in the theme configurator).

## Theme config

```json
{
  "colors": {
    "intensity": 1,
    "groups": {
      "neutral": { "base": "#595959" },
      "accent-1": { "base": "oklch(0.468 0.164 255.8)" },
      "info": { "alias": "accent-1" }
    }
  }
}
```

- `base`: any CSS color. The group and its inverse group are generated from it
- `alias`: the group refers to another group, token for token, including the inverse group. The target must have its own `base`
- `intensity`: scales the chroma of every group; 1 is the default curve

```ts
import {
  validateThemeConfig,
  generateColorTokens,
  applyColorTokens,
} from '@dsn-starter-kit/theme-engine';

validateThemeConfig(config); // [] or a list of problems
const values = generateColorTokens(config, 'light');
const json = applyColorTokens(colorsLightJson, values);
```

`applyColorTokens()` only changes `$value`. Key order, `$type`, `$description` and every token outside the color groups stay as they are. It throws when the JSON and the config do not describe the same groups.
