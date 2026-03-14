# CSS & Token Naming Conventions

**Last Updated:** March 14, 2026

Consistente naamgeving maakt CSS en tokens voorspelbaar: je kunt de naam van een klasse afleiden uit de structuur van een component, en de structuur van een component afleiden uit de naam van een klasse. Dit document legt de regels vast die gelden voor alle CSS-klassen, CSS custom properties en design tokens in dit design system.

---

## Table of Contents

1. [Namespace prefix `dsn-`](#namespace-prefix-dsn-)
2. [CSS-klassen — BEM](#css-klassen--bem)
   - [Block](#block)
   - [Element](#element)
   - [Modifier](#modifier)
   - [Toestandsklassen](#toestandsklassen)
3. [CSS Custom Properties](#css-custom-properties)
   - [Globale design tokens](#globale-design-tokens)
   - [Component tokens](#component-tokens)
   - [Lokale alias — scoping-patroon](#lokale-alias--scoping-patroon)
4. [Design token namen — JSON](#design-token-namen--json)
5. [Utility-klassen](#utility-klassen)
6. [Bestandsstructuur CSS](#bestandsstructuur-css)
7. [Snelle referentie](#snelle-referentie)
8. [Veelgemaakte fouten](#veelgemaakte-fouten)

---

## Namespace prefix `dsn-`

Alle CSS-klassen en CSS custom properties beginnen met het prefix `dsn-` (Design System Namespace). Dit voorkomt botsingen met applicatie-CSS of third-party libraries.

```css
/* ✅ correct */
.dsn-button { }
--dsn-color-neutral-bg-default

/* ❌ fout — geen prefix */
.button { }
--color-neutral-bg-default
```

---

## CSS-klassen — BEM

We gebruiken [BEM](https://getbem.com/) (Block Element Modifier) als naamgevingsconventie. BEM maakt de relatie tussen HTML-elementen en hun stijlregels expliciet leesbaar zonder de DOM-structuur te kennen.

### Structuur

```
dsn-[block]
dsn-[block]__[element]
dsn-[block]--[modifier]
dsn-[block]__[element]--[modifier]
```

- Enkelvoudige koppeltekens (`-`) scheiden woorden binnen een naam: `form-field`, `text-input`
- Dubbele underscore (`__`) voor elementen
- Dubbele koppeltekens (`--`) voor modifiers

### Block

Een block is een zelfstandig, herbruikbaar component. De blocknaam is gelijk aan de componentnaam, in lowercase kebab-case.

```css
.dsn-button {
}
.dsn-text-input {
}
.dsn-form-field {
}
.dsn-status-badge {
}
```

### Element

Een element is een onderdeel van een block dat geen zelfstandige betekenis heeft buiten dat block. Elementen worden altijd geschreven als `block__element` — nooit als geneste namen (`block__element__sub-element`).

```css
.dsn-button__label {
} /* tekstlabel in een button */
.dsn-alert__heading {
} /* heading in een alert */
.dsn-note__icon {
} /* icoon in een note */
.dsn-text-input__wrapper {
} /* wrapper-div rondom een input */
```

```html
<!-- ✅ Correct — één niveau diep -->
<div class="dsn-alert">
  <span class="dsn-alert__icon">...</span>
  <strong class="dsn-alert__heading">Fout</strong>
  <div class="dsn-alert__content">...</div>
</div>

<!-- ❌ Fout — geneste element-naam -->
<div class="dsn-alert">
  <div class="dsn-alert__content">
    <p class="dsn-alert__content__text">...</p>
    <!-- niet doen -->
  </div>
</div>
```

### Modifier

Een modifier past het uiterlijk of gedrag van een block of element aan. Modifiers staan **altijd naast** de basis-klasse, nooit alleen.

```html
<!-- ✅ Correct — modifier naast basis-klasse -->
<button class="dsn-button dsn-button--strong">Label</button>

<!-- ❌ Fout — modifier zonder basis-klasse -->
<button class="dsn-button--strong">Label</button>
```

#### Variant-modifiers

Veranderen het visuele karakter van een component.

```css
.dsn-button--strong {
} /* primaire, prominente knop */
.dsn-button--subtle {
} /* teruggetrokken knop */
.dsn-note--info {
} /* informatieve variant */
.dsn-note--warning {
} /* waarschuwingsvariant */
```

#### Grootte-modifiers

Altijd geschreven als `--size-{naam}`.

```css
.dsn-button--size-small {
} /* ✅ */
.dsn-button--small {
} /* ❌ — ontbreekt 'size-' prefix */
.dsn-button--sm {
} /* ❌ — afkorting, niet leesbaar */
```

#### Toestandsmodifiers

Beschrijven een specifieke visuele toestand van een component.

```css
.dsn-button--loading {
} /* laadstatus */
.dsn-button--icon-only {
} /* alleen icoon, label visueel verborgen */
.dsn-note--no-heading {
} /* note zonder heading */
```

### Toestandsklassen

HTML-attributen als `disabled`, `aria-invalid` en `aria-expanded` worden direct als CSS-selector gebruikt voor interactieve toestandsstijlen — niet als BEM-modifier:

```css
/* ✅ — via HTML-attribuut of pseudo-klasse */
.dsn-button:disabled {
}
.dsn-button:hover {
}
.dsn-button:focus-visible {
}
.dsn-text-input[aria-invalid='true'] {
}

/* ❌ — HTML-toestand als BEM-modifier herhalen is overbodig */
.dsn-button--disabled {
}
```

---

## CSS Custom Properties

### Globale design tokens

Globale tokens zijn beschikbaar in de volledige applicatie en volgen de structuur `--dsn-{categorie}-{subgroep?}-{eigenschap}`.

```
--dsn-{categorie}-{subgroep?}-{eigenschap}
```

```css
--dsn-color-neutral-bg-default
--dsn-color-positive-border-active
--dsn-space-block-md
--dsn-border-width-medium
--dsn-focus-outline-color
--dsn-box-shadow-sm
```

### Component tokens

Component tokens geven toegang tot component-specifieke waarden die thema's kunnen overschrijven. Ze volgen `--dsn-{component}-{variant?}-{eigenschap}`.

```
--dsn-{component}-{variant?}-{eigenschap}
```

```css
--dsn-button-strong-background-color
--dsn-button-strong-color
--dsn-note-info-background-color
--dsn-text-input-focus-border-color
--dsn-alert-padding-block
```

### Lokale alias — scoping-patroon

Binnen een component-CSS-bestand worden lokale custom properties gebruikt als runtime-alias. Dit maakt variant-switching mogelijk zonder specificiteitsproblemen en houdt stijlregels voor states compact.

**Patroon — vier stappen:**

```css
/* Stap 1 — definieer de lokale alias op het block, wijs standaardvariant toe */
.dsn-button {
  --dsn-button-background-color: var(--dsn-button-default-background-color);
  --dsn-button-color: var(--dsn-button-default-color);
}

/* Stap 2 — overschrijf de alias per variant-modifier */
.dsn-button--strong {
  --dsn-button-background-color: var(--dsn-button-strong-background-color);
  --dsn-button-color: var(--dsn-button-strong-color);
}

/* Stap 3 — gebruik uitsluitend de lokale alias in de stijlregels */
.dsn-button {
  background-color: var(--dsn-button-background-color);
  color: var(--dsn-button-color);
}

/* Stap 4 — hover/focus updaten enkel de alias, niet de volledige stijlregel */
.dsn-button:hover {
  --dsn-button-background-color: var(
    --dsn-button-default-background-color-hover
  );
}
```

**Voordelen:**

- Eén set stijlregels voor alle varianten — geen gedupliceerde `background-color`-declaraties per modifier.
- States (`:hover`, `:focus`, `:disabled`) overschrijven enkel de alias, niet de volledige stijlregel.
- Thema-overrides hoeven alleen de component-token aan te passen, niet de component-CSS.

> **Lokale tokens zijn privé.** Ze bestaan alleen binnen de component-CSS en worden nooit extern gedocumenteerd of gebruikt. Alleen de component tokens (in de token-JSON-bestanden) zijn publieke API.

---

## Design token namen — JSON

Token-namen in JSON volgen een gelaagde structuur van algemeen naar specifiek:

```
dsn.{categorie}.{concept}.{eigenschap}.{toestand?}.{variant?}
```

### Ordeningsregels

1. Categorie (algemeen → specifiek)
2. Toestanden: `active`, `checked`, `disabled`, `focus`, `hover`, `visited`
3. Varianten: `inverse`, groottes
4. Alfabetisch binnen hetzelfde niveau

### Voorbeelden

```
dsn.color.neutral.bg-default
dsn.color.neutral.bg-hover
dsn.color.neutral.bg-active

dsn.button.strong.background-color
dsn.button.strong.hover.background-color
dsn.button.size.small.font-size

dsn.focus.outline-color
dsn.focus.outline-width
dsn.focus.background-color
```

De JSON-structuur wordt door Style Dictionary vertaald naar CSS custom properties:

- `dsn.color.neutral.bg-default` → `--dsn-color-neutral-bg-default`
- `dsn.button.strong.background-color` → `--dsn-button-strong-background-color`

---

## Utility-klassen

Utility-klassen volgen geen BEM-structuur. Ze zijn globale helpers met één verantwoordelijkheid, herkenbaar aan hun enkelvoudige naam na het `dsn-`-prefix.

```css
.dsn-visually-hidden {
} /* verberg visueel, maar behoud voor screenreaders */
```

Utility-klassen hebben nooit elementen of modifiers. Ze worden geplaatst op elk element dat de utility nodig heeft, ongeacht het block.

---

## Bestandsstructuur CSS

Elk component-CSS-bestand volgt dezelfde vaste sectievolgorde, gescheiden door een sectionheader-comment:

```css
/* ===========================
   Local color tokens (neutral = default)
   =========================== */
/* Variant-alias definities en overrides */

/* ===========================
   Base layout
   =========================== */
/* Display, grid/flex, padding, border */

/* ===========================
   [Element A]
   =========================== */

/* ===========================
   [Element B]
   =========================== */

/* ===========================
   [Modifier naam]
   =========================== */
```

---

## Snelle referentie

| Situatie                    | Klasse of property                                  |
| --------------------------- | --------------------------------------------------- |
| Zelfstandig component       | `dsn-button`                                        |
| Onderdeel van een component | `dsn-button__label`                                 |
| Visuele variant             | `dsn-button--strong`                                |
| Grootte                     | `dsn-button--size-small`                            |
| Visuele toestand            | `dsn-button--loading`                               |
| Interactieve toestand       | `.dsn-button:disabled`, `.dsn-button:focus-visible` |
| Globale token (CSS)         | `--dsn-color-neutral-bg-default`                    |
| Component token (CSS)       | `--dsn-button-strong-background-color`              |
| Lokale alias (interne CSS)  | `--dsn-button-background-color`                     |
| Token (JSON)                | `dsn.button.strong.background-color`                |
| Utility                     | `dsn-visually-hidden`                               |

---

## Veelgemaakte fouten

### Geneste element-namen

```css
/* ❌ */
.dsn-form-field__label__icon {
}

/* ✅ — vlak, element van het block */
.dsn-form-field__label-icon {
}
```

### Modifier zonder basis-klasse

```html
<!-- ❌ -->
<div class="dsn-note--info">...</div>

<!-- ✅ -->
<div class="dsn-note dsn-note--info">...</div>
```

### Hardcoded waarden in plaats van tokens

```css
/* ❌ */
.dsn-button--strong {
  background-color: #1b59a4;
}

/* ✅ */
.dsn-button--strong {
  --dsn-button-background-color: var(--dsn-button-strong-background-color);
}
```

### Grootte-modifier zonder `size-` prefix

```css
/* ❌ */
.dsn-button--small {
}

/* ✅ */
.dsn-button--size-small {
}
```

### CamelCase of PascalCase in klasse- of tokennamen

```css
/* ❌ */
.dsn-formField {
}
.dsn-FormField {
}

/* ✅ */
.dsn-form-field {
}
```

### HTML-toestand als BEM-modifier

```css
/* ❌ — attribuut en klasse zijn dubbel */
.dsn-button--disabled {
}

/* ✅ — volg het HTML-attribuut */
.dsn-button:disabled {
}
```

---

## Gerelateerde documentatie

- **[Architecture](./01-architecture.md)** — Token-architectuur, drie-tier structuur
- **[Design Tokens Reference](./02-design-tokens-reference.md)** — Alle tokenwaarden en schalen
- **[Development Workflow](./04-development-workflow.md)** — Token-updateproces, CSS best practices
