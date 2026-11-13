# DataList

Toont informatie als key-value paren, typisch aan het einde van een formulier of als metadata-overzicht.

## Doel

De DataList component presenteert gestructureerde gegevens als een beschrijvingslijst (`<dl>`). Elke rij bestaat uit een key (`<dt>`), een value (`<dd>`) en optionele actielinks. Het is gebaseerd op semantische HTML en hergebruikt het `Link` en `LinkButton` component voor acties.

<!-- VOORBEELD -->

## Wel gebruiken als...

- Je ingevulde formulierantwoorden wilt samenvatten vóór definitieve indiening ("check your answers").
- Je metadata met bijbehorende labels wilt tonen (naam, geboortedatum, adres).
- Gebruikers op een overzichtspagina gegevens moeten kunnen controleren en aanpassen.
- Je een beperkte set key-value paren wilt presenteren die inhoudelijk bij elkaar horen.

## Niet gebruiken als...

- Het om tabulaire gegevens met meerdere kolommen gaat: gebruik dan `Table`.
- Het om eenvoudige lijsten zonder labels gaat: gebruik dan `UnorderedList` of `OrderedList`.

## Goed gebruik

### Key en value

- Houd de key beknopt: één of twee woorden zijn het meest leesbaar.
- De key staat altijd vet en de value heeft regulier gewicht, zodat de label visueel direct herkenbaar is.
- Toon bij een ontbrekende value een betekenisvolle plaatshouder ("Niet opgegeven") in plaats van een lege cell.

### Acties

- Gebruik `Link` (of `dsn-link`) voor navigatieacties zoals "Wijzig".
- Gebruik `LinkButton` (of `dsn-link-button`) voor JavaScript-acties zoals het openen van een bevestigingsdialoog.
- Geef elke actielink een visueel verborgen contextzin: `Wijzig <span class="dsn-visually-hidden"> naam</span>`. Zonder die context zijn meerdere "Wijzig"-links identiek voor screenreadergebruikers.

### Gemengde lijsten

- Gebruik `noActions` op rijen zonder actiecel in een lijst die ook rijen met acties bevat. Dit zorgt voor consistente kolomuitlijning op brede viewports.

### Borders

- Denk goed na voordat je `noBorder` gebruikt: borders helpen gebruikers die inzoomen of vergrotingssoftware gebruiken bij het onderscheiden van rijen.

## Design tokens

<!-- tokens: data-list -->

## Toegankelijkheid

- `<dl>`, `<dt>` en `<dd>` zijn de semantische bouwstenen: screenreaders kondigen de description list-rol automatisch aan.
- Elke `<dt>` (key) beschrijft precies de bijbehorende `<dd>` (value) in dezelfde rij.
- Een `<div>` als row-wrapper is valide HTML5 binnen `<dl>` en behoudt de dt/dd-associatie.
- VoiceOver leest rijen samen: "Naam, Sarah Hendricks"; NVDA/JAWS lezen `<dt>` en `<dd>` apart.
- Elke actielink **moet** een visueel verborgen contextzin bevatten die beschrijft op welk gegeven de actie van toepassing is.
