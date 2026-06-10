import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ActionGroup,
  Body,
  Button,
  ButtonLink,
  Container,
  Grid,
  GridItem,
  Heading,
  Hero,
  Menu,
  MenuLink,
  PageBody,
  PageFooter,
  PageHeader,
  PageLayout,
  Paragraph,
  SearchInput,
  SkipLink,
  Stack,
} from '@dsn-starter-kit/components-react';
import {
  logoSlot,
  footerSlot1,
  footerSlot2,
  footerSlot3,
  footerSlot4,
} from './templateSharedContent';

// =============================================================================
// GEDEELDE CONTENT (identiek aan GridPage stories)
// =============================================================================

function PrimaryNavigation() {
  const [exp1b, setExp1b] = React.useState(false);

  return (
    <Menu orientation="vertical">
      <MenuLink href="/" level={1} current>
        Homepage
      </MenuLink>
      <MenuLink href="/level-1a" level={1}>
        Level 1a
      </MenuLink>
      <MenuLink
        href="/level-1b"
        level={1}
        subItems
        expanded={exp1b}
        onExpandToggle={() => setExp1b((v) => !v)}
      >
        Level 1b
      </MenuLink>
      {exp1b && (
        <>
          <MenuLink href="/level-2a" level={2}>
            Level 2a
          </MenuLink>
          <MenuLink href="/level-2b" level={2}>
            Level 2b
          </MenuLink>
        </>
      )}
      <MenuLink href="/level-1c" level={1}>
        Level 1c
      </MenuLink>
      <MenuLink href="/level-1d" level={1}>
        Level 1d
      </MenuLink>
    </Menu>
  );
}

const primaryNavigationLarge = (
  <Menu orientation="horizontal">
    <MenuLink href="/" level={1} current>
      Homepage
    </MenuLink>
    <MenuLink href="/level-1a" level={1}>
      Level 1a
    </MenuLink>
    <MenuLink href="/level-1b" level={1}>
      Level 1b
    </MenuLink>
    <MenuLink href="/level-1c" level={1}>
      Level 1c
    </MenuLink>
    <MenuLink href="/level-1d" level={1}>
      Level 1d
    </MenuLink>
  </Menu>
);

const primaryNavigationLargeCompact = (
  <Menu orientation="horizontal">
    <MenuLink href="/" level={1} current>
      Homepage
    </MenuLink>
    <MenuLink href="/level-1a" level={1}>
      Level 1a
    </MenuLink>
    <MenuLink href="/level-1b" level={1}>
      Level 1b
    </MenuLink>
    <MenuLink href="/level-1c" level={1}>
      Level 1c
    </MenuLink>
  </Menu>
);

function PrimaryNavigationCompact() {
  const [exp1b, setExp1b] = React.useState(false);

  return (
    <Menu orientation="vertical">
      <MenuLink href="/" level={1} current>
        Homepage
      </MenuLink>
      <MenuLink href="/level-1a" level={1}>
        Level 1a
      </MenuLink>
      <MenuLink
        href="/level-1b"
        level={1}
        subItems
        expanded={exp1b}
        onExpandToggle={() => setExp1b((v) => !v)}
      >
        Level 1b
      </MenuLink>
      {exp1b && (
        <>
          <MenuLink href="/level-2a" level={2}>
            Level 2a
          </MenuLink>
          <MenuLink href="/level-2b" level={2}>
            Level 2b
          </MenuLink>
        </>
      )}
      <MenuLink href="/level-1c" level={1}>
        Level 1c
      </MenuLink>
    </Menu>
  );
}

const secondaryNavigation = (
  <Menu orientation="vertical">
    <MenuLink href="/english" level={1}>
      English
    </MenuLink>
    <MenuLink href="/mijn-omgeving" level={1}>
      Mijn omgeving
    </MenuLink>
  </Menu>
);

const secondaryNavigationLarge = (
  <Menu orientation="horizontal">
    <MenuLink href="/english" level={1}>
      English
    </MenuLink>
    <MenuLink href="/mijn-omgeving" level={1}>
      Mijn omgeving
    </MenuLink>
  </Menu>
);

const searchSlot = (
  <>
    <SearchInput placeholder="Zoeken…" aria-label="Zoekopdracht" />
    <Button variant="strong">Zoeken</Button>
  </>
);

const IMAGE_URL = 'https://picsum.photos/id/1043/1600/900';

const mainContentStyle: React.CSSProperties = {
  paddingBlockEnd: 'var(--dsn-space-block-6xl)',
};

const gridContentStyle: React.CSSProperties = {
  paddingBlockStart: 'var(--dsn-space-block-6xl)',
};

// =============================================================================
// GEDEELDE HERO-INHOUD
// =============================================================================

function HeroContent({ headingId }: { headingId: string }) {
  return (
    <Stack space="lg">
      <Heading level={1} id={headingId}>
        Welkom bij Starter Kit
      </Heading>
      <Paragraph variant="lead">
        Introductietekst die de kernboodschap samenvat in één of twee zinnen.
      </Paragraph>
      <ActionGroup>
        <ButtonLink href="#" variant="strong" size="large">
          Aan de slag
        </ButtonLink>
        <ButtonLink href="#" variant="subtle" size="large">
          Meer informatie
        </ButtonLink>
      </ActionGroup>
    </Stack>
  );
}

// =============================================================================
// GEDEELDE GRID-INHOUD (identiek aan GridPage)
// =============================================================================

function GridContent() {
  return (
    <Stack space="2xl" style={gridContentStyle}>
      {/* Rij 1: volle breedte */}
      <Grid>
        <GridItem colSpan={12}>
          <Container>
            <Paragraph>Rij 1 — volle breedte (12 kolommen)</Paragraph>
          </Container>
        </GridItem>
      </Grid>

      {/* Rij 2: 2 kolommen vanaf md */}
      <Grid>
        <GridItem colSpan={12} colSpanMd={6}>
          <Container>
            <Paragraph>Rij 2 — kolom 1 van 2</Paragraph>
          </Container>
        </GridItem>
        <GridItem colSpan={12} colSpanMd={6}>
          <Container>
            <Paragraph>Rij 2 — kolom 2 van 2</Paragraph>
          </Container>
        </GridItem>
      </Grid>

      {/* Rij 3: 3 kolommen vanaf md */}
      <Grid>
        <GridItem colSpan={12} colSpanMd={4}>
          <Container>
            <Paragraph>Rij 3 — kolom 1 van 3</Paragraph>
          </Container>
        </GridItem>
        <GridItem colSpan={12} colSpanMd={4}>
          <Container>
            <Paragraph>Rij 3 — kolom 2 van 3</Paragraph>
          </Container>
        </GridItem>
        <GridItem colSpan={12} colSpanMd={4}>
          <Container>
            <Paragraph>Rij 3 — kolom 3 van 3</Paragraph>
          </Container>
        </GridItem>
      </Grid>
    </Stack>
  );
}

// =============================================================================
// META
// =============================================================================

const meta: Meta = {
  title: 'Templates/HomePage',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj;

// =============================================================================
// STORIES
// =============================================================================

export const Default: Story = {
  name: 'Home Page',
  render: () => (
    <Body>
      <SkipLink href="#main-content" />
      <PageLayout>
        <PageHeader
          logoSlot={logoSlot}
          primaryNavigation={<PrimaryNavigation />}
          primaryNavigationLarge={primaryNavigationLarge}
          secondaryNavigation={secondaryNavigation}
          secondaryNavigationLarge={secondaryNavigationLarge}
          searchSlot={searchSlot}
        />
        <PageBody>
          <main id="main-content" tabIndex={-1} style={mainContentStyle}>
            <Hero variant="inverse" aria-labelledby="hero-heading-home">
              <HeroContent headingId="hero-heading-home" />
            </Hero>
            <GridContent />
          </main>
        </PageBody>
        <PageFooter
          slot1={footerSlot1}
          slot2={footerSlot2}
          slot3={footerSlot3}
          slot4={footerSlot4}
        />
      </PageLayout>
    </Body>
  ),
};

export const FullWidth: Story = {
  name: 'Home Page: Full Width',
  render: () => (
    <Body>
      <SkipLink href="#main-content" />
      <PageLayout
        style={{ '--dsn-page-max-inline-size': 'none' } as React.CSSProperties}
      >
        <PageHeader
          logoSlot={logoSlot}
          primaryNavigation={<PrimaryNavigation />}
          primaryNavigationLarge={primaryNavigationLarge}
          secondaryNavigation={secondaryNavigation}
          secondaryNavigationLarge={secondaryNavigationLarge}
          searchSlot={searchSlot}
        />
        <PageBody>
          <main id="main-content" tabIndex={-1} style={mainContentStyle}>
            <Hero
              variant="inverse"
              style={
                { '--dsn-page-max-inline-size': 'none' } as React.CSSProperties
              }
              aria-labelledby="hero-heading-home-fullwidth"
            >
              <HeroContent headingId="hero-heading-home-fullwidth" />
            </Hero>
            <GridContent />
          </main>
        </PageBody>
        <PageFooter
          slot1={footerSlot1}
          slot2={footerSlot2}
          slot3={footerSlot3}
          slot4={footerSlot4}
        />
      </PageLayout>
    </Body>
  ),
};

export const Inverse: Story = {
  name: 'Home Page: Inverse',
  render: () => (
    <Body>
      <SkipLink href="#main-content" />
      <PageLayout>
        <PageHeader
          logoSlot={logoSlot}
          colorScheme="inverse"
          primaryNavigation={<PrimaryNavigation />}
          primaryNavigationLarge={primaryNavigationLarge}
          secondaryNavigation={secondaryNavigation}
          secondaryNavigationLarge={secondaryNavigationLarge}
          searchSlot={searchSlot}
        />
        <PageBody>
          <main id="main-content" tabIndex={-1} style={mainContentStyle}>
            <Hero
              variant="image-blend"
              backgroundImage={IMAGE_URL}
              aria-labelledby="hero-heading-home-inverse"
            >
              <HeroContent headingId="hero-heading-home-inverse" />
            </Hero>
            <GridContent />
          </main>
        </PageBody>
        <PageFooter
          slot1={footerSlot1}
          slot2={footerSlot2}
          slot3={footerSlot3}
          slot4={footerSlot4}
        />
      </PageLayout>
    </Body>
  ),
};

export const CompactInverseFullWidth: Story = {
  name: 'Home Page: Compact + Inverse + Full Width',
  render: () => (
    <Body>
      <SkipLink href="#main-content" />
      <PageLayout
        style={{ '--dsn-page-max-inline-size': 'none' } as React.CSSProperties}
      >
        <PageHeader
          logoSlot={logoSlot}
          layout="compact"
          colorScheme="inverse"
          primaryNavigation={<PrimaryNavigationCompact />}
          primaryNavigationLarge={primaryNavigationLargeCompact}
          secondaryNavigation={secondaryNavigation}
          secondaryNavigationLarge={secondaryNavigationLarge}
          searchSlot={searchSlot}
        />
        <PageBody>
          <main id="main-content" tabIndex={-1} style={mainContentStyle}>
            <Hero
              variant="inverse"
              style={
                { '--dsn-page-max-inline-size': 'none' } as React.CSSProperties
              }
              aria-labelledby="hero-heading-home-compact"
            >
              <HeroContent headingId="hero-heading-home-compact" />
            </Hero>
            <GridContent />
          </main>
        </PageBody>
        <PageFooter
          slot1={footerSlot1}
          slot2={footerSlot2}
          slot3={footerSlot3}
          slot4={footerSlot4}
        />
      </PageLayout>
    </Body>
  ),
};
