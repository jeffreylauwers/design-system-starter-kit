import {
  Heading,
  Link,
  Note,
  OrderedList,
  Paragraph,
  PreHeading,
  Stack,
  UnorderedList,
} from '@dsn-starter-kit/components-react';

/** Running text: headings, paragraphs, lists and links. */
export function ArticleScene() {
  return (
    <article>
      <Stack space="2xl">
        <Stack space="sm">
          <PreHeading>Nieuws</PreHeading>
          <Heading level={1}>Nieuwe fietsenstalling bij het station</Heading>
        </Stack>
        <Paragraph variant="lead">
          Vanaf maandag 7 december kun je je fiets gratis stallen in de nieuwe
          stalling aan de westkant van het station.
        </Paragraph>
        <Paragraph>
          De stalling biedt plaats aan 1.200 fietsen. Er zijn aparte plekken
          voor bakfietsen en fietsen met een kinderzitje. Lees meer over{' '}
          <Link href="#">parkeren in het centrum</Link> of bekijk de{' '}
          <Link href="#">openingstijden</Link>.
        </Paragraph>
        <Heading level={2}>Wat verandert er?</Heading>
        <UnorderedList>
          <li>De oude stalling aan de oostkant sluit op 1 februari.</li>
          <li>De eerste 24 uur stallen is gratis.</li>
          <li>Er is altijd een medewerker aanwezig.</li>
        </UnorderedList>
        <Heading level={3}>Zo meld je je aan</Heading>
        <OrderedList>
          <li>Maak een account aan met je e-mailadres.</li>
          <li>Koppel je ov-chipkaart of bankpas.</li>
          <li>Check in bij de ingang van de stalling.</li>
        </OrderedList>
        <Note variant="info" heading="Goed om te weten">
          <Paragraph>
            Fietsen die langer dan 28 dagen staan, worden verwijderd.
          </Paragraph>
        </Note>
        <Heading level={4}>Vragen?</Heading>
        <Paragraph>
          Bel 14 0123 of mail naar <Link href="#">fiets@voorbeeld.nl</Link>.
        </Paragraph>
        <Paragraph variant="small-print">
          Gepubliceerd op 27 november 2026.
        </Paragraph>
      </Stack>
    </article>
  );
}
