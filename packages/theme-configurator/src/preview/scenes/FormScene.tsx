import {
  ActionGroup,
  Alert,
  Button,
  CheckboxOption,
  DateInputGroup,
  FormField,
  FormFieldset,
  Heading,
  Icon,
  Link,
  LinkButton,
  Paragraph,
  RadioGroup,
  RadioOption,
  Stack,
  TelephoneInput,
  TextInput,
  EmailInput,
} from '@dsn-starter-kit/components-react';

const EMAIL_ERROR = 'Vul een e-mailadres in, zoals naam@voorbeeld.nl';

/**
 * A form step following docs/07-form-flow-patterns.md: the form title as h1,
 * the step as h2, the instruction, one error shown in an Alert and at the
 * field, optional fields marked "(niet verplicht)", and the actions below.
 */
export function FormScene() {
  return (
    <Stack space="2xl">
      <Heading level={1}>Verhuizing doorgeven</Heading>
      <Link href="#" iconStart={<Icon name="arrow-left" />}>
        Vorige stap
      </Link>
      <Alert variant="negative" heading="Er is een foutmelding" variantLabel="">
        <Link href="#form-email">{EMAIL_ERROR}</Link>
      </Alert>
      <Heading level={2}>Uw gegevens</Heading>
      <Paragraph>
        Vul alles in. Als iets niet verplicht is, staat dat erbij.
      </Paragraph>
      <form noValidate onSubmit={(event) => event.preventDefault()}>
        <Stack space="3xl">
          <FormField label="Voornaam" htmlFor="form-first-name">
            <TextInput
              id="form-first-name"
              autoComplete="given-name"
              defaultValue="Jan"
            />
          </FormField>
          <FormField
            label="Tussenvoegsel"
            htmlFor="form-infix"
            labelSuffix="(niet verplicht)"
          >
            <TextInput id="form-infix" inlineSize="xs" />
          </FormField>
          <FormField label="Achternaam" htmlFor="form-last-name">
            <TextInput
              id="form-last-name"
              autoComplete="family-name"
              defaultValue="Jansen"
            />
          </FormField>
          <FormFieldset
            legend="Geboortedatum"
            description="Bijvoorbeeld 23 4 1985"
          >
            <DateInputGroup id="form-birth-date" autoComplete="bday" />
          </FormFieldset>
          <FormField
            label="E-mailadres"
            htmlFor="form-email"
            error={EMAIL_ERROR}
          >
            <EmailInput
              id="form-email"
              inlineSize="xl"
              invalid
              defaultValue="jan@"
            />
          </FormField>
          <FormField
            label="Telefoonnummer"
            htmlFor="form-phone"
            labelSuffix="(niet verplicht)"
          >
            <TelephoneInput id="form-phone" inlineSize="md" />
          </FormField>
          <FormFieldset legend="Hoe wilt u bericht ontvangen?">
            <RadioGroup>
              <RadioOption
                id="form-message-email"
                name="message"
                label="Per e-mail"
                defaultChecked
              />
              <RadioOption
                id="form-message-post"
                name="message"
                label="Per post"
              />
            </RadioGroup>
          </FormFieldset>
          <Stack space="md">
            <Link href="#">Bekijk de voorwaarden</Link>
            <CheckboxOption
              id="form-terms"
              name="terms"
              label="Ik ga akkoord met de voorwaarden"
            />
          </Stack>
        </Stack>
        <ActionGroup
          direction="vertical"
          style={{ marginBlockStart: 'var(--dsn-space-block-3xl)' }}
        >
          <Button variant="strong" type="submit">
            Volgende stap
          </Button>
          <LinkButton>Opslaan en later verder</LinkButton>
          <LinkButton>Stoppen met het formulier</LinkButton>
        </ActionGroup>
      </form>
    </Stack>
  );
}
