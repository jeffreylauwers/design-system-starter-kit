# Icon Component

Icon component using individual Tabler Icon SVG imports for optimal tree-shaking and bundle size.

## Approach: Individual SVG Imports

**Why Individual Imports?**

- Tree-shaking: Only icons you use are included in your bundle
- Smaller bundles: No unused icons
- Type-safe: TypeScript knows which icons exist
- Modern build tools: Vite/Webpack optimize automatically
- Easy imports: `import { Icon } from '@dsn-starter-kit/components-react'`

## Features

- 20 commonly used icons from Tabler Icons
- 7 size variants (sm, md, lg, xl, 2xl, 3xl, 4xl)
- Uses design tokens for sizing (coupled to typography)
- BEM naming convention (CSS)
- Accessible (ARIA labels)
- TypeScript support with icon name validation
- Tree-shaking ready

## Available Icons

check, x, chevron-down, chevron-up, chevron-left, chevron-right, arrow-left, arrow-right, plus, minus, search, menu, home, user, settings, heart, star, trash, edit, download

## Size Variants

| Size | Token Value         | Actual Size    |
| ---- | ------------------- | -------------- |
| sm   | --dsn-icon-size-sm  | 21px           |
| md   | --dsn-icon-size-md  | 24px (default) |
| lg   | --dsn-icon-size-lg  | 25px           |
| xl   | --dsn-icon-size-xl  | 30px           |
| 2xl  | --dsn-icon-size-2xl | 40px           |
| 3xl  | --dsn-icon-size-3xl | 50px           |
| 4xl  | --dsn-icon-size-4xl | 52.8px         |

## Installation

### Vite Configuration (Required for React)

To import SVG files as React components, add this to your `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    svgr({
      // Enable importing SVG as React components
      svgrOptions: {
        icon: true, // Remove width/height from SVG
      },
    }),
  ],
});
```

Install the plugin:

```bash
pnpm add -D vite-plugin-svgr
```

## Usage

### React (Recommended)

```tsx
import { Icon } from '@dsn-starter-kit/components-react';

function App() {
  return (
    <div>
      {/* Decorative icon (with text) */}
      <span>
        <Icon name="check" size="sm" />
        Task complete
      </span>

      {/* Standalone icon (needs label) */}
      <Icon name="settings" size="lg" aria-label="Open settings" />

      {/* Icon button */}
      <button>
        <Icon name="plus" size="md" />
        Add item
      </button>

      {/* Different sizes */}
      <Icon name="heart" size="2xl" aria-label="Like" />
    </div>
  );
}
```

### TypeScript Support

The Icon component is fully typed:

```tsx
import { Icon, IconName, IconSize } from '@dsn-starter-kit/components-react';

// TypeScript will autocomplete icon names
<Icon name="check" /> // Valid
<Icon name="invalid" /> // Type error!

// Type-safe props
const iconName: IconName = "check";
const iconSize: IconSize = "lg";

<Icon name={iconName} size={iconSize} />
```

### HTML/CSS

For static HTML without React:

```html
<!DOCTYPE html>
<html>
  <head>
    <link
      rel="stylesheet"
      href="@dsn-starter-kit/components-react/src/Icon/Icon.css"
    />
  </head>
  <body>
    <!-- Inline SVG (copy from icons folder) -->
    <svg
      class="dsn-icon dsn-icon--md"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M5 12l5 5l10 -10" />
    </svg>
  </body>
</html>
```

## Accessibility

### When to use aria-label

- **Standalone icons**: Always provide `aria-label`
- **Icons with adjacent text**: Icon is decorative (automatically `aria-hidden`)
- **Icon buttons**: Provide `aria-label` on the button

### Examples

```tsx
// GOOD: Icon button with label on button
<button aria-label="Close dialog">
  <Icon name="x" />
</button>

// GOOD: Decorative icon with text
<span>
  <Icon name="check" />
  Success
</span>

// BAD: Standalone icon without label
<Icon name="settings" />

// GOOD: Standalone icon with label
<Icon name="settings" aria-label="Open settings" />

// GOOD: Link with icon and visible text
<a href="/settings">
  <Icon name="settings" />
  Settings
</a>

// BAD: Link with only icon, no label
<a href="/settings">
  <Icon name="settings" />
</a>

// GOOD: Link with only icon, has label
<a href="/settings" aria-label="Settings">
  <Icon name="settings" />
</a>
```

## Adding More Icons

To add more icons from Tabler Icons:

1. Download SVG from [tabler.io/icons](https://tabler.io/icons)
2. Save to `packages/components-html/assets/icons/[name].svg`
3. Run the icon registry generator:
   ```bash
   pnpm --filter @dsn-starter-kit/components-react generate:icons
   ```

The generator script scans the icons directory and automatically updates `icon-registry.generated.ts` with een React-component per icoon, de `IconName` type en de `iconMap`. No manual code changes needed.

## Inline SVG: waarom geen `.svg`-imports

De SVG-inhoud staat **inline** in `icon-registry.generated.ts`, als `React.createElement`-aanroepen.
Er wordt dus geen `.svg`-bestand geïmporteerd.

Dat is een bewuste keuze. Een import als
`import EditIcon from '../../../components-html/assets/icons/edit.svg?react'`
werkt alleen binnen deze monorepo, met `vite-plugin-svgr` geconfigureerd:

- het pad wijst buiten het gepubliceerde package, dus consumers krijgen `Module not found`
- de `?react`-suffix vereist dat élke consumer svgr installeert en configureert

Inline SVG maakt `dist/` zelfstandig en bundler-onafhankelijk: Vite, webpack, Next.js,
Rspack en Node werken zonder extra loader-configuratie.

## Bundle Size

De hele set van 51 iconen zit in `iconMap`, en `iconMap` wordt als geheel geraadpleegd
via `Icon`. De volledige set komt dus in de bundle van de consumer terecht, ongeveer
19 KB aan SVG-padgegevens (ruwweg 5-6 KB gzipped). Tree-shaking per icoon is niet
mogelijk zolang `Icon` de naam pas op runtime opzoekt.

Wie alleen een handvol iconen nodig heeft, kan de losse SVG's uit
`@dsn-starter-kit/components-html/assets/icons/` gebruiken in plaats van `Icon`.

## Design Tokens Used

- `--dsn-icon-size-sm` (21px)
- `--dsn-icon-size-md` (24px)
- `--dsn-icon-size-lg` (25px)
- `--dsn-icon-size-xl` (30px)
- `--dsn-icon-size-2xl` (40px)
- `--dsn-icon-size-3xl` (50px)
- `--dsn-icon-size-4xl` (52.8px)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Geen SVG-loader nodig: de iconen zijn inline React-componenten
- CSS uses CSS custom properties (IE11 not supported)

## Files Structure

```
packages/
├── components-html/
│   └── assets/
│       └── icons/
│           ├── check.svg
│           ├── x.svg
│           ├── chevron-down.svg
│           └── ... (51 icons total)
└── components-react/
    ├── scripts/
    │   └── generate-icons.js    # Icon registry generator
    └── src/Icon/
        ├── Icon.tsx                    # React component
        ├── Icon.css                    # Styles
        ├── icon-registry.generated.ts  # Auto-generated (do not edit)
        └── index.ts                    # Exports
```

## License

MIT
