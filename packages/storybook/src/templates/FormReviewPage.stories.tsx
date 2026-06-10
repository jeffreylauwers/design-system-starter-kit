import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ActionGroup,
  Body,
  Button,
  Grid,
  GridItem,
  Heading,
  Icon,
  Link,
  LinkButton,
  PageBody,
  PageFooter,
  PageHeader,
  PageLayout,
  SkipLink,
  Stack,
  SummaryList,
  SummaryListKey,
  SummaryListRow,
  SummaryListValue,
} from '@dsn-starter-kit/components-react';
import {
  logoSlot,
  footerSlot1,
  footerSlot2,
  footerSlot3,
  footerSlot4,
} from './templateSharedContent';

// =============================================================================
// GEDEELDE CONTENT
// =============================================================================

const mainStyle: React.CSSProperties = {
  paddingBlock: 'var(--dsn-space-block-6xl)',
};

// =============================================================================
// META
// =============================================================================

const meta: Meta = {
  title: 'Templates/Form flow/Review page',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj;

// =============================================================================
// STORIES
// =============================================================================

export const Example: Story = {
  name: 'Review page',
  render: () => (
    <Body>
      <SkipLink href="#main-content" />
      <PageLayout>
        <PageHeader
          logoSlot={logoSlot}
          layout="compact"
          hideMenuButton
          hideSearchButton
        />
        <PageBody>
          <main id="main-content" tabIndex={-1} style={mainStyle}>
            <Grid>
              <GridItem colSpan={12} colStartLg={3} colEndLg={11}>
                <Stack space="3xl">
                  <Heading level={1}>Titel formulier</Heading>

                  <h2 className="dsn-heading dsn-heading--heading-2">
                    Controleer uw gegevens
                  </h2>

                  <Stack space="5xl">
                    <Stack space="2xl">
                      <Stack space="sm">
                        <h3 className="dsn-heading dsn-heading--heading-3">
                          Titel van stap 1
                        </h3>
                        <Link href="#" iconStart={<Icon name="pencil" />}>
                          Wijzig
                          <span className="dsn-visually-hidden">
                            {' '}
                            Titel van stap 1
                          </span>
                        </Link>
                      </Stack>
                      <SummaryList>
                        <SummaryListRow noActions>
                          <SummaryListKey>Vraag</SummaryListKey>
                          <SummaryListValue>
                            Als een banaan een eigen persoonlijkheid zou hebben,
                            welke eigenschappen denk je dat hij dan zou hebben
                            en waarom?
                          </SummaryListValue>
                        </SummaryListRow>
                        <SummaryListRow noActions>
                          <SummaryListKey>Favoriete fruit</SummaryListKey>
                          <SummaryListValue>Banaan</SummaryListValue>
                        </SummaryListRow>
                      </SummaryList>
                    </Stack>

                    <Stack space="2xl">
                      <Stack space="sm">
                        <h3 className="dsn-heading dsn-heading--heading-3">
                          Uw gegevens
                        </h3>
                        <Link href="#" iconStart={<Icon name="pencil" />}>
                          Wijzig
                          <span className="dsn-visually-hidden">
                            {' '}
                            Uw gegevens
                          </span>
                        </Link>
                      </Stack>
                      <SummaryList>
                        <SummaryListRow noActions>
                          <SummaryListKey>Voornaam</SummaryListKey>
                          <SummaryListValue>Jeroen</SummaryListValue>
                        </SummaryListRow>
                        <SummaryListRow noActions>
                          <SummaryListKey>Achternaam</SummaryListKey>
                          <SummaryListValue>van Drouwen</SummaryListValue>
                        </SummaryListRow>
                        <SummaryListRow noActions>
                          <SummaryListKey>Straat</SummaryListKey>
                          <SummaryListValue>
                            Laan der Voorbeelden
                          </SummaryListValue>
                        </SummaryListRow>
                        <SummaryListRow noActions>
                          <SummaryListKey>Huisnummer</SummaryListKey>
                          <SummaryListValue>9999</SummaryListValue>
                        </SummaryListRow>
                        <SummaryListRow noActions>
                          <SummaryListKey>Postcode</SummaryListKey>
                          <SummaryListValue>1440 VP</SummaryListValue>
                        </SummaryListRow>
                        <SummaryListRow noActions>
                          <SummaryListKey>Woonplaats</SummaryListKey>
                          <SummaryListValue>
                            Westerhaar-Vriezenveensewijk
                          </SummaryListValue>
                        </SummaryListRow>
                        <SummaryListRow noActions>
                          <SummaryListKey>Geboortedatum</SummaryListKey>
                          <SummaryListValue>9-12-1984</SummaryListValue>
                        </SummaryListRow>
                        <SummaryListRow noActions>
                          <SummaryListKey>E-mailadres</SummaryListKey>
                          <SummaryListValue>
                            jeroenvandrouwen@gmail.com
                          </SummaryListValue>
                        </SummaryListRow>
                        <SummaryListRow noActions>
                          <SummaryListKey>Telefoonnummer</SummaryListKey>
                          <SummaryListValue>06 12 34 56 78</SummaryListValue>
                        </SummaryListRow>
                      </SummaryList>
                    </Stack>
                  </Stack>

                  <ActionGroup
                    direction="vertical"
                    style={{
                      marginBlockStart: 'var(--dsn-space-block-3xl)',
                    }}
                  >
                    <Button variant="strong-positive" type="submit">
                      Versturen
                    </Button>
                    <LinkButton>Opslaan en later verder</LinkButton>
                    <LinkButton>Stoppen met het formulier</LinkButton>
                  </ActionGroup>
                </Stack>
              </GridItem>
            </Grid>
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
