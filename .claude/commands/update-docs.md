# Documentatie synchroniseren

Synchroniseer alle projectdocumentatie met de actuele staat van de codebase. Werk elke stap in volgorde af.

Optionele context die meegegeven kan worden (gebruik $ARGUMENTS als startpunt):

> $ARGUMENTS

---

## Stap 1 — Begrijp wat er veranderd is

Voer uit:

```
git log --oneline -20
```

Noteer wat er veranderd is:

- Nieuwe componenten toegevoegd?
- Bestaande componenten gewijzigd (API, props, HTML klassen, tokens)?
- Nieuwe of gewijzigde design tokens?
- Breaking changes?
- Versie-bumps?
- Bug fixes of interne refactors?

Dit bepaalt welke bestanden daadwerkelijk updated moeten worden. Niet elk bestand hoeft bij elke sessie te veranderen.

---

## Stap 2 — Root `README.md`

Controleer en update waar nodig:

- **Componenttelling** — tel de werkelijke componenten in de codebase en vergelijk
- **Testaantal** — haal het actuele getal op via: `pnpm test run 2>&1 | tail -5`
- **Component tabel** — alle componenten vermeld? HTML/CSS + React + Web Component status correct?
- **Scripts sectie** — zijn er nieuwe scripts bijgekomen in `package.json`?
- **Tech stack** — zijn er versie-wijzigingen (bijv. Storybook, Vitest, TypeScript)?

---

## Stap 3 — `docs/` bestanden

### `docs/README.md`

- Componenttelling en statistieken up-to-date?
- Links naar andere docs — alle 5 nummers aanwezig?

### `docs/01-architecture.md`

Alleen updaten als de **architectuur zelf** veranderd is: token-structuur, repo-layout, naming conventions, package-verantwoordelijkheden.

### `docs/02-design-tokens-reference.md`

Updaten bij:

- Nieuwe token-categorieën of schalen
- Gewijzigde token-waarden (spacing, typografie, kleuren, borders)
- Nieuwe token-types (bijv. box-shadow tokens werden hier toegevoegd in PR #73)

### `docs/03-components.md`

**Grootste kans op updates.** Updaten bij:

- Nieuwe componenten → toevoegen aan de juiste categorie met correcte BEM klassen, props, beschrijving
- Gewijzigde API's → props, varianten, HTML klassen bijwerken
- Componenttelling per categorie controleren:
  - Layout Components: 4 (Container, Stack, Grid, GridItem)
  - Content Components: 9 (Button, ButtonLink, Heading, Icon, Link, LinkButton, OrderedList, Paragraph, UnorderedList)
  - Display & Feedback Components: 4 (Alert, Note, StatusBadge, Table)
  - Form Components: 25 (7 option + 2 input + 7 field + 9 specialized)
  - **Totaal: 42**

### `docs/04-development-workflow.md`

Updaten bij: nieuwe scripts, gewijzigde test-strategie, nieuwe tooling, CI/CD wijzigingen.

### `docs/06-css-naming-conventions.md`

Updaten bij: nieuwe naamgevingspatronen, nieuwe utility-klassen, wijzigingen in het lokale alias-scoping-patroon of token-naamstructuur.

### `docs/05-storybook-configuration.md`

Updaten bij: nieuwe addons, nieuwe story-types, gewijzigde Storybook config, nieuwe TokenTable features.

### `docs/changelog.md`

Voeg een nieuwe entry toe voor commits die nog niet gedocumenteerd zijn. Formaat:

```markdown
## [versie] — YYYY-MM-DD

### Added

- Omschrijving van nieuwe feature of component (PR #nummer)

### Changed

- Omschrijving van wijziging

### Fixed

- Omschrijving van bug fix

### Breaking Changes

- Omschrijving + migratiepad
```

Gebruik commit messages en PR-nummers als bron. Sla het over als alle recente commits al een entry hebben.

---

## Stap 4 — Storybook `packages/storybook/src/*.docs.md`

**Voor elk nieuw component** dat nog geen `.docs.md` heeft:
Maak een nieuw bestand aan in hetzelfde formaat als bestaande bestanden. Kijk naar een bestaand bestand in dezelfde categorie als voorbeeld. Secties:

1. Titel + korte beschrijving
2. Use when
3. Don't use when
4. Best practices
5. Design tokens tabel (tokennaam | waarde/beschrijving)

**Voor gewijzigde componenten:**

- Beschrijving updaten als de API of scope veranderd is
- Design tokens tabel updaten bij nieuwe of gewijzigde tokens
- Use when / Don't use when aanpassen als de aanbevolen inzet veranderd is

---

## Stap 5 — Commit

Zijn er bestanden gewijzigd? Commit ze dan met een beschrijvend bericht:

```
git add README.md docs/README.md docs/03-components.md docs/changelog.md packages/storybook/src/*.docs.md
git commit -m "docs: ..."
```

Gebruik de `docs:` prefix. Noem in de commit message welke versie(s) gedocumenteerd zijn en wat er is toegevoegd of bijgewerkt.

Vraag daarna aan de gebruiker of de commit rechtstreeks naar main gepusht moet worden, of via een PR. Doe dit **niet automatisch** — wacht op expliciete bevestiging.

---

## Regels

- Wijzig **nooit** code-bestanden (`.ts`, `.tsx`, `.css`, `.json` tokens, Storybook stories)
- Wijzig **nooit** `MEMORY.md` of bestanden in `.claude/` — dat is Claude's eigen domein
- Voeg **geen** verzonnen statistieken toe — haal testaantal en componenttelling altijd uit de werkelijke codebase
- Houd de **bestaande schrijfstijl** aan: toon, taal (Nederlands of Engels per bestand), opmaak, sectienamen
- Update **alleen wat daadwerkelijk veranderd is** — niet elk bestand hoeft bij elke sessie te wijzigen
- Als iets onduidelijk is: vraag eerst, update daarna
