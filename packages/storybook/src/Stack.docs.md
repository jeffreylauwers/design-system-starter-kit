# Stack

Layout primitief dat consistente verticale ruimte aanbrengt tussen gestapelde elementen.

## Doel

Stack past automatisch verticale ruimte toe tussen alle directe child-elementen via `display: flex; flex-direction: column; gap`. Je schrijft nooit zelf `margin` of `padding` voor tussenruimte — de Stack regelt dat.

Negen space-varianten — gebaseerd op de globale `--dsn-space-row-*` tokens — geven je controle over hoe ver de elementen uit elkaar staan.

<!-- VOORBEELD -->

## Use when

- Elementen verticaal stapelen met consistente tussenruimte (kopteksten, paragrafen, formuliervelden, secties).
- De tussenruimte uniform moet zijn voor alle children, zonder uitzonderingen per child.
- Je een layout-laag wilt scheiden van de inhoud zelf.

## Don't use when

- De ruimte tussen elementen sterk verschilt per child — gebruik dan losse `margin-block` per element.
- Je horizontale layout nodig hebt — gebruik flexbox of grid rechtstreeks.
- Slechts één child aanwezig is — Stack voegt dan geen zichtbare ruimte toe.

## Best practices

- **Kies de kleinst passende variant**: voor formuliervelden `sm`–`md`, voor secties op een pagina `3xl`–`4xl`, voor grote paginaovergangen `5xl`–`6xl`.
- **Nest Stack-componenten** voor complexe layouts: een buitenste Stack met `4xl` voor paginasecties, binnenste Stacks met `md` voor formuliervelden.
- **Gebruik Stack niet als vervanging voor semantische HTML**: de Stack rendert altijd als `<div>`. Geef children de juiste semantische elementen mee.

## Accessibility

Stack is een puur visueel layout-hulpmiddel. Het voegt geen ARIA-rollen, labels of andere toegankelijkheidsattributen toe. De semantiek van de pagina zit volledig in de children.

## Design tokens

| Token                 | Beschrijving                                                                    |
| --------------------- | ------------------------------------------------------------------------------- |
| `--dsn-stack-space`   | Interne CSS custom property — bepaalt de `gap` waarde. Overschrijfbaar via CSS. |
| `--dsn-space-row-sm`  | 4px — gebruikt door `.dsn-stack--space-sm`                                      |
| `--dsn-space-row-md`  | 8px — standaardwaarde (fallback van `--dsn-stack-space`)                        |
| `--dsn-space-row-lg`  | 12px — gebruikt door `.dsn-stack--space-lg`                                     |
| `--dsn-space-row-xl`  | 16px — gebruikt door `.dsn-stack--space-xl`                                     |
| `--dsn-space-row-2xl` | 20px — gebruikt door `.dsn-stack--space-2xl`                                    |
| `--dsn-space-row-3xl` | 24px — gebruikt door `.dsn-stack--space-3xl`                                    |
| `--dsn-space-row-4xl` | 32px — gebruikt door `.dsn-stack--space-4xl`                                    |
| `--dsn-space-row-5xl` | 64px — gebruikt door `.dsn-stack--space-5xl`                                    |
| `--dsn-space-row-6xl` | 160px — gebruikt door `.dsn-stack--space-6xl`                                   |
