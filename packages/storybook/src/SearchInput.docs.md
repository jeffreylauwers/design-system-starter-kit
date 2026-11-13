# SearchInput

Een invoerveld voor zoekopdrachten met een zoekicoon aan de linkerkant.

## Doel

De SearchInput component is een gespecialiseerd invoerveld voor zoekfunctionaliteit. Een niet-interactief zoekicoon staat links in het veld (`inline-start`) en heeft dezelfde kleur als de ingevoerde tekst (`--dsn-text-input-color`). De `padding-inline-start` van het invoerveld wordt automatisch vergroot zodat tekst nooit achter het icoon terechtkomt. De inline-size van het veld wordt bepaald door de wrapper, niet door het input-element zelf.

<!-- VOORBEELD -->

## Wel gebruiken als...

- Je een zoekveld nodig hebt in de header, toolbar of op een zoekpagina.
- Je wilt dat gebruikers direct herkennen dat het om zoeken gaat.
- Je zoekfunctionaliteit wilt toevoegen aan een lijst, tabel of catalogus.

## Niet gebruiken als...

- Het om filtering gaat zonder echte zoekfunctionaliteit: gebruik dan [TextInput](/docs/components-textinput--docs).
- Je een complexe zoekinterface bouwt met filters en facetten: combineer dan met andere componenten.

## Goed gebruik

- **Gebruik een zichtbaar label of `aria-label`.** Voeg altijd een label toe via `FormField` of `FormFieldLabel`, of gebruik `aria-label` als het visuele design geen zichtbaar label toestaat (bijv. een zoekveld in de siteheader). Een placeholder is niet verplicht en verdwijnt bij typen: gebruik het optioneel alleen als extra context over de zoekscope nuttig is (bijv. `Zoek in producten...`).
- **Gebruik `role="search"` op een wrapper element.** Dit helpt screen readers de zoekfunctionaliteit te identificeren.
- **Implementeer live search of debouncing.** Update resultaten tijdens het typen, maar niet bij elke toetsaanslag.
- **Geef feedback bij geen resultaten.** Toon een melding als er geen resultaten zijn gevonden.
- **Combineer met FormField voor een label.** Gebruik `FormFieldLabel` of `FormField` voor toegankelijkheid.
- **Kies de juiste inline-size.** Gebruik `inlineSize` met `md`, `lg`, `xl` of `full`. `xs` en `sm` bestaan bij SearchInput niet: naast het zoekicoon blijft dan te weinig ruimte over voor de zoekterm.

## Toegankelijkheid

- Het zoekicoon heeft `aria-hidden="true"`: het is puur decoratief en wordt niet voorgelezen door screen readers.
- De native browser clear-knop (×) van `type="search"` is verborgen via CSS. Een clear-knop wordt later geïmplementeerd als een apart patroon.
- De extra `padding-inline-start` zorgt ervoor dat ingevoerde tekst nooit over het icoon heen loopt.

## Opbouw

Een SearchInput bestaat uit:

- **Wrapper div**: regelt de inline-size en positioneert het icoon relatief aan het veld
- **Zoekicoon**: links in het veld, niet-interactief, zelfde kleur als de tekst
- **Input element**: `type="search"` met extra padding links voor het icoon

## Toestanden

- **Default**: Leeg, klaar voor invoer
- **Filled**: Bevat een zoekterm
- **Focus**: Actief, gebruiker typt
- **Hover**: Muis over het veld
- **Disabled**: Niet beschikbaar voor invoer
- **Read-only**: Waarde is zichtbaar maar niet aanpasbaar
- **Invalid**: Validatiefout (bijv. te korte zoekterm)

## Design tokens

<!-- tokens: search-input -->

SearchInput erft verder alle tokens van [TextInput](/docs/components-textinput--docs).
