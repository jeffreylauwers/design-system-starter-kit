import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Body,
  ButtonLink,
  Grid,
  GridItem,
  Heading,
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
  title: 'Templates/Form flow/Introduction page',
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
  name: 'Introduction page',
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

                  <Paragraph variant="lead">
                    Hier zou een korte introductie van het formulier kunnen
                    staan.
                  </Paragraph>

                  <UnorderedList>
                    <li>
                      Hier zou kunnen staan wat men nodig heeft om het formulier
                      in te kunnen vullen.
                    </li>
                    <li>
                      Dit formulier bestaat uit de volgende stappen: X, Y, Z en
                      het controleren van de ingevulde informatie.
                    </li>
                    <li>
                      Vul alles in. Als iets niet verplicht is, staat dat erbij.
                    </li>
                    <li>
                      U kunt het formulier tussendoor opslaan en later
                      verdergaan.
                    </li>
                    <li>
                      Na het versturen ontvangt u een bevestigingsmail. Ook kunt
                      u de {'{onderwerp}'} downloaden of printen.
                    </li>
                  </UnorderedList>

                  <div>
                    <ButtonLink href="#" variant="strong">
                      Doorgaan
                    </ButtonLink>
                  </div>
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
