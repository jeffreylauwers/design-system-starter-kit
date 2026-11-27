import {
  ActionGroup,
  ButtonLink,
  Card,
  CardBody,
  CardGroup,
  CardHeader,
  CardHeading,
  Heading,
  Hero,
  Link,
  Logo,
  Menu,
  MenuLink,
  PageBody,
  PageFooter,
  PageHeader,
  PageLayout,
  Paragraph,
  Stack,
  UnorderedList,
} from '@dsn-starter-kit/components-react';

const logo = (
  <a href="#">
    <Logo aria-hidden={true} />
    <span className="dsn-visually-hidden">Voorbeeld, naar de homepage</span>
  </a>
);

// The scene is a homepage, so Home is the first item and current.
function navigation(orientation: 'horizontal' | 'vertical') {
  return (
    <Menu orientation={orientation}>
      <MenuLink href="#" level={1} current>
        Home
      </MenuLink>
      <MenuLink href="#" level={1}>
        Diensten
      </MenuLink>
      <MenuLink href="#" level={1}>
        Nieuws
      </MenuLink>
      <MenuLink href="#" level={1}>
        Contact
      </MenuLink>
    </Menu>
  );
}

const CARDS = [
  ['Afspraak maken', 'Plan een afspraak aan de balie of online.'],
  ['Verhuizing doorgeven', 'Geef binnen vijf dagen je nieuwe adres door.'],
  ['Melding openbare ruimte', 'Zie je iets kapot op straat? Meld het.'],
];

/**
 * A homepage with header, inverse hero and footer, so the inverse colors
 * and the page layout are visible together.
 */
export function PageScene() {
  return (
    <PageLayout>
      <PageHeader
        logoSlot={logo}
        primaryNavigation={navigation('vertical')}
        primaryNavigationLarge={navigation('horizontal')}
        hideSearchButton
      />
      <PageBody>
        <main
          id="scene-main"
          style={{ paddingBlockEnd: 'var(--dsn-space-block-6xl)' }}
        >
          <Hero variant="inverse" aria-labelledby="scene-hero-heading">
            <Stack space="lg">
              <Heading level={1} id="scene-hero-heading">
                Welkom bij Voorbeeld
              </Heading>
              <Paragraph variant="lead">
                Alles over wonen, werken en ondernemen in onze gemeente.
              </Paragraph>
              <ActionGroup>
                <ButtonLink href="#" variant="strong" size="large">
                  Direct regelen
                </ButtonLink>
                <ButtonLink href="#" variant="subtle" size="large">
                  Meer informatie
                </ButtonLink>
              </ActionGroup>
            </Stack>
          </Hero>
          <section
            aria-labelledby="scene-services"
            style={{ paddingBlockStart: 'var(--dsn-space-block-6xl)' }}
          >
            <Stack space="2xl">
              <Heading level={2} id="scene-services">
                Veelgevraagd
              </Heading>
              <CardGroup>
                {CARDS.map(([title, text]) => (
                  <Card key={title} href="#">
                    <CardHeader>
                      <CardHeading level={3}>{title}</CardHeading>
                    </CardHeader>
                    <CardBody>
                      <Paragraph>{text}</Paragraph>
                    </CardBody>
                  </Card>
                ))}
              </CardGroup>
            </Stack>
          </section>
        </main>
      </PageBody>
      <PageFooter
        slot1={logo}
        slot2={
          <Paragraph>
            Gemeente Voorbeeld. <Link href="#">Over ons</Link>.
          </Paragraph>
        }
        slot3={
          <UnorderedList>
            <li>
              <Link href="#">Nieuws</Link>
            </li>
            <li>
              <Link href="#">Werken bij</Link>
            </li>
          </UnorderedList>
        }
        slot4={
          <UnorderedList>
            <li>
              <Link href="#">Privacy</Link>
            </li>
            <li>
              <Link href="#">Toegankelijkheid</Link>
            </li>
          </UnorderedList>
        }
      />
    </PageLayout>
  );
}
