# Home Page

Paginatemplate met een prominente Hero direct onder de Page Header, gevolgd door een responsieve grid-layout.

## Doel

Het Home Page template bouwt voort op de Base Page-structuur en plaatst een `Hero` als eerste element in de `<main>`, direct onder de `PageHeader`. Het template laat zien hoe je de Hero combineert met verschillende PageHeader-varianten (default, inverse, compact) en hoe je full-width en inverse kleurschema's combineert voor een sterk visueel openingsscherm.

Templates zijn Storybook-only composities van bestaande componenten. Ze bevatten geen eigen CSS of React component.

<!-- VOORBEELD -->

## Paginaopbouw

```html
<body class="dsn-body">
  <a href="#main-content" class="dsn-skip-link">Ga naar hoofdinhoud</a>
  <div class="dsn-page-layout">
    <header class="dsn-page-header">…</header>
    <div class="dsn-page-body">
      <main id="main-content" tabindex="-1">
        <section
          class="dsn-hero dsn-hero--inverse"
          aria-labelledby="hero-heading"
        >
          <div class="dsn-hero__inner">
            <div class="dsn-hero__content">…</div>
          </div>
        </section>
        <!-- grid-inhoud onder de Hero -->
      </main>
    </div>
    <footer class="dsn-page-footer">…</footer>
  </div>
</body>
```

```tsx
<Body>
  <SkipLink href="#main-content" />
  <PageLayout>
    <PageHeader logoSlot={…} … />
    <PageBody>
      <main id="main-content" tabIndex={-1}>
        <Hero variant="inverse" aria-labelledby="hero-heading">
          <Stack space="lg">
            <Heading level={1} id="hero-heading">Paginatitel</Heading>
            <Paragraph variant="lead">Introductietekst.</Paragraph>
            <ActionGroup>
              <ButtonLink href="/start" variant="strong" size="large">Aan de slag</ButtonLink>
              <ButtonLink href="/meer" variant="subtle" size="large">Meer informatie</ButtonLink>
            </ActionGroup>
          </Stack>
        </Hero>
        {/* grid-inhoud onder de Hero */}
      </main>
    </PageBody>
    <PageFooter … />
  </PageLayout>
</Body>
```

## Varianten

| Story                                     | PageHeader                   | Hero                |
| ----------------------------------------- | ---------------------------- | ------------------- |
| Home Page                                 | default                      | inverse             |
| Home Page: Full Width                     | default, full width          | inverse, full width |
| Home Page: Inverse                        | inverse                      | image-blend         |
| Home Page: Compact + Inverse + Full Width | compact, inverse, full width | inverse, full width |

### Full width

Stel `--dsn-page-max-inline-size: none` in op `PageLayout` voor een volledige paginabreedte. Stel dezelfde custom property ook in op de `Hero` zelf om de inhoud van rand tot rand te laten lopen.

```tsx
<PageLayout style={{ '--dsn-page-max-inline-size': 'none' }}>
  …
  <Hero variant="inverse" style={{ '--dsn-page-max-inline-size': 'none' }}>
    …
  </Hero>
</PageLayout>
```

### Inverse PageHeader + image-blend Hero

Combineer `colorScheme="inverse"` op de `PageHeader` met `variant="image-blend"` op de `Hero` voor een doorgaand visueel thema van header naar hero.

## Wel gebruiken als...

- Je een homepage of landingspagina bouwt met een prominente openingssectie.
- Je een visuele nadruk wilt op het eerste scherm met een Hero-afbeelding of inversekleurschema.
- Je de PageHeader en Hero thematisch op elkaar wilt afstemmen.

## Niet gebruiken als...

- De pagina geen bijzondere openingssectie nodig heeft: gebruik dan het Base Page template.
- De Hero alleen decoratief is zonder informatieve koptekst: een Hero vereist altijd een herkenbare `<h1>` met `aria-labelledby`.

## Toegankelijkheid

- Geef de `Hero` altijd `aria-labelledby` dat verwijst naar de `<h1>` erin, zodat het `<section>`-element een toegankelijke naam heeft.
- De `<h1>` staat in de Hero en is de eerste heading op de pagina — gebruik geen andere `<h1>` elders op de pagina.
- Zorg dat knoppen en links in de Hero ook op de inversebehtergrond voldoende contrast hebben (WCAG AA).
