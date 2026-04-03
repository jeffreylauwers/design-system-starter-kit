import type { Meta, StoryObj } from '@storybook/react';
import { Button, Icon, NumberBadge } from '@dsn/components-react';
import DocsPage from './NumberBadge.docs.mdx';

const meta: Meta<typeof NumberBadge> = {
  title: 'Components/NumberBadge',
  component: NumberBadge,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const variant = args.variant ?? 'negative';
        const count =
          args.maxCount !== undefined &&
          typeof args.children === 'number' &&
          args.children > args.maxCount
            ? `${args.maxCount}+`
            : (args.children ?? '5');
        return `<span class="dsn-number-badge dsn-number-badge--${variant}" aria-hidden="true">${count}</span>`;
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['negative', 'positive', 'warning', 'info', 'neutral'],
    },
    maxCount: { control: 'number' },
    children: { control: 'number' },
  },
  args: {
    variant: 'negative',
    children: 5,
  },
};

export default meta;
type Story = StoryObj<typeof NumberBadge>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  render: (args) => <NumberBadge {...args} />,
};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Negative: Story = {
  args: { variant: 'negative', children: 5 },
  render: (args) => <NumberBadge {...args} />,
};

export const Positive: Story = {
  args: { variant: 'positive', children: 5 },
  render: (args) => <NumberBadge {...args} />,
};

export const Warning: Story = {
  args: { variant: 'warning', children: 5 },
  render: (args) => <NumberBadge {...args} />,
};

export const Info: Story = {
  args: { variant: 'info', children: 5 },
  render: (args) => <NumberBadge {...args} />,
};

export const Neutral: Story = {
  args: { variant: 'neutral', children: 5 },
  render: (args) => <NumberBadge {...args} />,
};

export const MaxCount: Story = {
  name: 'Max count (99+)',
  args: { variant: 'negative', maxCount: 99, children: 128 },
  render: (args) => (
    <Button
      variant="subtle"
      iconStart={<Icon name="mail" aria-hidden />}
      iconEnd={
        <NumberBadge variant={args.variant} maxCount={args.maxCount}>
          {args.children}
        </NumberBadge>
      }
    >
      <span>
        Inbox
        <span className="dsn-visually-hidden">, 128 ongelezen berichten</span>
      </span>
    </Button>
  ),
};

export const HighCount: Story = {
  name: 'High count (above max)',
  args: { variant: 'negative', maxCount: 99, children: 256 },
  render: (args) => (
    <Button
      variant="subtle"
      iconStart={<Icon name="bell" aria-hidden />}
      iconEnd={
        <NumberBadge variant={args.variant} maxCount={args.maxCount}>
          {args.children}
        </NumberBadge>
      }
    >
      <span>
        Meldingen
        <span className="dsn-visually-hidden">, 256 ongelezen meldingen</span>
      </span>
    </Button>
  ),
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const InButton: Story = {
  name: 'In Button',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      {/* Subtle button met klein getal */}
      <Button
        variant="subtle"
        iconStart={<Icon name="mail" aria-hidden />}
        iconEnd={<NumberBadge variant="negative">5</NumberBadge>}
      >
        Inbox
      </Button>

      {/* Subtle button met afgekapt getal */}
      <Button
        variant="subtle"
        iconStart={<Icon name="mail" aria-hidden />}
        iconEnd={
          <NumberBadge variant="negative" maxCount={99}>
            128
          </NumberBadge>
        }
      >
        <span>
          Inbox
          <span className="dsn-visually-hidden">, 128 ongelezen berichten</span>
        </span>
      </Button>

      {/* Default button */}
      <Button
        variant="default"
        iconStart={<Icon name="bell" aria-hidden />}
        iconEnd={<NumberBadge variant="info">3</NumberBadge>}
      >
        Meldingen
      </Button>

      {/* Zonder icoon */}
      <Button
        variant="subtle"
        iconEnd={<NumberBadge variant="warning">12</NumberBadge>}
      >
        Taken
      </Button>
    </div>
  ),
};

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
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
            <NumberBadge variant={variant}>5</NumberBadge>
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
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  name: 'Short text (1 cijfer)',
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {[1, 5, 9].map((n) => (
        <NumberBadge key={n} variant="negative">
          {n}
        </NumberBadge>
      ))}
    </div>
  ),
};

export const LongText: Story = {
  name: 'Long text (99+)',
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <NumberBadge variant="negative" maxCount={99}>
        128
      </NumberBadge>
      <NumberBadge variant="warning" maxCount={99}>
        1000
      </NumberBadge>
    </div>
  ),
};
