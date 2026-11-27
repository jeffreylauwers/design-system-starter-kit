import {
  ActionGroup,
  Alert,
  Button,
  ButtonLink,
  Card,
  CardBody,
  CardGroup,
  CardHeader,
  CardHeading,
  CheckboxGroup,
  CheckboxOption,
  Details,
  DotBadge,
  FormField,
  FormFieldset,
  Heading,
  Icon,
  Link,
  LinkButton,
  Note,
  NumberBadge,
  Paragraph,
  ProgressBar,
  RadioGroup,
  RadioOption,
  Select,
  Spinner,
  Stack,
  StatusBadge,
  Table,
  TextArea,
  TextInput,
} from '@dsn-starter-kit/components-react';
import type { ReactNode } from 'react';

const STATUS_VARIANTS = [
  'neutral',
  'info',
  'positive',
  'warning',
  'negative',
] as const;

const STATUS_LABELS: Record<(typeof STATUS_VARIANTS)[number], string> = {
  neutral: 'Neutraal',
  info: 'Informatie',
  positive: 'Gelukt',
  warning: 'Let op',
  negative: 'Fout',
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <Stack space="lg">
        <Heading level={2}>{title}</Heading>
        {children}
      </Stack>
    </section>
  );
}

/** Every component variant, and the states that can be shown statically. */
export function ComponentsScene() {
  return (
    <Stack space="4xl">
      <Heading level={1}>Componenten</Heading>

      <Section title="Knoppen">
        <ActionGroup>
          <Button variant="strong">Strong</Button>
          <Button variant="default">Default</Button>
          <Button variant="subtle">Subtle</Button>
        </ActionGroup>
        <ActionGroup>
          <Button variant="strong-positive">Strong positive</Button>
          <Button variant="default-positive">Default positive</Button>
          <Button variant="subtle-positive">Subtle positive</Button>
        </ActionGroup>
        <ActionGroup>
          <Button variant="strong-negative">Strong negative</Button>
          <Button variant="default-negative">Default negative</Button>
          <Button variant="subtle-negative">Subtle negative</Button>
        </ActionGroup>
        <ActionGroup>
          <Button variant="strong" size="small">
            Klein
          </Button>
          <Button variant="strong" size="large">
            Groot
          </Button>
          <Button variant="default" iconStart={<Icon name="download" />}>
            Met icoon
          </Button>
          <Button variant="default" disabled>
            Uitgeschakeld
          </Button>
          <Button variant="strong" loading>
            Bezig
          </Button>
        </ActionGroup>
        <ActionGroup>
          <ButtonLink href="#" variant="default">
            Knop als link
          </ButtonLink>
          <LinkButton>Link als knop</LinkButton>
        </ActionGroup>
      </Section>

      <Section title="Links">
        <Paragraph>
          Een <Link href="#">gewone link</Link> in lopende tekst, een{' '}
          <Link href="#" current>
            huidige pagina
          </Link>
          , een{' '}
          <Link href="https://example.org" external>
            externe link
          </Link>{' '}
          en een <Link disabled>uitgeschakelde link</Link>.
        </Paragraph>
      </Section>

      <Section title="Badges">
        <ActionGroup>
          {STATUS_VARIANTS.map((variant) => (
            <StatusBadge key={variant} variant={variant}>
              {STATUS_LABELS[variant]}
            </StatusBadge>
          ))}
        </ActionGroup>
        <ActionGroup>
          {STATUS_VARIANTS.map((variant) => (
            <NumberBadge key={variant} variant={variant}>
              {12}
            </NumberBadge>
          ))}
          {STATUS_VARIANTS.map((variant) => (
            // DotBadge sits on the corner of a button: the wrapper is its
            // positioned parent.
            <span
              key={variant}
              style={{ position: 'relative', display: 'inline-flex' }}
            >
              <Button
                variant="subtle"
                iconOnly
                iconStart={<Icon name="bell" />}
              >
                Meldingen
                <span className="dsn-visually-hidden">
                  , nieuw: {STATUS_LABELS[variant]}
                </span>
              </Button>
              <DotBadge variant={variant} />
            </span>
          ))}
        </ActionGroup>
      </Section>

      <Section title="Meldingen">
        {STATUS_VARIANTS.map((variant) => (
          <Note
            key={variant}
            variant={variant}
            heading={STATUS_LABELS[variant]}
          >
            <Paragraph>Een korte notitie met de variant {variant}.</Paragraph>
          </Note>
        ))}
        {(['info', 'positive', 'warning', 'negative'] as const).map(
          (variant) => (
            <Alert
              key={variant}
              variant={variant}
              heading={`Melding: ${STATUS_LABELS[variant]}`}
            >
              <Paragraph>Een melding die de aandacht vraagt.</Paragraph>
            </Alert>
          )
        )}
      </Section>

      <Section title="Formulierelementen">
        <FormField label="Naam" htmlFor="components-name">
          <TextInput id="components-name" defaultValue="Jan Jansen" />
        </FormField>
        <FormField
          label="E-mailadres"
          htmlFor="components-email"
          error="Vul een e-mailadres in, zoals naam@voorbeeld.nl"
        >
          <TextInput
            id="components-email"
            inlineSize="xl"
            invalid
            defaultValue="jan@"
          />
        </FormField>
        <FormField
          label="Klantnummer"
          htmlFor="components-number"
          description="Dit nummer kun je niet wijzigen."
        >
          <TextInput
            id="components-number"
            inlineSize="sm"
            readOnly
            defaultValue="483920"
          />
        </FormField>
        <FormField label="Uitgeschakeld" htmlFor="components-disabled">
          <TextInput id="components-disabled" disabled defaultValue="Tekst" />
        </FormField>
        <FormField label="Provincie" htmlFor="components-province">
          <Select id="components-province" defaultValue="ut" inlineSize="md">
            <option value="gr">Groningen</option>
            <option value="ut">Utrecht</option>
            <option value="ze">Zeeland</option>
          </Select>
        </FormField>
        <FormField label="Toelichting" htmlFor="components-note">
          <TextArea id="components-note" defaultValue="Een langere tekst." />
        </FormField>
        <FormFieldset legend="Nieuwsbrieven">
          <CheckboxGroup>
            <CheckboxOption
              id="components-news-1"
              name="news"
              label="Wekelijks overzicht"
              defaultChecked
            />
            <CheckboxOption
              id="components-news-2"
              name="news"
              label="Aankondigingen"
            />
            <CheckboxOption
              id="components-news-3"
              name="news"
              label="Niet beschikbaar"
              disabled
            />
          </CheckboxGroup>
        </FormFieldset>
        <FormFieldset legend="Contact via" error="Kies hoe we contact opnemen">
          <RadioGroup>
            <RadioOption
              id="components-contact-1"
              name="contact"
              label="E-mail"
              invalid
            />
            <RadioOption
              id="components-contact-2"
              name="contact"
              label="Telefoon"
              invalid
            />
          </RadioGroup>
        </FormFieldset>
      </Section>

      <Section title="Overige">
        <Details summary="Meer informatie">
          <Paragraph>De inhoud van een uitklapblok.</Paragraph>
        </Details>
        <ProgressBar label="Uploaden" value={64} />
        <Spinner label="Laden" />
        <Table caption="Overzicht" scrollable>
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Laptop</th>
              <td>
                <StatusBadge variant="positive">Op voorraad</StatusBadge>
              </td>
            </tr>
            <tr>
              <th scope="row">Monitor</th>
              <td>
                <StatusBadge variant="warning">Bijna op</StatusBadge>
              </td>
            </tr>
          </tbody>
        </Table>
        <CardGroup>
          <Card href="#">
            <CardHeader>
              <CardHeading level={3}>Een kaart</CardHeading>
            </CardHeader>
            <CardBody>
              <Paragraph>Korte beschrijving van de kaart.</Paragraph>
            </CardBody>
          </Card>
          <Card href="#">
            <CardHeader>
              <CardHeading level={3}>Nog een kaart</CardHeading>
            </CardHeader>
            <CardBody>
              <Paragraph>Nog een korte beschrijving.</Paragraph>
            </CardBody>
          </Card>
        </CardGroup>
      </Section>
    </Stack>
  );
}
