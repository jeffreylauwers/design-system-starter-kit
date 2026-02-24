import type { Meta, StoryObj } from '@storybook/react';
import { Button, Icon } from '@dsn/components-react';
import type { IconName } from '@dsn/components-react/icon-registry.generated';
import {
  TEKST,
  WEINIG_TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const iconOptions: (IconName | undefined)[] = [
  undefined,
  'alert-triangle',
  'archive',
  'arrow-down',
  'arrow-left',
  'arrow-narrow-down',
  'arrow-narrow-up',
  'arrow-right',
  'arrow-up',
  'bell',
  'calendar-event',
  'check',
  'chevron-down',
  'chevron-left',
  'chevron-right',
  'chevron-up',
  'circle-check',
  'clock',
  'dots-vertical',
  'download',
  'edit',
  'exclamation-circle',
  'external-link',
  'eye',
  'file-description',
  'folder',
  'heart-filled',
  'heart',
  'home',
  'info-circle',
  'loader',
  'mail',
  'menu',
  'message-circle',
  'minus',
  'paperclip',
  'plus',
  'search',
  'selector',
  'settings',
  'star-filled',
  'star',
  'trash',
  'upload',
  'user',
  'x',
];

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const cls = [
          'dsn-button',
          `dsn-button--${args.variant ?? 'strong'}`,
          `dsn-button--size-${args.size ?? 'default'}`,
          args.loading && 'dsn-button--loading',
          args.fullWidth && 'dsn-button--full-width',
          args.iconOnly && 'dsn-button--icon-only',
        ]
          .filter(Boolean)
          .join(' ');
        const disabled = args.disabled || args.loading ? ' disabled' : '';
        return `<button type="button" class="${cls}"${disabled}>${args.children ?? 'Tekst'}</button>`;
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'strong',
        'default',
        'subtle',
        'link',
        'strong-negative',
        'default-negative',
        'subtle-negative',
        'strong-positive',
        'default-positive',
        'subtle-positive',
      ],
    },
    size: {
      control: 'select',
      options: ['small', 'default', 'large'],
    },
    loading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    iconOnly: { control: 'boolean' },
    disabled: { control: 'boolean' },
    iconStart: {
      control: 'select',
      options: iconOptions,
      mapping: iconOptions.reduce(
        (acc, icon) => {
          acc[icon ?? 'undefined'] = icon ? <Icon name={icon} /> : undefined;
          return acc;
        },
        {} as Record<string, React.ReactNode>
      ),
    },
    iconEnd: {
      control: 'select',
      options: iconOptions,
      mapping: iconOptions.reduce(
        (acc, icon) => {
          acc[icon ?? 'undefined'] = icon ? <Icon name={icon} /> : undefined;
          return acc;
        },
        {} as Record<string, React.ReactNode>
      ),
    },
  },
  args: {
    children: TEKST,
    variant: 'strong',
    size: 'default',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Strong: Story = {
  args: { variant: 'strong', children: TEKST },
};

export const DefaultVariant: Story = {
  name: 'Default variant',
  args: { variant: 'default', children: TEKST },
};

export const Subtle: Story = {
  args: { variant: 'subtle', children: TEKST },
};

export const Link: Story = {
  args: { variant: 'link', children: TEKST },
};

export const Small: Story = {
  args: { size: 'small', children: TEKST },
};

export const Large: Story = {
  args: { size: 'large', children: TEKST },
};

export const Loading: Story = {
  args: { loading: true, children: TEKST },
};

export const LoadingWithIcon: Story = {
  name: 'Loading with icon',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Button variant="strong" loading iconStart={<Icon name="check" />}>
        {TEKST}
      </Button>
      <Button variant="default" loading iconStart={<Icon name="edit" />}>
        {TEKST}
      </Button>
      <Button variant="subtle" loading>
        {TEKST}
      </Button>
    </div>
  ),
};

export const LoadingSizes: Story = {
  name: 'Loading sizes',
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <Button size="small" loading>
        {TEKST}
      </Button>
      <Button size="default" loading>
        {TEKST}
      </Button>
      <Button size="large" loading>
        {TEKST}
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, children: TEKST },
};

export const FullWidth: Story = {
  args: { fullWidth: true, children: TEKST },
};

export const NegativeSentiment: Story = {
  name: 'Negative sentiment',
  args: { variant: 'strong-negative', children: TEKST },
};

export const PositiveSentiment: Story = {
  name: 'Positive sentiment',
  args: { variant: 'strong-positive', children: TEKST },
};

export const WithIconStart: Story = {
  name: 'With icon start',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Button variant="strong" iconStart={<Icon name="check" />}>
        {TEKST}
      </Button>
      <Button variant="default" iconStart={<Icon name="edit" />}>
        {TEKST}
      </Button>
      <Button variant="subtle" iconStart={<Icon name="download" />}>
        {TEKST}
      </Button>
      <Button variant="strong-negative" iconStart={<Icon name="trash" />}>
        {TEKST}
      </Button>
    </div>
  ),
};

export const WithIconEnd: Story = {
  name: 'With icon end',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Button variant="strong" iconEnd={<Icon name="arrow-right" />}>
        {TEKST}
      </Button>
      <Button variant="default" iconEnd={<Icon name="arrow-right" />}>
        {TEKST}
      </Button>
      <Button variant="subtle" iconEnd={<Icon name="chevron-down" />}>
        {TEKST}
      </Button>
    </div>
  ),
};

export const WithIconStartAndEnd: Story = {
  name: 'With icon start and end',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Button
        variant="strong"
        iconStart={<Icon name="check" />}
        iconEnd={<Icon name="arrow-right" />}
      >
        {TEKST}
      </Button>
      <Button
        variant="default"
        iconStart={<Icon name="edit" />}
        iconEnd={<Icon name="chevron-down" />}
      >
        {TEKST}
      </Button>
    </div>
  ),
};

export const IconSizes: Story = {
  name: 'Icon sizes per button size',
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <Button size="small" iconStart={<Icon name="check" />}>
        {TEKST}
      </Button>
      <Button size="default" iconStart={<Icon name="check" />}>
        {TEKST}
      </Button>
      <Button size="large" iconStart={<Icon name="check" />}>
        {TEKST}
      </Button>
    </div>
  ),
};

export const IconOnly: Story = {
  name: 'Icon only',
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <Button variant="strong" iconOnly aria-label="Toevoegen">
        <Icon name="plus" />
      </Button>
      <Button variant="default" iconOnly aria-label="Instellingen">
        <Icon name="settings" />
      </Button>
      <Button variant="subtle" iconOnly aria-label="Sluiten">
        <Icon name="x" />
      </Button>
      <Button variant="strong-negative" iconOnly aria-label="Verwijderen">
        <Icon name="trash" />
      </Button>
    </div>
  ),
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Button variant="strong">{TEKST}</Button>
        <Button variant="default">{TEKST}</Button>
        <Button variant="subtle">{TEKST}</Button>
        <Button variant="link">{TEKST}</Button>
      </div>
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Button variant="strong-negative">{TEKST}</Button>
        <Button variant="default-negative">{TEKST}</Button>
        <Button variant="subtle-negative">{TEKST}</Button>
      </div>
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Button variant="strong-positive">{TEKST}</Button>
        <Button variant="default-positive">{TEKST}</Button>
        <Button variant="subtle-positive">{TEKST}</Button>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  name: 'All sizes',
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <Button size="small">{TEKST}</Button>
      <Button size="default">{TEKST}</Button>
      <Button size="large">{TEKST}</Button>
    </div>
  ),
};

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Button variant="strong">{TEKST}</Button>
      <Button variant="strong" disabled>
        {TEKST}
      </Button>
      <Button variant="strong" loading>
        {TEKST}
      </Button>
    </div>
  ),
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  name: 'Short text',
  args: { children: WEINIG_TEKST },
};

export const LongText: Story = {
  name: 'Long text',
  args: { children: VEEL_TEKST },
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Button variant="strong">{TEKST_AR}</Button>
      <Button variant="default">{TEKST_AR}</Button>
      <Button variant="subtle">{TEKST_AR}</Button>
      <Button variant="strong" iconStart={<Icon name="arrow-right" />}>
        {TEKST_AR}
      </Button>
      <Button variant="strong" iconEnd={<Icon name="arrow-left" />}>
        {TEKST_AR}
      </Button>
    </div>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  args: { children: VEEL_TEKST_AR },
};

// =============================================================================
// HIGH CONTRAST
// =============================================================================
