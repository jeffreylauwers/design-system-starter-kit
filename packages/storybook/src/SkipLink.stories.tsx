import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkipLink } from '@dsn-starter-kit/components-react';
import DocsPage from './SkipLink.docs.mdx';
import { rtlDecorator } from './story-helpers';

const meta: Meta<typeof SkipLink> = {
  title: 'Components/SkipLink',
  component: SkipLink,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        return `<a href="${args.href ?? '#main-content'}" class="dsn-skip-link">${args.children ?? 'Ga direct naar de hoofdinhoud'}</a>`;
      },
    },
  },
  argTypes: {
    href: { control: 'text' },
    children: { control: 'text' },
  },
  args: {
    href: '#main-content',
    children: 'Ga direct naar de hoofdinhoud',
  },
};

export default meta;
type Story = StoryObj<typeof SkipLink>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// ALLE STATES
// =============================================================================

/**
 * De skip-link is standaard onzichtbaar. Tab naar de link om de zichtbare focus-staat te zien.
 * In deze story worden beide staten naast elkaar getoond voor documentatiedoeleinden.
 */
export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>
          Verborgen staat (standaard)
        </h3>
        <p
          style={{
            fontSize: '0.875rem',
            color: '#666',
            marginBlockEnd: '0.5rem',
          }}
        >
          De skip-link is aanwezig in de DOM maar onzichtbaar — Tab naar de link
          om hem te zien.
        </p>
        <SkipLink href="#main-content">Ga direct naar de hoofdinhoud</SkipLink>
        <span style={{ fontSize: '0.875rem', fontStyle: 'italic' }}>
          (link is hier onzichtbaar aanwezig)
        </span>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>
          Zichtbare staat (bij :focus-visible)
        </h3>
        <p
          style={{
            fontSize: '0.875rem',
            color: '#666',
            marginBlockEnd: '0.5rem',
          }}
        >
          Ter illustratie: zo ziet de skip-link eruit wanneer de gebruiker er
          Tab op heeft gedrukt.
        </p>
        <a
          href="#main-content"
          className="dsn-skip-link"
          style={{
            position: 'static',
            clipPath: 'none',
            overflow: 'visible',
            backgroundColor: 'var(--dsn-focus-background-color)',
            color: 'var(--dsn-focus-color)',
            outline:
              'var(--dsn-focus-outline-width) var(--dsn-focus-outline-style) var(--dsn-focus-outline-color)',
            outlineOffset: 'var(--dsn-focus-outline-offset)',
            paddingBlock: 'var(--dsn-skip-link-padding-block)',
            paddingInline: 'var(--dsn-skip-link-padding-inline)',
            borderRadius: 'var(--dsn-skip-link-border-radius)',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Ga direct naar de hoofdinhoud
        </a>
      </div>
    </div>
  ),
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  name: 'Short text',
  args: { children: 'Sla over' },
};

export const LongText: Story = {
  name: 'Long text',
  args: {
    children:
      'Sla de hoofdnavigatie, zoekbalk en breadcrumbs over en ga direct naar de hoofdinhoud van de pagina',
  },
};

// =============================================================================
// MEERDERE SKIP-LINKS
// =============================================================================

export const MultipleSkipLinks: Story = {
  name: 'Multiple skip links',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <p
        style={{
          fontSize: '0.875rem',
          color: '#666',
          marginBlockEnd: '0.5rem',
        }}
      >
        Tab om de skip-links in volgorde te activeren.
      </p>
      <SkipLink href="#search">Ga direct naar zoeken</SkipLink>
      <SkipLink href="#main-content">Ga direct naar de hoofdinhoud</SkipLink>
    </div>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  decorators: [rtlDecorator],
  args: { children: 'انتقل مباشرة إلى المحتوى الرئيسي' },
};
