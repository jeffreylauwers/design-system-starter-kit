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

const PLACEHOLDER_16_9 = 'https://picsum.photos/seed/card1/800/450';
const PLACEHOLDER_16_9_B = 'https://picsum.photos/seed/card2/800/450';
const PLACEHOLDER_16_9_C = 'https://picsum.photos/seed/card3/800/450';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const href = args.href ?? '/artikel/slug';
        return `<article class="dsn-card">
  <div class="dsn-card__header">
    <figure class="dsn-image dsn-image--ratio-16-9" aria-hidden="true">
      <img
        class="dsn-image__img"
        src="${PLACEHOLDER_16_9}"
        alt=""
        width="800"
        height="450"
        loading="lazy"
        decoding="async"
      />
    </figure>
  </div>
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
  },
  args: {
    href: '/artikel/slug',
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

// =============================================================================
// Default — card met afbeelding en stretched link
// =============================================================================

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: '22rem' }}>
      <Card href={args.href}>
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
            Korte beschrijving van het artikel die aanvullende context biedt.
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

// =============================================================================
// ZonderAfbeelding — placeholder actief
// =============================================================================

export const ZonderAfbeelding: Story = {
  name: 'Zonder afbeelding (placeholder)',
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

// =============================================================================
// MetStatusBadge — children slot in body
// =============================================================================

export const MetStatusBadge: Story = {
  name: 'Met StatusBadge (children slot)',
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

// =============================================================================
// MetButtonLink — ButtonLink in footer
// =============================================================================

export const MetButtonLink: Story = {
  name: 'Met ButtonLink in footer',
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

// =============================================================================
// AndereFooterBestemming — footer-link naar andere URL (wél toegankelijk)
// =============================================================================

export const AndereFooterBestemming: Story = {
  name: 'Footer naar andere bestemming',
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
// CardGroep — gelijke hoogte, footer onderaan uitlijnd
// =============================================================================

export const CardGroep: Story = {
  name: 'CardGroup (gelijke hoogte)',
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
          <CardHeader>
            <Image
              src={PLACEHOLDER_16_9_B}
              alt=""
              width={800}
              height={450}
              ratio="16:9"
            />
          </CardHeader>
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
          <CardHeader>
            <Image
              src={PLACEHOLDER_16_9_C}
              alt=""
              width={800}
              height={450}
              ratio="16:9"
            />
          </CardHeader>
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
// RTL — rechts-naar-links
// =============================================================================

export const RTL: Story = {
  name: 'RTL (rechts-naar-links)',
  render: () => (
    <div dir="rtl" style={{ maxWidth: '22rem' }}>
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
