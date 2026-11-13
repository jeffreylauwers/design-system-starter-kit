# Paragraph

Een tekstblok voor lopende tekst, met varianten voor verschillende contexten.

## Doel

De Paragraph component biedt een consistente, toegankelijke manier om tekstblokken weer te geven. De component ondersteunt drie varianten: `lead` voor introducerende tekst, `default` voor normale lopende tekst, en `small-print` voor disclaimers of bijkomende informatie. Paragraphs zijn automatisch beperkt tot een maximale regelbreedte van 65 karakters voor optimale leesbaarheid.

<!-- VOORBEELD -->

## Wel gebruiken als...

- Je lopende tekst wilt weergeven in artikelen, documentatie, of beschrijvingen.
- Je een introductie wilt schrijven die meer visueel gewicht moet hebben (`lead` variant).
- Je disclaimers, voorwaarden, of bijkomende informatie wilt tonen (`small-print` variant).
- Je tekst wilt structureren met consistente marges tussen alinea's.

## Niet gebruiken als...

- Je een enkele regel tekst hebt: overweeg dan gewoon tekst zonder wrapper.
- Je een titel of kop nodig hebt: gebruik dan de [Heading](/docs/components-heading--docs) component.
- De tekst interactief is: gebruik dan de [Link](/docs/components-link--docs) component.
- Je een lijst wilt tonen: gebruik dan de [Unordered List](/docs/components-unorderedlist--docs) of [Ordered List](/docs/components-orderedlist--docs) componenten.

## Goed gebruik

- **Respecteer de maximale regelbreedte.** De component beperkt tekstregels automatisch tot 65 karakters (65ch) voor optimale leesbaarheid. Onderzoek toont aan dat regels tussen 45-75 karakters het gemakkelijkst te lezen zijn.
- **Gebruik `lead` spaarzaam.** De `lead` variant is bedoeld voor korte introducerende tekst (1-2 alinea's). Te veel lead paragraphs verzwakken de hiërarchie.
- **Small print is geen verbergen.** De `small-print` variant maakt tekst kleiner, maar moet nog steeds leesbaar zijn. Gebruik het niet om belangrijke informatie te verbergen.
- **Combineer met headings voor structuur.** Gebruik headings om secties te markeren en paragraphs voor de lopende tekst binnen die secties.
- **Let op contrast.** Zorg dat de tekstkleur voldoende contrast heeft met de achtergrond (minimaal WCAG AA 4.5:1 voor normale tekst).

## Design tokens

<!-- tokens: paragraph -->

## Toegankelijkheid

- Paragrafen gebruiken het semantische `<p>` HTML element.
- De component respecteert gebruikersvoorkeuren voor lettergrootte (gebruikt relative units).
- De maximale regelbreedte (`65ch`) verbetert leesbaarheid voor mensen met dyslexie en andere leesproblemen.
