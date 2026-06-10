import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ActionGroup,
  Body,
  Grid,
  GridItem,
  Icon,
  Link,
  Note,
  PageBody,
  PageFooter,
  PageHeader,
  PageLayout,
  Paragraph,
  SkipLink,
  Stack,
  UnorderedList,
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
  title: 'Templates/Form flow/Confirmation page',
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
  name: 'Confirmation page',
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
                  <Note
                    variant="positive"
                    heading="{Onderwerp} is verstuurd"
                    headingLevel={1}
                  >
                    <Paragraph>Kenmerk: 2308290-1118-59dc</Paragraph>
                  </Note>

                  <Stack space="md">
                    <h2 className="dsn-heading dsn-heading--heading-4">
                      Dit gaat er nu gebeuren
                    </h2>

                    <UnorderedList>
                      <li>
                        U ontvangt {'{tijdsindicatie}'} een bevestigingsmail op
                        jeroenvandrouwen@gmail.com.
                      </li>
                      <li>
                        Wij behandelen uw {'{onderwerp}'}. Wij nemen binnen{' '}
                        {'{tijdsindicatie}'} contact met u op.
                      </li>
                      <li>
                        U kunt in <Link href="#">{'{naam-mijn-omgeving}'}</Link>{' '}
                        de voortgang van uw {'{onderwerp}'} bekijken.
                      </li>
                    </UnorderedList>
                  </Stack>

                  <ActionGroup
                    direction="vertical"
                    style={{
                      marginBlockStart: 'var(--dsn-space-block-3xl)',
                    }}
                  >
                    <Link
                      href="#"
                      iconStart={<Icon name="printer" aria-hidden />}
                    >
                      Print {'{onderwerp}'}
                    </Link>
                    <Link
                      href="#"
                      iconStart={<Icon name="download" aria-hidden />}
                    >
                      Download {'{onderwerp}'} als PDF
                    </Link>
                    <Link href="#">Terug naar voorbeeld.nl</Link>
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
