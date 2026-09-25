# DR-2026-11: Card-secties en DOM-volgorde

**ID:** DR-2026-11
**Datum:** September 2026
**Status:** Accepted
**Auteurs:** Jeffrey Lauwers

---

## Context

De huidige Card heeft drie secties, en die dekken de inhoud niet goed af:

- `dsn-card__header` bevat alleen de afbeelding, zonder padding.
- De heading staat in `dsn-card__body`, samen met badges en paragrafen.
- `dsn-card-heading` is een los BEM-blok in plaats van een element van de Card.

Dat levert twee problemen op.

**Betekenisvolle volgorde (issue #300).** De afbeelding staat in de DOM vóór de heading. Heeft de afbeelding een alt-tekst, bijvoorbeeld omdat er tekst op staat, dan leest een screenreader informatie voor die bij de heading hoort, terwijl die heading nog niet is aangekondigd. Wie op koppen navigeert, slaat die informatie over. Dat is een overtreding van WCAG 1.3.2. Daarnaast zet de huidige markup `aria-hidden="true"` op de `<figure>`, wat botst met een betekenisvolle alt-tekst.

**Geen plek voor de rest van de inhoud.** De visie op Cards (Design Open Dagen, uitgewerkt met het NL Design System-kernteam) verdeelt een Card in vier slots: Pre-header, Header, Body en Footer. Die slots bevatten sub-componenten zoals Heading, Label, Description, Meta, badges, Image en Link. Voor Label, Description en Meta heeft de huidige Card geen elementen en geen tokens.

Dit record gaat alleen over de Default Card. Varianten (Case, Task) en een liggende layout volgen later.

---

## Opties overwogen

### Optie 1: Alleen de volgorde repareren

Heading en afbeelding in de DOM omwisselen en de afbeelding met `order` bovenaan zetten. Verder niets veranderen.

**Voordeel:** Klein, niet breaking, lost issue #300 op.
**Nadeel:** De heading blijft in de body staan en `dsn-card__header` blijft "de afbeelding" betekenen. Die naam botst met de Header uit de visie, dus de breaking change komt later alsnog, dan met dubbel werk.

### Optie 2: Vier secties, DOM-volgorde los van visuele volgorde (gekozen)

De Card krijgt vier secties, elk met eigen padding- en gap-tokens. In de DOM staat de Header vóór de Pre-header, en de Pre-header komt visueel bovenaan via `order: -1`.

**Voordeel:** Lost issue #300 op én sluit aan op de visie, de terminologie van Modal Dialog, Drawer en de pagina (header, body, footer) en de token-opzet per sectie.
**Nadeel:** Breaking change in DOM en React-API: `CardHeader` krijgt een andere betekenis.

---

## Beslissing

**De Card bestaat uit vier optionele secties: `dsn-card__pre-header`, `dsn-card__header`, `dsn-card__body` en `dsn-card__footer`. De Header staat in de DOM vóór de Pre-header, die visueel bovenaan komt via `order: -1`.**

```html
<article class="dsn-card">
  <div class="dsn-card__header">
    <h2 class="dsn-card__heading">
      <a href="/artikel/slug" class="dsn-card__link">Artikeltitel</a>
    </h2>
  </div>
  <div class="dsn-card__pre-header">
    <figure class="dsn-image dsn-image--ratio-16-9">
      <img class="dsn-image__img" src="…" alt="" />
    </figure>
  </div>
  <div class="dsn-card__body">
    <p class="dsn-paragraph">Korte beschrijving.</p>
  </div>
  <div class="dsn-card__footer">
    <span class="dsn-card__affordance" aria-hidden="true">Lees meer</span>
  </div>
</article>
```

Daarbij horen deze deelbesluiten.

### 1. Eén Card-blok, geen apart `dsn-card-as-link`

De visie onderscheidt 'Card as Link' en 'Card'. We houden voorlopig één blok: een Card gedraagt zich als link zodra er een `dsn-card__link` in zit. Hover- en focus-stijlen hangen aan `.dsn-card:has(.dsn-card__link…)`.

Een apart blok zou nu alle sectie-tokens dupliceren zonder dat de waarden verschillen. We splitsen pas als Card as Link echt eigen tokens nodig heeft.

### 2. De stretched link is een class, niet gekoppeld aan de heading

`dsn-card-heading__link` wordt `dsn-card__link`. Het `::before`-pseudo-element dekt de hele Card. Omdat het een losse class is, kan de primaire link ook in de footer staan, met unieke linktekst ("Lees meer over fruit").

### 3. Affordance zonder dubbele tabstop

Een visuele "Lees meer" die dezelfde bestemming heeft als de Card, is een `<span class="dsn-card__affordance" aria-hidden="true">`, gestyled als link. De huidige `<a aria-hidden="true" tabindex="-1">` vervalt: een focusbaar element met `aria-hidden` is een bekend anti-patroon, en de stretched link vangt de klik al af.

### 4. Pre-header heeft dezelfde padding als de Header, media bleedt eruit

De Pre-header is een slot waar van alles in kan (afbeelding, badge, logo, icoon). Daarom krijgt hij standaard dezelfde padding als de Header. De Pre-header-tokens verwijzen naar de Header-tokens, zodat de delegatieketen die gelijkheid bewaakt.

Een afbeelding of placeholder als direct kind wordt full-bleed met negatieve marges ter grootte van de padding van de sectie:

```css
.dsn-card__pre-header > :is(.dsn-image, .dsn-card__image-placeholder) {
  margin-inline-start: calc(
    -1 * var(--dsn-card-pre-header-padding-inline-start)
  );
  margin-inline-end: calc(-1 * var(--dsn-card-pre-header-padding-inline-end));
}

.dsn-card__pre-header
  > :is(.dsn-image, .dsn-card__image-placeholder):first-child {
  margin-block-start: calc(-1 * var(--dsn-card-pre-header-padding-block-start));
}

.dsn-card__pre-header
  > :is(.dsn-image, .dsn-card__image-placeholder):last-child {
  margin-block-end: calc(-1 * var(--dsn-card-pre-header-padding-block-end));
}
```

Overwogen alternatief: `.dsn-card__pre-header:has(img) { padding: 0 }`. Dat is korter, maar zet de padding voor de hele sectie op 0. Staat er naast de afbeelding ook een badge in de Pre-header, dan plakt die tegen de rand. Een `img` die niet full-bleed hoort te zijn, zoals een logo, verliest zijn padding ook. Met negatieve marges bleedt alleen de media, en houdt de overige inhoud van de sectie zijn padding.

### 5. Sub-componenten zijn elementen van de Card

`dsn-card-heading` wordt `dsn-card__heading`. Er komen `dsn-card__label`, `dsn-card__description` en `dsn-card__meta` bij, elk met eigen typografie-tokens. Zo blijft de tekstgrootte in een Card gelijk, ongeacht of de heading een `h2` of `h3` is.

### 6. Footer onderaan via `margin-block-start: auto`

Niet meer via `flex: 1` op de body. Dat werkt ook bij een Card zonder body, zoals alleen Header plus Footer, en houdt call-to-actions in een rij Cards op gelijke hoogte.

---

## Impact

| Dimensie                          | Voor                                  | Na                                                           |
| --------------------------------- | ------------------------------------- | ------------------------------------------------------------ |
| Secties                           | 3 (header = afbeelding, body, footer) | 4 (pre-header, header, body, footer)                         |
| Afbeelding in DOM vóór de heading | ja                                    | nee                                                          |
| `aria-hidden` op de `<figure>`    | altijd                                | nooit; de alt-tekst bepaalt of de afbeelding betekenis heeft |
| Tabstops per Card as Link         | 1 (plus een verborgen footer-link)    | 1                                                            |
| Tekst-elementen met eigen tokens  | 1 (heading)                           | 4 (heading, label, description, meta)                        |

De standaard-tokenwaarden kiezen we zo dat de bestaande stories visueel niet veranderen. Chromatic is daarmee de acceptatietest.

---

## Gevolgen

**Wat makkelijker wordt:**

- Een betekenisvolle afbeelding met alt-tekst schendt WCAG 1.3.2 niet meer.
- Nieuwe Card-vormen (Login, Topic, Message) zijn samen te stellen uit dezelfde secties en sub-componenten, zonder nieuw component.
- Per sectie zijn padding en gap via tokens aan te passen.

**Wat moeilijker wordt:**

- Dit is een breaking change en vraagt om een major release. `CardHeader` bevat straks de heading; de afbeelding verhuist naar `CardPreHeader`. Oude code blijft renderen, maar met de afbeelding in de verkeerde sectie. De changelog krijgt een migratienotitie.
- Visuele volgorde en DOM-volgorde verschillen. Wie de CSS leest, moet weten dat `order: -1` bewust is.

**Nieuwe verplichtingen voor contributors:**

- Zet de Header in de DOM altijd vóór de Pre-header, ook als de Pre-header visueel bovenaan staat. De HTML moet zonder CSS in een logische volgorde staan.
- Zet geen focusbare elementen in de Pre-header. Door `order` wijkt de focusvolgorde anders af van de visuele volgorde (WCAG 2.4.3).
- Geef een afbeelding in een Card geen `aria-hidden`. Decoratief is `alt=""`, betekenisvol is een alt-tekst.

---

## Supersedes / superseded by

Herzie deelbesluit 1 wanneer Card as Link tokens nodig heeft die afwijken van de Card, of wanneer de liggende layout (container queries) andere sectie-tokens vraagt.

---

## Gerelateerde records

- DR-2026-02 (twee-lagenpatroon): de sectiestructuur staat in de CSS; React volgt
- DR-2026-04 (htmlTemplate spiegelt de echte render): de htmlTemplates van de Card-stories volgen de nieuwe DOM-volgorde
- Issue #300: fix(Card): Afbeelding boven het kopje kan een conflict geven met betekenisvolle volgorde
- WCAG 1.3.2 Betekenisvolle volgorde: https://nldesignsystem.nl/wcag/1.3.2/
