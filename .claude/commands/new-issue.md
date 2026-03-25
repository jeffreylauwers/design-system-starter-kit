# Nieuw backlog item aanmaken

Maak een nieuw GitHub issue aan als backlog item. Het issue **moet altijd** het standaard template volgen — sla geen secties over.

Optionele context meegegeven door de gebruiker (componentnaam, beschrijving, etc.):

> $ARGUMENTS

---

## Stap 1 — Bepaal titel en scope

Als de gebruiker geen componentnaam of beschrijving heeft meegegeven via `$ARGUMENTS`, vraag dan:

- Wat is de naam van het component of de feature?
- Is dit een nieuw component, een uitbreiding, of een fix?

Bepaal het juiste titelformaat:

- Nieuw component of feature → `feat(ComponentName): korte beschrijving`
- Bug fix → `fix(ComponentName): korte beschrijving`
- Tooling / docs / refactor → `chore(scopeName): korte beschrijving`

---

## Stap 2 — Verzamel de template-inhoud

Vraag de gebruiker naar de volgende onderdelen (gebruik `AskUserQuestion` of vraag ze één voor één via tekst):

1. **User Story** — "Als [gebruiker/ontwikkelaar] wil ik [wat] zodat [waarom]."
2. **Context** — Technische context, gerelateerde issues of code. (optioneel)
3. **Acceptance Criteria** — De concrete done-criteria. (één per regel)
4. **Notities / Open vragen** — Edge cases, twijfels, refinement-punten. (optioneel)

Vraag ook: is dit een **nieuw component**? (bepaalt of de "Bij nieuw component" sectie meegenomen wordt)

---

## Stap 3 — Stel de issue body samen

Bouw de body op volgens het template hieronder. Vul de gebruikersinput in op de juiste plekken. Laat HTML-commentaren (`<!-- ... -->`) staan als er geen inhoud voor die sectie is.

```
## User Story

Als [gebruiker/ontwikkelaar] wil ik [wat] zodat [waarom].

## Context

<!-- Technische context: relevante patronen, betrokken componenten, links naar gerelateerde issues of code. -->

## Acceptance Criteria

- [ ] ...

## Definition of Done

### Voorbereiding

- [ ] Feature branch aangemaakt: `git checkout -b feature/naam`

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

<!-- Edge cases, twijfels, dingen om op te letten tijdens refinement. -->
```

**Let op:** Als het géén nieuw component is, laat dan de sectie `### Bij nieuw component` weg.

---

## Stap 4 — Toon ter review

Laat de volledige title én body zien aan de gebruiker. Vraag om expliciete bevestiging voordat het issue aangemaakt wordt.

---

## Stap 5 — Maak het issue aan

Na bevestiging van de gebruiker:

```bash
gh issue create --title "TITEL" --body "BODY"
```

Rapporteer de URL van het aangemaakte issue.

---

## Regels

- Gebruik **altijd** het volledige template — sla geen secties over
- Voeg **geen** verzonnen inhoud toe — als iets onbekend is, gebruik de HTML-comment placeholder
- Vraag altijd om **expliciete bevestiging** voordat het issue aangemaakt wordt
- Sectie `### Bij nieuw component` is **verplicht bij nieuwe componenten**, weglaten bij fixes/chores
