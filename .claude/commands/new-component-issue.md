# Nieuw component issue aanmaken

Maak een nieuw GitHub issue aan voor een **nieuw design system component**. Het issue volgt het vaste componentspec-formaat — inclusief HTML/CSS-structuur, React API, toegankelijkheidsvereisten en component tokens.

Optionele context meegegeven door de gebruiker (componentnaam, beschrijving, etc.):

> $ARGUMENTS

---

## Stap 1 — Componentnaam en beschrijving

Als `$ARGUMENTS` geen componentnaam bevat, vraag dan:

- Wat is de naam van het component? (PascalCase, bijv. `Tooltip`)
- Geef één zin die beschrijft wat het component doet.

Stel de titel op: `feat(ComponentName): korte beschrijving`

---

## Stap 2 — Verzamel de spec

Vraag de gebruiker naar de volgende onderdelen. Meerdere secties mogen in één keer worden aangeleverd; sluit geen enkel onderdeel over — gebruik HTML-commentaren als er niets is.

### 2a. Beschrijving en gebruik

- **Beschrijving**: Wat doet het component en wanneer gebruik je het? (2–4 zinnen)
- **Gebruik — wanneer wél**: 3–5 bulletpunten
- **Gebruik — wanneer niet**: 1–2 gevallen waarbij een alternatief beter is

### 2b. HTML/CSS implementatie

- **HTML-structuur**: De basis HTML-markup met alle CSS-klassen. Toon relevante varianten (bijv. standaard, open, met modifier).
- **CSS-klassenoverzicht**: tabel met `Klasse | Element | Beschrijving` voor alle `dsn-{component}*` klassen.

> Regels uit het design system:
>
> - Prefix altijd `dsn-`
> - Modifier altijd naast basisklasse: `class="dsn-note dsn-note--info"`
> - Grootte via `--size-{naam}`: `dsn-button--size-small`
> - Geen geneste element-namen: `dsn-alert__content__text` ❌
> - Nooit `aria-label` op buttons — altijd `dsn-button__label` span
> - Nooit hardcoded waarden in CSS — altijd `var(--dsn-*)`

### 2c. React component

- **Code voorbeelden**: basis gebruik + eventuele varianten
- **Props tabel**: `Prop | Type | Default | Beschrijving` voor alle props

### 2d. Toegankelijkheidsvereisten

Vraag specifiek naar:

- Structuur (impliciete ARIA-rollen, `scope`, vereiste attributen)
- Toetsenbordinteractie (indien van toepassing)
- Schermlezers (wat wordt voorgelezen, hoe navigeren gebruikers)
- Bekende beperkingen of onderzoeksbevindingen

### 2e. Component tokens (voorstel)

- JSON-structuur voor alle `dsn.{component}.*` tokens
- Welke globale tokens worden gerefereerd?
- Ontwerpkeuzes achter de tokenwaarden (1–3 regels per niet-voor-de-hand-liggende keuze)
- Markeer onzekere waarden met een ⚠️ opmerking

> **Token schrijfwijze — altijd controleren:**
> Sub-groepen (zoals `icon`, `label`, `control`) worden als geneste objecten geschreven, niet als geflattende sleutels met koppeltekens:
>
> ```json
> // ✅ Correct — geneste structuur
> "icon": {
>   "color": { "value": "...", "type": "color" },
>   "size":  { "value": "...", "type": "dimension" },
>   "gap":   { "value": "...", "type": "spacing" }
> }
>
> // ❌ Fout — geflattend
> "icon-color": { "value": "...", "type": "color" },
> "icon-size":  { "value": "...", "type": "dimension" }
> ```
>
> De gegenereerde CSS custom properties zijn in beide gevallen identiek (`--dsn-{component}-icon-color`, etc.), maar de JSON-schrijfwijze volgt altijd de geneste structuur.
> Controleer elk tokenvoorstel hierop voordat het issue wordt aangemaakt.

---

## Stap 3 — Stel de issue body samen

Bouw de body op in deze volgorde. Vul in wat de gebruiker aanleverde; gebruik HTML-commentaren voor ontbrekende informatie.

````
## Beschrijving

[één-alinea beschrijving van het component]

## Gebruik

Het [ComponentName] component wordt gebruikt voor:
- [use case 1]
- [use case 2]
- [use case 3]

> Gebruik [ComponentName] **niet** als [wanneer-niet-gebruik]. Gebruik in dat geval [alternatief].

## HTML/CSS

### Basis

```html
[basis HTML-markup]
````

### [Variant/Optie naam, indien van toepassing]

```html
[variant markup]
```

### CSS klassen

| Klasse            | Element       | Beschrijving   |
| ----------------- | ------------- | -------------- |
| `dsn-[component]` | `<[element]>` | [beschrijving] |

## React

```tsx
// Basis
<ComponentName prop="waarde">...</ComponentName>

// [Variant naam indien van toepassing]
<ComponentName variant="naam">...</ComponentName>
```

### Props

| Prop     | Type     | Default     | Beschrijving   |
| -------- | -------- | ----------- | -------------- |
| `[prop]` | `[type]` | `[default]` | [beschrijving] |

## Toegankelijkheidsvereisten

### Structuur

- [vereiste 1]
- [vereiste 2]

### [Subsectie indien van toepassing: Toetsenbord, Schermlezers, etc.]

- [vereiste]

## Component tokens (voorstel)

> ⚠️ **Review vereist vóór implementatie** — akkoord geven op deze tabel voordat de bouw begint.

```json
{
  "dsn": {
    "[component]": {
      "[token]": { "value": "{dsn.[referentie]}", "type": "[type]" }
    }
  }
}
```

**Ontwerpkeuzes:**

- [keuze en motivatie]

---

## Acceptatiecriteria

### HTML/CSS

- [ ] Component tokens JSON (`[component].json`)
- [ ] CSS implementatie (`[component].css`)
  - [ ] [specifiek CSS-onderdeel]
  - [ ] [specifiek CSS-onderdeel]

### React

- [ ] `[ComponentName]` component met [props opsomming]
- [ ] `React.forwardRef<HTML[Element]Element>`
- [ ] Export toegevoegd aan `packages/components-react/src/index.ts`

### Storybook

- [ ] Drie bestanden aangemaakt: `.stories.tsx`, `.docs.mdx`, `.docs.md`
- [ ] `// DEFAULT` sectie — `Default` story
- [ ] `// VARIANTEN` sectie — per-prop/state stories (bijv. `WithDescription`, `Disabled`, `Invalid`)
- [ ] `// OVERZICHTSSTORIES` sectie — `AllVariants` of `AllStates` (zie regel hieronder)
- [ ] `// TEKST VARIANTEN` sectie — `ShortText` + `LongText` (alleen bij componenten met zichtbare tekstinhoud)
- [ ] `// RTL` sectie — `RTL` + `RTLLongText` (alleen bij componenten met tekst of richtingsgevoelige layout)
- [ ] Alle story-namen in het Engels

---

## Definition of Done

### Voorbereiding

- [ ] Feature branch aangemaakt: `git checkout -b feature/[component-name]`

### Werkzaamheden

- [ ] Implementatie afgerond

### Bij nieuw component

- [ ] Drie Storybook-bestanden aangemaakt (`.stories.tsx`, `.docs.mdx`, `.docs.md`)
- [ ] Export toegevoegd aan `packages/components-react/src/index.ts`
- [ ] `Introduction.mdx` bijgewerkt (datum + componentnaam in de lijst)

### Kwaliteitscontrole

- [ ] Tests groen: `pnpm test`
- [ ] TypeScript schoon: `pnpm --filter storybook exec tsc --noEmit`
- [ ] Lint schoon: `pnpm lint`

### Documentatie

- [ ] `MEMORY.md` bijgewerkt indien nieuw patroon of architectuurkeuze
- [ ] Relevante `.docs.md` bijgewerkt

### Oplevering

- [ ] PR aangemaakt: `gh pr create`
- [ ] CI groen op de branch
- [ ] PR gemerged: `gh pr merge --merge`

## Notities / Open vragen

<!-- Edge cases, twijfels, tokenwaarden die nog bepaald moeten worden, dingen om op te letten tijdens refinement. -->

````

**Let op bij het invullen:**
- Acceptatiecriteria **genereer je** op basis van wat de gebruiker in stap 2 heeft opgegeven — maak ze concreet en specifiek
- Storybook stories leiden af uit de HTML/CSS-varianten die beschreven zijn
- Ontbrekende secties krijgen een HTML-commentaar, niet worden weggelaten
- Tokens die nog niet bepaald zijn, markeer je expliciet met een ⚠️-opmerking in de Notities sectie

**Storybook story-structuur — vaste regels:**

Elke `.stories.tsx` volgt altijd deze sectievolgorde (met `// ===` comments als scheidslijn):

1. `// DEFAULT` — altijd één `Default` story
2. `// VARIANTEN` — individuele stories per prop of state
3. `// OVERZICHTSSTORIES` — één overzichtsstory:
   - `AllVariants` / `'All variants'` → voor componenten met **visuele kleur- of stijlvarianten** (bijv. `variant="info|warning|error"`)
   - `AllStates` / `'All states'` → voor componenten met **interactieve states** (bijv. default, disabled, invalid, read-only)
4. `// TEKST VARIANTEN` — `ShortText` + `LongText` — **alleen** bij componenten met zichtbare tekstinhoud; weglaten bij icoon-only of puur visuele componenten (DotBadge, Icon, Checkbox, Radio)
5. `// RTL` — `RTL` + `RTLLongText` — **alleen** bij componenten met tekst of richtingsgevoelige layout

Geen `// HIGH CONTRAST` sectie — daar zijn we van af gestapt.

---

## Stap 4 — Toon ter review

Laat de volledige title én body zien aan de gebruiker. Vraag om expliciete bevestiging voordat het issue aangemaakt wordt.

---

## Stap 5 — Maak het issue aan

Na bevestiging van de gebruiker:

```bash
gh issue create \
  --title "feat(ComponentName): korte beschrijving" \
  --label "feat,component,needs refinement" \
  --body "BODY"
````

Rapporteer de URL van het aangemaakte issue.

---

## Regels

- Gebruik **altijd** het volledige template — sla geen secties over
- **Genereer** de acceptatiecriteria op basis van de spec — kopieer ze niet blind uit eerdere issues
- Voeg **geen** verzonnen implementatiedetails toe — als iets onbekend is, gebruik HTML-commentaar of ⚠️
- Vraag altijd om **expliciete bevestiging** voordat het issue aangemaakt wordt
- Labels zijn altijd `feat,component,needs refinement` — geen uitzonderingen voor nieuwe componenten
- **Geen Figma-verwijzingen** — er is geen Figma in dit project; schrijf nooit "valideren in Figma", "zie Figma" of soortgelijke verwijzingen
- **Token schrijfwijze** — controleer altijd of sub-groepen als geneste objecten zijn geschreven (zie stap 2e)
