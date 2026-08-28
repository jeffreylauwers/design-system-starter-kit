# Getting started

This guide takes you from zero to a working component in under five minutes. It covers installation, CSS setup, a first component, theming, and where to go next.

---

## 1. Install

Install the component library and core styles from npm:

```bash
npm install @dsn-starter-kit/components-react @dsn-starter-kit/core
# or
pnpm add @dsn-starter-kit/components-react @dsn-starter-kit/core
```

`@dsn-starter-kit/core` provides the design tokens (as CSS custom properties) and a CSS reset. `@dsn-starter-kit/components-react` provides the React components and their styles.

---

## 2. Import the CSS

Import both CSS files once in your application entry point — before any component imports.

**Vite / plain React:**

```tsx
// main.tsx
import '@dsn-starter-kit/core/css';
import '@dsn-starter-kit/components-react/css';
```

**Next.js (App Router):**

```tsx
// app/layout.tsx
import '@dsn-starter-kit/core/css';
import '@dsn-starter-kit/components-react/css';
```

**Next.js (Pages Router):**

```tsx
// pages/_app.tsx
import '@dsn-starter-kit/core/css';
import '@dsn-starter-kit/components-react/css';
```

The order matters: core first (tokens), then components (which reference those tokens).

---

## 3. Use your first component

```tsx
import {
  Stack,
  Heading,
  Paragraph,
  Button,
} from '@dsn-starter-kit/components-react';

export function MyPage() {
  return (
    <Stack space="lg">
      <Heading level={1}>Hello, design system</Heading>
      <Paragraph>You are up and running.</Paragraph>
      <Button variant="strong" onClick={() => alert('clicked')}>
        Get started
      </Button>
    </Stack>
  );
}
```

That is all you need. No additional configuration, no theme provider, no CSS module setup.

---

## 4. Theming

The system ships with two themes: **Start** (blue accent) and **Wireframe** (monochrome). Light and dark modes are both included.

Apply a theme by adding a class to your root element:

```html
<!-- Start theme, light mode (default) -->
<body class="dsn-theme-start">
  ...
</body>

<!-- Start theme, dark mode -->
<body class="dsn-theme-start dsn-theme-start--dark">
  ...
</body>

<!-- Wireframe theme, light mode -->
<body class="dsn-theme-wireframe">
  ...
</body>
```

The theme class can be set on any container, not just `<body>` — useful for side-by-side theme previews.

To toggle dark mode at runtime:

```tsx
document.body.classList.toggle('dsn-theme-start--dark');
```

---

## 5. HTML/CSS (no framework)

All components are available as plain CSS classes if you are not using React:

```bash
npm install @dsn-starter-kit/components-html @dsn-starter-kit/core
```

```html
<link
  rel="stylesheet"
  href="node_modules/@dsn-starter-kit/core/dist/core.css"
/>
<link
  rel="stylesheet"
  href="node_modules/@dsn-starter-kit/components-html/dist/components.css"
/>

<div class="dsn-stack dsn-stack--space-lg">
  <h1 class="dsn-heading dsn-heading--level-1">Hello, design system</h1>
  <p class="dsn-paragraph">You are up and running.</p>
  <button type="button" class="dsn-button dsn-button--strong">
    <span class="dsn-button__label">Get started</span>
  </button>
</div>
```

A machine-readable index of all components and their CSS classes is available at:

```bash
import manifest from '@dsn-starter-kit/components-html/manifest';
```

---

## 6. Web Components

A subset of components is available as framework-agnostic Web Components:

```bash
npm install @dsn-starter-kit/components-web @dsn-starter-kit/core
```

```html
<script
  type="module"
  src="node_modules/@dsn-starter-kit/components-web/dist/index.js"
></script>

<dsn-button variant="strong">Get started</dsn-button>
<dsn-heading level="1">Hello, design system</dsn-heading>
```

Available Web Components: `Button`, `Heading`, `Icon`, `Link`, `OrderedList`, `Paragraph`, `UnorderedList`.

---

## Where to go next

- **[Live Storybook](https://jeffreylauwers.github.io/design-system-starter-kit/)** — browse all 75 components with interactive examples and usage guidelines
- **[Design Tokens Reference](./02-design-tokens-reference.md)** — all token values, scales, and how to use them in your own CSS
- **[Components Reference](./03-components.md)** — component API specifications
- **[Contributing](../CONTRIBUTING.md)** — how to add or change components
