import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ActionGroup,
  Body,
  Button,
  EmailInput,
  File,
  FileInput,
  FileList,
  FormField,
  FormFieldDescription,
  FormFieldLabel,
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
// UPLOAD-REGELS
// =============================================================================

/** Maximale bestandsgrootte, gelijk aan de voorwaarde die op de pagina staat. */
const MAX_BYTES = 10 * 1024 * 1024;

/** Toegestane extensies, gelijk aan de voorwaarde die op de pagina staat. */
const TOEGESTANE_EXTENSIES = [
  'doc',
  'docx',
  'xlsx',
  'pdf',
  'zip',
  'jpg',
  'png',
  'bmp',
  'gif',
];

/**
 * Duur van de gesimuleerde upload. Lang genoeg om de loading-state waar te
 * nemen, kort genoeg om niet te vervelen bij het doorlopen van de flow.
 */
const UPLOAD_DUUR_MS = 1500;

type UploadStatus = 'default' | 'loading' | 'uploaded' | 'error';

interface GekozenBestand {
  id: number;
  /** Volledige bestandsnaam inclusief extensie. */
  naam: string;
  /** Extensie in hoofdletters: "PDF". */
  type: string;
  /** Geformatteerde grootte: "1,2 MB". */
  grootte: string;
  status: UploadStatus;
  foutmelding?: string;
}

function extensieVan(bestandsnaam: string): string {
  const laatstePunt = bestandsnaam.lastIndexOf('.');
  return laatstePunt > 0
    ? bestandsnaam.slice(laatstePunt + 1).toLowerCase()
    : '';
}

function formatteerGrootte(bytes: number): string {
  const eenheden = ['B', 'KB', 'MB', 'GB'];
  let waarde = bytes;
  let index = 0;
  while (waarde >= 1024 && index < eenheden.length - 1) {
    waarde /= 1024;
    index += 1;
  }
  const getal = new Intl.NumberFormat('nl-NL', {
    maximumFractionDigits: index === 0 ? 0 : 1,
  }).format(waarde);
  return `${getal} ${eenheden[index]}`;
}

/**
 * Beoordeelt een gekozen bestand tegen de voorwaarden die zichtbaar op de
 * pagina staan. Foutmeldingsteksten volgen docs/07-form-flow-patterns.md.
 */
function beoordeel(
  bestandsnaam: string,
  bytes: number
): {
  status: UploadStatus;
  foutmelding?: string;
} {
  const extensie = extensieVan(bestandsnaam);

  if (!TOEGESTANE_EXTENSIES.includes(extensie)) {
    return {
      status: 'error',
      foutmelding:
        'Het gekozen bestandstype is niet toegestaan. Kies een doc, docx, xlsx, pdf, zip, jpg, png, bmp of gif.',
    };
  }

  if (bytes > MAX_BYTES) {
    return {
      status: 'error',
      foutmelding:
        'Het gekozen bestand is te groot. Het bestand mag maximaal 10 MB zijn.',
    };
  }

  return { status: 'loading' };
}

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

function UploadPage() {
  const [activeModal, setActiveModal] = React.useState<ActiveModal>(null);
  const [bestanden, setBestanden] = React.useState<GekozenBestand[]>([]);
  const volgendeId = React.useRef(0);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  // Ruim lopende upload-timers op bij unmount
  React.useEffect(() => {
    const lopend = timers.current;
    return () => lopend.forEach(clearTimeout);
  }, []);

  function handleBestandskeuze(event: React.ChangeEvent<HTMLInputElement>) {
    const gekozen = Array.from(event.target.files ?? []);
    if (gekozen.length === 0) return;

    const nieuwe: GekozenBestand[] = gekozen.map((bestand) => {
      volgendeId.current += 1;
      const { status, foutmelding } = beoordeel(bestand.name, bestand.size);
      return {
        id: volgendeId.current,
        naam: bestand.name,
        type: extensieVan(bestand.name).toUpperCase(),
        grootte: formatteerGrootte(bestand.size),
        status,
        foutmelding,
      };
    });

    setBestanden((huidig) => [...huidig, ...nieuwe]);

    // Leeg de input, zodat hetzelfde bestand opnieuw gekozen kan worden
    event.target.value = '';

    // Simuleer de upload voor alles wat door de controle kwam
    nieuwe
      .filter((bestand) => bestand.status === 'loading')
      .forEach((bestand) => {
        const timer = setTimeout(() => {
          setBestanden((huidig) =>
            huidig.map((item) =>
              item.id === bestand.id ? { ...item, status: 'uploaded' } : item
            )
          );
        }, UPLOAD_DUUR_MS);
        timers.current.push(timer);
      });
  }

  function verwijder(id: number) {
    setBestanden((huidig) => huidig.filter((bestand) => bestand.id !== id));
  }

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

                  <h2 className="dsn-heading dsn-heading--heading-2">
                    Bestand toevoegen
                  </h2>

                  <form noValidate>
                    <Stack space="3xl">
                      <div className="dsn-form-field">
                        <FormFieldLabel htmlFor="bestand-upload">
                          Bestand toevoegen
                        </FormFieldLabel>
                        <FormFieldDescription
                          as="div"
                          id="bestand-upload-description"
                        >
                          <UnorderedList>
                            <li>Het bestand mag maximaal 10 MB zijn.</li>
                            <li>
                              Toegestane bestandstypen: doc, docx, xlsx, pdf,
                              zip, jpg, png, bmp en gif.
                            </li>
                          </UnorderedList>
                        </FormFieldDescription>
                        <FileInput
                          id="bestand-upload"
                          aria-describedby="bestand-upload-description"
                          onChange={handleBestandskeuze}
                          multiple
                          required
                        />

                        {bestanden.length > 0 && (
                          <FileList
                            style={{
                              marginBlockStart: 'var(--dsn-space-block-lg)',
                            }}
                          >
                            {bestanden.map((bestand) => (
                              <File
                                key={bestand.id}
                                fileName={bestand.naam}
                                fileType={bestand.type}
                                fileSize={bestand.grootte}
                                status={bestand.status}
                                errorMessage={bestand.foutmelding}
                                onDelete={() => verwijder(bestand.id)}
                              />
                            ))}
                          </FileList>
                        )}
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
  title: 'Templates/Form flow/Form step: Upload',
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
  name: 'Form step: Upload',
  render: () => <UploadPage />,
};
