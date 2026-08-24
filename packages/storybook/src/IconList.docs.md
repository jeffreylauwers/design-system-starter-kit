# Icon List

Een lijst waarbij elk item een icoon als marker heeft in plaats van een bullet of cijfer.

## Doel

De IconList component toont een opsomming waarbij het icoon per item visuele context toevoegt: welk soort informatie het item bevat, of welke status het heeft. De lijst is standaard semantisch een `<ul>` en kan met `as="ol"` een geordende lijst worden wanneer de volgorde betekenis heeft. De icoonkleur is standaard de accentkleur (gelijk aan de marker-kleur van UnorderedList) en kan per lijst worden overschreven met elke `*-color-default` kleur uit de kleurpaletten.

<!-- VOORBEELD -->

## Use when

- Iconen visuele context toevoegen aan elk item, bijvoorbeeld voordelen, kenmerken of praktische details.
- Je categorisch onderscheid wilt maken tussen items via verschillende iconen.
- Je een status per item wilt tonen met een semantische kleur (positief, negatief, waarschuwing).
- Je geordende stappen toont waarbij een icoon duidelijker is dan een cijfer.

## Don't use when

- De items geen visueel onderscheidend icoon nodig hebben: gebruik dan de [Unordered List](/docs/components-unorderedlist--docs) of [Ordered List](/docs/components-orderedlist--docs).
- Het nummer van elke stap zelf betekenis heeft en genoemd moet worden: gebruik dan de [Ordered List](/docs/components-orderedlist--docs), die het cijfer zichtbaar houdt.
- De items volledige statusberichten zijn die aandacht vragen: gebruik dan [Alert](/docs/components-alert--docs) of [Note](/docs/components-note--docs).
- Je key-value informatie toont: gebruik dan de [Summary List](/docs/components-summarylist--docs).

## Best practices

### Icoonkeuze

- **Kies iconen die het item verduidelijken.** Een icoon dat niets toevoegt, leidt af. Als je geen betekenisvol icoon kunt kiezen, is een gewone lijst beter.
- **Wees consequent binnen een lijst.** Gebruik óf per item een eigen icoon (categorisch onderscheid), óf voor alle items hetzelfde icoon (statuslijst). Een mix van beide leest onrustig.
- **Herhaal de icoonbetekenis in de tekst.** Iconen zijn decoratief (`aria-hidden`); alle informatie moet ook uit de tekst blijken.

### Kleurgebruik

- **Gebruik de standaard accentkleur tenzij de kleur betekenis draagt.** Zet `iconColor` alleen wanneer de kleur een status communiceert.
- **Kleur is nooit de enige drager van betekenis.** Combineer een positieve kleur met een check-icoon en tekst die de status benoemt (WCAG 1.4.1).
- **Eén kleur per lijst.** `iconColor` geldt voor de hele lijst. Wisselende statussen per item horen in aparte lijsten of in een [Summary List](/docs/components-summarylist--docs).

### Inhoud

- **Houd items compact en scanbaar.** Lange beschrijvingen horen in paragraphs, niet in lijstitems.
- **Gebruik parallelle grammatica.** Start elk item met hetzelfde type woord.
- **Kies bewust tussen `ul` en `ol`.** Gebruik `as="ol"` alleen wanneer de volgorde echt betekenis heeft; screenreaders kondigen items dan aan als "item 1 van 3".

## Design tokens

| Token                              | Beschrijving                                        |
| ---------------------------------- | --------------------------------------------------- |
| `--dsn-icon-list-color`            | Tekstkleur                                          |
| `--dsn-icon-list-font-family`      | Lettertypefamilie                                   |
| `--dsn-icon-list-font-size`        | Font size (md)                                      |
| `--dsn-icon-list-font-weight`      | Font weight                                         |
| `--dsn-icon-list-line-height`      | Line height                                         |
| `--dsn-icon-list-max-inline-size`  | Maximale breedte voor leesbaarheid                  |
| `--dsn-icon-list-gap`              | Ruimte tussen list items                            |
| `--dsn-icon-list-margin-block-end` | Ondermarge van de lijst                             |
| `--dsn-icon-list-icon-color`       | Icoonkleur (accentkleur), overschrijfbaar per lijst |
| `--dsn-icon-list-icon-size`        | Icoongrootte, gelijk aan één regelhoogte            |
| `--dsn-icon-list-icon-gap`         | Ruimte tussen icoon en tekst                        |

De icoonkleur is de enige token die bedoeld is om per lijst te overschrijven. In React gaat dat via de `iconColor` prop, in HTML/CSS via een inline custom property op het lijstelement:

```html
<ul
  class="dsn-icon-list"
  role="list"
  style="--dsn-icon-list-icon-color: var(--dsn-color-positive-color-default)"
>
  ...
</ul>
```

## Accessibility

- De component gebruikt het semantische `<ul>` of `<ol>` element voor correcte structuur.
- **`role="list"` staat er altijd op.** `list-style-type: none` laat Safari/VoiceOver de lijstaankondiging weglaten; de expliciete rol herstelt dat en verandert niets in andere browsers. De React-component zet de rol automatisch; neem hem in handgeschreven HTML altijd over.
- Iconen zijn decoratief (`aria-hidden="true"`) en worden niet uitgesproken. De tekst van het item draagt de volledige betekenis.
- Bij `as="ol"` kondigen screenreaders elk item aan als "item 1 van 3": semantisch correct voor geordende stappen.
- De lijst is presentationeel en kent geen eigen toetsenbordinteractie. Bevatten items links of buttons, dan brengen die componenten hun eigen toetsenbordgedrag mee.
- De icoongrootte is gekoppeld aan de regelhoogte, zodat het icoon meeschaalt wanneer de gebruiker de tekstgrootte vergroot.
