import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ActionGroup,
  Alert,
  Body,
  Button,
  DateInputGroup,
  DateInputGroupValue,
  EmailInput,
  FormField,
  FormFieldset,
  Grid,
  GridItem,
  Heading,
  Icon,
  Link,
  LinkButton,
  ModalDialog,
  ModalDialogBody,
  ModalDialogFooter,
  ModalDialogHeader,
  ModalDialogHeading,
  NumberInput,
  PageBody,
  PageFooter,
  PageHeader,
  PageLayout,
  Paragraph,
  SkipLink,
  Stack,
  TelephoneInput,
  TextArea,
  TextInput,
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
// HELPER COMPONENTS
// =============================================================================

type ActiveModal = 'save' | 'stop' | null;

function FormModals({
  activeModal,
  onClose,
}: {
  activeModal: ActiveModal;
  onClose: () => void;
}) {
  return (
    <>
      <ModalDialog isOpen={activeModal === 'save'} onClose={onClose}>
        <ModalDialogHeader>
          <ModalDialogHeading>Opslaan en later verder</ModalDialogHeading>
        </ModalDialogHeader>
        <ModalDialogBody>
          <Stack space="md">
            <Paragraph>
              Vul uw e-mailadres in. Er wordt een unieke link naar uw
              e-mailadres verstuurd. Hiermee kunt u dit formulier op een later
              moment afmaken.
            </Paragraph>
            <FormField label="E-mailadres" htmlFor="modal-email">
              <EmailInput id="modal-email" autoComplete="email" width="xl" />
            </FormField>
          </Stack>
        </ModalDialogBody>
        <ModalDialogFooter>
          <ActionGroup>
            <Button variant="strong">Opslaan</Button>
            <Button variant="default" onClick={onClose}>
              Annuleren
            </Button>
          </ActionGroup>
        </ModalDialogFooter>
      </ModalDialog>
      <ModalDialog isOpen={activeModal === 'stop'} onClose={onClose}>
        <ModalDialogHeader>
          <ModalDialogHeading>Stoppen met het formulier</ModalDialogHeading>
        </ModalDialogHeader>
        <ModalDialogBody>
          <Paragraph>
            Weet u zeker dat u wilt stoppen met het formulier? Uw gegevens
            worden niet opgeslagen.
          </Paragraph>
        </ModalDialogBody>
        <ModalDialogFooter>
          <ActionGroup>
            <Button variant="strong">Stoppen</Button>
            <Button variant="default" onClick={onClose}>
              Annuleren
            </Button>
          </ActionGroup>
        </ModalDialogFooter>
      </ModalDialog>
    </>
  );
}

function ExtendedDetailsPage() {
  const [activeModal, setActiveModal] = React.useState<ActiveModal>(null);
  const [geboortedatum, setGeboortedatum] = useState<DateInputGroupValue>({
    day: '',
    month: '',
    year: '',
  });

  return (
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
                    Vorige stap
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
                      <FormField label="Voornaam" htmlFor="voornaam">
                        <TextInput id="voornaam" autoComplete="given-name" />
                      </FormField>

                      <FormField
                        label="Tussenvoegsel"
                        htmlFor="tussenvoegsel"
                        labelSuffix="(niet verplicht)"
                      >
                        <TextInput
                          id="tussenvoegsel"
                          width="sm"
                          autoComplete="additional-name"
                        />
                      </FormField>

                      <FormField label="Achternaam" htmlFor="achternaam">
                        <TextInput id="achternaam" autoComplete="family-name" />
                      </FormField>

                      <FormField label="Straat" htmlFor="straat">
                        <TextInput
                          id="straat"
                          width="xl"
                          autoComplete="address-line1"
                        />
                      </FormField>

                      <FormField label="Huisnummer" htmlFor="huisnummer">
                        <NumberInput
                          id="huisnummer"
                          width="xs"
                          autoComplete="address-line2"
                        />
                      </FormField>

                      <FormField
                        label="Toevoeging"
                        htmlFor="toevoeging"
                        labelSuffix="(niet verplicht)"
                      >
                        <TextInput
                          id="toevoeging"
                          width="xs"
                          autoComplete="address-line2"
                        />
                      </FormField>

                      <FormField label="Postcode" htmlFor="postcode">
                        <TextInput
                          id="postcode"
                          width="xs"
                          autoComplete="postal-code"
                        />
                      </FormField>

                      <FormField label="Woonplaats" htmlFor="woonplaats">
                        <TextInput
                          id="woonplaats"
                          width="xl"
                          autoComplete="address-level2"
                        />
                      </FormField>

                      <FormFieldset
                        legend="Geboortedatum"
                        description="Bijvoorbeeld: 15 3 1990"
                      >
                        <DateInputGroup
                          id="geboortedatum"
                          value={geboortedatum}
                          onChange={setGeboortedatum}
                        />
                      </FormFieldset>

                      <FormField label="E-mailadres" htmlFor="email">
                        <EmailInput
                          id="email"
                          autoComplete="email"
                          width="xl"
                        />
                      </FormField>

                      <FormField
                        label="Telefoonnummer"
                        htmlFor="telefoonnummer"
                        labelSuffix="(niet verplicht)"
                      >
                        <TelephoneInput
                          id="telefoonnummer"
                          autoComplete="tel"
                          width="md"
                        />
                      </FormField>

                      <FormField
                        label="Opmerkingen"
                        htmlFor="opmerkingen"
                        labelSuffix="(niet verplicht)"
                      >
                        <TextArea id="opmerkingen" />
                      </FormField>

                      <ActionGroup
                        direction="vertical"
                        style={{
                          marginBlockStart: 'var(--dsn-space-block-3xl)',
                        }}
                      >
                        <Button variant="strong" type="submit">
                          Volgende stap
                        </Button>
                        <LinkButton onClick={() => setActiveModal('save')}>
                          Opslaan en later verder
                        </LinkButton>
                        <LinkButton onClick={() => setActiveModal('stop')}>
                          Stoppen met het formulier
                        </LinkButton>
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
      <FormModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
      />
    </Body>
  );
}

const EMAIL_ERROR = 'Ingevulde e-mailadres is niet toegestaan. Er mist een @.';
const VOORNAAM_ERROR =
  'Ingevulde voornaam is niet toegestaan. Gebruik alleen letters.';
const POSTCODE_ERROR =
  'Ingevulde postcode is niet toegestaan. Een postcode heeft 4 cijfers.';

function SingleErrorPage() {
  const [activeModal, setActiveModal] = React.useState<ActiveModal>(null);
  const [geboortedatum, setGeboortedatum] = useState<DateInputGroupValue>({
    day: '9',
    month: '12',
    year: '1984',
  });

  return (
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
                    Vorige stap
                  </Link>

                  <Alert variant="negative" heading="Er is een foutmelding">
                    <Link href="#single-error-email">{EMAIL_ERROR}</Link>
                  </Alert>

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
                      <FormField
                        label="Voornaam"
                        htmlFor="single-error-voornaam"
                      >
                        <TextInput
                          id="single-error-voornaam"
                          autoComplete="given-name"
                          defaultValue="Jeroen"
                        />
                      </FormField>

                      <FormField
                        label="Tussenvoegsel"
                        htmlFor="single-error-tussenvoegsel"
                        labelSuffix="(niet verplicht)"
                      >
                        <TextInput
                          id="single-error-tussenvoegsel"
                          width="sm"
                          autoComplete="additional-name"
                        />
                      </FormField>

                      <FormField
                        label="Achternaam"
                        htmlFor="single-error-achternaam"
                      >
                        <TextInput
                          id="single-error-achternaam"
                          autoComplete="family-name"
                          defaultValue="van Drouwen"
                        />
                      </FormField>

                      <FormField label="Straat" htmlFor="single-error-straat">
                        <TextInput
                          id="single-error-straat"
                          width="xl"
                          autoComplete="address-line1"
                          defaultValue="Laan der Voorbeelden"
                        />
                      </FormField>

                      <FormField
                        label="Huisnummer"
                        htmlFor="single-error-huisnummer"
                      >
                        <NumberInput
                          id="single-error-huisnummer"
                          width="xs"
                          autoComplete="address-line2"
                          defaultValue="99999"
                        />
                      </FormField>

                      <FormField
                        label="Toevoeging"
                        htmlFor="single-error-toevoeging"
                        labelSuffix="(niet verplicht)"
                      >
                        <TextInput
                          id="single-error-toevoeging"
                          width="xs"
                          autoComplete="address-line2"
                        />
                      </FormField>

                      <FormField
                        label="Postcode"
                        htmlFor="single-error-postcode"
                      >
                        <TextInput
                          id="single-error-postcode"
                          width="xs"
                          autoComplete="postal-code"
                          defaultValue="1440 VP"
                        />
                      </FormField>

                      <FormField
                        label="Woonplaats"
                        htmlFor="single-error-woonplaats"
                      >
                        <TextInput
                          id="single-error-woonplaats"
                          width="xl"
                          autoComplete="address-level2"
                          defaultValue="Westerhaar-Vriezenveensewijk"
                        />
                      </FormField>

                      <FormFieldset
                        legend="Geboortedatum"
                        description="Bijvoorbeeld: 15 3 1990"
                      >
                        <DateInputGroup
                          id="single-error-geboortedatum"
                          value={geboortedatum}
                          onChange={setGeboortedatum}
                        />
                      </FormFieldset>

                      <FormField
                        label="E-mailadres"
                        htmlFor="single-error-email"
                        error={EMAIL_ERROR}
                      >
                        <EmailInput
                          id="single-error-email"
                          autoComplete="email"
                          width="xl"
                          defaultValue="jeroenvandrouwen2gmail.com"
                          invalid
                        />
                      </FormField>

                      <FormField
                        label="Telefoonnummer"
                        htmlFor="single-error-telefoonnummer"
                        labelSuffix="(niet verplicht)"
                      >
                        <TelephoneInput
                          id="single-error-telefoonnummer"
                          autoComplete="tel"
                          width="md"
                        />
                      </FormField>

                      <FormField
                        label="Opmerkingen"
                        htmlFor="single-error-opmerkingen"
                        labelSuffix="(niet verplicht)"
                      >
                        <TextArea id="single-error-opmerkingen" />
                      </FormField>

                      <ActionGroup
                        direction="vertical"
                        style={{
                          marginBlockStart: 'var(--dsn-space-block-3xl)',
                        }}
                      >
                        <Button variant="strong" type="submit">
                          Volgende stap
                        </Button>
                        <LinkButton onClick={() => setActiveModal('save')}>
                          Opslaan en later verder
                        </LinkButton>
                        <LinkButton onClick={() => setActiveModal('stop')}>
                          Stoppen met het formulier
                        </LinkButton>
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
      <FormModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
      />
    </Body>
  );
}

function MultipleErrorsPage() {
  const [activeModal, setActiveModal] = React.useState<ActiveModal>(null);
  const [geboortedatum, setGeboortedatum] = useState<DateInputGroupValue>({
    day: '9',
    month: '12',
    year: '1984',
  });

  return (
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
                    Vorige stap
                  </Link>

                  <Alert variant="negative" heading="Er zijn 3 foutmeldingen">
                    <UnorderedList>
                      <li>
                        <Link href="#multi-error-voornaam">
                          {VOORNAAM_ERROR}
                        </Link>
                      </li>
                      <li>
                        <Link href="#multi-error-postcode">
                          {POSTCODE_ERROR}
                        </Link>
                      </li>
                      <li>
                        <Link href="#multi-error-email">{EMAIL_ERROR}</Link>
                      </li>
                    </UnorderedList>
                  </Alert>

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
                      <FormField
                        label="Voornaam"
                        htmlFor="multi-error-voornaam"
                        error={VOORNAAM_ERROR}
                      >
                        <TextInput
                          id="multi-error-voornaam"
                          autoComplete="given-name"
                          defaultValue="4"
                          invalid
                        />
                      </FormField>

                      <FormField
                        label="Tussenvoegsel"
                        htmlFor="multi-error-tussenvoegsel"
                        labelSuffix="(niet verplicht)"
                      >
                        <TextInput
                          id="multi-error-tussenvoegsel"
                          width="sm"
                          autoComplete="additional-name"
                        />
                      </FormField>

                      <FormField
                        label="Achternaam"
                        htmlFor="multi-error-achternaam"
                      >
                        <TextInput
                          id="multi-error-achternaam"
                          autoComplete="family-name"
                          defaultValue="van Drouwen"
                        />
                      </FormField>

                      <FormField label="Straat" htmlFor="multi-error-straat">
                        <TextInput
                          id="multi-error-straat"
                          width="xl"
                          autoComplete="address-line1"
                          defaultValue="Laan der Voorbeelden"
                        />
                      </FormField>

                      <FormField
                        label="Huisnummer"
                        htmlFor="multi-error-huisnummer"
                      >
                        <NumberInput
                          id="multi-error-huisnummer"
                          width="xs"
                          autoComplete="address-line2"
                          defaultValue="99999"
                        />
                      </FormField>

                      <FormField
                        label="Toevoeging"
                        htmlFor="multi-error-toevoeging"
                        labelSuffix="(niet verplicht)"
                      >
                        <TextInput
                          id="multi-error-toevoeging"
                          width="xs"
                          autoComplete="address-line2"
                        />
                      </FormField>

                      <FormField
                        label="Postcode"
                        htmlFor="multi-error-postcode"
                        error={POSTCODE_ERROR}
                      >
                        <TextInput
                          id="multi-error-postcode"
                          width="xs"
                          autoComplete="postal-code"
                          defaultValue="144 VP"
                          invalid
                        />
                      </FormField>

                      <FormField
                        label="Woonplaats"
                        htmlFor="multi-error-woonplaats"
                      >
                        <TextInput
                          id="multi-error-woonplaats"
                          width="xl"
                          autoComplete="address-level2"
                          defaultValue="Westerhaar-Vriezenveensewijk"
                        />
                      </FormField>

                      <FormFieldset
                        legend="Geboortedatum"
                        description="Bijvoorbeeld: 15 3 1990"
                      >
                        <DateInputGroup
                          id="multi-error-geboortedatum"
                          value={geboortedatum}
                          onChange={setGeboortedatum}
                        />
                      </FormFieldset>

                      <FormField
                        label="E-mailadres"
                        htmlFor="multi-error-email"
                        error={EMAIL_ERROR}
                      >
                        <EmailInput
                          id="multi-error-email"
                          autoComplete="email"
                          width="xl"
                          defaultValue="jeroenvandrouwen2gmail.com"
                          invalid
                        />
                      </FormField>

                      <FormField
                        label="Telefoonnummer"
                        htmlFor="multi-error-telefoonnummer"
                        labelSuffix="(niet verplicht)"
                      >
                        <TelephoneInput
                          id="multi-error-telefoonnummer"
                          autoComplete="tel"
                          width="md"
                        />
                      </FormField>

                      <FormField
                        label="Opmerkingen"
                        htmlFor="multi-error-opmerkingen"
                        labelSuffix="(niet verplicht)"
                      >
                        <TextArea id="multi-error-opmerkingen" />
                      </FormField>

                      <ActionGroup
                        direction="vertical"
                        style={{
                          marginBlockStart: 'var(--dsn-space-block-3xl)',
                        }}
                      >
                        <Button variant="strong" type="submit">
                          Volgende stap
                        </Button>
                        <LinkButton onClick={() => setActiveModal('save')}>
                          Opslaan en later verder
                        </LinkButton>
                        <LinkButton onClick={() => setActiveModal('stop')}>
                          Stoppen met het formulier
                        </LinkButton>
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
      <FormModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
      />
    </Body>
  );
}

// =============================================================================
// META
// =============================================================================

const meta: Meta = {
  title: 'Templates/Form flow/Form step: Extended details',
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
  name: 'Form step: Extended details',
  render: () => <ExtendedDetailsPage />,
};

export const WithSingleError: Story = {
  name: 'Form step: Extended details: With single error',
  render: () => <SingleErrorPage />,
};

export const WithMultipleErrors: Story = {
  name: 'Form step: Extended details: With multiple errors',
  render: () => <MultipleErrorsPage />,
};
