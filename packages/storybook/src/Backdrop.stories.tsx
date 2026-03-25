import type { Meta, StoryObj } from '@storybook/react';
import { Backdrop } from '@dsn/components-react';
import DocsPage from './Backdrop.docs.mdx';

const meta: Meta<typeof Backdrop> = {
  title: 'Components/Backdrop',
  component: Backdrop,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const noBlur = args.blur === false ? ' dsn-backdrop--no-blur' : '';
        return `<div class="dsn-backdrop${noBlur}" aria-hidden="true"></div>`;
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    blur: { control: 'boolean' },
  },
  args: {
    blur: true,
  },
};

export default meta;
type Story = StoryObj<typeof Backdrop>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  decorators: [
    (Story) => (
      <div
        style={{
          position: 'relative',
          height: '300px',
          background: 'var(--dsn-color-neutral-bg-subtle)',
          transform: 'translateZ(0)',
        }}
      >
        <div
          style={{
            padding: '1.5rem',
            fontFamily: 'sans-serif',
            color: 'var(--dsn-color-neutral-color-document)',
          }}
        >
          <h2 style={{ margin: '0 0 0.5rem' }}>Pagina-inhoud</h2>
          <p style={{ margin: 0 }}>
            Deze inhoud staat achter de backdrop overlay.
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
};

// =============================================================================
// VARIANTEN
// =============================================================================

export const WithoutBlur: Story = {
  name: 'Without blur',
  decorators: [
    (Story) => (
      <div
        style={{
          position: 'relative',
          height: '300px',
          background: 'var(--dsn-color-neutral-bg-subtle)',
          transform: 'translateZ(0)',
        }}
      >
        <div
          style={{
            padding: '1.5rem',
            fontFamily: 'sans-serif',
            color: 'var(--dsn-color-neutral-color-document)',
          }}
        >
          <h2 style={{ margin: '0 0 0.5rem' }}>Pagina-inhoud</h2>
          <p style={{ margin: 0 }}>
            Backdrop zonder blur — fallback voor omgevingen zonder
            backdrop-filter support.
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
  args: {
    blur: false,
  },
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        padding: '1rem',
      }}
    >
      {/* Met blur */}
      <div>
        <p
          style={{
            margin: '0 0 0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--dsn-color-neutral-color-default)',
          }}
        >
          Met blur
        </p>
        <div
          style={{
            position: 'relative',
            height: '180px',
            background: 'var(--dsn-color-neutral-bg-subtle)',
            borderRadius: '4px',
            transform: 'translateZ(0)',
          }}
        >
          <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
            <strong>Pagina-inhoud</strong>
            <p style={{ margin: '0.25rem 0 0' }}>
              Achtergrondtekst die vervaagt.
            </p>
          </div>
          <div className="dsn-backdrop" aria-hidden="true" />
        </div>
      </div>

      {/* Zonder blur */}
      <div>
        <p
          style={{
            margin: '0 0 0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--dsn-color-neutral-color-default)',
          }}
        >
          Zonder blur (fallback)
        </p>
        <div
          style={{
            position: 'relative',
            height: '180px',
            background: 'var(--dsn-color-neutral-bg-subtle)',
            borderRadius: '4px',
            transform: 'translateZ(0)',
          }}
        >
          <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
            <strong>Pagina-inhoud</strong>
            <p style={{ margin: '0.25rem 0 0' }}>
              Achtergrondtekst zonder blur.
            </p>
          </div>
          <div
            className="dsn-backdrop dsn-backdrop--no-blur"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  ),
};
