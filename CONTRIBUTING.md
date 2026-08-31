# Contributing to the Design System Starter Kit

Thanks for contributing. This guide covers everything you need to open a quality PR: contribution criteria, branching conventions, a pre-PR checklist, and how the system's conventions are enforced.

---

## Table of Contents

1. [Before you start](#before-you-start)
2. [Contribution criteria](#contribution-criteria)
3. [Branching conventions](#branching-conventions)
4. [New component checklist](#new-component-checklist)
5. [Pre-PR checklist](#pre-pr-checklist)
6. [Commit message format](#commit-message-format)
7. [Opening a pull request](#opening-a-pull-request)
8. [AI-assisted work](#ai-assisted-work)

---

## Before you start

Read the relevant docs for your change before writing any code. The full documentation lives in `docs/`:

| Change type                       | Read first                                                   |
| --------------------------------- | ------------------------------------------------------------ |
| New component                     | `docs/06-css-naming-conventions.md`, `docs/03-components.md` |
| Token change                      | `docs/02-design-tokens-reference.md`                         |
| Architecture or structural change | `docs/01-architecture.md`                                    |
| Workflow or tooling question      | `docs/04-development-workflow.md`                            |
| Storybook stories or docs pages   | `docs/05-storybook-configuration.md`                         |

---

## Contribution criteria

A PR is ready to merge when it meets all of these:

- Implements **both layers**: an HTML/CSS implementation in `packages/components-html` and a React wrapper in `packages/components-react`. This is non-negotiable — the CSS classes are the source of truth; React is convenience on top.
- Uses **design tokens exclusively** — no hardcoded colours, spacing values, or transition timings in CSS.
- Follows **BEM naming** with the `dsn-` prefix throughout (`dsn-block`, `dsn-block__element`, `dsn-block--modifier`).
- Accessible by default: semantic HTML, ARIA attributes where needed, keyboard-navigable. For buttons, always use a `dsn-button__label` span — never `aria-label`. See [CLAUDE.md](CLAUDE.md) for the exact pattern.
- Uses **logical CSS properties** (`padding-inline-start`, `margin-block-end`) instead of physical ones (`padding-left`, `margin-bottom`).
- Writes **mobile-first CSS** — base styles for small screens, `min-width` media queries to enhance upward.
- Includes **tests** for all props, variants, and states.
- Includes **Storybook stories** and a docs page in the required format.
- All CI checks pass: lint, type-check, tests, build.

---

## Branching conventions

```
feature/component-name     # new component or feature
fix/short-description      # bug fix
docs/what-changed          # documentation-only change
chore/what-changed         # tooling, config, dependency updates
refactor/what-changed      # internal refactor with no behaviour change
```

Always branch from `main`. Never commit directly to `main`.

```bash
git checkout main
git pull
git checkout -b feature/my-component
```

---

## New component checklist

Every new component requires exactly these files — no more, no less:

**HTML/CSS layer**

```
packages/components-html/src/{component-name}/
  └── {component-name}.css
```

**React layer**

```
packages/components-react/src/{ComponentName}/
  ├── {ComponentName}.tsx
  ├── {ComponentName}.test.tsx
  └── {ComponentName}.css        # @import from components-html
```

**Storybook**

```
packages/storybook/src/
  ├── {ComponentName}.stories.tsx
  ├── {ComponentName}.docs.mdx
  └── {ComponentName}.docs.md
```

**Registrations**

- Add export to `packages/components-react/src/index.ts`
- Add component to the list in `packages/storybook/src/Introduction.mdx`

**Design tokens** (only if new tokens are needed)

```
packages/design-tokens/src/tokens/components/{component-name}.json
packages/design-tokens/src/tokens/themes/start/base.json          # structural tokens
packages/design-tokens/src/tokens/themes/start/colors-light.json  # colour tokens
packages/design-tokens/src/tokens/themes/start/colors-dark.json   # always update both modes
```

**Token hierarchy rule:** when changing a token value, find where it is ultimately defined (usually `base.json`) and change it there. Never bypass the delegation chain by redefining a value in a component token file that already delegates to a shared token.

---

## Pre-PR checklist

Run these commands and fix any failures before opening a PR:

```bash
pnpm lint            # 0 lint errors
pnpm format:check    # code is formatted
pnpm build           # required: generates source files the type-check needs
pnpm type-check      # 0 TypeScript errors, all packages including Storybook
pnpm test            # all tests green
```

This is the same order as CI (`.github/workflows/ci.yml`), so a green local run
means a green CI run. `pnpm build` is not optional: `components-web` imports
generated files that the build produces and that are gitignored, so on a fresh
clone `pnpm type-check` fails without it.

Then check:

- [ ] Both the HTML/CSS and React implementations are present
- [ ] No hardcoded values in CSS — only `var(--dsn-*)` tokens
- [ ] BEM class names follow the `dsn-` prefix convention
- [ ] Icon-only buttons use `dsn-button__label`, not `aria-label`
- [ ] New dark-mode colour tokens are added alongside light-mode tokens
- [ ] Storybook story names are in English (e.g. `'All States'`, not `'Alle states'`)
- [ ] Long text in stories uses the shared constants from `story-helpers.tsx`
- [ ] Storybook docs page follows the required section order (title, purpose, use when, don't use when, best practices, tokens, accessibility)
- [ ] `packages/storybook/src/Introduction.mdx` is updated with the new component
- [ ] `docs/changelog.md` has an entry for the change

---

## Commit message format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(ComponentName): add initial implementation
fix(Button): correct disabled state token reference
docs(TextInput): add accessibility section
chore: bump all packages to 1.2.0
refactor(Stack): extract gap logic into shared mixin
test(Select): add test for keyboard navigation
```

Stage specific files only — never `git add -A` or `git add .`:

```bash
git add packages/components-html/src/my-component/my-component.css
git add packages/components-react/src/MyComponent/MyComponent.tsx
# ...
git commit -m "feat(MyComponent): add initial implementation"
```

---

## Opening a pull request

```bash
gh pr create
```

In the PR description, include:

- What the change does and why
- Which component(s) are affected
- A link to the relevant issue (if any)
- Screenshots or Storybook links for visual changes

CI must be fully green before merging. Use `gh pr merge --merge` after approval.

For version bumps, see the versioning section in [`docs/04-development-workflow.md`](docs/04-development-workflow.md).

---

## AI-assisted work

This project is set up for Claude Code. The full set of conventions — BEM rules, token hierarchy, two-layer implementation pattern, accessible button naming, story naming, Storybook docs structure — is encoded in [`CLAUDE.md`](CLAUDE.md).

If you are working with Claude Code on a contribution:

1. Claude reads `CLAUDE.md` automatically at the start of every session.
2. The conventions in `CLAUDE.md` are the same ones in this guide — they are not separately maintained.
3. The pre-PR checklist above applies equally to AI-generated and human-written code. CI is the final gate regardless of how the code was written.

If you are reviewing AI-assisted PRs, apply the same criteria as any other PR. The checklist exists precisely because the conventions are detailed enough to miss without a systematic check.
