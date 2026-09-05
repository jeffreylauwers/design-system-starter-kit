import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ActionGroup,
  Alert,
  Backdrop,
  Body,
  BreadcrumbNavigation,
  BreadcrumbNavigationItem,
  BreakoutSection,
  Button,
  ButtonLink,
  Card,
  CardBody,
  CardFooter,
  CardGroup,
  CardHeader,
  CardHeading,
  Checkbox,
  CheckboxGroup,
  CheckboxOption,
  Container,
  DateInput,
  DateInputGroup,
  type DateInputGroupValue,
  Details,
  DotBadge,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerHeading,
  EmailInput,
  File,
  FileInput,
  FormField,
  FormFieldDescription,
  FormFieldErrorMessage,
  FormFieldLabel,
  FormFieldset,
  FormFieldStatus,
  Grid,
  GridItem,
  Heading,
  Hero,
  Icon,
  Image,
  Link,
  LinkButton,
  Logo,
  Menu,
  MenuButton,
  MenuLink,
  ModalDialog,
  ModalDialogBody,
  ModalDialogFooter,
  ModalDialogHeader,
  ModalDialogHeading,
  Note,
  NumberBadge,
  NumberInput,
  OptionLabel,
  OrderedList,
  PageBody,
  PageFooter,
  PageHeader,
  PageLayout,
  Paragraph,
  PasswordInput,
  Popover,
  PopoverBody,
  ProgressBar,
  Radio,
  RadioGroup,
  RadioOption,
  SearchInput,
  Select,
  SkipLink,
  Spinner,
  Stack,
  StatusBadge,
  SummaryList,
  SummaryListActions,
  SummaryListKey,
  SummaryListRow,
  SummaryListValue,
  Table,
  TelephoneInput,
  TextArea,
  TextInput,
  TimeInput,
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
// NAVIGATIE
// =============================================================================

function PrimaryNavigation() {
  const [exp1b, setExp1b] = React.useState(false);
  const [exp2b, setExp2b] = React.useState(false);

  return (
    <Menu orientation="vertical">
      <MenuLink href="/" level={1}>
        Homepage
      </MenuLink>
      <MenuLink href="/level-1a" level={1} current>
        Kitchen Sink
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
            <MenuLink href="/level-3a" level={3}>
              Level 3a
            </MenuLink>
          )}
        </>
      )}
      <MenuLink href="/level-1c" level={1}>
        Level 1c
      </MenuLink>
    </Menu>
  );
}

const primaryNavigationLarge = (
  <Menu orientation="horizontal">
    <MenuLink href="/" level={1}>
      Homepage
    </MenuLink>
    <MenuLink href="/kitchen-sink" level={1} current>
      Kitchen Sink
    </MenuLink>
    <MenuLink href="/level-1b" level={1}>
      Level 1b
    </MenuLink>
    <MenuLink href="/level-1c" level={1}>
      Level 1c
    </MenuLink>
  </Menu>
);

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

// =============================================================================
// OVERLAY HELPERS
// =============================================================================

function ModalDialogDemo() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <Button variant="default" onClick={() => setIsOpen(true)}>
        Open Modal Dialog
      </Button>
      <ModalDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalDialogHeader>
          <ModalDialogHeading>Titel</ModalDialogHeading>
        </ModalDialogHeader>
        <ModalDialogBody>
          <Paragraph>Tekst</Paragraph>
        </ModalDialogBody>
        <ModalDialogFooter>
          <ActionGroup>
            <Button variant="strong" onClick={() => setIsOpen(false)}>
              Tekst
            </Button>
            <Button variant="default" onClick={() => setIsOpen(false)}>
              Tekst
            </Button>
          </ActionGroup>
        </ModalDialogFooter>
      </ModalDialog>
    </>
  );
}

function DrawerDemo() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <Button variant="default" onClick={() => setIsOpen(true)}>
        Open Drawer
      </Button>
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} side="right">
        <DrawerHeader>
          <DrawerHeading>Titel</DrawerHeading>
        </DrawerHeader>
        <DrawerBody>
          <Paragraph>Tekst</Paragraph>
        </DrawerBody>
        <DrawerFooter>
          <ActionGroup>
            <Button variant="strong" onClick={() => setIsOpen(false)}>
              Tekst
            </Button>
            <Button variant="default" onClick={() => setIsOpen(false)}>
              Tekst
            </Button>
          </ActionGroup>
        </DrawerFooter>
      </Drawer>
    </>
  );
}

function DateInputGroupDemo() {
  const [value, setValue] = useState<DateInputGroupValue>({
    day: '',
    month: '',
    year: '',
  });
  return (
    <DateInputGroup
      id="dateinputgroup-kitchen"
      value={value}
      onChange={setValue}
    />
  );
}

function PopoverDemo() {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <Button
        ref={triggerRef}
        variant="subtle"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        Open Popover
      </Button>
      <Popover
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
        label="Tekst"
      >
        <PopoverBody>
          <Menu>
            <MenuButton onClick={() => setIsOpen(false)}>Tekst</MenuButton>
            <MenuButton onClick={() => setIsOpen(false)}>Tekst</MenuButton>
            <MenuButton onClick={() => setIsOpen(false)}>Tekst</MenuButton>
          </Menu>
        </PopoverBody>
      </Popover>
    </>
  );
}

// =============================================================================
// SECTION HELPER
// =============================================================================

function Section({
  name,
  docPath,
  children,
}: {
  name: string;
  docPath: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <Heading level={2}>{name}</Heading>
      <Link
        href={docPath}
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
          const { origin, pathname } = window.parent.location;
          window.parent.location.href = origin + pathname + docPath;
        }}
      >
        Bekijk de documentatie voor {name}
      </Link>
      <div style={{ marginBlockStart: 'var(--dsn-space-block-3xl)' }}>
        {children}
      </div>
    </section>
  );
}

// =============================================================================
// STIJLEN
// =============================================================================

const mainStyle: React.CSSProperties = {
  paddingBlock: 'var(--dsn-space-block-6xl)',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

// =============================================================================
// META
// =============================================================================

const meta: Meta = {
  title: 'Templates/KitchenSinkPage',
  parameters: {
    layout: 'fullscreen',
    // Chromatic maakt van deze pagina geen snapshot. Zijn limiet is 25.000.000
    // pixels oppervlak, en deze story meet 1.200 x 25.335 = 30.400.200. Bij
    // 1.200px breed is 20.833px de maximale hoogte, en daar zit een pagina die
    // bewust élk component toont ruim overheen.
    //
    // Dat kost geen dekking: elk component dat hier staat heeft zijn eigen
    // stories, en die worden wél gesnapshot. Wat deze pagina uniek toont is de
    // compositie, en dat is precies het stuk dat niet in één beeld past.
    //
    // Knip de pagina niet op om Chromatic te plezieren. Hij is bedoeld om in
    // één keer doorheen te scrollen.
    chromatic: { disableSnapshot: true },
  },
};

export default meta;
type Story = StoryObj;

// =============================================================================
// STORY
// =============================================================================

export const Default: Story = {
  name: 'Kitchen Sink',
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
          <main id="main-content" tabIndex={-1} style={mainStyle}>
            <Stack space="6xl">
              {/* Intro */}
              <div>
                <Heading level={1}>Kitchen sink</Heading>
                <Paragraph>Alle componenten op een rijtje.</Paragraph>
              </div>

              {/* ActionGroup */}
              <Section
                name="ActionGroup"
                docPath="?path=/docs/components-actiongroup--docs"
              >
                <ActionGroup>
                  <Button variant="strong">Tekst</Button>
                  <Button variant="default">Tekst</Button>
                  <Button variant="subtle">Tekst</Button>
                </ActionGroup>
              </Section>

              {/* Alert */}
              <Section
                name="Alert"
                docPath="?path=/docs/components-alert--docs"
              >
                <Stack space="md">
                  <Alert variant="info" heading="Heading">
                    <Paragraph>Tekst</Paragraph>
                  </Alert>
                  <Alert variant="warning" heading="Heading">
                    <Paragraph>Tekst</Paragraph>
                  </Alert>
                  <Alert variant="negative" heading="Heading">
                    <Paragraph>Tekst</Paragraph>
                  </Alert>
                  <Alert variant="positive" heading="Heading">
                    <Paragraph>Tekst</Paragraph>
                  </Alert>
                </Stack>
              </Section>

              {/* Backdrop */}
              <Section
                name="Backdrop"
                docPath="?path=/docs/components-backdrop--docs"
              >
                <div
                  style={{
                    position: 'relative',
                    height: '200px',
                    background: 'var(--dsn-color-neutral-bg-subtle)',
                    borderRadius: '4px',
                    transform: 'translateZ(0)',
                  }}
                >
                  <div style={{ padding: '1rem' }}>
                    <Paragraph>Tekst</Paragraph>
                  </div>
                  <Backdrop />
                </div>
              </Section>

              {/* BreadcrumbNavigation */}
              <Section
                name="BreadcrumbNavigation"
                docPath="?path=/docs/components-breadcrumbnavigation--docs"
              >
                <BreadcrumbNavigation aria-label="Broodkruimelpad">
                  <BreadcrumbNavigationItem href="#">
                    Tekst
                  </BreadcrumbNavigationItem>
                  <BreadcrumbNavigationItem href="#">
                    Tekst
                  </BreadcrumbNavigationItem>
                  <BreadcrumbNavigationItem current>
                    Tekst
                  </BreadcrumbNavigationItem>
                </BreadcrumbNavigation>
              </Section>

              {/* BreakoutSection */}
              <Section
                name="BreakoutSection"
                docPath="?path=/docs/layout-components-breakoutsection--docs"
              >
                <BreakoutSection
                  style={{
                    backgroundColor: 'var(--dsn-color-accent-1-bg-subtle)',
                    padding: 'var(--dsn-space-block-xl)',
                  }}
                >
                  <Paragraph>Tekst</Paragraph>
                </BreakoutSection>
              </Section>

              {/* Button */}
              <Section
                name="Button"
                docPath="?path=/docs/components-button--docs"
              >
                <Stack space="md">
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                  >
                    <div style={rowStyle}>
                      <Button variant="strong">Tekst</Button>
                      <Button variant="default">Tekst</Button>
                      <Button variant="subtle">Tekst</Button>
                    </div>
                    <div style={rowStyle}>
                      <Button variant="strong-negative">Tekst</Button>
                      <Button variant="default-negative">Tekst</Button>
                      <Button variant="subtle-negative">Tekst</Button>
                    </div>
                    <div style={rowStyle}>
                      <Button variant="strong-positive">Tekst</Button>
                      <Button variant="default-positive">Tekst</Button>
                      <Button variant="subtle-positive">Tekst</Button>
                    </div>
                  </div>
                  <div style={rowStyle}>
                    <Button size="small">Tekst</Button>
                    <Button size="default">Tekst</Button>
                    <Button size="large">Tekst</Button>
                  </div>
                  <div style={rowStyle}>
                    <Button variant="strong" iconStart={<Icon name="check" />}>
                      Tekst
                    </Button>
                    <Button
                      variant="default"
                      iconStart={<Icon name="pencil" />}
                    >
                      Tekst
                    </Button>
                    <Button
                      variant="subtle"
                      iconStart={<Icon name="download" />}
                    >
                      Tekst
                    </Button>
                    <Button
                      variant="strong-negative"
                      iconStart={<Icon name="trash" />}
                    >
                      Tekst
                    </Button>
                  </div>
                  <div style={rowStyle}>
                    <Button
                      variant="strong"
                      iconEnd={<Icon name="arrow-right" />}
                    >
                      Tekst
                    </Button>
                    <Button
                      variant="default"
                      iconEnd={<Icon name="arrow-right" />}
                    >
                      Tekst
                    </Button>
                    <Button
                      variant="subtle"
                      iconEnd={<Icon name="chevron-down" />}
                    >
                      Tekst
                    </Button>
                  </div>
                  <div style={rowStyle}>
                    <Button
                      variant="strong"
                      iconOnly
                      iconStart={<Icon name="plus" aria-hidden />}
                    >
                      Toevoegen
                    </Button>
                    <Button
                      variant="default"
                      iconOnly
                      iconStart={<Icon name="settings" aria-hidden />}
                    >
                      Instellingen
                    </Button>
                    <Button
                      variant="subtle"
                      iconOnly
                      iconStart={<Icon name="x" aria-hidden />}
                    >
                      Sluiten
                    </Button>
                    <Button
                      variant="strong-negative"
                      iconOnly
                      iconStart={<Icon name="trash" aria-hidden />}
                    >
                      Verwijderen
                    </Button>
                  </div>
                </Stack>
              </Section>

              {/* ButtonLink */}
              <Section
                name="ButtonLink"
                docPath="?path=/docs/components-buttonlink--docs"
              >
                <div style={rowStyle}>
                  <ButtonLink href="#" variant="strong">
                    Tekst
                  </ButtonLink>
                  <ButtonLink href="#" variant="default">
                    Tekst
                  </ButtonLink>
                  <ButtonLink href="#" variant="subtle">
                    Tekst
                  </ButtonLink>
                </div>
              </Section>

              {/* Card */}
              <Section name="Card" docPath="?path=/docs/components-card--docs">
                <CardGroup>
                  <li>
                    <Card href="#">
                      <CardHeader>
                        <Image
                          src="https://picsum.photos/seed/card1/800/450"
                          alt=""
                          width={800}
                          height={450}
                          ratio="16:9"
                        />
                      </CardHeader>
                      <CardBody>
                        <CardHeading level={2}>Titel</CardHeading>
                        <Paragraph>Tekst</Paragraph>
                      </CardBody>
                      <CardFooter>
                        <Link href="#" aria-hidden tabIndex={-1}>
                          Lees meer
                        </Link>
                      </CardFooter>
                    </Card>
                  </li>
                  <li>
                    <Card href="#">
                      <CardHeader />
                      <CardBody>
                        <CardHeading level={2}>
                          Titel met een langere tekst die over meerdere regels
                          loopt
                        </CardHeading>
                        <Paragraph>Tekst</Paragraph>
                      </CardBody>
                      <CardFooter>
                        <Link href="#" aria-hidden tabIndex={-1}>
                          Lees meer
                        </Link>
                      </CardFooter>
                    </Card>
                  </li>
                  <li>
                    <Card href="#">
                      <CardBody>
                        <CardHeading level={2}>Titel</CardHeading>
                        <Paragraph>Tekst</Paragraph>
                      </CardBody>
                      <CardFooter>
                        <Link href="#" aria-hidden tabIndex={-1}>
                          Lees meer
                        </Link>
                      </CardFooter>
                    </Card>
                  </li>
                </CardGroup>
              </Section>

              {/* Checkbox */}
              <Section
                name="Checkbox"
                docPath="?path=/docs/components-checkbox--docs"
              >
                <Checkbox aria-label="Checkbox" />
              </Section>

              {/* CheckboxGroup */}
              <Section
                name="CheckboxGroup"
                docPath="?path=/docs/components-checkboxgroup--docs"
              >
                <CheckboxGroup>
                  <CheckboxOption label="Optie A" defaultChecked />
                  <CheckboxOption label="Optie B" />
                  <CheckboxOption label="Optie C" />
                </CheckboxGroup>
              </Section>

              {/* CheckboxOption */}
              <Section
                name="CheckboxOption"
                docPath="?path=/docs/components-checkboxoption--docs"
              >
                <CheckboxOption label="Optie A" />
              </Section>

              {/* Container */}
              <Section
                name="Container"
                docPath="?path=/docs/layout-components-container--docs"
              >
                <Container>Tekst</Container>
              </Section>

              {/* DateInput */}
              <Section
                name="DateInput"
                docPath="?path=/docs/components-dateinput--docs"
              >
                <DateInput />
              </Section>

              {/* DateInputGroup */}
              <Section
                name="DateInputGroup"
                docPath="?path=/docs/components-dateinputgroup--docs"
              >
                <DateInputGroupDemo />
              </Section>

              {/* Details */}
              <Section
                name="Details"
                docPath="?path=/docs/components-details--docs"
              >
                <Details summary="Tekst">
                  <Paragraph>Tekst</Paragraph>
                </Details>
              </Section>

              {/* DotBadge */}
              <Section
                name="DotBadge"
                docPath="?path=/docs/components-dotbadge--docs"
              >
                <div style={rowStyle}>
                  <span
                    style={{ position: 'relative', display: 'inline-flex' }}
                  >
                    <Button
                      variant="subtle"
                      iconOnly
                      iconStart={<Icon name="bell" aria-hidden />}
                    >
                      Notificaties
                    </Button>
                    <DotBadge variant="negative" aria-hidden />
                  </span>
                  <span
                    style={{ position: 'relative', display: 'inline-flex' }}
                  >
                    <Button
                      variant="subtle"
                      iconOnly
                      iconStart={<Icon name="bell" aria-hidden />}
                    >
                      Notificaties
                    </Button>
                    <DotBadge variant="positive" pulse aria-hidden />
                  </span>
                  <span
                    style={{ position: 'relative', display: 'inline-flex' }}
                  >
                    <Button
                      variant="subtle"
                      iconOnly
                      iconStart={<Icon name="bell" aria-hidden />}
                    >
                      Notificaties
                    </Button>
                    <DotBadge variant="warning" aria-hidden />
                  </span>
                </div>
              </Section>

              {/* Drawer */}
              <Section
                name="Drawer"
                docPath="?path=/docs/components-drawer--docs"
              >
                <DrawerDemo />
              </Section>

              {/* EmailInput */}
              <Section
                name="EmailInput"
                docPath="?path=/docs/components-emailinput--docs"
              >
                <EmailInput />
              </Section>

              {/* File */}
              <Section name="File" docPath="?path=/docs/components-file--docs">
                <File
                  fileName="document.pdf"
                  fileType="PDF"
                  fileSize="1,2 MB"
                  href="#"
                />
              </Section>

              {/* FileInput */}
              <Section
                name="FileInput"
                docPath="?path=/docs/components-fileinput--docs"
              >
                <FileInput />
              </Section>

              {/* FormField */}
              <Section
                name="FormField"
                docPath="?path=/docs/components-formfield--docs"
              >
                <FormField label="Tekst" htmlFor="ff-kitchen">
                  <TextInput id="ff-kitchen" />
                </FormField>
              </Section>

              {/* FormFieldDescription */}
              <Section
                name="FormFieldDescription"
                docPath="?path=/docs/components-formfielddescription--docs"
              >
                <FormFieldDescription>Tekst</FormFieldDescription>
              </Section>

              {/* FormFieldErrorMessage */}
              <Section
                name="FormFieldErrorMessage"
                docPath="?path=/docs/components-formfielderrormessage--docs"
              >
                <FormFieldErrorMessage>Tekst</FormFieldErrorMessage>
              </Section>

              {/* FormFieldLabel */}
              <Section
                name="FormFieldLabel"
                docPath="?path=/docs/components-formfieldlabel--docs"
              >
                <FormFieldLabel htmlFor="ffl-kitchen">Tekst</FormFieldLabel>
              </Section>

              {/* FormFieldset */}
              <Section
                name="FormFieldset"
                docPath="?path=/docs/components-formfieldset--docs"
              >
                <FormFieldset legend="Tekst">
                  <CheckboxGroup>
                    <CheckboxOption label="Optie A" defaultChecked />
                    <CheckboxOption label="Optie B" />
                    <CheckboxOption label="Optie C" />
                  </CheckboxGroup>
                </FormFieldset>
              </Section>

              {/* FormFieldStatus */}
              <Section
                name="FormFieldStatus"
                docPath="?path=/docs/components-formfieldstatus--docs"
              >
                <Stack space="sm">
                  <FormFieldStatus>Tekst</FormFieldStatus>
                  <FormFieldStatus variant="positive">Tekst</FormFieldStatus>
                  <FormFieldStatus variant="warning">Tekst</FormFieldStatus>
                </Stack>
              </Section>

              {/* Grid */}
              <Section
                name="Grid"
                docPath="?path=/docs/layout-components-grid--docs"
              >
                <Grid>
                  <GridItem colSpan={8}>
                    <Container>dsn-col-8 — Hoofdinhoud</Container>
                  </GridItem>
                  <GridItem colSpan={4}>
                    <Container>dsn-col-4 — Sidebar</Container>
                  </GridItem>
                </Grid>
              </Section>

              {/* Heading */}
              <Section
                name="Heading"
                docPath="?path=/docs/components-heading--docs"
              >
                <Stack space="sm">
                  <Heading level={1}>Tekst</Heading>
                  <Heading level={2}>Tekst</Heading>
                  <Heading level={3}>Tekst</Heading>
                  <Heading level={4}>Tekst</Heading>
                  <Heading level={5}>Tekst</Heading>
                  <Heading level={6}>Tekst</Heading>
                </Stack>
              </Section>

              {/* Hero */}
              <Section name="Hero" docPath="?path=/docs/components-hero--docs">
                <Hero aria-labelledby="hero-kitchen-heading">
                  <Stack space="lg">
                    <Heading level={3} id="hero-kitchen-heading">
                      Titel
                    </Heading>
                    <Paragraph variant="lead">Tekst</Paragraph>
                    <ActionGroup>
                      <ButtonLink href="#" variant="strong" size="large">
                        Tekst
                      </ButtonLink>
                      <ButtonLink href="#" variant="subtle" size="large">
                        Tekst
                      </ButtonLink>
                    </ActionGroup>
                  </Stack>
                </Hero>
              </Section>

              {/* Icon */}
              <Section name="Icon" docPath="?path=/docs/components-icon--docs">
                <div style={rowStyle}>
                  <Icon name="home" />
                  <Icon name="user" />
                  <Icon name="bell" />
                  <Icon name="search" />
                  <Icon name="check" />
                  <Icon name="x" />
                  <Icon name="pencil" />
                  <Icon name="trash" />
                  <Icon name="chevron-right" />
                  <Icon name="arrow-right" />
                  <Icon name="plus" />
                  <Icon name="dots-vertical" />
                </div>
              </Section>

              {/* Image */}
              <Section
                name="Image"
                docPath="?path=/docs/components-image--docs"
              >
                <Image
                  src="https://picsum.photos/seed/kitchen1/800/450"
                  alt="Tekst"
                  width={800}
                  height={450}
                  ratio="16:9"
                />
              </Section>

              {/* Link */}
              <Section name="Link" docPath="?path=/docs/components-link--docs">
                <Link href="#">Tekst</Link>
              </Section>

              {/* LinkButton */}
              <Section
                name="LinkButton"
                docPath="?path=/docs/components-linkbutton--docs"
              >
                <LinkButton onClick={() => undefined}>Tekst</LinkButton>
              </Section>

              {/* Logo */}
              <Section name="Logo" docPath="?path=/docs/components-logo--docs">
                <Logo title="Starter Kit" />
              </Section>

              {/* Menu */}
              <Section name="Menu" docPath="?path=/docs/components-menu--docs">
                <Menu orientation="vertical">
                  <MenuLink href="#" level={1} current>
                    Tekst
                  </MenuLink>
                  <MenuLink href="#" level={1}>
                    Tekst
                  </MenuLink>
                  <MenuLink href="#" level={1}>
                    Tekst
                  </MenuLink>
                </Menu>
              </Section>

              {/* MenuButton */}
              <Section
                name="MenuButton"
                docPath="?path=/docs/components-menubutton--docs"
              >
                <Menu orientation="vertical">
                  <MenuButton onClick={() => undefined}>Tekst</MenuButton>
                  <MenuButton onClick={() => undefined}>Tekst</MenuButton>
                  <MenuButton onClick={() => undefined}>Tekst</MenuButton>
                </Menu>
              </Section>

              {/* MenuLink */}
              <Section
                name="MenuLink"
                docPath="?path=/docs/components-menulink--docs"
              >
                <Menu orientation="vertical">
                  <MenuLink href="#" level={1} current>
                    Tekst
                  </MenuLink>
                  <MenuLink href="#" level={2}>
                    Tekst
                  </MenuLink>
                  <MenuLink href="#" level={3}>
                    Tekst
                  </MenuLink>
                </Menu>
              </Section>

              {/* ModalDialog */}
              <Section
                name="ModalDialog"
                docPath="?path=/docs/components-modaldialog--docs"
              >
                <ModalDialogDemo />
              </Section>

              {/* Note */}
              <Section name="Note" docPath="?path=/docs/components-note--docs">
                <Stack space="md">
                  <Note variant="neutral" heading="Heading">
                    <Paragraph>Tekst</Paragraph>
                  </Note>
                  <Note variant="info" heading="Informatie">
                    <Paragraph>Tekst</Paragraph>
                  </Note>
                  <Note variant="warning" heading="Waarschuwing">
                    <Paragraph>Tekst</Paragraph>
                  </Note>
                  <Note variant="negative" heading="Let op">
                    <Paragraph>Tekst</Paragraph>
                  </Note>
                  <Note variant="positive" heading="Tip">
                    <Paragraph>Tekst</Paragraph>
                  </Note>
                </Stack>
              </Section>

              {/* NumberBadge */}
              <Section
                name="NumberBadge"
                docPath="?path=/docs/components-numberbadge--docs"
              >
                <div style={rowStyle}>
                  <NumberBadge variant="negative" aria-hidden>
                    5
                  </NumberBadge>
                  <NumberBadge variant="positive" aria-hidden>
                    5
                  </NumberBadge>
                  <NumberBadge variant="warning" aria-hidden>
                    5
                  </NumberBadge>
                  <NumberBadge variant="info" aria-hidden>
                    5
                  </NumberBadge>
                  <NumberBadge variant="neutral" aria-hidden>
                    5
                  </NumberBadge>
                </div>
              </Section>

              {/* NumberInput */}
              <Section
                name="NumberInput"
                docPath="?path=/docs/components-numberinput--docs"
              >
                <NumberInput />
              </Section>

              {/* OptionLabel */}
              <Section
                name="OptionLabel"
                docPath="?path=/docs/components-optionlabel--docs"
              >
                <OptionLabel>Tekst</OptionLabel>
              </Section>

              {/* OrderedList */}
              <Section
                name="OrderedList"
                docPath="?path=/docs/components-orderedlist--docs"
              >
                <OrderedList>
                  <li>Tekst</li>
                  <li>Tekst</li>
                  <li>Tekst</li>
                </OrderedList>
              </Section>

              {/* Paragraph */}
              <Section
                name="Paragraph"
                docPath="?path=/docs/components-paragraph--docs"
              >
                <Stack space="sm">
                  <Paragraph>Tekst</Paragraph>
                  <Paragraph variant="lead">Tekst</Paragraph>
                  <Paragraph variant="small-print">Tekst</Paragraph>
                </Stack>
              </Section>

              {/* PasswordInput */}
              <Section
                name="PasswordInput"
                docPath="?path=/docs/components-passwordinput--docs"
              >
                <PasswordInput passwordAutocomplete="current-password" />
              </Section>

              {/* Popover */}
              <Section
                name="Popover"
                docPath="?path=/docs/components-popover--docs"
              >
                <PopoverDemo />
              </Section>

              {/* ProgressBar */}
              <Section
                name="ProgressBar"
                docPath="?path=/docs/components-progressbar--docs"
              >
                <ProgressBar label="Tekst" value={35} max={100} />
              </Section>

              {/* Radio */}
              <Section
                name="Radio"
                docPath="?path=/docs/components-radio--docs"
              >
                <Radio name="radio-kitchen-single" aria-label="Radio" />
              </Section>

              {/* RadioGroup */}
              <Section
                name="RadioGroup"
                docPath="?path=/docs/components-radiogroup--docs"
              >
                <RadioGroup>
                  <RadioOption
                    label="Optie A"
                    name="rg-kitchen"
                    defaultChecked
                  />
                  <RadioOption label="Optie B" name="rg-kitchen" />
                  <RadioOption label="Optie C" name="rg-kitchen" />
                </RadioGroup>
              </Section>

              {/* RadioOption */}
              <Section
                name="RadioOption"
                docPath="?path=/docs/components-radiooption--docs"
              >
                <RadioOption label="Optie A" name="ro-kitchen-single" />
              </Section>

              {/* SearchInput */}
              <Section
                name="SearchInput"
                docPath="?path=/docs/components-searchinput--docs"
              >
                <SearchInput />
              </Section>

              {/* Select */}
              <Section
                name="Select"
                docPath="?path=/docs/components-select--docs"
              >
                <Select>
                  <option value="">Tekst</option>
                  <option value="a">Tekst</option>
                  <option value="b">Tekst</option>
                </Select>
              </Section>

              {/* Spinner */}
              <Section
                name="Spinner"
                docPath="?path=/docs/components-spinner--docs"
              >
                <Spinner label="Tekst" />
              </Section>

              {/* Stack */}
              <Section
                name="Stack"
                docPath="?path=/docs/layout-components-stack--docs"
              >
                <Stack space="md">
                  <Paragraph>Tekst</Paragraph>
                  <Paragraph>Tekst</Paragraph>
                  <Paragraph>Tekst</Paragraph>
                </Stack>
              </Section>

              {/* StatusBadge */}
              <Section
                name="StatusBadge"
                docPath="?path=/docs/components-statusbadge--docs"
              >
                <div style={rowStyle}>
                  <StatusBadge variant="neutral">Tekst</StatusBadge>
                  <StatusBadge variant="info">Tekst</StatusBadge>
                  <StatusBadge variant="positive">Tekst</StatusBadge>
                  <StatusBadge variant="negative">Tekst</StatusBadge>
                  <StatusBadge variant="warning">Tekst</StatusBadge>
                </div>
              </Section>

              {/* SummaryList */}
              <Section
                name="SummaryList"
                docPath="?path=/docs/components-summarylist--docs"
              >
                <SummaryList>
                  <SummaryListRow>
                    <SummaryListKey>Tekst</SummaryListKey>
                    <SummaryListValue>Tekst</SummaryListValue>
                    <SummaryListActions>
                      <Link href="#" iconStart={<Icon name="pencil" />}>
                        Tekst
                      </Link>
                    </SummaryListActions>
                  </SummaryListRow>
                  <SummaryListRow>
                    <SummaryListKey>Tekst</SummaryListKey>
                    <SummaryListValue>Tekst</SummaryListValue>
                    <SummaryListActions>
                      <Link href="#" iconStart={<Icon name="pencil" />}>
                        Tekst
                      </Link>
                    </SummaryListActions>
                  </SummaryListRow>
                  <SummaryListRow>
                    <SummaryListKey>Tekst</SummaryListKey>
                    <SummaryListValue>Tekst</SummaryListValue>
                  </SummaryListRow>
                </SummaryList>
              </Section>

              {/* Table */}
              <Section
                name="Table"
                docPath="?path=/docs/components-table--docs"
              >
                <Table caption="Tekst">
                  <thead>
                    <tr>
                      <th scope="col">Tekst</th>
                      <th scope="col" className="dsn-table__cell--numeric">
                        Tekst
                      </th>
                      <th scope="col" className="dsn-table__cell--numeric">
                        Tekst
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Tekst</td>
                      <td className="dsn-table__cell--numeric">Tekst</td>
                      <td className="dsn-table__cell--numeric">Tekst</td>
                    </tr>
                    <tr>
                      <td>Tekst</td>
                      <td className="dsn-table__cell--numeric">Tekst</td>
                      <td className="dsn-table__cell--numeric">Tekst</td>
                    </tr>
                  </tbody>
                </Table>
              </Section>

              {/* TelephoneInput */}
              <Section
                name="TelephoneInput"
                docPath="?path=/docs/components-telephoneinput--docs"
              >
                <TelephoneInput />
              </Section>

              {/* TextArea */}
              <Section
                name="TextArea"
                docPath="?path=/docs/components-textarea--docs"
              >
                <TextArea />
              </Section>

              {/* TextInput */}
              <Section
                name="TextInput"
                docPath="?path=/docs/components-textinput--docs"
              >
                <TextInput />
              </Section>

              {/* TimeInput */}
              <Section
                name="TimeInput"
                docPath="?path=/docs/components-timeinput--docs"
              >
                <TimeInput />
              </Section>

              {/* UnorderedList */}
              <Section
                name="UnorderedList"
                docPath="?path=/docs/components-unorderedlist--docs"
              >
                <UnorderedList>
                  <li>Tekst</li>
                  <li>Tekst</li>
                  <li>Tekst</li>
                </UnorderedList>
              </Section>
            </Stack>
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
