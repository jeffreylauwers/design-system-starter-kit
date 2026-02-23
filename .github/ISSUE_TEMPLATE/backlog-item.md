---
name: Backlog item
about: Nieuw backlog item voor het design system
title: 'feat(ComponentName): korte beschrijving'
labels: ''
assignees: ''
---

## User Story

Als [gebruiker/ontwikkelaar] wil ik [wat] zodat [waarom].

## Context

<!-- Technische context: relevante patronen, betrokken componenten, links naar gerelateerde issues of code. -->

## Acceptance Criteria

- [ ]
- [ ]

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
