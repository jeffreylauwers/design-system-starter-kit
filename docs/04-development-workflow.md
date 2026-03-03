# Development Workflow

**Last Updated:** February 14, 2026

Guidelines and workflows for developing and contributing to the Design System Starter Kit.

---

## Table of Contents

1. [Package Scripts](#package-scripts)
2. [Token Updates](#token-updates)
3. [CSS Methodology](#css-methodology)
4. [Testing Strategy](#testing-strategy)
5. [Code Quality](#code-quality)

---

## Package Scripts

### Root Level Scripts

```bash
# Build all packages (in correct dependency order)
pnpm build

# Build specific layers
pnpm build:tokens      # Design tokens only
pnpm build:core        # Core utilities
pnpm build:components  # All component packages
pnpm build:storybook   # Storybook static site

# Watch design tokens for changes
pnpm --filter @dsn/design-tokens watch

# Start Storybook in development mode
pnpm dev

# Run tests (628 tests across 35 test suites)
pnpm test

# Run tests in watch mode
pnpm test:watch

# TypeScript type checking (all packages)
pnpm type-check

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Check if code is formatted
pnpm format:check

# Clean all build artifacts and node_modules
pnpm clean
```

### Build Pipeline

The build system ensures packages are built in the correct dependency order:

```bash
# The root build command executes these in sequence:
pnpm build
  ↓
  1. pnpm build:tokens      # Design tokens (Style Dictionary)
  ↓
  2. pnpm build:core        # Core utilities and CSS
  ↓
  3. pnpm build:components  # HTML, React, and Web Components
     ├─ components-html (CSS concatenation)
     ├─ components-react (Icon generation + TypeScript)
     └─ components-web (TypeScript)
  ↓
  4. pnpm build:storybook   # Static documentation site
```

**Key Features:**

- Icon registry is automatically generated before React component compilation
- CSS from `components-html` is referenced by `components-react`
- Dependencies are built before dependents (tokens → core → components)
- Workspace packages use `workspace:*` protocol for reliable linking

### Working with Packages

```bash
# Build a specific package
pnpm --filter @dsn/design-tokens build

# Add dependency to a package
pnpm --filter @dsn/components-react add react

# Add dev dependency to root
pnpm add -Dw eslint

# Run script in all packages
pnpm -r build
```

---

## Token Updates

### Token JSON Conventions

All token JSON files follow a consistent structure. These rules apply to primitive, semantic, and component-level tokens alike.

#### Key ordering (in order of priority)

1. **Nesting depth first** — shallower tokens come before deeper ones
2. **At the same level: states first, then variants, then sub-components**
   - States appear in this fixed order:
     1. `active`
     2. `checked`
     3. `disabled`
     4. `hover`
     5. `focus`
     6. `focus-visible`
     7. `visited`
   - Then: variants (e.g. `primary`, `secondary`, `subtle`)
   - Then: sub-components (e.g. `icon`, `heading`, `panel`)
3. **Alphabetically within each group**

#### Naming convention

Always use **kebab-case** — never camelCase:

```
✅ border-color, padding-inline-start, background-color
❌ borderColor, paddingInlineStart, backgroundColor
```

#### Example — Button component tokens

```json
{
  "dsn": {
    "button": {
      "background-color": "#fff",
      "border-color": "#000",
      "border-width": "1px",
      "color": "#000",
      "padding-inline-start": "16px",
      "active": {
        "background-color": "#eee"
      },
      "hover": {
        "background-color": "#f5f5f5"
      },
      "focus-visible": {
        "outline-color": "#0000ff"
      },
      "primary": {
        "background-color": "#5115EF",
        "color": "#fff"
      },
      "secondary": {
        "background-color": "#006FB3",
        "color": "#fff"
      },
      "icon": {
        "size": "24px"
      }
    }
  }
}
```

**Why this order?**

- Base properties describe the default state — they come first
- States are variations on the base — they come right after
- Variants are alternative versions (e.g. primary vs secondary) — after states
- Sub-components are internal parts (e.g. icon inside a button) — last

This makes each token file readable top-to-bottom: first what a thing looks like normally, then how it changes, then which variants exist.

---

### Adding New Semantic Tokens

1. **Update appropriate JSON file** in `tokens/themes/{theme}/`

   ```json
   // Example: Adding a new spacing token
   {
     "dsn": {
       "space": {
         "block": {
           "7xl": { "value": "{dsn.space.base} * 10" }
         }
       }
     }
   }
   ```

2. **Run the build**

   ```bash
   pnpm --filter @dsn/design-tokens build
   ```

3. **Verify output** in `dist/css/`

   ```bash
   cat packages/design-tokens/dist/css/start-light-default.css | grep "7xl"
   ```

4. **Test in components** - Use the new token in a component

5. **Update documentation** - Add to [Design Tokens Reference](./02-design-tokens-reference.md)

### Adding Component Tokens

1. **Define semantic token mappings**

   ```json
   // tokens/components/my-component.json
   {
     "dsn": {
       "my-component": {
         "background-color": { "value": "{dsn.color.neutral.bg-default}" },
         "hover": {
           "background-color": { "value": "{dsn.color.neutral.bg-hover}" }
         }
       }
     }
   }
   ```

2. **Run build**

   ```bash
   pnpm build:tokens
   ```

3. **Update component CSS** to use new tokens

   ```css
   .dsn-my-component {
     background-color: var(--dsn-my-component-background-color);
   }

   .dsn-my-component:hover {
     background-color: var(--dsn-my-component-hover-background-color);
   }
   ```

4. **Test visual rendering** in Storybook

5. **Update documentation** - Add component spec to [Components](./03-components.md)

### Adding a New Theme

See [Architecture: Adding a New Theme](./01-architecture.md#adding-a-new-theme)

### Adding a New Project Type

See [Architecture: Adding a New Project Type](./01-architecture.md#adding-a-new-project-type)

---

## Importing Components

### React Components (Barrel Exports)

The `@dsn/components-react` package provides a barrel export for convenient importing:

```tsx
// ✅ Recommended: Import multiple components from barrel export
import { Button, TextInput, Heading, FormField } from '@dsn/components-react';

// Also supported: Import individual components
import { Button } from '@dsn/components-react/Button';
```

**Benefits:**

- Single import statement for multiple components
- Cleaner import sections
- Tree-shaking still works (unused exports are eliminated)
- Better IDE autocomplete

### HTML/CSS Components

CSS components can be imported individually:

```tsx
// In React components that use HTML/CSS styles
import './Button.css'; // Re-exports from @dsn/components-html

// The CSS file contains:
// @import '../../../components-html/src/button/button.css';
```

**Package Exports:**

The `@dsn/components-html` package exports individual CSS files:

```json
{
  "exports": {
    "./button": "./src/button/button.css",
    "./icon": "./src/icon/icon.css"
    // ... other components
  }
}
```

### Design Tokens

```tsx
// CSS
@import '@dsn/design-tokens/css';         // Light theme
@import '@dsn/design-tokens/css/dark';    // Dark theme

// JavaScript/TypeScript (typed exports)
import { DsnColorNeutralBgDocument } from '@dsn/design-tokens';
```

### Core Utilities

```tsx
// JavaScript utilities
import { classNames, bem, bemModifiers } from '@dsn/core';

// CSS utilities and reset
import '@dsn/core/css'; // Includes reset + utilities
```

---

## CSS Methodology

### Mobile-First Approach

**Principle:** Write CSS for mobile devices first, then progressively enhance for larger screens.

**✅ CORRECT - Mobile-First:**

```css
/* Base styles for mobile (no media query needed) */
.component {
  font-size: 1rem;
  padding: 0.5rem;
}

/* Enhance for tablets */
@media (min-width: 768px) {
  .component {
    font-size: 1.125rem;
    padding: 1rem;
  }
}
```

**❌ INCORRECT - Desktop-First:**

```css
/* Don't do this */
.component {
  font-size: 1.125rem;
  padding: 1rem;
}

@media (max-width: 767px) {
  .component {
    font-size: 1rem;
    padding: 0.5rem;
  }
}
```

### BEM Naming Convention

**Block Element Modifier**

```css
.dsn-button {
} /* Block */
.dsn-button__icon {
} /* Element */
.dsn-button--strong {
} /* Modifier */
.dsn-button--size-small {
} /* Modifier */
```

**Guidelines:**

- Use single dash for word separation within names
- Use double dash `--` for modifiers
- Use double underscore `__` for elements
- Prefix all component classes with `dsn-`

### CSS Best Practices

**Use design tokens:**

```css
/* ✅ Good */
.component {
  color: var(--dsn-color-neutral-color-default);
  padding: var(--dsn-space-block-md);
}

/* ❌ Bad */
.component {
  color: #333;
  padding: 8px;
}
```

**Avoid `transition: all`:**

```css
/* ✅ Good - specific properties */
.component {
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

/* ❌ Bad - performance issues */
.component {
  transition: all 0.2s ease;
}
```

**Use logical properties:**

```css
/* ✅ Good - logical properties */
.component {
  margin-block-end: 1rem;
  padding-inline-start: 0.5rem;
}

/* ❌ Bad - physical properties */
.component {
  margin-bottom: 1rem;
  padding-left: 0.5rem;
}
```

---

## Testing Strategy

### Test Coverage

- **Total tests:** 628 across 35 test suites
- **Frameworks:** Vitest + React Testing Library
- **Coverage areas:** React components, Web Components, utilities

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests for specific component
pnpm test Button

# Run tests with coverage
pnpm test --coverage
```

### Writing Component Tests

**React Component Test Example:**

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@dsn/components-react';
// or: import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('applies variant class', () => {
    render(<Button variant="strong">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('dsn-button--strong');
  });

  it('applies size class', () => {
    render(<Button size="large">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('dsn-button--size-large');
  });
});
```

**Web Component Test Example:**

```tsx
import { describe, it, expect, beforeAll } from 'vitest';
import { defineButton } from './Button';

describe('DsnButton', () => {
  beforeAll(() => {
    defineButton();
  });

  it('renders with text', () => {
    const button = document.createElement('dsn-button');
    button.textContent = 'Click me';
    document.body.appendChild(button);

    expect(button.shadowRoot?.textContent).toContain('Click me');

    button.remove();
  });
});
```

### Test Checklist

After adding/updating a component:

- [ ] Component renders correctly
- [ ] All props work as expected
- [ ] All variants/sizes render correctly
- [ ] Accessibility attributes are present
- [ ] Event handlers work correctly
- [ ] Edge cases are covered
- [ ] TypeScript types are correct

---

## Code Quality

### Pre-commit Hooks

The project uses Husky + lint-staged to run checks before commits:

```json
{
  "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{css,scss,md,json}": ["prettier --write"]
}
```

### ESLint Configuration

- **Config file:** `.eslintrc.js`
- **Ignored patterns:** `*.generated.*` files
- **Rules:** Standard TypeScript + React rules

### TypeScript

```bash
# Type-check all packages
pnpm type-check

# Type-check specific package
pnpm --filter @dsn/components-react type-check
```

### Prettier

```bash
# Format all files
pnpm format

# Check formatting
pnpm format:check
```

### CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):

1. **Lint** - ESLint check
2. **Type-check** - TypeScript compilation
3. **Test** - Run all tests
4. **Build** - Build all packages

All checks must pass before merging to main.

---

## Best Practices

### Component Development

1. **Start with tokens** - Define component tokens before writing CSS
2. **Mobile-first** - Design for small screens first
3. **Accessibility** - Use semantic HTML and ARIA attributes
4. **Test thoroughly** - Write tests for all props and states
5. **Document** - Update Storybook and markdown docs

### Token Development

1. **Use references** - Component tokens reference semantic tokens
2. **Consistent naming** - Follow the naming convention
3. **Document values** - Add comments for complex calculations
4. **Test themes** - Verify tokens in all theme/mode combinations

### Code Review

Before submitting a PR:

- [ ] All tests pass
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] Prettier formatting applied
- [ ] Documentation updated
- [ ] Storybook stories added/updated
- [ ] No console errors or warnings

---

## Related Documentation

- **[Architecture](./01-architecture.md)** - Token architecture
- **[Design Tokens Reference](./02-design-tokens-reference.md)** - Token values
- **[Components](./03-components.md)** - Component specifications
- **[Storybook Configuration](./05-storybook-configuration.md)** - Documentation setup
