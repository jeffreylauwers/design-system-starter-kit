import type { Meta, StoryObj } from '@storybook/react';
import { Button, DotBadge, Icon, Link } from '@dsn/components-react';
import DocsPage from './DotBadge.docs.mdx';

const meta: Meta<typeof DotBadge> = {
  title: 'Components/DotBadge',
  component: DotBadge,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const variant = args.variant ?? 'negative';
        const pulse = args.pulse ? ' dsn-dot-badge--pulse' : '';
        return `<span class="dsn-dot-badge dsn-dot-badge--${variant}${pulse}" aria-hidden="true"></span>`;
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['negative', 'positive', 'warning', 'info', 'neutral'],
    },
    pulse: { control: 'boolean' },
  },
  args: {
    variant: 'negative',
    pulse: false,
  },
};

export default meta;
type Story = StoryObj<typeof DotBadge>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  decorators: [
    (Story) => (
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          padding: '0.5rem',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

// =============================================================================
// VARIANTEN
// =============================================================================

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '2rem',
        padding: '0.5rem',
        alignItems: 'center',
      }}
    >
      {(['negative', 'positive', 'warning', 'info', 'neutral'] as const).map(
        (variant) => (
          <div
            key={variant}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'inline-block',
                padding: '0.5rem',
              }}
            >
              <DotBadge variant={variant} />
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--dsn-color-neutral-color-default)',
              }}
            >
              {variant}
            </span>
          </div>
        )
      )}
    </div>
  ),
};

export const WithPulse: Story = {
  name: 'With pulse',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '2rem',
        padding: '0.75rem',
        alignItems: 'center',
      }}
    >
      {(['negative', 'positive', 'warning', 'info', 'neutral'] as const).map(
        (variant) => (
          <div
            key={variant}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'inline-block',
                padding: '0.75rem',
              }}
            >
              <DotBadge variant={variant} pulse />
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--dsn-color-neutral-color-default)',
              }}
            >
              {variant}
            </span>
          </div>
        )
      )}
    </div>
  ),
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const WithButton: Story = {
  name: 'With Button',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      }}
    >
      {/* Icon-only button met dot */}
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <Button
          variant="subtle"
          iconOnly
          iconStart={<Icon name="mail" aria-hidden />}
        >
          Inbox
          <span className="dsn-visually-hidden">, 3 ongelezen berichten</span>
        </Button>
        <DotBadge variant="negative" />
      </div>

      {/* Icon-only button met pulserende dot */}
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <Button
          variant="subtle"
          iconOnly
          iconStart={<Icon name="bell" aria-hidden />}
        >
          Meldingen
          <span className="dsn-visually-hidden">, nieuwe meldingen</span>
        </Button>
        <DotBadge variant="negative" pulse />
      </div>

      {/* Icon-only button met positieve dot */}
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <Button
          variant="subtle"
          iconOnly
          iconStart={<Icon name="circle-check" aria-hidden />}
        >
          Status
          <span className="dsn-visually-hidden">, status bijgewerkt</span>
        </Button>
        <DotBadge variant="positive" />
      </div>
    </div>
  ),
};

export const WithLink: Story = {
  name: 'With Link',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      }}
    >
      {/* Link met dot */}
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <Link href="#">
          Meldingen
          <span className="dsn-visually-hidden"> (ongelezen)</span>
        </Link>
        <DotBadge variant="negative" />
      </div>

      {/* Link met pulserende dot */}
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <Link href="#">
          Updates
          <span className="dsn-visually-hidden">
            {' '}
            (nieuwe updates beschikbaar)
          </span>
        </Link>
        <DotBadge variant="info" pulse />
      </div>
    </div>
  ),
};
