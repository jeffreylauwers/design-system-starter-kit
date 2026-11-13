# TableOfContents

Inhoudsopgave met ankerlinks naar de H2-secties van de huidige pagina.

## Doel

De TableOfContents component toont een lijst van ankerlinks waarmee een gebruiker snel naar een sectie verderop op de pagina kan springen. Alleen H2-secties horen hierin opgenomen te worden: dat houdt de lijst overzichtelijk en voorkomt een te diepe navigatiestructuur. Twee appearances: **framed** (accent-1 achtergrond en linkerborder, voor gebruik inline in de content-flow) en **plain** (geen kader, voor gebruik in een losstaande kolom naast de hoofdinhoud).

<!-- VOORBEELD -->

## Wel gebruiken als...

- Een lange pagina meerdere H2-secties heeft waar de gebruiker snel naartoe wil kunnen springen.
- De inhoudsopgave inline in de content-flow staat, bijvoorbeeld direct onder de introductietekst op kleinere viewports: gebruik dan `appearance="framed"` (default).
- De inhoudsopgave op bredere viewports in een losstaande kolom naast de hoofdinhoud staat: gebruik dan `appearance="plain"`.

## Niet gebruiken als...

- De pagina maar één of twee secties heeft: een inhoudsopgave voegt dan geen waarde toe.
- Je een paginabrede navigatiestructuur nodig hebt: gebruik **Menu**/**MenuLink**.
- Je een algemene, niet-navigatiegerelateerde tip of waarschuwing wilt tonen: gebruik **Note**.

## Goed gebruik

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

<!-- tokens: table-of-contents -->

## Toegankelijkheid

- Rendert als `<nav>` met `aria-labelledby` gekoppeld aan de heading: de accessible name is de zichtbare heading-tekst.
- Pas `headingLevel` aan op de documenthiërarchie (standaard `h2`, gelijk aan de secties waarnaar gelinkt wordt).
- Ankerlinks zijn gewone `Link`-elementen: toetsenbordgebruikers kunnen er doorheen tabben en met Enter activeren.
- Bij dubbele weergave (inline + kolom): verberg de niet-actieve kopie met `display: none`, niet met `visibility: hidden` of `opacity: 0`, zodat schermlezers hem niet dubbel tegenkomen.
