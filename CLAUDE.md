# Design System Starter Kit — Claude Instructions

Dit bestand wordt automatisch gelezen aan het begin van elke Claude-sessie.
Het bevat de projectregels, architectuurpatronen en navigatiekaart naar de volledige documentatie.

---

## Documentatie — waar staat wat?

| Vraag                                              | Lees dit                             |
| -------------------------------------------------- | ------------------------------------ |
| Hoe is het project opgebouwd?                      | `docs/01-architecture.md`            |
| Welke tokens bestaan er en wat zijn de waarden?    | `docs/02-design-tokens-reference.md` |
| Welke componenten bestaan er en wat zijn de specs? | `docs/03-components.md`              |
| Hoe werkt het development workflow / git / CI?     | `docs/04-development-workflow.md`    |
| Hoe werken CSS-klassen en token-namen?             | `docs/06-css-naming-conventions.md`  |
| Hoe werkt Storybook?                               | `docs/05-storybook-configuration.md` |
| Wat is er recent veranderd?                        | `docs/changelog.md`                  |

**Voor een nieuw component:** lees altijd `docs/06-css-naming-conventions.md` en `docs/03-components.md` eerst.

---

## Twee-lagen implementatiepatroon — ALTIJD

Elk component in dit design system heeft **altijd twee lagen**. Geen uitzonderingen.

| Laag         | Wat                                        | Voorbeeld                                     |
| ------------ | ------------------------------------------ | --------------------------------------------- |
| **HTML/CSS** | De kern — layout en stijllogica            | `<div class="dsn-stack dsn-stack--space-md">` |
| **React**    | De wrapper — genereert de HTML/CSS klassen | `<Stack space="md">`                          |

- De CSS-klassen zijn de bron van waarheid
- React is gemak bovenop de HTML/CSS-laag
- Bij elk nieuw component: **beide** lagen uitwerken en documenteren
- Storybook-docs tonen altijd zowel de HTML/CSS-variant als de React-variant

---

## Kritieke regels — nooit overtreden

### 1. Button accessible naming — NOOIT `aria-label`

Gebruik **altijd** een `dsn-button__label` span. `dsn-button--icon-only` verbergt hem visueel maar houdt hem beschikbaar voor screenreaders.

```html
<!-- ✅ Standaard icon-only button -->
<button
  type="button"
  class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only"
>
  <svg class="dsn-icon" aria-hidden="true"><!-- icon --></svg>
  <span class="dsn-button__label">Instellingen</span>
</button>

<!-- ✅ Icon-only met rij-context (tabelacties) -->
<button
  type="button"
  class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only"
>
  <svg class="dsn-icon" aria-hidden="true"><!-- dots-vertical --></svg>
  <span class="dsn-button__label">
    Toon acties
    <span class="dsn-visually-hidden"> voor product: Laptop Pro</span>
  </span>
</button>

<!-- ❌ NOOIT -->
<button aria-label="Instellingen">...</button>
```

### 2. Tokens — nooit hardcoded waarden in CSS

```css
/* ❌ */
color: #1b59a4;
padding: 8px;
transition: 0.2s ease;

/* ✅ */
color: var(--dsn-color-accent-1-color-default);
padding: var(--dsn-space-block-md);
transition: var(--dsn-transition-duration-normal)
  var(--dsn-transition-easing-default);
```

### 3. BEM naming — zie `docs/06-css-naming-conventions.md`

Kernregels:

- Prefix altijd `dsn-`
- Modifier altijd naast basis-klasse: `class="dsn-note dsn-note--info"`
- Grootte altijd via `--size-{naam}`: `dsn-button--size-small`
- Geen geneste element-namen: `dsn-alert__content__text` ❌
- HTML-toestanden via pseudo-klassen: `.dsn-button:disabled` ✅

### 4. Twee TypeScript-waarschuwingen zijn pre-existing

`pnpm --filter storybook exec tsc --noEmit` geeft **4 warnings** in bestaande bestanden. Dit zijn bekende, pre-existing issues — geen blocker. Nieuwe code moet 0 nieuwe fouten introduceren.

---

## Nieuw component bouwen — checklist

### Bestanden aanmaken

Elk nieuw component vereist exact deze bestanden:

```
packages/components-html/src/{component-name}/
  └── {component-name}.css              # HTML/CSS implementatie

packages/components-react/src/{ComponentName}/
  ├── {ComponentName}.tsx               # React wrapper
  ├── {ComponentName}.test.tsx          # Tests
  └── {ComponentName}.css              # @import van components-html CSS

packages/storybook/src/
  ├── {ComponentName}.stories.tsx       # Storybook stories
  ├── {ComponentName}.docs.mdx          # Storybook docs page (MDX)
  └── {ComponentName}.docs.md           # Docs content (Markdown)
```

### Exports en registraties

- `packages/components-react/src/index.ts` — export toevoegen
- `packages/storybook/src/Introduction.mdx` — datum updaten + component in de lijst

### Token-bestanden (indien nieuwe tokens nodig)

```
packages/design-tokens/src/tokens/components/{component-name}.json
packages/design-tokens/src/tokens/themes/start/colors-light.json  (indien kleur-tokens)
packages/design-tokens/src/tokens/themes/start/colors-dark.json   (altijd simultaan)
packages/design-tokens/src/tokens/themes/start/base.json          (indien structurele tokens)
```

### Kwaliteitscontrole voor PR

```bash
pnpm test                                        # alle tests groen
pnpm --filter storybook exec tsc --noEmit        # 0 nieuwe TypeScript-fouten
pnpm lint                                        # 0 lint-fouten
```

---

## Storybook-docs structuur

Elk component heeft een `.docs.md` met vaste secties in deze volgorde:

1. **Titel + korte beschrijving** (één zin)
2. **Doel** — wat doet het component en wanneer gebruik je het?
3. **Use when** — bulletlijst
4. **Don't use when** — bulletlijst
5. **Best practices** — subsecties per onderwerp
6. **Design tokens** — tabel met alle `--dsn-{component}-*` tokens
7. **Accessibility** — toegankelijkheidsaandachtspunten

Bekijk `packages/storybook/src/Button.docs.md` als referentie voor toon en opmaak.

---

## Git-workflow

```bash
git checkout -b feature/naam          # altijd een feature branch
# ... implementatie ...
pnpm test && pnpm lint                # altijd testen voor commit
git add [specifieke bestanden]        # nooit git add -A of git add .
git commit -m "feat(Component): ..."  # conventional commits
gh pr create                          # PR aanmaken
gh pr merge --merge                   # na CI-groen en review
```

Commit-prefixes: `feat` / `fix` / `docs` / `chore` / `refactor` / `test`

---

## Huidige staat — zie MEMORY.md

De actuele staat van het project (welke componenten af zijn, recente PRs, openstaande issues) staat in MEMORY.md. CLAUDE.md bevat de permanente projectregels; MEMORY.md bevat de actuele sessie-context.
