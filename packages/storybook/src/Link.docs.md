# Link

Een navigatie-element dat gebruikers naar een andere pagina of sectie leidt.

## Doel

De Link component biedt een consistente, toegankelijke manier om hyperlinks weer te geven. Links kunnen inline gebruikt worden (zonder expliciete `size`) om de lettergrootte van de omliggende tekst te erven, of standalone met een expliciete `size` voor navigatie-elementen. De component ondersteunt iconen voor/na de tekst, automatische external link handling (met target="\_blank" en zichtbare hint), en states zoals disabled en current page. Links hebben duidelijke hover/active states en volledige keyboard en screenreader ondersteuning.

<!-- VOORBEELD -->

## Use when

- De gebruiker naar een andere pagina, sectie, of externe site moet navigeren.
- Je puur navigatie nodig hebt zonder bijeffecten (zoals data opslaan of verwijderen).
- Je een link inline in lopende tekst wilt plaatsen.
- Je een duidelijke visuele indicatie wilt dat iets klikbaar is en ergens naartoe leidt.

## Don't use when

- De actie een bijeffect heeft (opslaan, verwijderen, formulier versturen) zonder dat er genavigeerd wordt — gebruik dan de [LinkButton](/docs/components-linkbutton--docs) component (link-styling met button semantiek) of de [Button](/docs/components-button--docs) component voor meer prominentie.
- De link een complexe interactie triggert — overweeg dan een button of custom element.

## Best practices

- **Gebruik beschrijvende linkteksten.** Vermijd "klik hier" of "lees meer". Gebruik in plaats daarvan beschrijvende tekst zoals "Bekijk onze prijzen" of "Lees de volledige documentatie".
- **Markeer de huidige pagina.** Gebruik de `current` prop voor links die naar de huidige pagina wijzen (bijv. in navigatie).
- **External links krijgen automatisch een hint.** De `external` prop voegt automatisch "(opent nieuw tabblad)" toe. Dit is belangrijk voor toegankelijkheid — gebruikers moeten weten dat ze de huidige context verlaten.
- **Iconen verduidelijken betekenis.** Gebruik `iconStart` voor acties (download, external link) en `iconEnd` voor richtingen (volgende pagina, externe site).
- **Gebruik inline links zonder size.** Voor links in lopende tekst, laat de `size` prop weg zodat de link de lettergrootte van de omliggende tekst erft.
- **Test keyboard navigatie.** Links moeten focusbaar zijn met Tab en activeerbaar met Enter.
- **Respecteer de onderlijning.** De standaard onderlijning helpt gebruikers links te herkennen. Verwijder deze alleen als er een zeer goede reden is.

## Design tokens

| Token                                   | Beschrijving                               |
| --------------------------------------- | ------------------------------------------ |
| `--dsn-link-color`                      | Tekstkleur van de link                     |
| `--dsn-link-hover-color`                | Tekstkleur bij hover                       |
| `--dsn-link-active-color`               | Tekstkleur bij active (klik)               |
| `--dsn-link-disabled-color`             | Tekstkleur disabled state                  |
| `--dsn-link-text-decoration-line`       | Onderlijning (underline)                   |
| `--dsn-link-text-decoration-color`      | Kleur van de onderlijning                  |
| `--dsn-link-text-decoration-thickness`  | Dikte van de onderlijning                  |
| `--dsn-link-text-underline-offset`      | Afstand tussen tekst en onderlijning (4px) |
| `--dsn-link-hover-text-decoration-line` | Onderlijning bij hover (none)              |
| `--dsn-link-gap`                        | Ruimte tussen icoon en tekst               |
| `--dsn-link-icon-size`                  | Icoongrootte standaard                     |
| `--dsn-link-size-small-font-size`       | Font size small variant                    |
| `--dsn-link-size-small-gap`             | Gap small variant                          |
| `--dsn-link-size-small-icon-size`       | Icon size small variant                    |
| `--dsn-link-size-default-font-size`     | Font size default variant                  |
| `--dsn-link-size-default-gap`           | Gap default variant                        |
| `--dsn-link-size-default-icon-size`     | Icon size default variant                  |
| `--dsn-link-size-large-font-size`       | Font size large variant                    |
| `--dsn-link-size-large-gap`             | Gap large variant                          |
| `--dsn-link-size-large-icon-size`       | Icon size large variant                    |

## Accessibility

- Links gebruiken het semantische `<a>` HTML element met correcte `href` attributen.
- Disabled links krijgen `aria-disabled="true"` en `tabIndex={-1}` om ze uit de tab order te halen.
- Current page links krijgen `aria-current="page"` zodat screenreaders de huidige locatie kunnen aankondigen.
- External links bevatten zichtbare tekst "(opent nieuw tabblad)" voor alle gebruikers, niet alleen screenreaders.
- Links hebben een duidelijke focus state met outline voor keyboard navigatie.
- De onderlijning helpt gebruikers met kleurenblindheid om links te herkennen. Disabled links hebben geen onderlijning — zo wordt de disabled staat niet alleen via kleur overgebracht.
