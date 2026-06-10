import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ActionGroup,
  Body,
  Button,
  EmailInput,
  FormField,
  Grid,
  GridItem,
  Heading,
  Icon,
  Link,
  PageBody,
  PageFooter,
  PageHeader,
  PageLayout,
  Paragraph,
  SkipLink,
  Stack,
  TextInput,
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
  title: 'Templates/Form flow/Form step: Edit from review',
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
  name: 'Form step: Edit from review',
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

                  <Link href="#" iconStart={<Icon name="arrow-left" />}>
                    Terug
                  </Link>

                  <Stack space="sm">
                    <h2 className="dsn-heading dsn-heading--heading-2">
                      Uw gegevens
                    </h2>

                    <Paragraph>
                      Vul alles in. Als iets niet verplicht is, staat dat erbij.
                    </Paragraph>
                  </Stack>

                  <form noValidate>
                    <Stack space="3xl">
                      <FormField label="Naam" htmlFor="naam">
                        <TextInput
                          id="naam"
                          autoComplete="name"
                          defaultValue="Jeroen van Drouwen"
                        />
                      </FormField>

                      <FormField label="E-mailadres" htmlFor="email">
                        <EmailInput
                          id="email"
                          autoComplete="email"
                          width="xl"
                          defaultValue="jeroenvandrouwen@gmail.com"
                        />
                      </FormField>

                      <ActionGroup
                        direction="vertical"
                        style={{
                          marginBlockStart: 'var(--dsn-space-block-3xl)',
                        }}
                      >
                        <Button variant="strong" type="submit">
                          Opslaan en terug
                        </Button>
                        <Button variant="default" type="button">
                          Annuleren
                        </Button>
                      </ActionGroup>
                    </Stack>
                  </form>
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
