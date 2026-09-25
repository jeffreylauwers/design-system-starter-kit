import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Card,
  CardPreHeader,
  CardHeader,
  CardBody,
  CardHeading,
  CardFooter,
  CardAffordance,
  CardGroup,
  Image,
  Paragraph,
  Link,
  StatusBadge,
  ButtonLink,
} from '@dsn-starter-kit/components-react';
import DocsPage from './Card.docs.mdx';
import {
  WEINIG_TEKST,
  VEEL_TEKST,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const PLACEHOLDER_16_9 = 'https://picsum.photos/seed/card1/800/450';

type CardStoryArgs = React.ComponentProps<typeof Card> & { showImage: boolean };

const meta: Meta<CardStoryArgs> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const href = args.href ?? '/artikel/slug';
        const preHeader =
          args.showImage !== false
            ? `\n  <div class="dsn-card__pre-header">\n    <figure class="dsn-image dsn-image--ratio-16-9" aria-hidden="true">\n      <img\n        class="dsn-image__img"\n        src="${PLACEHOLDER_16_9}"\n        alt=""\n        width="800"\n        height="450"\n        loading="lazy"\n        decoding="async"\n      />\n    </figure>\n  </div>`
            : '';
        return `<article class="dsn-card">
  <div class="dsn-card__header">
    <h2 class="dsn-card__heading">
      <a href="${href}" class="dsn-card__link">Artikeltitel</a>
    </h2>
  </div>${preHeader}
  <div class="dsn-card__body">
    <p class="dsn-paragraph">Korte beschrijving van het artikel die aanvullende context biedt.</p>
  </div>
  <div class="dsn-card__footer">
    <span class="dsn-card__affordance" aria-hidden="true">Lees meer</span>
  </div>
</article>`;
      },
    },
  },
  argTypes: {
    href: { control: 'text' },
    showImage: { control: 'boolean' },
  },
  args: {
    href: '/artikel/slug',
    showImage: true,
  },
};

export default meta;
type Story = StoryObj<CardStoryArgs>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: '22rem' }}>
      <Card href={args.href}>
        <CardHeader>
          <CardHeading level={2}>Artikeltitel</CardHeading>
        </CardHeader>
        {args.showImage && (
          <CardPreHeader>
            <Image
              src={PLACEHOLDER_16_9}
              alt=""
              width={800}
              height={450}
              ratio="16:9"
            />
          </CardPreHeader>
        )}
        <CardBody>
          <Paragraph>
            Korte beschrijving van het artikel die aanvullende context biedt.
          </Paragraph>
        </CardBody>
        <CardFooter>
          <CardAffordance>Lees meer</CardAffordance>
        </CardFooter>
      </Card>
    </div>
  ),
};

// =============================================================================
// VARIANTEN
// =============================================================================

export const WithImagePlaceholder: Story = {
  name: 'With image placeholder',
  render: () => (
    <div style={{ maxWidth: '22rem' }}>
      <Card href="/artikel/slug">
        <CardHeader>
          <CardHeading level={2}>Artikeltitel zonder afbeelding</CardHeading>
        </CardHeader>
        <CardPreHeader />
        <CardBody>
          <Paragraph>
            Wanneer <code>CardPreHeader</code> geen children krijgt, toont het
            automatisch een afbeeldingsplaceholder.
          </Paragraph>
        </CardBody>
        <CardFooter>
          <CardAffordance>Lees meer</CardAffordance>
        </CardFooter>
      </Card>
    </div>
  ),
};

export const WithoutHeader: Story = {
  name: 'Without pre-header',
  render: () => (
    <div style={{ maxWidth: '22rem' }}>
      <Card href="/artikel/slug">
        <CardHeader>
          <CardHeading level={2}>Artikeltitel zonder afbeelding</CardHeading>
        </CardHeader>
        <CardBody>
          <Paragraph>
            Zonder <code>CardPreHeader</code> toont de card alleen header, body
            en footer.
          </Paragraph>
        </CardBody>
        <CardFooter>
          <CardAffordance>Lees meer</CardAffordance>
        </CardFooter>
      </Card>
    </div>
  ),
};

export const WithStatusBadge: Story = {
  name: 'With StatusBadge',
  render: () => (
    <div style={{ maxWidth: '22rem' }}>
      <Card href="/artikel/slug">
        <CardHeader>
          <CardHeading level={2}>Artikeltitel</CardHeading>
          <StatusBadge variant="positive">Nieuw</StatusBadge>
        </CardHeader>
        <CardPreHeader>
          <Image
            src={PLACEHOLDER_16_9}
            alt=""
            width={800}
            height={450}
            ratio="16:9"
          />
        </CardPreHeader>
        <CardBody>
          <Paragraph>
            De StatusBadge staat in de header, direct na de heading, zodat hij
            bij het kopje wordt voorgelezen.
          </Paragraph>
        </CardBody>
        <CardFooter>
          <CardAffordance>Lees meer</CardAffordance>
        </CardFooter>
      </Card>
    </div>
  ),
};

export const WithButtonLink: Story = {
  name: 'With ButtonLink in footer',
  render: () => (
    <div style={{ maxWidth: '22rem' }}>
      <Card>
        <CardHeader>
          <CardHeading level={2}>Artikeltitel</CardHeading>
        </CardHeader>
        <CardPreHeader>
          <Image
            src={PLACEHOLDER_16_9}
            alt=""
            width={800}
            height={450}
            ratio="16:9"
          />
        </CardPreHeader>
        <CardBody>
          <Paragraph>
            De <code>ButtonLink</code> in de footer is hier de link van de card.
            De heading heeft daarom geen link, en de card geen <code>href</code>
            .
          </Paragraph>
        </CardBody>
        <CardFooter>
          <ButtonLink
            href="/artikel/slug"
            variant="default"
            className="dsn-card__link"
          >
            Bekijk artikel
            <span className="dsn-visually-hidden">: Artikeltitel</span>
          </ButtonLink>
        </CardFooter>
      </Card>
    </div>
  ),
};

export const WithAlternativeFooter: Story = {
  name: 'With alternative footer destination',
  render: () => (
    <div style={{ maxWidth: '22rem' }}>
      <Card href="/artikel/slug">
        <CardHeader>
          <CardHeading level={2}>Artikeltitel</CardHeading>
        </CardHeader>
        <CardPreHeader>
          <Image
            src={PLACEHOLDER_16_9}
            alt=""
            width={800}
            height={450}
            ratio="16:9"
          />
        </CardPreHeader>
        <CardBody>
          <Paragraph>
            De footer-link verwijst naar een andere bestemming dan de card-link.
            Hij staat boven de stretched link en is zelfstandig klikbaar.
          </Paragraph>
        </CardBody>
        <CardFooter>
          <Link href="/download/brochure.pdf">Download brochure</Link>
        </CardFooter>
      </Card>
    </div>
  ),
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const CardGroupStory: Story = {
  name: 'CardGroup (equal height)',
  render: () => (
    <CardGroup>
      <li>
        <Card href="/artikel/1">
          <CardHeader>
            <CardHeading level={2}>Eerste artikel</CardHeading>
          </CardHeader>
          <CardPreHeader>
            <Image
              src={PLACEHOLDER_16_9}
              alt=""
              width={800}
              height={450}
              ratio="16:9"
            />
          </CardPreHeader>
          <CardBody>
            <Paragraph>Korte beschrijving van het eerste artikel.</Paragraph>
          </CardBody>
          <CardFooter>
            <CardAffordance>Lees meer</CardAffordance>
          </CardFooter>
        </Card>
      </li>
      <li>
        <Card href="/artikel/2">
          <CardHeader>
            <CardHeading level={2}>
              Tweede artikel met een langere titel die over meerdere regels
              loopt
            </CardHeading>
          </CardHeader>
          <CardPreHeader />
          <CardBody>
            <Paragraph>
              Dit artikel heeft een langere titel en een iets langere
              beschrijving om de gelijke-hoogte uitlijning te demonstreren.
            </Paragraph>
          </CardBody>
          <CardFooter>
            <CardAffordance>Lees meer</CardAffordance>
          </CardFooter>
        </Card>
      </li>
      <li>
        <Card href="/artikel/3">
          <CardHeader>
            <CardHeading level={2}>Derde artikel</CardHeading>
          </CardHeader>
          <CardBody>
            <Paragraph>Korte beschrijving.</Paragraph>
          </CardBody>
          <CardFooter>
            <CardAffordance>Lees meer</CardAffordance>
          </CardFooter>
        </Card>
      </li>
    </CardGroup>
  ),
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  name: 'Short text',
  render: () => (
    <div style={{ maxWidth: '22rem' }}>
      <Card href="/artikel/slug">
        <CardHeader>
          <CardHeading level={2}>{WEINIG_TEKST}</CardHeading>
        </CardHeader>
        <CardPreHeader>
          <Image
            src={PLACEHOLDER_16_9}
            alt=""
            width={800}
            height={450}
            ratio="16:9"
          />
        </CardPreHeader>
        <CardBody>
          <Paragraph>{WEINIG_TEKST}</Paragraph>
        </CardBody>
        <CardFooter>
          <CardAffordance>Lees meer</CardAffordance>
        </CardFooter>
      </Card>
    </div>
  ),
};

export const LongText: Story = {
  name: 'Long text',
  render: () => (
    <div style={{ maxWidth: '22rem' }}>
      <Card href="/artikel/slug">
        <CardHeader>
          <CardHeading level={2}>
            Artikel met een langere titel die over meerdere regels loopt
          </CardHeading>
        </CardHeader>
        <CardPreHeader>
          <Image
            src={PLACEHOLDER_16_9}
            alt=""
            width={800}
            height={450}
            ratio="16:9"
          />
        </CardPreHeader>
        <CardBody>
          <Paragraph>{VEEL_TEKST}</Paragraph>
          <Paragraph>{VEEL_TEKST}</Paragraph>
        </CardBody>
        <CardFooter>
          <CardAffordance>Lees meer</CardAffordance>
        </CardFooter>
      </Card>
    </div>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  decorators: [rtlDecorator],
  render: () => (
    <div style={{ maxWidth: '22rem' }}>
      <Card href="/artikel/slug">
        <CardHeader>
          <CardHeading level={2}>عنوان المقال</CardHeading>
        </CardHeader>
        <CardPreHeader>
          <Image
            src={PLACEHOLDER_16_9}
            alt=""
            width={800}
            height={450}
            ratio="16:9"
          />
        </CardPreHeader>
        <CardBody>
          <Paragraph>وصف مختصر للمقال يوفر سياقاً إضافياً.</Paragraph>
        </CardBody>
        <CardFooter>
          <CardAffordance>اقرأ المزيد</CardAffordance>
        </CardFooter>
      </Card>
    </div>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  render: () => (
    <div style={{ maxWidth: '22rem' }}>
      <Card href="/artikel/slug">
        <CardHeader>
          <CardHeading level={2}>{VEEL_TEKST_AR}</CardHeading>
        </CardHeader>
        <CardPreHeader>
          <Image
            src={PLACEHOLDER_16_9}
            alt=""
            width={800}
            height={450}
            ratio="16:9"
          />
        </CardPreHeader>
        <CardBody>
          <Paragraph>{VEEL_TEKST_AR}</Paragraph>
        </CardBody>
        <CardFooter>
          <CardAffordance>اقرأ المزيد</CardAffordance>
        </CardFooter>
      </Card>
    </div>
  ),
};
