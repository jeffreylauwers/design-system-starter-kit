# Design System Starter Kit

A production-ready, white-label design system starter kit built with design tokens, web components, React components, and comprehensive documentation.

## Packages

This monorepo contains the following packages:

- **[@dsn/design-tokens](./packages/design-tokens)** - Design tokens (colors, typography, spacing, etc.)
- **[@dsn/core](./packages/core)** - Core utilities and global styles (CSS reset, utility classes)
- **[@dsn/components-html](./packages/components-html)** - Pure HTML/CSS components
- **[@dsn/components-react](./packages/components-react)** - React components with TypeScript
- **[@dsn/components-web](./packages/components-web)** - Web Components (vanilla TypeScript)
- **[@dsn/storybook](./packages/storybook)** - Documentation and component showcase

## Quick Start

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

# Watch design tokens for changes
pnpm --filter @dsn/design-tokens watch

# Start Storybook in development mode
pnpm dev

# Run tests (1169 tests across 57 test suites)
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

1. **Design Tokens** (`@dsn/design-tokens`) - Generates CSS, SCSS, JS, and JSON files
2. **Core** (`@dsn/core`) - Builds utilities and base styles
3. **Components** (`@dsn/components-html`, `@dsn/components-react`, `@dsn/components-web`) - Builds all component packages
4. **Storybook** (`@dsn/storybook`) - Generates static documentation site

Icon generation is automatically included in the React components build step.

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
- **Form Components** - 19 complete form components with 26 token files

All tokens (~1050 per configuration) are built with [Style Dictionary](https://amzn.github.io/style-dictionary/) and exported as:

- CSS Custom Properties
- SCSS Variables
- JavaScript/TypeScript modules (with typed exports)
- JSON

## Components

### Importing Components

The React component package provides a convenient barrel export for easy importing:

```tsx
// Import multiple components at once
import { Button, TextInput, Heading, Icon } from '@dsn/components-react';

// Or import individually (if preferred)
import { Button } from '@dsn/components-react/Button';
```

All components are fully typed with TypeScript and include comprehensive JSDoc documentation.

### Current Components

**Layout Components (5)**

| Component     | HTML/CSS | React | Web Component |
| ------------- | -------- | ----- | ------------- |
| **Body**      | Yes      | Yes   | —             |
| **Container** | Yes      | Yes   | —             |
| **Grid**      | Yes      | Yes   | —             |
| **GridItem**  | Yes      | Yes   | —             |
| **Stack**     | Yes      | Yes   | —             |

**Content Components (10)**

| Component         | HTML/CSS | React | Web Component |
| ----------------- | -------- | ----- | ------------- |
| **Button**        | Yes      | Yes   | Yes           |
| **ButtonLink**    | Yes      | Yes   | —             |
| **Heading**       | Yes      | Yes   | Yes           |
| **Icon**          | Yes      | Yes   | Yes           |
| **Image**         | Yes      | Yes   | —             |
| **Link**          | Yes      | Yes   | Yes           |
| **LinkButton**    | Yes      | Yes   | —             |
| **OrderedList**   | Yes      | Yes   | Yes           |
| **Paragraph**     | Yes      | Yes   | Yes           |
| **UnorderedList** | Yes      | Yes   | Yes           |

**Display & Feedback Components (8)**

| Component       | HTML/CSS | React | Web Component |
| --------------- | -------- | ----- | ------------- |
| **Alert**       | Yes      | Yes   | —             |
| **Backdrop**    | Yes      | Yes   | —             |
| **Card**        | Yes      | Yes   | —             |
| **Details**     | Yes      | Yes   | —             |
| **DotBadge**    | Yes      | Yes   | —             |
| **Note**        | Yes      | Yes   | —             |
| **StatusBadge** | Yes      | Yes   | —             |
| **Table**       | Yes      | Yes   | —             |

**Form Components (25)**

| Component                 | HTML/CSS | React | Web Component |
| ------------------------- | -------- | ----- | ------------- |
| **Checkbox**              | Yes      | Yes   | —             |
| **CheckboxGroup**         | Yes      | Yes   | —             |
| **CheckboxOption**        | Yes      | Yes   | —             |
| **DateInput**             | Yes      | Yes   | —             |
| **DateInputGroup**        | Yes      | Yes   | —             |
| **EmailInput**            | Yes      | Yes   | —             |
| **FormField**             | Yes      | Yes   | —             |
| **FormFieldDescription**  | Yes      | Yes   | —             |
| **FormFieldErrorMessage** | Yes      | Yes   | —             |
| **FormFieldLabel**        | Yes      | Yes   | —             |
| **FormFieldLegend**       | Yes      | Yes   | —             |
| **FormFieldset**          | Yes      | Yes   | —             |
| **FormFieldStatus**       | Yes      | Yes   | —             |
| **NumberInput**           | Yes      | Yes   | —             |
| **OptionLabel**           | Yes      | Yes   | —             |
| **PasswordInput**         | Yes      | Yes   | —             |
| **Radio**                 | Yes      | Yes   | —             |
| **RadioGroup**            | Yes      | Yes   | —             |
| **RadioOption**           | Yes      | Yes   | —             |
| **SearchInput**           | Yes      | Yes   | —             |
| **Select**                | Yes      | Yes   | —             |
| **TelephoneInput**        | Yes      | Yes   | —             |
| **TextArea**              | Yes      | Yes   | —             |
| **TextInput**             | Yes      | Yes   | —             |
| **TimeInput**             | Yes      | Yes   | —             |

See the [Documentation](./docs/) for full component details and specifications.

### Component Composition

Components are designed to compose together:

**Layout Components**

```jsx
// React — Container als visueel kader voor gerelateerde content
<Container>
  <Heading level={2}>Sectie</Heading>
  <Paragraph>Inhoud van de container.</Paragraph>
</Container>

// React — Elevated container met schaduw (bijv. kaart)
<Container elevated as="article">
  <Paragraph>Dit is een elevated container.</Paragraph>
</Container>

// React — Grid met Containers als items
<Grid contained>
  <GridItem colSpan={8}><Container>Hoofdinhoud</Container></GridItem>
  <GridItem colSpan={4}><Container>Sidebar</Container></GridItem>
</Grid>
```

**Content Components**

```jsx
// React — Button with icon
<Button variant="strong" size="default">
  <Icon name="check" size="sm" />
  Save Changes
</Button>

// React — Button loading state (animated loader replaces iconStart)
<Button loading>Saving...</Button>

// React — External link (visible hint, no icon)
<Link href="https://example.com" external>Visit example.com</Link>
```

```html
<!-- Web Component — Button with icon -->
<dsn-button variant="strong" size="default">
  <dsn-icon name="check" size="sm"></dsn-icon>
  Save Changes
</dsn-button>

<!-- Web Component — External link -->
<dsn-link href="https://example.com" external>Visit example.com</dsn-link>
```

**Form Components**

```jsx
// React — Complete form field with text input
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

// React — Checkbox group with fieldset/legend
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

// React — Radio group
<FormFieldset legend="Delivery method">
  <RadioGroup>
    <RadioOption label="Standard shipping" name="delivery" value="standard" />
    <RadioOption label="Express shipping" name="delivery" value="express" />
  </RadioGroup>
</FormFieldset>
```

## Accessibility

Accessibility is built-in from the start:

- WCAG 2.1 Level AA compliant
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
@import '@dsn/design-tokens/css';

/* Dark theme */
@import '@dsn/design-tokens/css/dark';
```

```ts
// JavaScript (typed exports)
import { DsnColorNeutralBgDocument } from '@dsn/design-tokens';
import { DsnColorNeutralBgDocument as Dark } from '@dsn/design-tokens/dark';
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
- **1169 tests** covering React components, Web Components, and utilities
- **CI/CD** via GitHub Actions (lint, type-check, test, build)

## Tech Stack

- **Build Tool:** Vite
- **Token Processor:** Style Dictionary 3.9
- **Web Components:** Vanilla TypeScript (Shadow DOM)
- **React:** 18+
- **TypeScript:** 5.3+
- **Testing:** Vitest + React Testing Library
- **Documentation:** Storybook 7.x
- **CI/CD:** GitHub Actions
- **Package Manager:** PNPM 8+
- **Code Quality:** Husky, lint-staged, ESLint, Prettier
- **CSS:** Custom Properties (no preprocessor required)

## License

MIT - Jeffrey Lauwers

## Links

- [Repository](https://github.com/jeffreylauwers/design-system-starter-kit)
- [Live Storybook](https://jeffreylauwers.github.io/design-system-starterkit/)
- [Documentation](./docs/)

---

**Built by Jeffrey Lauwers**
