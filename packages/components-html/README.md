# @dsn-starter-kit/components-html

Pure HTML/CSS components for the design system: no JavaScript required.

Use these components in static HTML pages, server-rendered templates, or any project that doesn't use a JavaScript framework.

## Features

- Pure CSS, no JavaScript dependencies
- BEM class naming convention
- Uses design tokens via CSS custom properties
- Works with any templating language or static HTML

## Installation

```bash
pnpm add @dsn-starter-kit/components-html
```

## Usage

### In HTML

Include the CSS and use BEM classes on standard HTML elements:

```html
<link
  rel="stylesheet"
  href="@dsn-starter-kit/design-tokens/dist/css/variables.css"
/>
<link
  rel="stylesheet"
  href="@dsn-starter-kit/components-html/dist/components.css"
/>

<button class="dsn-button dsn-button--strong dsn-button--size-default">
  Save
</button>

<button class="dsn-button dsn-button--default dsn-button--size-small">
  Cancel
</button>

<button class="dsn-button dsn-button--strong-negative dsn-button--size-default">
  Delete
</button>
```

### In JavaScript/TypeScript Projects

The package exports individual component CSS files:

```tsx
// Import all components
import '@dsn-starter-kit/components-html';

// Or import individual components
import '@dsn-starter-kit/components-html/button';
import '@dsn-starter-kit/components-html/alert';
import '@dsn-starter-kit/components-html/modal-dialog';
```

**Available exports:**

- `./action-group` — Action group styles
- `./alert` — Alert component styles
- `./backdrop` — Backdrop overlay styles
- `./body` — Body component styles
- `./breadcrumb-navigation` — Breadcrumb navigation styles
- `./breakout-section` — Breakout section styles
- `./button` — Button component styles
- `./button-link` — ButtonLink component styles
- `./card` — Card component styles
- `./checkbox` — Checkbox styles
- `./checkbox-group` — Checkbox group styles
- `./checkbox-option` — Checkbox option styles
- `./container` — Container layout styles
- `./data-list` — Data list styles
- `./date-input` — Date input styles
- `./date-input-group` — Date input group styles
- `./details` — Details/summary styles
- `./dot-badge` — Dot badge styles
- `./drawer` — Drawer component styles
- `./file` — File component styles
- `./file-input` — File input styles
- `./form-field` — Form field styles
- `./form-field-description` — Form field description styles
- `./form-field-error-message` — Form field error message styles
- `./form-field-label` — Form field label styles
- `./form-field-status` — Form field status styles
- `./form-fieldset` — Form fieldset styles
- `./grid` — Grid layout styles
- `./heading` — Heading styles
- `./heading-group` — Heading group styles
- `./hero` — Hero section styles
- `./icon` — Icon component styles
- `./image` — Image component styles
- `./link` — Link component styles
- `./link-button` — LinkButton component styles
- `./logo` — Logo component styles
- `./menu` — Menu component styles
- `./menu-button` — Menu button styles
- `./menu-link` — Menu link styles
- `./modal-dialog` — Modal dialog styles
- `./note` — Note component styles
- `./number-badge` — Number badge styles
- `./option-label` — Option label styles
- `./ordered-list` — Ordered list styles
- `./page-body` — Page body styles
- `./page-footer` — Page footer styles
- `./page-header` — Page header styles
- `./page-layout` — Page layout styles
- `./paragraph` — Paragraph styles
- `./popover` — Popover component styles
- `./popover-menu` — PopoverMenu component styles
- `./pre-heading` — Pre-heading styles
- `./progress-bar` — Progress bar styles
- `./radio` — Radio styles
- `./radio-group` — Radio group styles
- `./radio-option` — Radio option styles
- `./search-input` — Search input styles
- `./select` — Select component styles
- `./skip-link` — Skip link styles
- `./spinner` — Spinner component styles
- `./stack` — Stack layout styles
- `./status-badge` — Status badge styles
- `./table` — Table component styles
- `./table-of-contents` — Table of contents styles
- `./text-area` — Text area styles
- `./text-input` — Text input styles
- `./time-input` — Time input styles
- `./unordered-list` — Unordered list styles

### Components that need another component's CSS

Some components put another component's classes in their own markup. The sort
button in a Table column header carries `dsn-button`, a ButtonLink carries
`dsn-button`, a LinkButton carries `dsn-link`. Import one of those on its own and
you get the component's own rules without the ones it builds on, which renders as
an unstyled button or link.

Each such component declares it at the top of its CSS:

```css
/* packages/components-html/src/table/table.css */
/* @dsn-depends-on: button */
```

| Component         | Also import                  |
| ----------------- | ---------------------------- |
| `./button-link`   | `./button`                   |
| `./date-input`    | `./text-input`               |
| `./file`          | `./link`, `./link-button`    |
| `./heading-group` | `./heading`, `./pre-heading` |
| `./link-button`   | `./link`                     |
| `./menu-link`     | `./button`                   |
| `./search-input`  | `./text-input`               |
| `./select`        | `./text-input`               |
| `./table`         | `./button`                   |
| `./time-input`    | `./text-input`               |

Import the dependency first, so the component's own rules still win at equal
specificity:

```tsx
import '@dsn-starter-kit/components-html/button';
import '@dsn-starter-kit/components-html/table';
```

This does not apply to the `.` export: `dist/components.css` contains every
component, ordered so that each one comes after what it depends on.

## Available Components

| Component             | CSS Classes                                                      | Export Path                  |
| --------------------- | ---------------------------------------------------------------- | ---------------------------- |
| ActionGroup           | `dsn-action-group`                                               | `./action-group`             |
| Alert                 | `dsn-alert`, `dsn-alert--{variant}`                              | `./alert`                    |
| Backdrop              | `dsn-backdrop`                                                   | `./backdrop`                 |
| Body                  | `dsn-body`                                                       | `./body`                     |
| BreadcrumbNavigation  | `dsn-breadcrumb-navigation`                                      | `./breadcrumb-navigation`    |
| BreakoutSection       | `dsn-breakout-section`                                           | `./breakout-section`         |
| Button                | `dsn-button`, `dsn-button--{variant}`, `dsn-button--size-{size}` | `./button`                   |
| ButtonLink            | `dsn-button`                                                     | `./button-link`              |
| Card                  | `dsn-card`                                                       | `./card`                     |
| Checkbox              | `dsn-checkbox`, `dsn-checkbox__control`                          | `./checkbox`                 |
| CheckboxGroup         | `dsn-checkbox-group`                                             | `./checkbox-group`           |
| CheckboxOption        | `dsn-checkbox-option`                                            | `./checkbox-option`          |
| Container             | `dsn-container`                                                  | `./container`                |
| DataList              | `dsn-data-list`                                                  | `./data-list`                |
| DateInput             | `dsn-text-input`, `dsn-date-input`                               | `./date-input`               |
| DateInputGroup        | `dsn-date-input-group`                                           | `./date-input-group`         |
| Details               | `dsn-details`                                                    | `./details`                  |
| DotBadge              | `dsn-dot-badge`, `dsn-dot-badge--{variant}`                      | `./dot-badge`                |
| Drawer                | `dsn-drawer`                                                     | `./drawer`                   |
| File                  | `dsn-file`                                                       | `./file`                     |
| FileInput             | `dsn-file-input`                                                 | `./file-input`               |
| FormField             | `dsn-form-field`                                                 | `./form-field`               |
| FormFieldDescription  | `dsn-form-field-description`                                     | `./form-field-description`   |
| FormFieldErrorMessage | `dsn-form-field-error-message`                                   | `./form-field-error-message` |
| FormFieldLabel        | `dsn-form-field-label`                                           | `./form-field-label`         |
| FormFieldStatus       | `dsn-form-field-status`, `dsn-form-field-status--{variant}`      | `./form-field-status`        |
| FormFieldset          | `fieldset.dsn-form-field`                                        | `./form-fieldset`            |
| Grid                  | `dsn-grid`                                                       | `./grid`                     |
| Heading               | `dsn-heading`, `dsn-heading--heading-{level}`                    | `./heading`                  |
| HeadingGroup          | `dsn-heading-group`                                              | `./heading-group`            |
| Hero                  | `dsn-hero`                                                       | `./hero`                     |
| Icon                  | `dsn-icon`, `dsn-icon--size-{size}`                              | `./icon`                     |
| IconList              | `dsn-icon-list`, `dsn-icon-list__item`, `dsn-icon-list__icon`    | `./icon-list`                |
| Image                 | `dsn-image`                                                      | `./image`                    |
| Link                  | `dsn-link`, `dsn-link--external`                                 | `./link`                     |
| LinkButton            | `dsn-link`                                                       | `./link-button`              |
| Logo                  | `dsn-logo`                                                       | `./logo`                     |
| Menu                  | `dsn-menu`, `dsn-menu--horizontal`                               | `./menu`                     |
| MenuButton            | `dsn-menu-button`                                                | `./menu-button`              |
| MenuLink              | `dsn-menu-link`                                                  | `./menu-link`                |
| ModalDialog           | `dsn-modal-dialog`                                               | `./modal-dialog`             |
| Note                  | `dsn-note`, `dsn-note--{variant}`                                | `./note`                     |
| NumberBadge           | `dsn-number-badge`                                               | `./number-badge`             |
| OptionLabel           | `dsn-option-label`                                               | `./option-label`             |
| OrderedList           | `dsn-ordered-list`                                               | `./ordered-list`             |
| PageBody              | `dsn-page-body`                                                  | `./page-body`                |
| PageFooter            | `dsn-page-footer`                                                | `./page-footer`              |
| PageHeader            | `dsn-page-header`                                                | `./page-header`              |
| PageLayout            | `dsn-page-layout`                                                | `./page-layout`              |
| Paragraph             | `dsn-paragraph`, `dsn-paragraph--size-{size}`                    | `./paragraph`                |
| Popover               | `dsn-popover`                                                    | `./popover`                  |
| PopoverMenu           | `dsn-popover-menu`, `dsn-popover-menu--placement-{placement}`    | `./popover-menu`             |
| PreHeading            | `dsn-pre-heading`                                                | `./pre-heading`              |
| ProgressBar           | `dsn-progress-bar`                                               | `./progress-bar`             |
| Radio                 | `dsn-radio`, `dsn-radio__control`                                | `./radio`                    |
| RadioGroup            | `dsn-radio-group`                                                | `./radio-group`              |
| RadioOption           | `dsn-radio-option`                                               | `./radio-option`             |
| SearchInput           | `dsn-text-input`, `dsn-search-input`                             | `./search-input`             |
| Select                | `dsn-text-input`, `dsn-select`                                   | `./select`                   |
| SkipLink              | `dsn-skip-link`                                                  | `./skip-link`                |
| Spinner               | `dsn-spinner`                                                    | `./spinner`                  |
| Stack                 | `dsn-stack`, `dsn-stack--space-{size}`                           | `./stack`                    |
| StatusBadge           | `dsn-status-badge`, `dsn-status-badge--{variant}`                | `./status-badge`             |
| Table                 | `dsn-table`                                                      | `./table`                    |
| TableOfContents       | `dsn-table-of-contents`, `dsn-table-of-contents--plain`          | `./table-of-contents`        |
| TextArea              | `dsn-text-area`, `dsn-text-area--size-{size}`                    | `./text-area`                |
| TextInput             | `dsn-text-input`, `dsn-text-input--size-{size}`                  | `./text-input`               |
| TimeInput             | `dsn-text-input`, `dsn-time-input`                               | `./time-input`               |
| UnorderedList         | `dsn-unordered-list`                                             | `./unordered-list`           |

Some components build on another component's block and need both stylesheets when
you import export paths individually. `./select`, `./search-input`, `./date-input`
and `./time-input` need `./text-input`, and `./form-fieldset` needs `./form-field`.
Importing `dist/components.css` gives you everything in the right order.

## Component manifest

`manifest.json` is a machine-readable index of every component: its BEM block,
category, purpose, which platform implementations exist, and its most important
props. It needs no build step, so tooling and AI agents can read it directly.

```ts
import manifest from '@dsn-starter-kit/components-html/manifest';
import type {
  Category,
  ComponentEntry,
  Platform,
} from '@dsn-starter-kit/components-html/manifest';

const formControls: ComponentEntry[] = manifest.components.filter(
  (component) => component.category === 'form-input'
);

function componentsFor(platform: Platform): string[] {
  return manifest.components
    .filter((component) => component.platforms.includes(platform))
    .map((component) => component.name);
}

const categories: Category[] = ['form-input', 'form-option', 'form-field'];
```

The default export is typed as `Manifest`, so `component.category` and
`component.platforms` are the narrow union types `Category` and `Platform` rather
than plain `string`. The types live in `manifest.d.ts` and are exported from the
same `./manifest` path: `Manifest`, `ComponentEntry`, `PropDefinition`, `Category`
and `Platform`. Both `moduleResolution: "nodenext"` and `"bundler"` resolve them.

`manifest-schema.json` describes the same structure as JSON Schema, for editors and
for the validation step in the build. It is available as
`@dsn-starter-kit/components-html/manifest-schema` if you want to validate your own
additions against it.

### One file per component

`manifest.json` is generated. Each component describes itself in
`src/<dir>/<name>.manifest.json`, next to its CSS: `src/button/button.manifest.json`.
`<name>` is the kebab-case component name. A component without a directory of its
own lives in the directory of its `cssBlock`, so `EmailInput` is
`src/text-input/email-input.manifest.json`.

`scripts/build-manifest.js` validates every part, sorts the components by name and
writes `manifest.json`. That file stays checked in, so consumers, `figma-sync` and
the tests can read it without a build. After changing a part, regenerate it:

```bash
pnpm --filter @dsn-starter-kit/components-html build:manifest
```

The regular build does the same. In CI (`CI=true`) it only checks, and fails when
the checked-in `manifest.json` differs from what the parts produce.

### The `api` block

`primaryProps` is a curated summary. Every component also has an `api` block
with its complete public API: every prop (except `className`), its slots, its
interaction states, and how each of them appears in the generated Figma
component set:

```json
"api": {
  "props": [
    {
      "name": "size",
      "values": ["small", "default", "large"],
      "default": "default",
      "figma": [{ "kind": "variant", "property": "size" }]
    },
    {
      "name": "loading",
      "type": "boolean",
      "default": false,
      "figma": [{ "kind": "none", "reason": "Heeft eigen tokens en open vragen (#323)." }]
    },
    { "name": "children", "type": "ReactNode", "slots": ["label"] }
  ],
  "slots": [
    {
      "name": "label",
      "element": "dsn-button__label",
      "figma": [{ "kind": "text", "property": "label" }]
    }
  ],
  "states": [
    {
      "name": "hover",
      "selector": ":hover",
      "figma": [{ "kind": "variant", "property": "state", "value": "hover" }]
    }
  ]
}
```

A Figma binding is one of:

| Kind                               | Meaning                                                                                                   | Example                                                      |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `variant`                          | The prop, slot or state owns an axis of the component set                                                 | `size` on Button; a slot that is there or not                |
| `variant` with `unset`             | An enum prop without a default; `unset` is the axis value for "not set", first on the axis                | `auto` on the `inlineSize` axis of TextInput                 |
| `variant` with `value`             | One value of an axis shared by several props or states; one value stays the base                          | `checked` and `indeterminate` on `state`                     |
| `boolean`, `text`, `instance-swap` | A component property                                                                                      | `label`, `showIconStart`, `iconStart`                        |
| ... with `instance`                | A component property of a nested, exposed instance; the matrix needs `instances: true`                    | the `label` of CheckboxOption, on OptionLabel                |
| `variant` with `values`            | The axis values as Figma spells them: another spelling, a subset, labels for false/true or present/absent | `16-9` for `16:9`; `with-border`, `no-border` for `noBorder` |
| `slot`                             | A Figma slot (`data-figma-children` in the matrix)                                                        | the options of CheckboxGroup                                 |
| `none` with `reason`               | Deliberately not in Figma                                                                                 | `loading` on Button (#323)                                   |

A prop that owns a whole axis has the axis values as its `values` (after the
`unset` value, if any); a boolean
prop, or a prop whose presence is the axis (a filled-in value or not), owns a
`false`/`true` axis. A prop that fills a slot takes its binding from that slot. Besides `string`,
`boolean`, `number` and `ReactNode`, a prop `type` can be `function` (a
callback such as `onChange`) or `object` (DateInputGroup's `value`).
A prop the component inherits from its element's React attributes, such as
`disabled`, `checked` or `children`, is marked `"native": true`. Props a
component inherits from another component (`CheckboxOptionProps extends
CheckboxProps`) are listed without it. The `viewport` axis of a matrix is a
choice of figma-sync, not part of the API, and needs no binding.

Where `api` exists, three things are checked:

- the validator: rules the schema cannot express, such as "`none` needs a
  reason" and "`primaryProps` may not contradict `api.props`"
- `tests/manifest-react.test.ts`: `api.props` against the `{Name}Props` interface
  in `components-react`, including what it extends from other components
  (names, values in union order, optionality, defaults)
- `tests/manifest-figma.test.ts`: the bindings against the axes, component
  properties and Figma slots of the matrix in `figma-sync`

Any binding can carry `"open": true` with a `reason`: something about it is
not known yet, such as why a prop is not in Figma. That marks a question for
later instead of a guessed answer. List them all, as a Markdown table:

```bash
pnpm --filter @dsn-starter-kit/components-html report:figma-open
```

Every component has an `api` block; the schema requires it. A component
without a Figma set (Body, Icon, the layout components, ButtonLink and the
like) binds every part to `none`, with the reason it has no set.

## Assets

SVG icons are available in `assets/icons/` for use as inline SVGs:

```
assets/icons/
├── check.svg
├── chevron-down.svg
├── home.svg
├── ... (20 icons total)
```

## Building

```bash
pnpm --filter @dsn-starter-kit/components-html build
```

The build validates every `*.manifest.json` part and the assembled
`manifest.json` against `manifest-schema.json` before it concatenates any CSS, so
an invalid category, an unknown platform or a misspelled field fails the build
instead of shipping. Run that check on its own, without writing anything, with:

```bash
pnpm --filter @dsn-starter-kit/components-html validate:manifest
```

The `@dsn-depends-on` comments determine the order in `dist/components.css`: a
component is emitted after everything it declares. Use a comment rather than an
`@import` here. An `@import` would survive into the bundled CSS with a relative
path that resolves to nothing from `dist/`, and the bundler of a consuming package
would inline the same file a second time, after the overriding rules.

## License

MIT
