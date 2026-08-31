# Design System Documentation

**Version:** 5.30.0
**Last Updated:** April 26, 2026

Complete documentation voor het Design System Starter Kit.

---

## 📚 Table of Contents

### Core Documentation

0. **[Getting Started](./00-getting-started.md)**
   - Install from npm
   - CSS setup per framework (Vite, Next.js)
   - First component example
   - Theming and dark mode

1. **[Architecture](./01-architecture.md)**
   - Token architecture (3-tier structure)
   - Three-axis configuration model (Theme × Mode × Project Type)
   - Build system
   - Naming conventions

2. **[Design Tokens Reference](./02-design-tokens-reference.md)**
   - Typography (font families, sizes, weights, line heights)
   - Spacing (5 concepts: block, inline, text, column, row)
   - Sizing (icon sizes, pointer targets)
   - Colors (14 color sets with light/dark themes)
   - Borders (radius, width)
   - Focus states

3. **[Components](./03-components.md)**
   - Component guidelines
   - All component specifications (Button, Form components, Content components)
   - Component token architecture
   - Web Components registration

4. **[Development Workflow](./04-development-workflow.md)**
   - Token updates
   - Package scripts
   - CSS methodology
   - Testing strategy

5. **[CSS & Token Naming Conventions](./06-css-naming-conventions.md)**
   - Namespace prefix `dsn-`
   - BEM: Block, Element, Modifier
   - CSS custom property structuur (globaal, component, lokale alias)
   - Design token namen in JSON
   - Snelle referentie en veelgemaakte fouten

6. **[Storybook Configuration](./05-storybook-configuration.md)**
   - Architecture overview
   - Runtime theme switching
   - TokenTable component
   - Documentation structure

7. **[Form Flow Patterns](./07-form-flow-patterns.md)**
   - Enkelvoudig vs meerstappenformulier, en de flow-structuur
   - De juiste formuliercontrole kiezen, en bestanden uploaden
   - Validatie en foutmeldingsteksten
   - Review- en bevestigingspagina

8. **[Changelog](./changelog.md)**
   - Version history
   - Feature additions
   - Breaking changes

---

## 🚀 Quick Links

- **[Main README](../README.md)** - Installation & quick start
- **[Package: design-tokens](../packages/design-tokens/README.md)** - Design tokens package
- **[Package: components-react](../packages/components-react/README.md)** - React components
- **[Package: components-web](../packages/components-web/README.md)** - Web Components
- **[Repository Structure](./01-architecture.md#repository-structure)** - Project organization

---

## 💡 Getting Started

### New to this Design System?

1. Start with **[Getting Started](./00-getting-started.md)** — install to first component in 5 minutes
2. Read **[Architecture](./01-architecture.md)** to understand the token system
3. Browse **[Components](./03-components.md)** to see what's available
4. Check **[Development Workflow](./04-development-workflow.md)** for contribution guidelines

### Looking for Something Specific?

- **Adding a new theme?** → [Architecture: Adding a New Theme](./01-architecture.md#adding-a-new-theme)
- **Component specs?** → [Components](./03-components.md)
- **Token values?** → [Design Tokens Reference](./02-design-tokens-reference.md)
- **CSS- en tokennamen?** → [CSS & Token Naming Conventions](./06-css-naming-conventions.md)
- **Een formulierflow bouwen?** → [Form Flow Patterns](./07-form-flow-patterns.md)
- **Storybook setup?** → [Storybook Configuration](./05-storybook-configuration.md)
- **Recent changes?** → [Changelog](./changelog.md)

---

## 📊 System Statistics

- **Tokens per configuration:** ~1380
- **Configurations:** 8 (2 themes × 2 modes × 2 project types)
- **Components:** 73 React components; all of them styled by `components-html` (68 CSS files)
- **Tests:** 1678 across 81 test suites
- **Storybook stories:** 601 across 72 component pages

---

## 🎯 Key Principles

- **Scalable** - Built for growth from day one
- **Themeable** - Full multi-theme and light/dark mode support
- **Accessible** - WCAG 2.2 Level AA compliant
- **Framework Agnostic** - Tokens work everywhere
- **Developer Friendly** - Clear naming, good DX
- **Mobile-First** - Responsive design from smallest screens up

---

## 📝 Documentation Standards

All documentation follows these principles:

- **Clear structure** - Logical sections with table of contents
- **Examples included** - Code samples for all features
- **Up-to-date** - Version numbers and dates on all docs
- **Cross-referenced** - Links between related topics
- **Searchable** - Descriptive headings and keywords

---

**Built by Jeffrey Lauwers** • [GitHub Repository](https://github.com/jeffreylauwers/design-system-starter-kit)
