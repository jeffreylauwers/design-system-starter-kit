import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from '@dsn-starter-kit/components-react';
import DocsPage from './Spinner.docs.mdx';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const large = args.size === 'large' ? ' dsn-spinner--large' : '';
        const labelClass = args.hideLabel
          ? ' dsn-spinner__label dsn-visually-hidden'
          : ' dsn-spinner__label';
        const label = args.label ?? 'Laden...';
        return `<div class="dsn-spinner${large}" role="status">
  <svg class="dsn-spinner__circle" viewBox="0 0 24 24" aria-hidden="true">
    <circle class="dsn-spinner__track" cx="12" cy="12" r="10" />
    <circle class="dsn-spinner__arc" cx="12" cy="12" r="10" />
  </svg>
  <span class="${labelClass}">${label}</span>
</div>`;
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'large'],
    },
    hideLabel: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    label: 'Laden...',
    size: 'default',
    hideLabel: false,
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// GROOTTEN
// =============================================================================

export const Large: Story = {
  args: {
    size: 'large',
    label: 'Pagina wordt geladen',
  },
};

export const AllSizes: Story = {
  name: 'All sizes',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '3rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      {(['default', 'large'] as const).map((size) => (
        <div
          key={size}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <Spinner size={size} label="Laden..." />
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--dsn-color-neutral-color-default)',
            }}
          >
            {size}
          </span>
        </div>
      ))}
    </div>
  ),
};

// =============================================================================
// LABEL VARIANTEN
// =============================================================================

export const ReducedMotion: Story = {
  name: 'Reduced motion',
  decorators: [
    (Story) => (
      <>
        <style>{`
          .dsn-spinner-reduced-motion-demo .dsn-spinner__circle {
            animation: dsn-spinner-pulse var(--dsn-spinner-duration) ease-in-out infinite alternate !important;
          }
        `}</style>
        <div className="dsn-spinner-reduced-motion-demo">
          <Story />
        </div>
      </>
    ),
  ],
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '3rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Spinner label="Laden..." />
      <Spinner size="large" label="Pagina wordt geladen" />
    </div>
  ),
};

export const HiddenLabel: Story = {
  name: 'Hidden label',
  args: {
    hideLabel: true,
    label: 'Laden...',
  },
};

// =============================================================================
// GEBRUIK
// =============================================================================

export const InlineUse: Story = {
  name: 'Inline gebruik',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Spinner label="Zoekresultaten laden" hideLabel />
        <span>Zoekresultaten worden geladen...</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Spinner label="Opslaan" />
      </div>
    </div>
  ),
};

export const PageLoading: Story = {
  name: 'Pagina laden',
  render: () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '4rem',
      }}
    >
      <Spinner size="large" label="Pagina wordt geladen" />
    </div>
  ),
};
