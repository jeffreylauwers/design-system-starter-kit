# TableOfContents

Inhoudsopgave met ankerlinks naar de H2-secties van de huidige pagina.

## Doel

De TableOfContents component toont een lijst van ankerlinks waarmee een gebruiker snel naar een sectie verderop op de pagina kan springen. Alleen H2-secties horen hierin opgenomen te worden: dat houdt de lijst overzichtelijk en voorkomt een te diepe navigatiestructuur. Twee appearances: **framed** (accent-1 achtergrond en linkerborder, voor gebruik inline in de content-flow) en **plain** (geen kader, voor gebruik in een losstaande kolom naast de hoofdinhoud).

<!-- VOORBEELD -->

## Use when

- Een lange pagina met meerdere H2-secties waar de gebruiker snel naartoe wil kunnen springen.
- `appearance="framed"` (default) voor gebruik inline in de content-flow, bijvoorbeeld direct onder de introductietekst op kleinere viewports.
- `appearance="plain"` voor gebruik in een losstaande kolom naast de hoofdinhoud op bredere viewports.

## Don't use when

- De pagina maar één of twee secties heeft: een inhoudsopgave voegt dan geen waarde toe.
- Je een paginabrede navigatiestructuur nodig hebt: gebruik **Menu**/**MenuLink**.
- Je een algemene, niet-navigatiegerelateerde tip of waarschuwing wilt tonen: gebruik **Note**.

## Best practices

### Alleen H2-secties

Neem alleen H2's op in `items`. H3's en dieper horen niet in de inhoudsopgave.

### `appearance` prop

| Waarde               | Wanneer                                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `'framed'` (default) | Inline in de content-flow: accent-1 achtergrond en linkerborder maken het blok visueel herkenbaar tussen de lopende tekst  |
| `'plain'`            | In een losstaande kolom naast de hoofdinhoud: de kolompositie geeft al voldoende visuele scheiding, een kader is overbodig |

### Twee keer renderen voor responsive gedrag

Wanneer een pagina zowel inline (mobiel/tablet) als in een kolom (desktop) een inhoudsopgave toont, render je het component twee keer: één keer met `appearance="framed"` en één keer met `appearance="plain"`, en toon je per breakpoint telkens één via CSS (`display: none` op de andere). Een `display: none`-element valt buiten de accessibility tree, dus er is nooit dubbele content voor schermlezers.

### Ids

Elk item's `id` moet exact overeenkomen met het `id` van de bijbehorende `Heading level={2}` op de pagina.

## Design tokens

| Token                                               | Beschrijving                                            |
| --------------------------------------------------- | ------------------------------------------------------- |
| `--dsn-table-of-contents-border-inline-start-width` | Breedte van de linkerborder (framed appearance)         |
| `--dsn-table-of-contents-border-inline-start-color` | Kleur van de linkerborder (framed appearance), accent-1 |
| `--dsn-table-of-contents-background-color`          | Achtergrondkleur (framed appearance), accent-1          |
| `--dsn-table-of-contents-padding-block`             | Verticale padding (framed appearance)                   |
| `--dsn-table-of-contents-padding-inline-start`      | Horizontale padding aan het begin (framed appearance)   |
| `--dsn-table-of-contents-padding-inline-end`        | Horizontale padding aan het einde (framed appearance)   |
| `--dsn-table-of-contents-heading-gap`               | Ruimte tussen de heading en de lijst met ankerlinks     |

## Accessibility

- Rendert als `<nav>` met `aria-labelledby` gekoppeld aan de heading: de accessible name is de zichtbare heading-tekst.
- Pas `headingLevel` aan op de documenthiërarchie (standaard `h2`, gelijk aan de secties waarnaar gelinkt wordt).
- Ankerlinks zijn gewone `Link`-elementen: toetsenbordgebruikers kunnen er doorheen tabben en met Enter activeren.
- Bij dubbele weergave (inline + kolom): verberg de niet-actieve kopie met `display: none`, niet met `visibility: hidden` of `opacity: 0`, zodat schermlezers hem niet dubbel tegenkomen.
