import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  CardHeader,
  CardBody,
  CardHeading,
  CardFooter,
  CardGroup,
  Image,
  Paragraph,
  Link,
  StatusBadge,
  ButtonLink,
} from '@dsn/components-react';
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
        const header =
          args.showImage !== false
            ? `\n  <div class="dsn-card__header">\n    <figure class="dsn-image dsn-image--ratio-16-9" aria-hidden="true">\n      <img\n        class="dsn-image__img"\n        src="${PLACEHOLDER_16_9}"\n        alt=""\n        width="800"\n        height="450"\n        loading="lazy"\n        decoding="async"\n      />\n    </figure>\n  </div>`
            : '';
        return `<article class="dsn-card">${header}
  <div class="dsn-card__body">
    <h2 class="dsn-card-heading">
      <a href="${href}" class="dsn-card-heading__link">Artikeltitel</a>
    </h2>
    <p class="dsn-paragraph">Korte beschrijving van het artikel die aanvullende context biedt.</p>
  </div>
  <div class="dsn-card__footer">
    <a href="${href}" class="dsn-link" aria-hidden="true" tabindex="-1">Lees meer</a>
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
        {args.showImage && (
          <CardHeader>
            <Image
              src={PLACEHOLDER_16_9}
              alt=""
              width={800}
              height={450}
              ratio="16:9"
            />
          </CardHeader>
        )}
        <CardBody>
          <CardHeading level={2}>Artikeltitel</CardHeading>
          <Paragraph>
            Korte beschrijving van het artikel die aanvullende context biedt.
          </Paragraph>
        </CardBody>
        <CardFooter>
          <Link href={args.href} aria-hidden tabIndex={-1}>
            Lees meer
          </Link>
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
        <CardHeader />
        <CardBody>
          <CardHeading level={2}>Artikeltitel zonder afbeelding</CardHeading>
          <Paragraph>
            Wanneer <code>CardHeader</code> geen children krijgt, toont het
            automatisch een afbeeldingsplaceholder.
          </Paragraph>
        </CardBody>
        <CardFooter>
          <Link href="/artikel/slug" aria-hidden tabIndex={-1}>
            Lees meer
          </Link>
        </CardFooter>
      </Card>
    </div>
  ),
};

export const WithoutHeader: Story = {
  name: 'Without header',
  render: () => (
    <div style={{ maxWidth: '22rem' }}>
      <Card href="/artikel/slug">
        <CardBody>
          <CardHeading level={2}>Artikeltitel zonder afbeelding</CardHeading>
          <Paragraph>
            Zonder <code>CardHeader</code> toont de card alleen body en footer.
          </Paragraph>
        </CardBody>
        <CardFooter>
          <Link href="/artikel/slug" aria-hidden tabIndex={-1}>
            Lees meer
          </Link>
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
          <Image
            src={PLACEHOLDER_16_9}
            alt=""
            width={800}
            height={450}
            ratio="16:9"
          />
        </CardHeader>
        <CardBody>
          <CardHeading level={2}>Artikeltitel</CardHeading>
          <StatusBadge variant="positive">Nieuw</StatusBadge>
          <Paragraph>
            Extra content in de body via het children slot — bijv. een
            StatusBadge.
          </Paragraph>
        </CardBody>
        <CardFooter>
          <Link href="/artikel/slug" aria-hidden tabIndex={-1}>
            Lees meer
          </Link>
        </CardFooter>
      </Card>
    </div>
  ),
};

export const WithButtonLink: Story = {
  name: 'With ButtonLink in footer',
  render: () => (
    <div style={{ maxWidth: '22rem' }}>
      <Card href="/artikel/slug">
        <CardHeader>
          <Image
            src={PLACEHOLDER_16_9}
            alt=""
            width={800}
            height={450}
            ratio="16:9"
          />
        </CardHeader>
        <CardBody>
          <CardHeading level={2}>Artikeltitel</CardHeading>
          <Paragraph>
            Footer met een <code>ButtonLink</code> in plaats van een{' '}
            <code>Link</code>.
          </Paragraph>
        </CardBody>
        <CardFooter>
          <ButtonLink
            href="/artikel/slug"
            variant="default"
            aria-hidden
            tabIndex={-1}
          >
            Bekijk artikel
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
          <Image
            src={PLACEHOLDER_16_9}
            alt=""
            width={800}
            height={450}
            ratio="16:9"
          />
        </CardHeader>
        <CardBody>
          <CardHeading level={2}>Artikeltitel</CardHeading>
          <Paragraph>
            De footer-link verwijst naar een andere bestemming dan de card-link
            — wél toegankelijk, boven de stretched link via z-index.
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
            <Image
              src={PLACEHOLDER_16_9}
              alt=""
              width={800}
              height={450}
              ratio="16:9"
            />
          </CardHeader>
          <CardBody>
            <CardHeading level={2}>Eerste artikel</CardHeading>
            <Paragraph>Korte beschrijving van het eerste artikel.</Paragraph>
          </CardBody>
          <CardFooter>
            <Link href="/artikel/1" aria-hidden tabIndex={-1}>
              Lees meer
            </Link>
          </CardFooter>
        </Card>
      </li>
      <li>
        <Card href="/artikel/2">
          <CardHeader />
          <CardBody>
            <CardHeading level={2}>
              Tweede artikel met een langere titel die over meerdere regels
              loopt
            </CardHeading>
            <Paragraph>
              Dit artikel heeft een langere titel en een iets langere
              beschrijving om de gelijke-hoogte uitlijning te demonstreren.
            </Paragraph>
          </CardBody>
          <CardFooter>
            <Link href="/artikel/2" aria-hidden tabIndex={-1}>
              Lees meer
            </Link>
          </CardFooter>
        </Card>
      </li>
      <li>
        <Card href="/artikel/3">
          <CardBody>
            <CardHeading level={2}>Derde artikel</CardHeading>
            <Paragraph>Korte beschrijving.</Paragraph>
          </CardBody>
          <CardFooter>
            <Link href="/artikel/3" aria-hidden tabIndex={-1}>
              Lees meer
            </Link>
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
          <Image
            src={PLACEHOLDER_16_9}
            alt=""
            width={800}
            height={450}
            ratio="16:9"
          />
        </CardHeader>
        <CardBody>
          <CardHeading level={2}>{WEINIG_TEKST}</CardHeading>
          <Paragraph>{WEINIG_TEKST}</Paragraph>
        </CardBody>
        <CardFooter>
          <Link href="/artikel/slug" aria-hidden tabIndex={-1}>
            Lees meer
          </Link>
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
          <Image
            src={PLACEHOLDER_16_9}
            alt=""
            width={800}
            height={450}
            ratio="16:9"
          />
        </CardHeader>
        <CardBody>
          <CardHeading level={2}>
            Artikel met een langere titel die over meerdere regels loopt
          </CardHeading>
          <Paragraph>{VEEL_TEKST}</Paragraph>
          <Paragraph>{VEEL_TEKST}</Paragraph>
        </CardBody>
        <CardFooter>
          <Link href="/artikel/slug" aria-hidden tabIndex={-1}>
            Lees meer
          </Link>
        </CardFooter>
      </Card>
    </div>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: () => (
    <div style={{ maxWidth: '22rem' }}>
      <Card href="/artikel/slug">
        <CardHeader>
          <Image
            src={PLACEHOLDER_16_9}
            alt=""
            width={800}
            height={450}
            ratio="16:9"
          />
        </CardHeader>
        <CardBody>
          <CardHeading level={2}>عنوان المقال</CardHeading>
          <Paragraph>وصف مختصر للمقال يوفر سياقاً إضافياً.</Paragraph>
        </CardBody>
        <CardFooter>
          <Link href="/artikel/slug" aria-hidden tabIndex={-1}>
            اقرأ المزيد
          </Link>
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
          <Image
            src={PLACEHOLDER_16_9}
            alt=""
            width={800}
            height={450}
            ratio="16:9"
          />
        </CardHeader>
        <CardBody>
          <CardHeading level={2}>{VEEL_TEKST_AR}</CardHeading>
          <Paragraph>{VEEL_TEKST_AR}</Paragraph>
        </CardBody>
        <CardFooter>
          <Link href="/artikel/slug" aria-hidden tabIndex={-1}>
            اقرأ المزيد
          </Link>
        </CardFooter>
      </Card>
    </div>
  ),
};
