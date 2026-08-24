import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Body,
  BreadcrumbNavigation,
  BreadcrumbNavigationItem,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
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
  TableOfContents,
} from '@dsn-starter-kit/components-react';
import {
  logoSlot,
  footerSlot1,
  footerSlot2,
  footerSlot3,
  footerSlot4,
} from './templateSharedContent';

// =============================================================================
// TYPES
// =============================================================================

type CurrentPage =
  | 'homepage'
  | 'level-1a'
  | 'level-2a'
  | 'level-3a'
  | 'level-4a';

// =============================================================================
// GEDEELDE CONTENT
// =============================================================================

function PrimaryNavigation({
  currentPage = 'homepage',
}: {
  currentPage?: CurrentPage;
}) {
  const inLevel1b = ['level-2a', 'level-3a', 'level-4a'].includes(currentPage);
  const inLevel2b = ['level-3a', 'level-4a'].includes(currentPage);
  const inLevel3b = currentPage === 'level-4a';

  const [exp1b, setExp1b] = React.useState(inLevel1b);
  const [exp2b, setExp2b] = React.useState(inLevel2b);
  const [exp3b, setExp3b] = React.useState(inLevel3b);

  return (
    <Menu orientation="vertical">
      <MenuLink href="/" level={1} current={currentPage === 'homepage'}>
        Homepage
      </MenuLink>
      <MenuLink href="/level-1a" level={1} current={currentPage !== 'homepage'}>
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
          <MenuLink
            href="/level-2a"
            level={2}
            current={currentPage === 'level-2a'}
          >
            Level 2a
          </MenuLink>
          <MenuLink
            href="/level-2b"
            level={2}
            subItems
            expanded={exp2b}
            onExpandToggle={() => setExp2b((v) => !v)}
          >
            Level 2b
          </MenuLink>
          {exp2b && (
            <>
              <MenuLink
                href="/level-3a"
                level={3}
                current={currentPage === 'level-3a'}
              >
                Level 3a
              </MenuLink>
              <MenuLink
                href="/level-3b"
                level={3}
                subItems
                expanded={exp3b}
                onExpandToggle={() => setExp3b((v) => !v)}
              >
                Level 3b
              </MenuLink>
              {exp3b && (
                <>
                  <MenuLink
                    href="/level-4a"
                    level={4}
                    current={currentPage === 'level-4a'}
                  >
                    Level 4a
                  </MenuLink>
                  <MenuLink href="/level-4b" level={4}>
                    Level 4b
                  </MenuLink>
                </>
              )}
              <MenuLink href="/level-3c" level={3}>
                Level 3c
              </MenuLink>
              <MenuLink href="/level-3d" level={3}>
                Level 3d
              </MenuLink>
            </>
          )}
          <MenuLink href="/level-2c" level={2}>
            Level 2c
          </MenuLink>
          <MenuLink href="/level-2d" level={2}>
            Level 2d
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

function PrimaryNavigationLarge({
  currentPage = 'homepage',
}: {
  currentPage?: CurrentPage;
}) {
  return (
    <Menu orientation="horizontal">
      <MenuLink href="/" level={1} current={currentPage === 'homepage'}>
        Homepage
      </MenuLink>
      <MenuLink href="/level-1a" level={1} current={currentPage !== 'homepage'}>
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

const mainStyle: React.CSSProperties = {
  paddingBlockEnd: 'var(--dsn-space-block-6xl)',
  paddingBlockStart: 'var(--dsn-space-block-4xl)',
};

// =============================================================================
// SIDEBAR NAVIGATIE
// =============================================================================

function SidebarNavigation({ currentPage }: { currentPage: CurrentPage }) {
  const inLevel2b = ['level-3a', 'level-4a'].includes(currentPage);
  const inLevel3b = currentPage === 'level-4a';

  const [exp2b, setExp2b] = React.useState(inLevel2b);
  const [exp3b, setExp3b] = React.useState(inLevel3b);

  return (
    <nav aria-label="Sub-navigatie">
      <Menu orientation="vertical">
        <MenuLink
          href="/level-2a"
          level={1}
          current={currentPage === 'level-2a'}
        >
          Level 2a
        </MenuLink>
        <MenuLink
          href="/level-2b"
          level={1}
          subItems
          expanded={exp2b}
          onExpandToggle={() => setExp2b((v) => !v)}
        >
          Level 2b
        </MenuLink>
        {exp2b && (
          <>
            <MenuLink
              href="/level-3a"
              level={2}
              current={currentPage === 'level-3a'}
            >
              Level 3a
            </MenuLink>
            <MenuLink
              href="/level-3b"
              level={2}
              subItems
              expanded={exp3b}
              onExpandToggle={() => setExp3b((v) => !v)}
            >
              Level 3b
            </MenuLink>
            {exp3b && (
              <>
                <MenuLink
                  href="/level-4a"
                  level={3}
                  current={currentPage === 'level-4a'}
                >
                  Level 4a
                </MenuLink>
                <MenuLink href="/level-4b" level={3}>
                  Level 4b
                </MenuLink>
              </>
            )}
            <MenuLink href="/level-3c" level={2}>
              Level 3c
            </MenuLink>
            <MenuLink href="/level-3d" level={2}>
              Level 3d
            </MenuLink>
          </>
        )}
        <MenuLink href="/level-2c" level={1}>
          Level 2c
        </MenuLink>
        <MenuLink href="/level-2d" level={1}>
          Level 2d
        </MenuLink>
      </Menu>
    </nav>
  );
}

// =============================================================================
// GEDEELDE GRID-INHOUD
// =============================================================================

function GridContent() {
  return (
    <Stack space="2xl">
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
// PAGINA-INHOUD MET KOPPEN EN GRID
// =============================================================================

function MainContent({ pageName }: { pageName: string }) {
  return (
    <Stack space="2xl">
      <Heading level={1}>{pageName}</Heading>
      <Paragraph variant="lead">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad
        minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
        ex ea commodo consequat.
      </Paragraph>
      <Heading level={2}>Sectietitel</Heading>
      <Paragraph>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris.
      </Paragraph>
      <GridContent />
    </Stack>
  );
}

// =============================================================================
// TABLE OF CONTENTS
// Alleen H2's worden in de Table of Contents opgenomen.
// =============================================================================

const tocItems = [
  { id: 'sectie-kenmerken', label: 'Kenmerken' },
  { id: 'sectie-gebruik', label: 'Gebruik' },
  { id: 'sectie-toegankelijkheid', label: 'Toegankelijkheid' },
];

// =============================================================================
// PAGINA-INHOUD MET H2-SECTIES EN TABLE OF CONTENTS
// =============================================================================

function MainContentWithToc({ pageName }: { pageName: string }) {
  return (
    <Stack space="2xl">
      <Heading level={1}>{pageName}</Heading>
      <Paragraph variant="lead">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad
        minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
        ex ea commodo consequat.
      </Paragraph>
      <div className="dsn-sidebar-layout__toc-inline">
        <TableOfContents appearance="framed" items={tocItems} />
      </div>
      <Heading level={2} id="sectie-kenmerken">
        Kenmerken
      </Heading>
      <Paragraph>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris.
      </Paragraph>
      <Heading level={2} id="sectie-gebruik">
        Gebruik
      </Heading>
      <Paragraph>
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
        dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
        proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </Paragraph>
      <Heading level={2} id="sectie-toegankelijkheid">
        Toegankelijkheid
      </Heading>
      <Paragraph>
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem
        accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab
        illo inventore veritatis et quasi architecto beatae vitae dicta sunt
        explicabo.
      </Paragraph>
      <GridContent />
    </Stack>
  );
}

// =============================================================================
// META
// =============================================================================

const meta: Meta = {
  title: 'Templates/Detailpage',
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
  name: 'With Sidebar',
  render: () => (
    <Body>
      <SkipLink href="#main-content" />
      <PageLayout>
        <PageHeader
          logoSlot={logoSlot}
          primaryNavigation={<PrimaryNavigation currentPage="level-1a" />}
          primaryNavigationLarge={
            <PrimaryNavigationLarge currentPage="level-1a" />
          }
          secondaryNavigation={secondaryNavigation}
          secondaryNavigationLarge={secondaryNavigationLarge}
          searchSlot={searchSlot}
        />
        <PageBody>
          <div className="dsn-sidebar-layout">
            <aside className="dsn-sidebar-layout__sidebar">
              <SidebarNavigation currentPage="level-1a" />
            </aside>
            <main
              id="main-content"
              tabIndex={-1}
              className="dsn-sidebar-layout__main"
              style={mainStyle}
            >
              <GridContent />
            </main>
          </div>
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

export const WithToc: Story = {
  name: 'With Sidebar + Table of Contents',
  render: () => (
    <Body>
      <SkipLink href="#main-content" />
      <PageLayout>
        <PageHeader
          logoSlot={logoSlot}
          primaryNavigation={<PrimaryNavigation currentPage="level-1a" />}
          primaryNavigationLarge={
            <PrimaryNavigationLarge currentPage="level-1a" />
          }
          secondaryNavigation={secondaryNavigation}
          secondaryNavigationLarge={secondaryNavigationLarge}
          searchSlot={searchSlot}
        />
        <PageBody>
          <div className="dsn-sidebar-layout">
            <aside className="dsn-sidebar-layout__sidebar">
              <SidebarNavigation currentPage="level-1a" />
            </aside>
            <main
              id="main-content"
              tabIndex={-1}
              className="dsn-sidebar-layout__main"
              style={mainStyle}
            >
              <MainContentWithToc pageName="Level 1a" />
            </main>
            <aside className="dsn-sidebar-layout__toc">
              <TableOfContents appearance="plain" items={tocItems} />
            </aside>
          </div>
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
  name: 'Full Width + Sidebar',
  render: () => (
    <Body>
      <SkipLink href="#main-content" />
      <PageLayout
        style={{ '--dsn-page-max-inline-size': 'none' } as React.CSSProperties}
      >
        <PageHeader
          logoSlot={logoSlot}
          primaryNavigation={<PrimaryNavigation currentPage="level-1a" />}
          primaryNavigationLarge={
            <PrimaryNavigationLarge currentPage="level-1a" />
          }
          secondaryNavigation={secondaryNavigation}
          secondaryNavigationLarge={secondaryNavigationLarge}
          searchSlot={searchSlot}
        />
        <PageBody>
          <div className="dsn-sidebar-layout">
            <aside className="dsn-sidebar-layout__sidebar">
              <SidebarNavigation currentPage="level-1a" />
            </aside>
            <main
              id="main-content"
              tabIndex={-1}
              className="dsn-sidebar-layout__main"
              style={mainStyle}
            >
              <GridContent />
            </main>
          </div>
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

export const FullWidthWithToc: Story = {
  name: 'Full Width + Sidebar + Table of Contents',
  render: () => (
    <Body>
      <SkipLink href="#main-content" />
      <PageLayout
        style={{ '--dsn-page-max-inline-size': 'none' } as React.CSSProperties}
      >
        <PageHeader
          logoSlot={logoSlot}
          primaryNavigation={<PrimaryNavigation currentPage="level-1a" />}
          primaryNavigationLarge={
            <PrimaryNavigationLarge currentPage="level-1a" />
          }
          secondaryNavigation={secondaryNavigation}
          secondaryNavigationLarge={secondaryNavigationLarge}
          searchSlot={searchSlot}
        />
        <PageBody>
          <div className="dsn-sidebar-layout">
            <aside className="dsn-sidebar-layout__sidebar">
              <SidebarNavigation currentPage="level-1a" />
            </aside>
            <main
              id="main-content"
              tabIndex={-1}
              className="dsn-sidebar-layout__main"
              style={mainStyle}
            >
              <MainContentWithToc pageName="Level 1a" />
            </main>
            <aside className="dsn-sidebar-layout__toc">
              <TableOfContents appearance="plain" items={tocItems} />
            </aside>
          </div>
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

export const FullWidthCenteredContent: Story = {
  name: 'Full Width + Centered Main Content',
  render: () => (
    <Body>
      <SkipLink href="#main-content" />
      <PageLayout
        style={{ '--dsn-page-max-inline-size': 'none' } as React.CSSProperties}
      >
        <PageHeader
          logoSlot={logoSlot}
          primaryNavigation={<PrimaryNavigation currentPage="level-1a" />}
          primaryNavigationLarge={
            <PrimaryNavigationLarge currentPage="level-1a" />
          }
          secondaryNavigation={secondaryNavigation}
          secondaryNavigationLarge={secondaryNavigationLarge}
          searchSlot={searchSlot}
        />
        <PageBody>
          <div className="dsn-sidebar-layout">
            <aside className="dsn-sidebar-layout__sidebar">
              <SidebarNavigation currentPage="level-1a" />
            </aside>
            <main
              id="main-content"
              tabIndex={-1}
              className="dsn-sidebar-layout__main"
              style={mainStyle}
            >
              <div
                style={{
                  maxInlineSize: '75rem',
                  marginInline: 'auto',
                }}
              >
                <GridContent />
              </div>
            </main>
          </div>
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

export const Level2a: Story = {
  name: 'Level 2a',
  render: () => (
    <Body>
      <SkipLink href="#main-content" />
      <PageLayout>
        <PageHeader
          logoSlot={logoSlot}
          primaryNavigation={<PrimaryNavigation currentPage="level-2a" />}
          primaryNavigationLarge={
            <PrimaryNavigationLarge currentPage="level-2a" />
          }
          secondaryNavigation={secondaryNavigation}
          secondaryNavigationLarge={secondaryNavigationLarge}
          searchSlot={searchSlot}
        />
        <PageBody>
          <div className="dsn-sidebar-layout">
            <aside className="dsn-sidebar-layout__sidebar">
              <SidebarNavigation currentPage="level-2a" />
            </aside>
            <div className="dsn-sidebar-layout__main">
              <BreadcrumbNavigation
                variant="compact"
                aria-label="Broodkruimelpad"
              >
                <BreadcrumbNavigationItem href="/">
                  Homepage
                </BreadcrumbNavigationItem>
                <BreadcrumbNavigationItem href="/level-1a">
                  Level 1a
                </BreadcrumbNavigationItem>
                <BreadcrumbNavigationItem current>
                  Level 2a
                </BreadcrumbNavigationItem>
              </BreadcrumbNavigation>
              <main id="main-content" tabIndex={-1} style={mainStyle}>
                <MainContent pageName="Level 2a" />
              </main>
            </div>
          </div>
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

export const Level3a: Story = {
  name: 'Level 3a',
  render: () => (
    <Body>
      <SkipLink href="#main-content" />
      <PageLayout>
        <PageHeader
          logoSlot={logoSlot}
          primaryNavigation={<PrimaryNavigation currentPage="level-3a" />}
          primaryNavigationLarge={
            <PrimaryNavigationLarge currentPage="level-3a" />
          }
          secondaryNavigation={secondaryNavigation}
          secondaryNavigationLarge={secondaryNavigationLarge}
          searchSlot={searchSlot}
        />
        <PageBody>
          <div className="dsn-sidebar-layout">
            <aside className="dsn-sidebar-layout__sidebar">
              <SidebarNavigation currentPage="level-3a" />
            </aside>
            <div className="dsn-sidebar-layout__main">
              <BreadcrumbNavigation
                variant="compact"
                aria-label="Broodkruimelpad"
              >
                <BreadcrumbNavigationItem href="/">
                  Homepage
                </BreadcrumbNavigationItem>
                <BreadcrumbNavigationItem href="/level-1a">
                  Level 1a
                </BreadcrumbNavigationItem>
                <BreadcrumbNavigationItem href="/level-2b">
                  Level 2b
                </BreadcrumbNavigationItem>
                <BreadcrumbNavigationItem current>
                  Level 3a
                </BreadcrumbNavigationItem>
              </BreadcrumbNavigation>
              <main id="main-content" tabIndex={-1} style={mainStyle}>
                <MainContent pageName="Level 3a" />
              </main>
            </div>
          </div>
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

export const Level4a: Story = {
  name: 'Level 4a',
  render: () => (
    <Body>
      <SkipLink href="#main-content" />
      <PageLayout>
        <PageHeader
          logoSlot={logoSlot}
          primaryNavigation={<PrimaryNavigation currentPage="level-4a" />}
          primaryNavigationLarge={
            <PrimaryNavigationLarge currentPage="level-4a" />
          }
          secondaryNavigation={secondaryNavigation}
          secondaryNavigationLarge={secondaryNavigationLarge}
          searchSlot={searchSlot}
        />
        <PageBody>
          <div className="dsn-sidebar-layout">
            <aside className="dsn-sidebar-layout__sidebar">
              <SidebarNavigation currentPage="level-4a" />
            </aside>
            <div className="dsn-sidebar-layout__main">
              <BreadcrumbNavigation
                variant="compact"
                aria-label="Broodkruimelpad"
              >
                <BreadcrumbNavigationItem href="/">
                  Homepage
                </BreadcrumbNavigationItem>
                <BreadcrumbNavigationItem href="/level-1a">
                  Level 1a
                </BreadcrumbNavigationItem>
                <BreadcrumbNavigationItem href="/level-2b">
                  Level 2b
                </BreadcrumbNavigationItem>
                <BreadcrumbNavigationItem href="/level-3b">
                  Level 3b
                </BreadcrumbNavigationItem>
                <BreadcrumbNavigationItem current>
                  Level 4a
                </BreadcrumbNavigationItem>
              </BreadcrumbNavigation>
              <main id="main-content" tabIndex={-1} style={mainStyle}>
                <MainContent pageName="Level 4a" />
              </main>
            </div>
          </div>
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
