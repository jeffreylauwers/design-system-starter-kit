# Design System Starter Kit

A production-ready, white-label design system starter kit built with design tokens, web components, React components, and comprehensive documentation.

**New here?** Start with the [Getting Started guide](./docs/00-getting-started.md) — it walks you from install to first component in under five minutes. The rest of this file is a reference for contributors and maintainers.

## Packages

This monorepo contains the following packages:

- **[@dsn-starter-kit/design-tokens](./packages/design-tokens)** - Design tokens (colors, typography, spacing, etc.)
- **[@dsn-starter-kit/core](./packages/core)** - Core utilities and global styles (CSS reset, utility classes)
- **[@dsn-starter-kit/components-html](./packages/components-html)** - Pure HTML/CSS components
- **[@dsn-starter-kit/components-react](./packages/components-react)** - React components with TypeScript
- **[@dsn-starter-kit/components-web](./packages/components-web)** - Web Components (vanilla TypeScript)
- **[@dsn-starter-kit/storybook](./packages/storybook)** - Documentation and component showcase

Internal packages (not published to npm):

- **[@dsn-starter-kit/figma-sync](./packages/figma-sync)** - Generates Figma node specs from the HTML/CSS layer
- **[@dsn-starter-kit/figma-plugin](./packages/figma-plugin)** - Figma plugin that writes the generated variables and component specs into Figma
- **[@dsn-starter-kit/color-palette-generator](./packages/color-palette-generator)** - Interactive OKLCH color palette generator for white-label themes

## Quick Start

### Option A: Install from npm (recommended for consumers)

All packages are published to npm under the `@dsn-starter-kit` scope:

```bash
pnpm add @dsn-starter-kit/components-react @dsn-starter-kit/core
```

```tsx
import '@dsn-starter-kit/core/css'; // design tokens + reset
import '@dsn-starter-kit/components-react/css'; // all component styles
import { Button, Stack, Heading } from '@dsn-starter-kit/components-react';
```

### Option B: Clone the repository (for contributors and forks)

### Prerequisites

- Node.js 20+ (LTS recommended)
- PNPM 8+

Install PNPM if you haven't already:

```bash
npm install -g pnpm
```

### Installation

```bash
# Clone the repository
git clone https://github.com/jeffreylauwers/design-system-starter-kit.git
cd design-system-starter-kit

# Install dependencies
pnpm install

# Build design tokens
pnpm build:tokens

# Start Storybook
pnpm dev
```

Storybook will open at [http://localhost:6006](http://localhost:6006)

## Development

### Available Scripts

```bash
# Build all packages (in correct dependency order)
pnpm build

# Build specific layers
pnpm build:tokens      # Design tokens only
pnpm build:core        # Core utilities
pnpm build:components  # All component packages
pnpm build:storybook   # Storybook static site

# Build the Figma chain (tokens, variables, component specs, plugin)
pnpm build:figma

# Watch design tokens for changes
pnpm --filter @dsn-starter-kit/design-tokens watch

# Start Storybook in development mode
pnpm dev

# Run tests (1661 tests across 80 test suites)
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

1. **Design Tokens** (`@dsn-starter-kit/design-tokens`) - Generates CSS, SCSS, JS, and JSON files
2. **Core** (`@dsn-starter-kit/core`) - Builds utilities and base styles
3. **Components** (`@dsn-starter-kit/components-html`, `@dsn-starter-kit/components-react`, `@dsn-starter-kit/components-web`) - Builds all component packages
4. **Storybook** (`@dsn-starter-kit/storybook`) - Generates static documentation site

Icon generation is automatically included in the React components build step.

### Working with Packages

```bash
# Build a specific package
pnpm --filter @dsn-starter-kit/design-tokens build

# Add dependency to a package
pnpm --filter @dsn-starter-kit/components-react add react

# Add dev dependency to root
pnpm add -Dw eslint

# Run script in all packages
pnpm -r build
```

## Design Tokens

Design tokens are the foundation of the system. They are organized in a three-tier architecture:

1. **Core tokens** - Universal values (borders, spacing, typography, sizing)
2. **Theme tokens** - Color values per theme (light, dark)
3. **Semantic tokens** - Component-level references (e.g. form-control)

Token categories:

- **Typography** - Font families, sizes, weights, line heights (fluid scale)
- **Spacing** - 5 concepts (block, inline, text, column, row)
- **Colors** - 10 semantic color sets with light/dark themes
- **Sizing** - Icon sizes coupled to typography (fluid, scales with viewport)
- **Borders** - Radius and width values
- **Shadows** - 3 elevation levels
- **Focus States** - Accessible focus indicators
- **Form Controls** - Border, spacing, typography, and color tokens for form elements (7 states)
- **Form Components** - 26 form components, covered by 22 token files (EmailInput, NumberInput, TelephoneInput, FormFieldset and FormFieldLegend define none of their own and reuse the shared `form-control` tokens)

All tokens (~1380 per configuration) are built with [Style Dictionary](https://amzn.github.io/style-dictionary/) and exported as:

- CSS Custom Properties
- SCSS Variables
- JavaScript/TypeScript modules (with typed exports)
- JSON

## Components

### Importing Components

The React component package provides a convenient barrel export for easy importing:

```tsx
// Import multiple components at once
import {
  Button,
  TextInput,
  Heading,
  Icon,
} from '@dsn-starter-kit/components-react';

// Or import individually (if preferred)
import { Button } from '@dsn-starter-kit/components-react/Button';
```

All components are fully typed with TypeScript and include comprehensive JSDoc documentation.

### Current Components

**Layout Components (10)**

| Component           | HTML/CSS | React | Web Component |
| ------------------- | -------- | ----- | ------------- |
| **ActionGroup**     | Yes      | Yes   | No            |
| **Body**            | Yes      | Yes   | No            |
| **BreakoutSection** | Yes      | Yes   | No            |
| **Container**       | Yes      | Yes   | No            |
| **Grid**            | Yes      | Yes   | No            |
| **GridItem**        | Yes      | Yes   | No            |
| **Hero**            | Yes      | Yes   | No            |
| **PageBody**        | Yes      | Yes   | No            |
| **PageLayout**      | Yes      | Yes   | No            |
| **Stack**           | Yes      | Yes   | No            |

**Content Components (13)**

| Component         | HTML/CSS | React | Web Component |
| ----------------- | -------- | ----- | ------------- |
| **Button**        | Yes      | Yes   | Yes           |
| **ButtonLink**    | Yes      | Yes   | No            |
| **Heading**       | Yes      | Yes   | Yes           |
| **HeadingGroup**  | Yes      | Yes   | No            |
| **Icon**          | Yes      | Yes   | Yes           |
| **IconList**      | Yes      | Yes   | No            |
| **Image**         | Yes      | Yes   | No            |
| **Link**          | Yes      | Yes   | Yes           |
| **LinkButton**    | Yes      | Yes   | No            |
| **OrderedList**   | Yes      | Yes   | Yes           |
| **Paragraph**     | Yes      | Yes   | Yes           |
| **PreHeading**    | Yes      | Yes   | No            |
| **UnorderedList** | Yes      | Yes   | Yes           |

**Display & Feedback Components (17)**

| Component       | HTML/CSS | React | Web Component |
| --------------- | -------- | ----- | ------------- |
| **Alert**       | Yes      | Yes   | No            |
| **Backdrop**    | Yes      | Yes   | No            |
| **Card**        | Yes      | Yes   | No            |
| **Details**     | Yes      | Yes   | No            |
| **DotBadge**    | Yes      | Yes   | No            |
| **Drawer**      | Yes      | Yes   | No            |
| **File**        | Yes      | Yes   | No            |
| **FileList**    | Yes      | Yes   | No            |
| **ModalDialog** | Yes      | Yes   | No            |
| **Note**        | Yes      | Yes   | No            |
| **NumberBadge** | Yes      | Yes   | No            |
| **Popover**     | Yes      | Yes   | No            |
| **ProgressBar** | Yes      | Yes   | No            |
| **Spinner**     | Yes      | Yes   | No            |
| **StatusBadge** | Yes      | Yes   | No            |
| **SummaryList** | Yes      | Yes   | No            |
| **Table**       | Yes      | Yes   | No            |

**Navigation Components (7)**

| Component                | HTML/CSS | React | Web Component |
| ------------------------ | -------- | ----- | ------------- |
| **BreadcrumbNavigation** | Yes      | Yes   | No            |
| **Menu**                 | Yes      | Yes   | No            |
| **MenuButton**           | Yes      | Yes   | No            |
| **MenuLink**             | Yes      | Yes   | No            |
| **PageFooter**           | Yes      | Yes   | No            |
| **PageHeader**           | Yes      | Yes   | No            |
| **TableOfContents**      | Yes      | Yes   | No            |

**Branding Components (1)**

| Component | HTML/CSS | React | Web Component |
| --------- | -------- | ----- | ------------- |
| **Logo**  | Yes      | Yes   | No            |

**Accessibility Components (1)**

| Component    | HTML/CSS | React | Web Component |
| ------------ | -------- | ----- | ------------- |
| **SkipLink** | Yes      | Yes   | No            |

**Form Components (26)**

| Component                 | HTML/CSS | React | Web Component |
| ------------------------- | -------- | ----- | ------------- |
| **Checkbox**              | Yes      | Yes   | No            |
| **CheckboxGroup**         | Yes      | Yes   | No            |
| **CheckboxOption**        | Yes      | Yes   | No            |
| **DateInput**             | Yes      | Yes   | No            |
| **DateInputGroup**        | Yes      | Yes   | No            |
| **EmailInput**            | Yes      | Yes   | No            |
| **FileInput**             | Yes      | Yes   | No            |
| **FormField**             | Yes      | Yes   | No            |
| **FormFieldDescription**  | Yes      | Yes   | No            |
| **FormFieldErrorMessage** | Yes      | Yes   | No            |
| **FormFieldLabel**        | Yes      | Yes   | No            |
| **FormFieldLegend**       | Yes      | Yes   | No            |
| **FormFieldset**          | Yes      | Yes   | No            |
| **FormFieldStatus**       | Yes      | Yes   | No            |
| **NumberInput**           | Yes      | Yes   | No            |
| **OptionLabel**           | Yes      | Yes   | No            |
| **PasswordInput**         | Yes      | Yes   | No            |
| **Radio**                 | Yes      | Yes   | No            |
| **RadioGroup**            | Yes      | Yes   | No            |
| **RadioOption**           | Yes      | Yes   | No            |
| **SearchInput**           | Yes      | Yes   | No            |
| **Select**                | Yes      | Yes   | No            |
| **TelephoneInput**        | Yes      | Yes   | No            |
| **TextArea**              | Yes      | Yes   | No            |
| **TextInput**             | Yes      | Yes   | No            |
| **TimeInput**             | Yes      | Yes   | No            |

See the [Documentation](./docs/) for full component details and specifications.

### Component Composition

Components are designed to compose together:

**Layout Components**

```jsx
// React: Container als visueel kader voor gerelateerde content
<Container>
  <Heading level={2}>Sectie</Heading>
  <Paragraph>Inhoud van de container.</Paragraph>
</Container>

// React: Elevated container met schaduw (bijv. kaart)
<Container elevated as="article">
  <Paragraph>Dit is een elevated container.</Paragraph>
</Container>

// React: Grid met Containers als items
<Grid contained>
  <GridItem colSpan={8}><Container>Hoofdinhoud</Container></GridItem>
  <GridItem colSpan={4}><Container>Sidebar</Container></GridItem>
</Grid>
```

**Content Components**

```jsx
// React: Button with icon
<Button variant="strong" size="default">
  <Icon name="check" size="sm" />
  Save Changes
</Button>

// React: Button loading state (animated loader replaces iconStart)
<Button loading>Saving...</Button>

// React: External link (visible hint, no icon)
<Link href="https://example.com" external>Visit example.com</Link>
```

```html
<!-- Web Component: Button with icon -->
<dsn-button variant="strong" size="default">
  <dsn-icon name="check" size="sm"></dsn-icon>
  Save Changes
</dsn-button>

<!-- Web Component: External link -->
<dsn-link href="https://example.com" external>Visit example.com</dsn-link>
```

**Form Components**

```jsx
// React: Complete form field with text input
<FormField
  label="Email address"
  htmlFor="email"
  description="We'll never share your email"
  error={errors.email}
>
  <EmailInput
    id="email"
    invalid={!!errors.email}
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</FormField>

// React: Checkbox group with fieldset/legend
<FormFieldset
  legend="Notification preferences"
  description="Choose how you want to be notified"
>
  <CheckboxGroup>
    <CheckboxOption label="Email notifications" value="email" />
    <CheckboxOption label="SMS notifications" value="sms" />
    <CheckboxOption label="Push notifications" value="push" />
  </CheckboxGroup>
</FormFieldset>

// React: Radio group
<FormFieldset legend="Delivery method">
  <RadioGroup>
    <RadioOption label="Standard shipping" name="delivery" value="standard" />
    <RadioOption label="Express shipping" name="delivery" value="express" />
  </RadioGroup>
</FormFieldset>
```

## Accessibility

Accessibility is built-in from the start:

- WCAG 2.2 Level AA compliant
- Proper semantic HTML
- Keyboard navigation support
- Focus management
- ARIA attributes where needed
- Color contrast compliance
- Touch target sizes (48px minimum)
- `.sr-only` utility class for visually hidden, screen reader accessible content
- External links include visible "(opens in new tab)" hint text

## Theming

Full dark mode support out of the box:

```css
/* Light theme (default) */
@import '@dsn-starter-kit/design-tokens/css';

/* Dark theme */
@import '@dsn-starter-kit/design-tokens/css/dark';
```

```ts
// JavaScript (typed exports)
import { DsnColorNeutralBgDocument } from '@dsn-starter-kit/design-tokens';
import { DsnColorNeutralBgDocument as Dark } from '@dsn-starter-kit/design-tokens/dark';
```

Toggle themes by switching CSS files or using CSS custom properties.

## Documentation

Comprehensive documentation is available in the `/docs` folder:

- **[Documentation Index](./docs/)** - Complete documentation overview
- **[Architecture](./docs/01-architecture.md)** - Token system and three-axis configuration
- **[Design Tokens Reference](./docs/02-design-tokens-reference.md)** - All token values and scales
- **[Components](./docs/03-components.md)** - Component specifications and API
- **[Development Workflow](./docs/04-development-workflow.md)** - Development guidelines
- **[Storybook Configuration](./docs/05-storybook-configuration.md)** - Documentation setup
- **[Changelog](./docs/changelog.md)** - Version history

## Code Quality

- **Pre-commit hooks** via Husky + lint-staged (ESLint + Prettier)
- **Type checking** across all packages (`pnpm type-check`)
- **1661 tests** covering React components, Web Components, and utilities
- **CI/CD** via GitHub Actions (lint, type-check, test, build)

## Tech Stack

- **Build Tool:** Vite
- **Token Processor:** Style Dictionary 4.4.0 (DTCG format)
- **Web Components:** Vanilla TypeScript (Shadow DOM)
- **React:** 18+
- **TypeScript:** 5.3+
- **Testing:** Vitest + React Testing Library
- **Documentation:** Storybook 10.3.6
- **CI/CD:** GitHub Actions
- **Package Manager:** PNPM 8+
- **Code Quality:** Husky, lint-staged, ESLint, Prettier
- **CSS:** Custom Properties (no preprocessor required)

## License

MIT - Jeffrey Lauwers

## Links

- [Repository](https://github.com/jeffreylauwers/design-system-starter-kit)
- [Live Storybook](https://jeffreylauwers.github.io/design-system-starter-kit/)
- [Documentation](./docs/)

---

**Built by Jeffrey Lauwers**
