# Design System Starter Kit: Claude Instructions

Dit bestand wordt automatisch gelezen aan het begin van elke Claude-sessie.
Het bevat de projectregels, architectuurpatronen en navigatiekaart naar de volledige documentatie.

---

## Documentatie: waar staat wat?

| Vraag                                              | Lees dit                             |
| -------------------------------------------------- | ------------------------------------ |
| Hoe is het project opgebouwd?                      | `docs/01-architecture.md`            |
| Welke tokens bestaan er en wat zijn de waarden?    | `docs/02-design-tokens-reference.md` |
| Welke componenten bestaan er en wat zijn de specs? | `docs/03-components.md`              |
| Hoe werkt het development workflow / git / CI?     | `docs/04-development-workflow.md`    |
| Hoe werken CSS-klassen en token-namen?             | `docs/06-css-naming-conventions.md`  |
| Hoe werkt Storybook?                               | `docs/05-storybook-configuration.md` |
| Wat is er recent veranderd?                        | `docs/changelog.md`                  |
| Hoe werken formulierflows en -patronen?            | `docs/07-form-flow-patterns.md`      |
| Hoe komen tokens en componenten in Figma?          | `packages/figma-sync/README.md`      |
| Waarom is een architectuurkeuze zo gemaakt?        | `docs/decisions/`                    |

**Voor een nieuw component:** lees altijd `docs/06-css-naming-conventions.md` en `docs/03-components.md` eerst.

**Bij een formulierflow-opdracht (URL, prompt of schets):** lees altijd `docs/07-form-flow-patterns.md` eerst.

---

## Twee-lagen implementatiepatroon: ALTIJD

Elk component in dit design system heeft **altijd twee lagen**. Geen uitzonderingen.

| Laag         | Wat                                       | Voorbeeld                                     |
| ------------ | ----------------------------------------- | --------------------------------------------- |
| **HTML/CSS** | De kern: layout en stijllogica            | `<div class="dsn-stack dsn-stack--space-md">` |
| **React**    | De wrapper: genereert de HTML/CSS klassen | `<Stack space="md">`                          |

- De CSS-klassen zijn de bron van waarheid
- React is gemak bovenop de HTML/CSS-laag
- Bij elk nieuw component: **beide** lagen uitwerken en documenteren
- Storybook-docs tonen altijd zowel de HTML/CSS-variant als de React-variant

---

## Kritieke regels: nooit overtreden

### 1. Button accessible naming: NOOIT `aria-label`

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

### 2. Tokens: nooit hardcoded waarden in CSS

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

### 3. BEM naming: zie `docs/06-css-naming-conventions.md`

Kernregels:

- Prefix altijd `dsn-`
- Modifier altijd naast basis-klasse: `class="dsn-note dsn-note--info"`
- Grootte altijd via `--size-{naam}`: `dsn-button--size-small`
- Geen geneste element-namen: `dsn-alert__content__text` ❌
- HTML-toestanden via pseudo-klassen: `.dsn-button:disabled` ✅

### 4. Token-hiërarchie: altijd op de juiste laag aanpassen

Tokens zijn gelaagd: `base.json` (gedeelde primitieven) → component-token JSON → CSS custom property → component CSS. Pas altijd aan op de **hoogste laag die de waarde definieert**, zodat de delegatieketen intact blijft.

```json
// ❌ Omzeilen van de delegatieketen in text-input.json
"padding-block-start": { "value": "{dsn.space.block.md}" }

// ✅ Aanpassen op de juiste laag: in base.json onder form-control
"padding-block-start": { "value": "{dsn.space.block.md}" }
// text-input.json blijft delegeren naar {dsn.form-control.padding-block-start}
```

**Werkwijze bij een token-wijziging:**

1. Zoek via `Grep` welk token de waarde _uiteindelijk_ definieert (vaak in `base.json` of een theme-bestand)
2. Pas dáár de waarde aan
3. Controleer of de delegatieketen in component-JSONs ongewijzigd blijft

### 5. TypeScript moet volledig schoon zijn

Nieuwe code mag geen nieuwe fouten of warnings introduceren. Er zijn **twee** type-checks nodig, want ze dekken verschillende packages:

```bash
pnpm type-check                                  # core, components-react, components-web
pnpm --filter storybook exec tsc --noEmit        # storybook (stories en docs)
```

Beide checks erven dezelfde strenge instellingen uit de root `tsconfig.json` (`strict`, `noImplicitReturns`), maar ze kijken naar andere bestanden. De storybook-tsconfig include't alleen `packages/storybook/src` en `.storybook`, en lost `@dsn-starter-kit/components-react` op via de `types`-entry in de package.json, dus via de gebouwde `dist/*.d.ts`. De Vite-alias naar `../components-react/src` in `.storybook/main.ts` geldt alleen tijdens de build, niet voor `tsc`.

Gevolg: de storybook-check ziet de broncode van componenten nooit. Een groene storybook-check is geen bewijs dat `components-react` compileert. Wie componentcode aanraakt, draait `pnpm type-check`.

### 6. Navigatie: homepage krijgt altijd een 'Home' item als eerste, met `current`

Wanneer een URL een homepage is (domein zonder pad, of pad eindigt op `/`), **voeg dan 'Home' toe als eerste navigatie-item** en markeer dit als `current`. Niet een willekeurig ander item als current markeren.

```tsx
// ✅ Homepage: Home als eerste item, current
<MenuLink href="/" level={1} current>Home</MenuLink>
<MenuLink href="/over" level={1}>Over</MenuLink>

// ❌ Homepage maar 'Contact' current — misleidend
<MenuLink href="/over" level={1}>Over</MenuLink>
<MenuLink href="/contact" level={1} current>Contact</MenuLink>
```

Dit geldt ook als de originele website zelf geen 'Home' in de navigatie heeft — de gedeelde URL is de homepage, dus voeg het toe.

### 7. Cards: CardGroup vs Grid — kies bewust en gebruik mobile-first colSpan

**Wanneer CardGroup:**

- Gelijkwaardige cards waarbij het aantal variabel kan zijn
- Auto-responsive gewenst: cards wrappen automatisch zodra ze niet meer passen op `--dsn-card-group-item-min-width` (280px)
- Geen noodzaak voor expliciete kolomcontrole

**Wanneer Grid + GridItem:**

- Expliciete kolomverdeling vereist (bijv. 8+4 layout naast andere content)
- Cards moeten uitlijnen met niet-card-inhoud in hetzelfde grid

**Kritieke regel bij Grid + cards: altijd mobile-first, begin met `colSpan={12}`**

```tsx
// ✅ Mobile-first: 1-kolom → 2-kolom sm → 3-kolom md
<GridItem colSpan={12} colSpanSm={6} colSpanMd={4}>

// ✅ Mobile-first: 1-kolom → 2-kolom md
<GridItem colSpan={12} colSpanMd={6}>

// ❌ Desktop-first: cards worden te smal op mobile
<GridItem colSpan={4}>
<GridItem colSpan={4} colSpanSm={6} colSpanMd={4}>
```

`colSpan={12}` als basis garandeert dat cards op kleine viewports dezelfde volledige breedte pakken als gestackte CardGroup-cards. Daarnaast: Cards in GridItems altijd `style={{ height: '100%' }}` geven zodat ze de volledige GridItem-hoogte vullen (CardGroup regelt dit automatisch via flex).

### 8. Inverse context: alle tekst-componenten meenemen

Wanneer een container-component (Hero, PageHeader, PageFooter) kleur-overrides definieert voor een inverse/donkere achtergrond, moeten **alle** tekst-componenten met een eigen `--dsn-*-color` custom property worden meegenomen — inclusief `PreHeading`. De override-lijst in de CSS moet compleet zijn:

```css
/* ✅ Compleet: alle tekst-componenten overschreven */
--dsn-pre-heading-color: var(--dsn-hero-color-inverse);
--dsn-heading-level-1-color: var(--dsn-hero-color-inverse);
--dsn-paragraph-color: var(--dsn-hero-color-inverse);

/* ❌ Onvolledig: PreHeading mist → donkere tekst op donkere achtergrond */
--dsn-heading-level-1-color: var(--dsn-hero-color-inverse);
--dsn-paragraph-color: var(--dsn-hero-color-inverse);
```

Controleer bij elke nieuwe inverse container of `--dsn-pre-heading-color` is opgenomen.

### 9. Paginastructuur: gebruik dsn-page-body\_\_inner, geen inline max-inline-size

Content op een pagina zit altijd binnen `PageBody`, die automatisch `dsn-page-body__inner` rendert met de juiste `max-inline-size` en `padding-inline`. **Voeg geen extra wrapper divs toe met hardcoded `max-inline-size: 960px`.**

```tsx
// ✅ Content is al geconstrained door dsn-page-body__inner
<PageBody>
  <main>
    <section style={{ paddingBlock: 'var(--dsn-space-block-6xl)' }}>
      <Heading>...</Heading>
    </section>
  </main>
</PageBody>

// ❌ Onnodige re-constraint — dsn-page-body__inner doet dit al
<PageBody>
  <main>
    <div style={{ maxInlineSize: '960px', marginInline: 'auto', paddingInline: '...' }}>
      <Heading>...</Heading>
    </div>
  </main>
</PageBody>
```

Content **binnen** een `BreakoutSection` of `Hero` (die uitbreken uit de inner wrapper) moet wél opnieuw geconstrained worden — gebruik dan `className="dsn-page-body__inner"`.

---

## Nieuw component bouwen: checklist

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

- `packages/components-react/src/index.ts`: export toevoegen
- `packages/components-html/package.json`: nieuwe entry toevoegen aan de `exports` map (`"./component-name": "./src/component-name/component-name.css"`) — de build-script pikt CSS automatisch op, maar de exports map niet
- `packages/storybook/src/Introduction.mdx`: datum updaten + component in de lijst

### Token-bestanden (indien nieuwe tokens nodig)

```
packages/design-tokens/src/tokens/components/{component-name}.json
packages/design-tokens/src/tokens/themes/start/colors-light.json  (indien kleur-tokens)
packages/design-tokens/src/tokens/themes/start/colors-dark.json   (altijd simultaan)
packages/design-tokens/src/tokens/themes/start/base.json          (indien structurele tokens)
```

### Kwaliteitscontrole voor PR

Draai dit in dezelfde volgorde als CI, zodat een groene lokale run ook een groene CI betekent:

```bash
pnpm lint                                        # 0 lint-fouten
pnpm format:check                                # prettier
pnpm type-check                                  # core, components-react, components-web
pnpm --filter storybook exec tsc --noEmit        # storybook (niet gedekt door type-check)
pnpm test                                        # alle tests groen
```

Bij wijzigingen aan stories, MDX of build-scripts ook `pnpm build`: een kapotte `.docs.mdx` of een ontbrekende entry in de `exports`-map van `components-html` breekt pas daar, niet bij de type-checks.

---

## Storybook-docs structuur

Elk component heeft een `.docs.md` met vaste secties in deze volgorde:

1. **Titel + korte beschrijving** (één zin)
2. **Doel**: wat doet het component en wanneer gebruik je het?
3. **Use when**: bulletlijst
4. **Don't use when**: bulletlijst
5. **Best practices**: subsecties per onderwerp
6. **Design tokens**: tabel met alle `--dsn-{component}-*` tokens
7. **Accessibility**: toegankelijkheidsaandachtspunten

Bekijk `packages/storybook/src/Button.docs.md` als referentie voor toon en opmaak.

---

## Storybook stories: naamgeving en canonieke teksten

### Story namen: altijd Engels

Story `name` waarden zijn altijd Engelstalig. Gebruik de Engelse variant van bekende patronen:

| Patroon             | ✅ Correct             | ❌ Niet doen               |
| ------------------- | ---------------------- | -------------------------- |
| Overzicht           | `'All States'`         | `'Alle states'`            |
| Lange tekst         | `'Long Text'`          | `'Lange tekst'`            |
| Korte tekst         | `'Short Text'`         | `'Korte tekst'`            |
| Met iets            | `'With Image Preview'` | `'Met afbeeldingspreview'` |
| Interactief variant | `'Interactive'`        | `'Interactief'`            |
| RTL                 | `'RTL'`                | —                          |
| Bestandslijst       | `'File List'`          | `'Bestandslijst'`          |

### Canonieke teksten uit `story-helpers.tsx`

Voor lange tekst in stories, gebruik altijd de gedeelde constanten uit `packages/storybook/src/story-helpers.tsx`. Importeer ze nooit opnieuw als losse string.

```tsx
import {
  VEEL_TEKST,
  WEINIG_TEKST,
  TEKST,
  VEEL_TEKST_AR,
} from './story-helpers';

// ✅ Lange bestandsnaam
args: {
  fileName: `${VEEL_TEKST}.pdf`;
}

// ✅ Lange labeltekst
args: {
  label: VEEL_TEKST;
}

// ❌ Nooit een eigen lange string verzinnen
args: {
  fileName: 'dit-is-een-heel-lange-naam-die-afgekapt-moet-worden.pdf';
}
```

| Constante       | Waarde (samenvatting)                                              |
| --------------- | ------------------------------------------------------------------ |
| `TEKST`         | `'Tekst'`                                                          |
| `WEINIG_TEKST`  | `'A'`                                                              |
| `VEEL_TEKST`    | Nederlandstalige zin over meerdere regels (voor long-text stories) |
| `VEEL_TEKST_AR` | Arabische variant van `VEEL_TEKST` (voor RTL stories)              |

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

## Huidige staat: zie MEMORY.md

De actuele staat van het project (welke componenten af zijn, recente PRs, openstaande issues) staat in MEMORY.md. CLAUDE.md bevat de permanente projectregels; MEMORY.md bevat de actuele sessie-context.
