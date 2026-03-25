# Storybook Configuration

**Last Updated:** March 15, 2026

Documentation for the Storybook setup, runtime theme switching, UI components, and documentation structure.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Configuration Files](#configuration-files)
3. [Runtime Theme Switching](#runtime-theme-switching)
4. [UI Components](#ui-components)
5. [Documentation Structure](#documentation-structure)
6. [Development Workflow](#development-workflow)

---

## Architecture Overview

Storybook uses a four-file configuration for runtime theme switching and documentation:

```
packages/storybook/.storybook/
├── main.ts              # Storybook config, static dirs, multilevel-sort
├── preview.ts           # Decorator, globalTypes (toolbar), storySort
├── preview-head.html    # Dynamic token loading script
└── preview-body.css     # Preview iframe styles
```

**Documentation structure per component (three files):**

```
packages/storybook/src/
├── Button.stories.tsx    # Stories + argTypes + DocsPage import + htmlTemplate
├── Button.docs.mdx       # MDX wrapper (Meta, PreviewFrame, CodeTabs, Controls, Markdown)
└── Button.docs.md        # Dutch documentation content
```

**UI components:**

```
packages/storybook/src/components/
├── PreviewFrame.tsx      # Visueel kader rondom story previews
├── CodeTabs.tsx          # React / HTML/CSS tabs met syntax highlighting
├── TokenControls.tsx     # Live token configuratie op de Design Tokens pagina
└── index.ts              # Barrel export
```

---

## Configuration Files

### main.ts

**Location:** `packages/storybook/.storybook/main.ts`

**Purpose:** Core Storybook configuration

**Key features:**

- Static file serving (design tokens, icons)
- Addon configuration
- Story file patterns
- Multilevel sort plugin for docs-first ordering

```ts
import type { StorybookConfig } from '@storybook/react-vite';
import { configureSort } from 'storybook-multilevel-sort';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  staticDirs: [
    {
      from: '../../design-tokens/dist',
      to: '/design-tokens/dist',
    },
    {
      from: '../../components-html/assets',
      to: '/assets',
    },
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    {
      name: 'storybook-multilevel-sort',
      options: {
        configureSort: configureSort({
          typeOrder: ['docs', 'story'],
        }),
      },
    },
  ],
};

export default config;
```

### preview.ts

**Location:** `packages/storybook/.storybook/preview.ts`

**Purpose:** Defines toolbar controls and decorator for theme switching

**Key features:**

- Toolbar controls for Theme, Mode, Density
- Decorator for dynamic token loading — also applies `dsn-body` to `document.body` so all story previews inherit document-level base styles
- Story sorting

```ts
import type { Preview } from '@storybook/react';

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      defaultValue: 'start',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'start', title: 'Start Theme' },
          { value: 'wireframe', title: 'Wireframe' },
        ],
      },
    },
    mode: {
      name: 'Mode',
      defaultValue: 'light',
      toolbar: {
        items: [
          { value: 'light', title: 'Light Mode' },
          { value: 'dark', title: 'Dark Mode' },
        ],
      },
    },
    projectType: {
      name: 'Density',
      defaultValue: 'default',
      toolbar: {
        items: [
          { value: 'default', title: 'Default (Fluid)' },
          { value: 'information-dense', title: 'Information Dense (Fixed)' },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'start';
      const mode = context.globals.mode || 'light';
      const projectType = context.globals.projectType || 'default';

      // Load CSS configuration dynamically...
      // (see Runtime Theme Switching section)

      return Story();
    },
  ],
};

export default preview;
```

**Important:** Token CSS is NOT imported statically. This prevents CSS cascade conflicts.

### preview-head.html

**Location:** `packages/storybook/.storybook/preview-head.html`

**Purpose:** Handles dynamic token loading in the preview iframe

**Key features:**

- Fetch-based CSS loading (no `<link>` tags)
- `:root:root` selector for higher specificity
- MutationObserver to keep styles at end of `<head>`
- URL parameter parsing for toolbar state

```html
<script>
  (function () {
    const CONFIG_BASE_URL = '/design-tokens/dist/css';

    function loadTokenConfig(configName) {
      fetch(`${CONFIG_BASE_URL}/${configName}.css`)
        .then((r) => r.text())
        .then((cssText) => {
          // Remove existing dynamic styles
          const existing = document.head.querySelector('[data-dsn-tokens]');
          if (existing) existing.remove();

          // Use :root:root for higher specificity
          const style = document.createElement('style');
          style.setAttribute('data-dsn-tokens', configName);
          style.textContent = cssText.replace(':root', ':root:root');
          document.head.appendChild(style);
        });
    }

    // MutationObserver ensures our styles stay at end of <head>
    const observer = new MutationObserver(() => {
      const tokenStyle = document.head.querySelector('[data-dsn-tokens]');
      if (tokenStyle && tokenStyle !== document.head.lastElementChild) {
        document.head.appendChild(tokenStyle);
      }
    });

    observer.observe(document.head, { childList: true });

    // URL polling detects Storybook toolbar changes
    let lastUrl = window.location.href;
    setInterval(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        // Parse globals from URL and load config...
      }
    }, 100);
  })();
</script>
```

### preview-body.css

**Location:** `packages/storybook/.storybook/preview-body.css`

**Purpose:** Base styles for the preview iframe

```css
body {
  background-color: var(--dsn-color-neutral-bg-document);
  color: var(--dsn-color-neutral-color-document);
}
```

---

## Runtime Theme Switching

### Why This Architecture?

1. **Static imports cause cascade issues** — Vite/webpack bundles CSS imports, which may load after dynamically injected styles
2. **`:root:root` selector** — Higher specificity ensures dynamic tokens override bundled ones
3. **MutationObserver** — New styles added by HMR or components don't break theming
4. **URL parameter parsing** — Storybook encodes globals in URL (`?globals=mode:dark`)
5. **Works for Stories AND Docs** — Unlike decorators, the script runs for all iframe content

### How It Works

1. User changes toolbar control (Theme, Mode, or Density)
2. Storybook updates URL with new global values
3. Script in `preview-head.html` detects URL change
4. Script parses globals from URL parameters
5. Script fetches new CSS configuration
6. Script removes old `<style>` element
7. Script creates new `<style>` with `:root:root` selector
8. Script appends to end of `<head>`
9. MutationObserver ensures it stays last
10. All components update with new token values

### Example: Switching to Dark Mode

1. User clicks "Dark Mode" in toolbar
2. URL changes to `?globals=mode:dark`
3. Script detects change
4. Script fetches `/design-tokens/dist/css/start-dark-default.css`
5. Script injects with `:root:root` selector
6. All `--dsn-*` variables update
7. Components re-render with new colors

---

## UI Components

Custom React components voor Storybook documentation, gelocaliseerd in `packages/storybook/src/components/`.

### PreviewFrame

**Location:** `packages/storybook/src/components/PreviewFrame.tsx`

**Purpose:** Visueel kader rondom story previews op docs pagina's. Verbindt visueel met CodeTabs eronder.

**Features:**

- `dsn-body` class op de wrapper div — zorgt voor correcte typography tokens (`font-size`, `font-family`, `line-height`, `font-weight`) en achtergrondkleur (`--dsn-color-neutral-bg-document`); gedrag identiek aan de afzonderlijke story-canvassen
- `sb-unstyled` class op de wrapper div — sluit de PreviewFrame en al zijn kind-elementen uit van Storybook's docs-pagina CSS-reset (`.css-qa4clq :where(div:not(.sb-unstyled, ...))`), die anders `font-size: 16px` zou opleggen en de token-waarde overschrijven
- Subtiele border (`--dsn-color-neutral-border-subtle`) en border-radius bovenaan
- Geen onderkant border — verbindt visueel met de CodeTabs eronder als één geheel

**Usage in docs.mdx:**

```mdx
import { PreviewFrame, CodeTabs } from './components';

<PreviewFrame>
  <Story of={ButtonStories.Default} />
</PreviewFrame>
```

### CodeTabs

**Location:** `packages/storybook/src/components/CodeTabs.tsx`

**Purpose:** Twee tabs (React en HTML/CSS) met syntax highlighting, direct onder de PreviewFrame. Beide tabs updaten live als de gebruiker props aanpast via het Controls panel.

**Props:**

| Prop   | Type     | Verplicht | Beschrijving                                                    |
| ------ | -------- | --------- | --------------------------------------------------------------- |
| `of`   | `Story`  | Ja        | Verwijzing naar de Storybook story (voor live updates)          |
| `html` | `string` | Nee       | Statische HTML/CSS code als fallback (voor wrapper componenten) |

**Hoe de tabs werken:**

- **React tab** — `Source of={story}` subscribet automatisch op `STORY_ARGS_UPDATED`. Storybook genereert de React code live op basis van de huidige args.
- **HTML/CSS tab** — `Source of={story} transform={...}` intercepteert de code-output. Als `parameters.dsn.htmlTemplate` aanwezig is in de story, roept de transform die functie aan met de live args. Anders valt het terug op de statische `html` prop.

**Usage in docs.mdx:**

```mdx
<CodeTabs
  of={ButtonStories.Default}
  html={`<button class="dsn-button dsn-button--strong">Tekst</button>`}
/>
```

**Visuele samenhang:**

- Geen top border — sluit naadloos aan op de PreviewFrame erboven
- Border-radius alleen onderaan
- Tab bar met token-based achtergrond en active tab kleur via `--dsn-link-color`

### `htmlTemplate` patroon

Elke story file (behalve wrapper componenten) definieert een `htmlTemplate` functie in `parameters.dsn`. Deze functie genereert de HTML string op basis van de huidige args en wordt door de CodeTabs HTML tab aangeroepen via `transform`.

**Pattern:**

```tsx
const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const cls = [
          'dsn-button',
          `dsn-button--${args.variant ?? 'strong'}`,
          `dsn-button--size-${args.size ?? 'default'}`,
          args.loading && 'dsn-button--loading',
          args.disabled && 'dsn-button--disabled',
        ]
          .filter(Boolean)
          .join(' ');
        const disabled = args.disabled || args.loading ? ' disabled' : '';
        return `<button type="button" class="${cls}"${disabled}>${args.children ?? 'Tekst'}</button>`;
      },
    },
  },
};
```

**Uitzonderingen — geen `htmlTemplate`:**

| Component      | Reden                                                             |
| -------------- | ----------------------------------------------------------------- |
| CheckboxGroup  | Wrapper component met custom render — toont statische `html` prop |
| RadioGroup     | Wrapper component met custom render — toont statische `html` prop |
| DateInputGroup | Wrapper component met custom render — toont statische `html` prop |
| UnorderedList  | Geen zinvolle Controls beschikbaar om HTML dynamisch te genereren |

### TokenControls

**Location:** `packages/storybook/src/components/TokenControls.tsx`

**Purpose:** Display live CSS variable values in documentation

**Features:**

- Shows token name, CSS variable, and computed value
- Updates automatically on theme change
- Uses MutationObserver to detect style changes
- Listens for `storybook-globals-updated` event

**Usage in Documentation:**

```tsx
<TokenControls
  tokens={[
    { name: 'Background', cssVar: '--dsn-button-strong-background-color' },
    { name: 'Text Color', cssVar: '--dsn-button-strong-color' },
  ]}
/>
```

### TokenTable

**Location:** `packages/storybook/src/components/TokenTable.tsx`

**Purpose:** Renders a table of design tokens with optional live preview visuals and computed CSS values.

**Props:**

| Prop            | Type          | Default  | Description                         |
| --------------- | ------------- | -------- | ----------------------------------- |
| `tokens`        | `Token[]`     | —        | Array of `{ name, cssVar, value? }` |
| `previewType`   | `PreviewType` | `'none'` | Visual preview type                 |
| `showLiveValue` | `boolean`     | `true`   | Show computed CSS value             |

**`previewType` values:**

| Value                   | Preview                                                       |
| ----------------------- | ------------------------------------------------------------- |
| `'color'`               | Gekleurd vlak 32×32px                                         |
| `'spacing'`             | Horizontale balk (breedte = tokenwaarde)                      |
| `'typography-size'`     | "Aa" in de tokengrootte                                       |
| `'border-radius'`       | Gevuld vlak 40×40px met border-radius toegepast               |
| `'shadow'`              | Kaartje met `box-shadow` toegepast                            |
| `'transition-duration'` | Animerende sweep-balk (animationDuration = token)             |
| `'transition-easing'`   | Stip op track (animationTimingFunction = token, vaste 1200ms) |
| `'none'`                | Geen preview kolom                                            |

Alle kleur-previews gebruiken `--dsn-color-accent-1-inverse-bg-default` als accentkleur.

### TocLink

**Location:** `packages/storybook/src/components/TocLink.tsx`

**Purpose:** Anchor-navigatie binnen een Storybook docs-pagina zonder de Storybook URL te breken.

Storybook gebruikt `?path=`-gebaseerde URL-routing. Een gewone `<a href="#section">` vervangt de hele URL en laat de sidebar verdwijnen. `TocLink` onderschept de klik via `e.preventDefault()` en roept `document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })` aan.

```tsx
<TocLink targetId="colors">Colors</TocLink>
// rendert als: <a class="dsn-link" href="#colors">Colors</a>
// klik: scrollt naar element met id="colors", geen URL-verandering
```

---

## Documentation Structure

### Component Documentation Files

Each component has **three files**:

1. **Stories file** (`.stories.tsx`) — Interactive examples + argTypes + DocsPage import + `htmlTemplate`
2. **MDX file** (`.docs.mdx`) — Documentation wrapper met PreviewFrame, CodeTabs, Controls
3. **Markdown file** (`.docs.md`) — Dutch content (Doel, Use when, Best practices, etc.)

### Stories File Pattern

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@dsn/components-react';
import DocsPage from './Button.docs.mdx';
import { TEKST, rtlDecorator } from './story-helpers';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      htmlTemplate: (args: any) => {
        const cls = ['dsn-button', `dsn-button--${args.variant ?? 'strong'}`]
          .filter(Boolean)
          .join(' ');
        return `<button type="button" class="${cls}">${args.children ?? 'Tekst'}</button>`;
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['strong', 'default', 'subtle', 'link'],
    },
  },
  args: { children: TEKST },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};
```

**Opmerking:** `Button.stories.tsx` importeert **geen** DocsPage en heeft **geen** `parameters.docs.page` — `Button.docs.mdx` importeert `ButtonStories` terug, wat een circulaire import geeft die Storybook laat crashen.

**Story volgorde (standaard):**

1. `Default`
2. Individuele state stories (`Disabled`, `Invalid`, `ReadOnly`, etc.)
3. `AllStates` overzichtsstory
4. `ShortText` / `LongText` (indien van toepassing)
5. `RTL` / `RTLLongText` (bij componenten met zichtbare tekst)

**Niet toevoegen:**

- ❌ `HighContrast` stories — CSS-simulatie geeft onrealistisch beeld
- ❌ `LargeText` stories — form inputs gebruiken `clamp()` met rem-waarden; een wrapper div heeft geen effect

### MDX File Pattern

```mdx
{/* Button.docs.mdx */}
import { Meta, Story, Controls, Markdown } from '@storybook/blocks';
import \* as ButtonStories from './Button.stories';
import docs from './Button.docs.md?raw';
import { PreviewFrame, CodeTabs } from './components';

export const [intro, rest] = docs.split('<!-- VOORBEELD -->');

<Meta of={ButtonStories} />

<Markdown>{intro}</Markdown>

## Voorbeeld

<PreviewFrame>
  <Story of={ButtonStories.Default} />
</PreviewFrame>

<CodeTabs
  of={ButtonStories.Default}
  html={`<button class="dsn-button dsn-button--strong">Tekst</button>`}
/>

<Controls of={ButtonStories.Default} />

<Markdown>{rest}</Markdown>
```

### Markdown File Sections

```markdown
<!-- Button.docs.md -->

# Button

Korte beschrijving van het component.

## Doel

Uitleg wat het component doet.

<!-- VOORBEELD -->

## Use when

- De gebruiker moet een actie uitvoeren
- Je een primaire call-to-action nodig hebt

## Don't use when

- Je naar een andere pagina wilt navigeren (gebruik Link)

## Best practices

- Gebruik duidelijke, actie-gerichte tekst

## Accessibility

- ...

## States

- ...

## Design tokens

[TokenTable showing component tokens]
```

### story-helpers.tsx

**Location:** `packages/storybook/src/story-helpers.tsx`

Canonical text constants and decorators for consistent story content:

```tsx
import {
  rtlDecorator,
  TEKST,
  WEINIG_TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
} from './story-helpers';
```

| Export            | Type        | Gebruik                                    |
| ----------------- | ----------- | ------------------------------------------ |
| `TEKST`           | `string`    | Default tekst voor de meeste stories       |
| `WEINIG_TEKST`    | `string`    | Korte tekst voor ShortText stories         |
| `VEEL_TEKST`      | `string`    | Lange tekst voor LongText stories          |
| `TEKST_AR`        | `string`    | Arabische tekst voor RTL stories           |
| `WEINIG_TEKST_AR` | `string`    | Korte Arabische tekst                      |
| `VEEL_TEKST_AR`   | `string`    | Lange Arabische tekst                      |
| `rtlDecorator`    | `Decorator` | Voegt RTL richting toe aan de story iframe |

### Docs-First Ordering

The `storybook-multilevel-sort` plugin ensures Docs pages appear first:

```ts
configureSort({
  typeOrder: ['docs', 'story'],
});
```

**Sidebar structure:**

```
Components
  ├── Button
  │   ├── Docs (appears first)
  │   ├── Default
  │   ├── Strong
  │   └── Loading
  └── Icon
      ├── Docs (appears first)
      ├── Default
      └── Sizes
```

---

## Development Workflow

### Running Storybook

```bash
# Start Storybook
pnpm dev

# Build static Storybook
pnpm --filter @dsn/storybook build
```

### Adding Documentation for a New Component

1. **Create stories file** — `ComponentName.stories.tsx`
   - Import `DocsPage` from `.docs.mdx`
   - Add `parameters.docs.page: DocsPage`
   - Add `parameters.dsn.htmlTemplate` met een functie die HTML genereert
   - Import text constants from `story-helpers.tsx`
2. **Create MDX file** — `ComponentName.docs.mdx`
   - Wrap story in `<PreviewFrame>`
   - Add `<CodeTabs of={} html="..." />`
3. **Create markdown file** — `ComponentName.docs.md`
   - Follow the standard section structure
4. **Test theme switching** — Verify all themes/modes work
5. **Verify both tabs** — Check that React and HTML/CSS tabs show correct, dynamic code

### TypeScript Import Check

Na het toevoegen of wijzigen van imports altijd controleren op ontbrekende of ongebruikte imports:

```bash
pnpm --filter storybook exec tsc --noEmit 2>&1 | grep "TS2304\|TS6133"
```

---

## Storybook Features

### Toolbar Controls

- **Theme** — Switch between themes (start, wireframe)
- **Mode** — Switch between light/dark modes
- **Density** — Switch between fluid/fixed typography

### Addons

- `@storybook/addon-links` — Navigation between stories
- `@storybook/addon-essentials` — Core Storybook features
- `@storybook/addon-interactions` — Testing interactions
- `@storybook/addon-a11y` — Accessibility testing
- `storybook-multilevel-sort` — Sidebar ordering

### Accessibility Testing

Every story automatically includes accessibility checks via `@storybook/addon-a11y`:

- WCAG 2.1 Level AA violations
- Color contrast issues
- Missing ARIA attributes
- Keyboard navigation problems

---

## Related Documentation

- **[Architecture](./01-architecture.md)** - Theme architecture
- **[Components](./03-components.md)** - Component specifications
- **[Development Workflow](./04-development-workflow.md)** - Development guidelines
