import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ActionGroup,
  Body,
  Button,
  CheckboxGroup,
  CheckboxOption,
  DateInput,
  DateInputGroup,
  DateInputGroupValue,
  EmailInput,
  FileInput,
  FormField,
  FormFieldDescription,
  FormFieldLabel,
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
  PasswordInput,
  RadioGroup,
  RadioOption,
  SearchInput,
  Select,
  SkipLink,
  Stack,
  TelephoneInput,
  TextArea,
  TextInput,
  TimeInput,
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

function AllTypesPage() {
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
                      Alle formuliertypen
                    </h2>
                    <Paragraph>
                      Vul alles in. Als iets niet verplicht is, staat dat erbij.
                    </Paragraph>
                  </Stack>

                  <form noValidate>
                    <Stack space="3xl">
                      <FormField label="Tekstveld" htmlFor="text-input">
                        <TextInput id="text-input" />
                      </FormField>

                      <FormField label="Tekstvlak" htmlFor="text-area">
                        <TextArea id="text-area" />
                      </FormField>

                      <FormField label="Getal" htmlFor="number-input">
                        <NumberInput id="number-input" width="xs" />
                      </FormField>

                      <FormField label="E-mailadres" htmlFor="email-input">
                        <EmailInput
                          id="email-input"
                          autoComplete="email"
                          width="xl"
                        />
                      </FormField>

                      <FormField
                        label="Telefoonnummer"
                        htmlFor="telephone-input"
                      >
                        <TelephoneInput
                          id="telephone-input"
                          autoComplete="tel"
                          width="md"
                        />
                      </FormField>

                      <FormField label="Wachtwoord" htmlFor="password-input">
                        <PasswordInput
                          id="password-input"
                          autoComplete="current-password"
                        />
                      </FormField>

                      <FormField label="Zoeken" htmlFor="search-input">
                        <SearchInput id="search-input" />
                      </FormField>

                      <FormField label="Tijdstip" htmlFor="time-input">
                        <TimeInput id="time-input" />
                      </FormField>

                      <FormField label="Datum" htmlFor="date-input">
                        <DateInput id="date-input" />
                      </FormField>

                      <FormFieldset
                        legend="Geboortedatum"
                        description="Bijvoorbeeld: 15 3 1990"
                      >
                        <DateInputGroup
                          id="date-input-group"
                          value={geboortedatum}
                          onChange={setGeboortedatum}
                        />
                      </FormFieldset>

                      <FormField label="Selecteer een optie" htmlFor="select">
                        <Select id="select">
                          <option value="">Maak een keuze</option>
                          <option value="optie-1">Optie 1</option>
                          <option value="optie-2">Optie 2</option>
                          <option value="optie-3">Optie 3</option>
                        </Select>
                      </FormField>

                      <FormFieldset legend="Selecteer meerdere opties">
                        <CheckboxGroup>
                          <CheckboxOption
                            id="checkbox-1"
                            name="checkboxes"
                            value="optie-1"
                            label="Optie 1"
                          />
                          <CheckboxOption
                            id="checkbox-2"
                            name="checkboxes"
                            value="optie-2"
                            label="Optie 2"
                          />
                          <CheckboxOption
                            id="checkbox-3"
                            name="checkboxes"
                            value="optie-3"
                            label="Optie 3"
                          />
                        </CheckboxGroup>
                      </FormFieldset>

                      <FormFieldset legend="Selecteer één optie">
                        <RadioGroup>
                          <RadioOption
                            id="radio-1"
                            name="radios"
                            value="optie-1"
                            label="Optie 1"
                          />
                          <RadioOption
                            id="radio-2"
                            name="radios"
                            value="optie-2"
                            label="Optie 2"
                          />
                          <RadioOption
                            id="radio-3"
                            name="radios"
                            value="optie-3"
                            label="Optie 3"
                          />
                        </RadioGroup>
                      </FormFieldset>

                      <div className="dsn-form-field">
                        <FormFieldLabel htmlFor="file-input">
                          Bestand toevoegen
                        </FormFieldLabel>
                        <FormFieldDescription id="file-input-description">
                          Het bestand mag maximaal 10 MB zijn. <br /> Toegestane
                          bestandstypen: doc, docx, xlsx, pdf, zip, jpg, png,
                          bmp en gif.
                        </FormFieldDescription>
                        <FileInput
                          id="file-input"
                          aria-describedby="file-input-description"
                        />
                      </div>

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
  title: 'Templates/Form flow/Form step: All form types',
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
  name: 'Form step: All form types',
  render: () => <AllTypesPage />,
};
