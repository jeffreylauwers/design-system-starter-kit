# Stack

Layout primitief dat consistente verticale ruimte aanbrengt tussen gestapelde elementen.

## Doel

Stack past automatisch verticale ruimte toe tussen alle directe child-elementen via `display: flex; flex-direction: column; gap`. Je schrijft nooit zelf `margin` of `padding` voor tussenruimte: de Stack regelt dat.

Negen space-varianten: gebaseerd op de globale `--dsn-space-row-*` tokens: geven je controle over hoe ver de elementen uit elkaar staan.

<!-- VOORBEELD -->

## Wel gebruiken als...

- Je elementen verticaal wilt stapelen met consistente tussenruimte (kopteksten, paragrafen, formuliervelden, secties).
- De tussenruimte uniform moet zijn voor alle children, zonder uitzonderingen per child.
- Je een layout-laag wilt scheiden van de inhoud zelf.

## Niet gebruiken als...

- De ruimte tussen elementen sterk verschilt per child: gebruik dan losse `margin-block` per element.
- Je horizontale layout nodig hebt: gebruik flexbox of grid rechtstreeks.
- Slechts één child aanwezig is: Stack voegt dan geen zichtbare ruimte toe.

## Goed gebruik

- **Kies de kleinst passende variant**: voor formuliervelden `sm`–`md`, voor secties op een pagina `3xl`–`4xl`, voor grote paginaovergangen `5xl`–`6xl`.
- **Nest Stack-componenten** voor complexe layouts: een buitenste Stack met `4xl` voor paginasecties, binnenste Stacks met `md` voor formuliervelden.
- **Gebruik Stack niet als vervanging voor semantische HTML**: de Stack rendert altijd als `<div>`. Geef children de juiste semantische elementen mee.

## Toegankelijkheid

Stack is een puur visueel layout-hulpmiddel. Het voegt geen ARIA-rollen, labels of andere toegankelijkheidsattributen toe. De semantiek van de pagina zit volledig in de children.

## Design tokens

De `gap` loopt via het interne custom property `--dsn-stack-space`. De standaardwaarde is `--dsn-space-row-md`; elke `dsn-stack--space-{naam}` modifier zet hem op de bijbehorende row-token. Je kunt hem ook zelf overschrijven.

<!-- tokens: --dsn-space-row-sm --dsn-space-row-md --dsn-space-row-lg --dsn-space-row-xl --dsn-space-row-2xl --dsn-space-row-3xl --dsn-space-row-4xl --dsn-space-row-5xl --dsn-space-row-6xl -->
