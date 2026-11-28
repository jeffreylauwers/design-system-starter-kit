import {
  Details,
  Heading,
  Icon,
  Link,
  OrderedList,
  Paragraph,
  Stack,
  Table,
  UnorderedList,
} from '@dsn-starter-kit/components-react';

const ISSUE_URL =
  'https://github.com/jeffreylauwers/design-system-starter-kit/issues/new?labels=theme-configurator&title=%5BTheme+Configurator%5D+';

const CHROMA_FACTORS = [
  ['Achtergronden', 'bg-document, bg-elevated', 'basisC × 0,06'],
  ['Achtergronden', 'bg-subtle … bg-active', 'basisC × 0,10 tot 0,22'],
  ['Randen', 'border-subtle', 'basisC × 0,45'],
  ['Randen', 'border-default … border-active', 'basisC × 1,0'],
  ['Tekst', 'color-default … color-active', 'basisC × 1,0'],
];

/** What the configurator is for, how to use it and how it calculates. */
export function AboutSection() {
  return (
    <section aria-labelledby="about-heading">
      <Stack space="lg">
        <Heading level={3} id="about-heading">
          Over de configurator
        </Heading>

        <Details summary="Waarvoor dient deze tool?">
          <Stack space="md">
            <Paragraph>
              De theme configurator maakt een thema voor de starter kit. Nu stel
              je de kleuren in: per kleurgroep één basiskleur, waaruit een
              volledig semantisch palet volgt. Je begint bij het thema Start.
            </Paragraph>
            <Paragraph>
              Het contrast van elke tint wordt gecontroleerd volgens WCAG 2:
              tekst en iconen halen minimaal 4,5:1 op hun achtergrond, randen
              minimaal 3:1. Haalt een tint dat niet, dan past de configurator de
              helderheid aan tot hij het wel haalt.
            </Paragraph>
          </Stack>
        </Details>

        <Details summary="Hoe gebruik je de tool?">
          <OrderedList>
            <li>
              Open een kleurgroep en kies een basiskleur. Een groep die naar een
              andere verwijst (&ldquo;volgt accent-1&rdquo;) krijgt met een
              eigen kleur een eigen palet.
            </li>
            <li>
              Voeg een eigen groep toe en geef hem een naam: die wordt de
              tokennaam, bijvoorbeeld <code>dsn.color.brand.*</code>. De tien
              groepen van Start horen bij de tokenstructuur en blijven staan.
            </li>
            <li>
              Stel de intensiteit in: lager geeft gedempte tinten, hoger
              levendigere.
            </li>
            <li>
              Bekijk het resultaat in het voorbeeld, in light en dark mode, op
              verschillende schermbreedtes en dichtheden.
            </li>
            <li>
              Activeer een kleur om de waarde te kopiëren, als HEX of OKLCH.
            </li>
            <li>
              Exporteer <code>theme.config.json</code>, zet hem in{' '}
              <code>packages/design-tokens/src/tokens/themes/start/</code> en
              draai <code>pnpm build:tokens</code>. De build schrijft de kleuren
              zelf.
            </li>
          </OrderedList>
        </Details>

        <Details summary="Hoe werkt de kleurafleiding?">
          <Stack space="md">
            <Paragraph>
              Het palet bestaat uit drie sporen met elk een eigen kleursterkte:
            </Paragraph>
            <UnorderedList>
              <li>
                Achtergronden: heel licht en licht getint, alleen om
                kleuridentiteit te geven.
              </li>
              <li>
                Randen: middelmatig sterk, zichtbaar tegen hun achtergrond.
              </li>
              <li>
                Tekst en iconen: het sterkst, met de helderheid bijgesteld tot
                het contrast voldoende is.
              </li>
            </UnorderedList>
            <Paragraph>
              De kleuren worden berekend in OKLCH: L is de helderheid (0 is
              zwart, 1 is wit), C de kleursterkte en H de tint. De tint komt
              altijd van de basiskleur. Per spoor wordt de kleursterkte van de
              basiskleur vermenigvuldigd, en de intensiteit vermenigvuldigt daar
              nog eens mee.
            </Paragraph>
            <Table caption="Kleursterkte per spoor (light mode)" scrollable>
              <thead>
                <tr>
                  <th scope="col">Spoor</th>
                  <th scope="col">Tokens</th>
                  <th scope="col">Kleursterkte</th>
                </tr>
              </thead>
              <tbody>
                {CHROMA_FACTORS.map(([track, tokens, factor]) => (
                  <tr key={tokens}>
                    <th scope="row">{track}</th>
                    <td>{tokens}</td>
                    <td>{factor}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Paragraph>
              Voor het contrast past de engine L aan in stappen van 0,005, tot
              de vereiste verhouding gehaald is, ook na afronden van de waarde
              die in de JSON komt. Kleuren buiten sRGB worden teruggebracht door
              de kleursterkte te verlagen.
            </Paragraph>
          </Stack>
        </Details>

        <Paragraph>
          Werkt iets niet zoals verwacht?{' '}
          <Link
            href={ISSUE_URL}
            external
            iconEnd={<Icon name="external-link" />}
          >
            Maak een issue aan op GitHub
          </Link>
          , met de basiskleur, wat je verwachtte en wat je zag.
        </Paragraph>
      </Stack>
    </section>
  );
}
