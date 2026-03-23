import type { Meta, StoryObj } from '@storybook/react';
import { Image } from '@dsn/components-react';
import DocsPage from './Image.docs.mdx';

const PLACEHOLDER_SRC = 'https://picsum.photos/800/600';
const PLACEHOLDER_WIDE = 'https://picsum.photos/1600/900';
const PLACEHOLDER_SQUARE = 'https://picsum.photos/600/600';
const PLACEHOLDER_CONTAIN = 'https://picsum.photos/200/150';

const meta: Meta<typeof Image> = {
  title: 'Components/Image',
  component: Image,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const ratioClass = args.ratio
          ? ` dsn-image--ratio-${args.ratio.replace(':', '-')}`
          : '';
        const containClass =
          args.objectFit === 'contain' ? ' dsn-image--object-fit-contain' : '';
        const ariaHidden = args.alt === '' ? ' aria-hidden="true"' : '';
        const loading = args.priority ? 'eager' : 'lazy';
        const priority = args.priority ? '\n    fetchpriority="high"' : '';
        const caption = args.caption
          ? `\n  <figcaption class="dsn-image__caption">${args.caption}</figcaption>`
          : '';
        return `<figure class="dsn-image${ratioClass}${containClass}"${ariaHidden}>
  <img
    class="dsn-image__img"
    src="${args.src ?? PLACEHOLDER_SRC}"
    alt="${args.alt ?? 'Beschrijving van de afbeelding'}"
    width="${args.width ?? 800}"
    height="${args.height ?? 600}"
    loading="${loading}"${priority}
    decoding="async"
  />${caption}
</figure>`;
      },
    },
  },
  argTypes: {
    src: { control: 'text' },
    alt: { control: 'text' },
    width: { control: 'number' },
    height: { control: 'number' },
    ratio: {
      control: 'select',
      options: [undefined, '16:9', '4:3', '1:1'],
    },
    objectFit: {
      control: 'radio',
      options: ['cover', 'contain'],
    },
    priority: { control: 'boolean' },
    caption: { control: 'text' },
    srcSet: { control: 'text' },
    sizes: { control: 'text' },
  },
  args: {
    src: PLACEHOLDER_SRC,
    alt: 'Beschrijving van de afbeelding',
    width: 800,
    height: 600,
    priority: false,
    objectFit: 'cover',
  },
};

export default meta;
type Story = StoryObj<typeof Image>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const WithRatio: Story = {
  name: 'With ratio',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxWidth: '640px',
      }}
    >
      <div>
        <p
          style={{
            marginBottom: '0.5rem',
            fontFamily: 'sans-serif',
            fontSize: '0.875rem',
            color: '#666',
          }}
        >
          16:9 (video, hero)
        </p>
        <Image
          src={PLACEHOLDER_WIDE}
          alt="16:9 afbeelding"
          width={1600}
          height={900}
          ratio="16:9"
        />
      </div>
      <div>
        <p
          style={{
            marginBottom: '0.5rem',
            fontFamily: 'sans-serif',
            fontSize: '0.875rem',
            color: '#666',
          }}
        >
          4:3 (klassieke foto)
        </p>
        <Image
          src={PLACEHOLDER_SRC}
          alt="4:3 afbeelding"
          width={800}
          height={600}
          ratio="4:3"
        />
      </div>
      <div>
        <p
          style={{
            marginBottom: '0.5rem',
            fontFamily: 'sans-serif',
            fontSize: '0.875rem',
            color: '#666',
          }}
        >
          1:1 (vierkant, avatar)
        </p>
        <Image
          src={PLACEHOLDER_SQUARE}
          alt="1:1 afbeelding"
          width={600}
          height={600}
          ratio="1:1"
        />
      </div>
    </div>
  ),
};

export const Priority: Story = {
  name: 'Priority (LCP / hero)',
  args: {
    src: PLACEHOLDER_WIDE,
    alt: 'Hero afbeelding van de pagina',
    width: 1600,
    height: 900,
    ratio: '16:9',
    priority: true,
  },
};

export const WithCaption: Story = {
  name: 'With caption',
  args: {
    caption: 'Bijschrift bij de afbeelding — extra context voor de lezer.',
  },
};

export const Decorative: Story = {
  name: 'Decorative (alt="")',
  args: {
    alt: '',
  },
};

export const ObjectFitContain: Story = {
  name: 'Object-fit: contain',
  args: {
    src: PLACEHOLDER_CONTAIN,
    alt: 'Logo zonder bijsnijden',
    width: 200,
    height: 150,
    ratio: '16:9',
    objectFit: 'contain',
  },
};

export const WithSrcSet: Story = {
  name: 'With srcSet (responsief)',
  args: {
    src: PLACEHOLDER_SRC,
    alt: 'Responsieve afbeelding',
    width: 800,
    height: 600,
    srcSet: `${PLACEHOLDER_SRC.replace('800/600', '400/300')} 400w, ${PLACEHOLDER_SRC} 800w`,
    sizes: '(max-width: 768px) 100vw, 50vw',
  },
};
