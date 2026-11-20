# Nieuw component issue aanmaken

Maak een nieuw GitHub issue aan voor een **nieuw design system component**. Het issue volgt het vaste componentspec-formaat: HTML/CSS-structuur, React API, toegankelijkheidsvereisten, component tokens, het manifest-`api`-blok en de Figma-matrix.

Optionele context meegegeven door de gebruiker (componentnaam, beschrijving, etc.):

> $ARGUMENTS

---

## Stap 0: Lees de bronnen

Lees vóór je iets voorstelt:

- `docs/06-css-naming-conventions.md` en `docs/03-components.md` (BEM, bestaande componenten)
- De sectie "Component manifest" in `packages/components-html/README.md` (het `api`-blok en de Figma-bindingen)
- De secties "Een component toevoegen", "Component properties", "Welke componenten wel en niet een matrix krijgen", "Slots" en "Onderdelen van een component" in `packages/figma-sync/README.md`
- Een vergelijkbaar bestaand component als referentie: zijn `*.manifest.json`, zijn `packages/figma-sync/src/matrices/*.js` en zijn token-JSON

---

## Stap 1: Componentnaam en beschrijving

Als `$ARGUMENTS` geen componentnaam bevat, vraag dan:

- Wat is de naam van het component? (PascalCase, bijv. `Tooltip`)
- Geef één zin die beschrijft wat het component doet.

Stel de titel op: `feat(ComponentName): korte beschrijving`

---

## Stap 2: Verzamel de spec

Vraag de gebruiker naar de volgende onderdelen. Meerdere secties mogen in één keer worden aangeleverd. Sla geen onderdeel over: gebruik HTML-commentaren als er niets is.

### 2a. Beschrijving en gebruik

- **Beschrijving**: Wat doet het component en wanneer gebruik je het? (2 tot 4 zinnen)
- **Wel gebruiken als...**: 3 tot 5 bulletpunten
- **Niet gebruiken als...**: 1 tot 3 gevallen waarbij een alternatief beter is, met dat alternatief na een dubbele punt

> Formuleer elke bullet zo dat hij de zin na het kopje afmaakt, zodat hij één-op-één naar de `.docs.md` kan:
>
> - ✅ "Je een tijdstip wilt laten invoeren." / "De gebruiker een onomkeerbare actie moet bevestigen."
> - ✅ "Het om vrije tekst gaat: gebruik dan TextInput."
> - ❌ "Tabulaire data weergeven." / "Als visuele achtergrond achter een dialog."
>
> Herschrijf losse zinsdelen die de gebruiker aanlevert naar deze vorm. Lukt dat niet zonder dat de zin geforceerd leest, laat hem dan staan.

### 2b. HTML/CSS implementatie

- **HTML-structuur**: De basis HTML-markup met alle CSS-klassen. Toon relevante varianten (bijv. standaard, open, met modifier).
- **CSS-klassenoverzicht**: tabel met `Klasse | Element | Beschrijving` voor alle `dsn-{component}*` klassen.
- **Afhankelijkheden**: gebruikt de markup klassen van een ander component (bijv. `dsn-button` in een tabelkop)? Dan krijgt de CSS bovenaan een `/* @dsn-depends-on: {component} */`-comment. Noem welke.

> Regels uit het design system:
>
> - Prefix altijd `dsn-`
> - Modifier altijd naast basisklasse: `class="dsn-note dsn-note--info"`
> - Grootte via `--size-{naam}`: `dsn-button--size-small`
> - Geen geneste element-namen: `dsn-alert__content__text` ❌
> - Nooit `aria-label` op buttons: altijd `dsn-button__label` span
> - Nooit hardcoded waarden in CSS: altijd `var(--dsn-*)`

### 2c. React component

- **Code voorbeelden**: basis gebruik + eventuele varianten
- **Props tabel**: `Prop | Type | Default | Beschrijving` voor alle props, in de volgorde en met de union-volgorde die ook in de `{Name}Props`-interface komt (het manifest wordt daar letterlijk tegen getest)
- **Web component**: komt er ook een variant in `components-web`? Zo ja, dan hoort `web-components` in de `platforms` van het manifest.

### 2d. Toegankelijkheidsvereisten

Vraag specifiek naar:

- Structuur (impliciete ARIA-rollen, `scope`, vereiste attributen)
- Toetsenbordinteractie (indien van toepassing)
- Schermlezers (wat wordt voorgelezen, hoe navigeren gebruikers)
- Bekende beperkingen of onderzoeksbevindingen

### 2e. Component tokens (voorstel)

- JSON-structuur voor alle `dsn.{component}.*` tokens, in DTCG-formaat: `$value`, `$type` en `$description`
- Welke globale tokens worden gerefereerd?
- Ontwerpkeuzes achter de tokenwaarden (1 tot 3 regels per niet-voor-de-hand-liggende keuze)
- Markeer onzekere waarden met een ⚠️ opmerking

> **Elk token heeft een `$description`.** Die komt in de tokentabel in Storybook en in Figma. Volg de schrijfregels: een rol-zin (wat het token doet), bij kleur een contrastzin, geen waarden, geen componentnaam, CSS-termen in het Nederlands ("Lijndikte van de rand aan de beginkant.", niet "border-inline-start-width van de Note").
>
> **Sub-groepen schrijf je genest, niet als platte sleutel met koppeltekens:**
>
> ```json
> // ✅ Correct: geneste structuur
> "icon": {
>   "color": { "$value": "...", "$type": "color", "$description": "..." },
>   "size":  { "$value": "...", "$type": "dimension", "$description": "..." },
>   "gap":   { "$value": "...", "$type": "dimension", "$description": "..." }
> }
>
> // ❌ Fout: plat
> "icon-color": { "$value": "...", "$type": "color" },
> "icon-size":  { "$value": "...", "$type": "dimension" }
> ```
>
> De CSS custom property is in beide gevallen `--dsn-{component}-icon-color`, maar in Figma niet: genest wordt een variable-groep (`{component}/icon/color`), plat blijft één losse naam (`{component}/icon-size`). Een handvol bestaande componenten heeft nog platte `icon-*`-sleutels; die zijn geen voorbeeld om te volgen.
> Controleer elk tokenvoorstel hierop voordat het issue wordt aangemaakt.

### 2f. Manifest en Figma (voorstel)

Leid dit zoveel mogelijk zelf af uit 2b en 2c, en leg het aan de gebruiker voor. Het manifest-schema eist een `api`-blok; `tests/manifest-react.test.ts` en `tests/manifest-figma.test.ts` vergelijken het met React en met de Figma-matrix.

1. **Manifest-basis**: `cssBlock`, `category` (een van `accessibility`, `branding`, `content`, `display-feedback`, `form-field`, `form-input`, `form-option`, `layout`, `navigation`, `section`), `purpose` (één Engelse zin, zoals de bestaande entries), `platforms`. Bepaal de bestandslocatie: `packages/components-html/src/{component-name}/{component-name}.manifest.json`, of de map van de `cssBlock` als het component geen eigen map heeft.

2. **Krijgt het een Figma-matrix?** De regel: elk component in het manifest krijgt een matrix, behalve:
   - layoutcomponenten zonder eigen verschijning (zoals Stack, Grid, Container); ActionGroup is de uitzondering omdat zijn slot iets draagt
   - componenten die het canvas zelf zijn (Body, Icon)
   - componenten met dezelfde CSS als een bestaand component op een ander HTML-element (ButtonLink naast Button, EmailInput naast TextInput)
   - overig: Backdrop, patronen en templates

   Valt het component hierbuiten, dan krijgt het geen matrix. Zet dat in het issue met de reden, en noteer dat het component dan in de lijst in `packages/figma-sync/README.md` ("Welke componenten wel en niet een matrix krijgen") moet komen. Alle onderdelen van het `api`-blok krijgen dan een binding `none` met die reden.

3. **Per prop, slot en state een Figma-binding**, als tabel `Onderdeel | Soort | Figma-binding | Toelichting`:

   | Binding                              | Wanneer                                                                         |
   | ------------------------------------ | ------------------------------------------------------------------------------- |
   | `variant` (`property`)               | Enum-prop of state die een as van de component set wordt                        |
   | `variant` met `values`               | Figma spelt de waarden anders, gebruikt een deel, of labels voor true/false     |
   | `variant` met `value`                | Eén waarde van een as die meerdere props of states delen (`checked` op `state`) |
   | `variant` met `unset`                | Enum-prop zonder default; `unset` is de waarde voor "niet gezet"                |
   | `boolean` / `text` / `instance-swap` | Een component property in het rechterpaneel (laag aan/uit, tekst, icoon)        |
   | `slot`                               | Kinderen die een designer zelf toevoegt of weghaalt (opties, items)             |
   | `none` met `reason`                  | Bewust niet in Figma, met de reden                                              |

   Elke binding kan daarnaast `"open": true` met een `reason` krijgen: er is iets nog onbekend. **Verzin nooit een reden**: zet dan `open` en zet de vraag bij Notities.

   Vuistregel voor as of property: verandert iets de gemeten layout (andere rijverdeling, andere maten), dan is het een as. Is het alleen een laag aan of uit, dan een boolean property.

4. **Matrix-schets** (alleen als er een matrix komt): welke assen (enum-assen altijd via `axisValues('{Name}', '{prop}')`, nooit overgetypt), toestanden (`state`, pseudo-states), combinaties die weg moeten (`skipVariant`, bijv. disabled zonder hover), component properties, slots (`data-figma-children`), geneste componenten als instances (`instances: true`), en of het een onderdeel van een ander component is (`partOf`, dan geen eigen manifest-entry).

---

## Stap 3: Stel de issue body samen

Bouw de body op in deze volgorde. Vul in wat de gebruiker aanleverde; gebruik HTML-commentaren voor ontbrekende informatie.

````
## Beschrijving

[één-alinea beschrijving van het component]

## Wel gebruiken als...

- [Je ... wilt ... / De gebruiker ... moet ...]
- [use case 2]
- [use case 3]

## Niet gebruiken als...

- [situatie]: gebruik dan [alternatief].

## HTML/CSS

### Basis

```html
[basis HTML-markup]
```

### [Variant/Optie naam, indien van toepassing]

```html
[variant markup]
```

### CSS klassen

| Klasse            | Element       | Beschrijving   |
| ----------------- | ------------- | -------------- |
| `dsn-[component]` | `<[element]>` | [beschrijving] |

<!-- Indien van toepassing: Afhankelijk van de CSS van [component] (`@dsn-depends-on: [component]`). -->

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

> ⚠️ **Review vereist vóór implementatie**: akkoord geven op dit voorstel voordat de bouw begint.

```json
{
  "dsn": {
    "[component]": {
      "[token]": {
        "$value": "{dsn.[referentie]}",
        "$type": "[type]",
        "$description": "[rol-zin]"
      }
    }
  }
}
```

**Ontwerpkeuzes:**

- [keuze en motivatie]

## Manifest en Figma (voorstel)

> ⚠️ **Review vereist vóór implementatie**, net als de tokens.

- **Categorie:** `[category]` · **Platforms:** `[html-css, react, ...]`
- **Purpose:** [één Engelse zin]
- **Figma-matrix:** [ja / nee, omdat ...]

| Onderdeel | Soort         | Figma-binding                         | Toelichting   |
| --------- | ------------- | ------------------------------------- | ------------- |
| `[prop]`  | prop          | `variant` → `[as]`                    |               |
| `[slot]`  | slot          | `text` → `[property]`                 |               |
| `[state]` | state         | `variant` → `state` = `[waarde]`      |               |
| `[prop]`  | prop          | `none`                                | [reden]       |
| `[prop]`  | prop          | `none`, `open`                        | [open vraag]  |

**Matrix-schets:** <!-- assen, skipVariant, component properties, slots, instances; of weglaten bij geen matrix -->

---

## Acceptatiecriteria

### HTML/CSS

- [ ] Component tokens JSON (`[component].json`), elk token met `$description`
- [ ] CSS implementatie (`[component].css`)
  - [ ] [specifiek CSS-onderdeel]
  - [ ] [specifiek CSS-onderdeel]
- [ ] `@dsn-depends-on`-comment bovenaan de CSS <!-- alleen als het klassen van een ander component gebruikt -->
- [ ] Export entry toegevoegd aan `packages/components-html/package.json` exports map

### React

- [ ] `[ComponentName]` component met [props opsomming]
- [ ] `React.forwardRef<HTML[Element]Element>`
- [ ] `index.ts` barrel file in de componentdirectory (exporteert component + prop types)
- [ ] Export toegevoegd aan `packages/components-react/src/index.ts`

### Manifest

- [ ] `[component-name].manifest.json` met `api`-blok zoals hierboven voorgesteld (props, slots, states, elk met Figma-binding)
- [ ] `manifest.json` opnieuw gegenereerd: `pnpm --filter @dsn-starter-kit/components-html build:manifest`
- [ ] Open bindingen (`"open": true`) staan in `report:figma-open` en als vraag in dit issue

### Figma <!-- of: "Geen matrix: [reden]. Component toegevoegd aan de lijst in packages/figma-sync/README.md" -->

- [ ] Matrix `packages/figma-sync/src/matrices/[component-name].js`, enum-assen via `axisValues`
- [ ] `pnpm build:figma-components [component-name]` draait zonder fouten of waarschuwingen
- [ ] Gegenereerde `dist/[component-name].json` nagekeken (bindingen, `values`/`unset` die geen test ziet)

### Storybook

- [ ] Drie bestanden aangemaakt: `.stories.tsx`, `.docs.mdx`, `.docs.md`
- [ ] `.docs.md` volledig in het Nederlands, met de vaste kopjes in deze volgorde: `## Doel`, `## Wel gebruiken als...`, `## Niet gebruiken als...`, `## Goed gebruik`, `## Design tokens` (marker `<!-- tokens: [component-name] -->`), `## Toegankelijkheid`
- [ ] Bullets onder Wel/Niet gebruiken als... overgenomen uit dit issue
- [ ] Stories volgens de vaste secties: [concreet invullen, bijv. `Default`, `WithDescription`, `Disabled`, `AllStates`, `ShortText`, `LongText`, `RTL`, `RTLLongText`]
- [ ] `Introduction.mdx` bijgewerkt (datum + componentnaam in de lijst)

---

## Definition of Done

- [ ] Feature branch: `git checkout -b feature/[component-name]`
- [ ] Alle acceptatiecriteria afgevinkt
- [ ] Kwaliteitscontrole in CI-volgorde groen: `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm type-check`, `pnpm test` (inclusief `tests/manifest-react.test.ts` en `tests/manifest-figma.test.ts`, en `tests/manifest-web.test.ts` bij een web component)
- [ ] `MEMORY.md` bijgewerkt indien nieuw patroon of architectuurkeuze
- [ ] PR aangemaakt (`gh pr create`), CI groen, gemerged (`gh pr merge --merge`)

## Notities / Open vragen

<!-- Edge cases, twijfels, tokenwaarden die nog bepaald moeten worden, open Figma-bindingen, dingen om op te letten tijdens refinement. -->
````

**Let op bij het invullen:**

- Acceptatiecriteria **genereer je** op basis van wat de gebruiker in stap 2 heeft opgegeven: maak ze concreet en specifiek, en haal criteria weg die niet van toepassing zijn (bijv. het Figma-blok wordt één regel als er geen matrix komt)
- Storybook stories leid je af uit de HTML/CSS-varianten die beschreven zijn
- Ontbrekende secties krijgen een HTML-commentaar, ze worden niet weggelaten
- Tokens die nog niet bepaald zijn en open Figma-bindingen markeer je expliciet in de Notities sectie

**Storybook story-structuur: vaste regels**

Elke `.stories.tsx` volgt altijd deze sectievolgorde (met `// ===` comments als scheidslijn):

1. `// DEFAULT`: altijd één `Default` story
2. `// VARIANTEN`: individuele stories per prop of state
3. `// OVERZICHTSSTORIES`: één overzichtsstory:
   - `AllVariants` voor componenten met **visuele kleur- of stijlvarianten** (bijv. `variant="info|warning|error"`)
   - `AllStates` voor componenten met **interactieve states** (bijv. default, disabled, invalid, read-only)
4. `// TEKST VARIANTEN`: `ShortText` + `LongText`, **alleen** bij componenten met zichtbare tekstinhoud; weglaten bij icoon-only of puur visuele componenten (DotBadge, Icon, Checkbox, Radio). `LongText` gebruikt altijd `VEEL_TEKST` uit `story-helpers.tsx`
5. `// RTL`: `RTL` + `RTLLongText`, **alleen** bij componenten met tekst of richtingsgevoelige layout

Geen `// HIGH CONTRAST` sectie: daar zijn we van af gestapt.

**Story-namen: Engels, en geen redundante `name`**

Storybook leidt de naam in de sidebar af uit de export-naam (`AllStates` wordt "All States"). De export-naam is dus altijd Engels. Een `name:` voeg je **alleen** toe als die afwijkt van wat Storybook zelf afleidt; anders klaagt de eslint-regel `storybook/no-redundant-story-name`.

```ts
// ✅ Geen name nodig
export const AllStates: Story = {/* ... */};

// ✅ name wijkt af van de afgeleide naam ('Current')
export const Current: Story = {
  name: 'Current (active page)',
};

// ❌ Nederlandse export-naam of name
export const AlleStaten: Story = {/* ... */};
export const WithIconStart: Story = { name: 'Met icoon start' };
```

---

## Stap 4: Toon ter review

Laat de volledige title én body zien aan de gebruiker. Vraag om expliciete bevestiging voordat het issue aangemaakt wordt.

---

## Stap 5: Maak het issue aan

Na bevestiging van de gebruiker:

```bash
gh issue create \
  --title "feat(ComponentName): korte beschrijving" \
  --label "feat,component,needs refinement" \
  --body "BODY"
```

Rapporteer de URL van het aangemaakte issue.

---

## Regels

- Gebruik **altijd** het volledige template: sla geen secties over
- **Genereer** de acceptatiecriteria op basis van de spec: kopieer ze niet blind uit eerdere issues
- Voeg **geen** verzonnen implementatiedetails toe: als iets onbekend is, gebruik HTML-commentaar of ⚠️
- **Verzin geen reden** voor een Figma-binding `none`: weet je het niet, gebruik `"open": true` en zet de vraag bij Notities
- Vraag altijd om **expliciete bevestiging** voordat het issue aangemaakt wordt
- Labels zijn altijd `feat,component,needs refinement`: geen uitzonderingen voor nieuwe componenten
- **Token-formaat**: DTCG (`$value`, `$type`, `$description`), sub-groepen genest (zie stap 2e)
- **Story-namen altijd Engels**, zonder redundante `name:` (zie de story-structuur hierboven)
- **Geen em dashes** in de issue-tekst: gebruik een komma, dubbele punt of haakjes
