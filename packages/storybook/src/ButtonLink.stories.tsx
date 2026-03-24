import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ButtonLink, Icon } from '@dsn/components-react';
import type { IconName } from '@dsn/components-react/icon-registry.generated';
import DocsPage from './ButtonLink.docs.mdx';
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

const meta: Meta<typeof ButtonLink> = {
  title: 'Components/ButtonLink',
  component: ButtonLink,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const cls = [
          'dsn-button',
          `dsn-button--${args.variant ?? 'strong'}`,
          `dsn-button--size-${args.size ?? 'default'}`,
          args.fullWidth && 'dsn-button--full-width',
          args.iconOnly && 'dsn-button--icon-only',
          'dsn-button-link',
        ]
          .filter(Boolean)
          .join(' ');

        const href = !args.disabled ? ` href="${args.href ?? '/'}"` : '';
        const disabled = args.disabled
          ? ` aria-disabled="true" tabindex="-1"`
          : '';
        const target = args.external ? ` target="_blank"` : '';
        const rel = args.external ? ` rel="noopener noreferrer"` : '';

        const iconStart = args.iconStart
          ? `\n  <svg class="dsn-icon" aria-hidden="true"><!-- icon --></svg>`
          : '';
        const text = args.children ?? 'Knoptekst';
        const label = `\n  <span class="dsn-button__label">${text}</span>`;
        const externalText = args.external ? '\n  (opent nieuw tabblad)' : '';
        const iconEnd = args.iconEnd
          ? `\n  <svg class="dsn-icon" aria-hidden="true"><!-- icon --></svg>`
          : '';

        return `<a class="${cls}"${href}${target}${rel}${disabled}>${iconStart}${label}${externalText}${iconEnd}\n</a>`;
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
    fullWidth: { control: 'boolean' },
    iconOnly: { control: 'boolean' },
    disabled: { control: 'boolean' },
    external: { control: 'boolean' },
    href: { control: 'text' },
    iconStart: {
      control: 'select',
      options: iconOptions,
      mapping: iconOptions.reduce(
        (acc, icon) => {
          acc[icon ?? 'undefined'] = icon ? (
            <Icon name={icon} aria-hidden />
          ) : undefined;
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
          acc[icon ?? 'undefined'] = icon ? (
            <Icon name={icon} aria-hidden />
          ) : undefined;
          return acc;
        },
        {} as Record<string, React.ReactNode>
      ),
    },
  },
  args: {
    children: TEKST,
    href: '/',
    variant: 'strong',
    size: 'default',
  },
};

export default meta;
type Story = StoryObj<typeof ButtonLink>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Strong: Story = {
  args: { variant: 'strong' },
};

export const DefaultVariant: Story = {
  name: 'Default variant',
  args: { variant: 'default' },
};

export const Subtle: Story = {
  args: { variant: 'subtle' },
};

export const Small: Story = {
  args: { size: 'small' },
};

export const Large: Story = {
  args: { size: 'large' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const External: Story = {
  args: { href: 'https://example.com', external: true },
};

export const FullWidth: Story = {
  args: { fullWidth: true },
};

export const NegativeSentiment: Story = {
  name: 'Negative sentiment',
  args: { variant: 'strong-negative' },
};

export const PositiveSentiment: Story = {
  name: 'Positive sentiment',
  args: { variant: 'strong-positive' },
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
      <ButtonLink
        href="/"
        variant="strong"
        iconStart={<Icon name="check" aria-hidden />}
      >
        {TEKST}
      </ButtonLink>
      <ButtonLink
        href="/"
        variant="default"
        iconStart={<Icon name="edit" aria-hidden />}
      >
        {TEKST}
      </ButtonLink>
      <ButtonLink
        href="/"
        variant="subtle"
        iconStart={<Icon name="download" aria-hidden />}
      >
        {TEKST}
      </ButtonLink>
      <ButtonLink
        href="/"
        variant="strong-negative"
        iconStart={<Icon name="trash" aria-hidden />}
      >
        {TEKST}
      </ButtonLink>
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
      <ButtonLink
        href="/"
        variant="strong"
        iconEnd={<Icon name="arrow-right" aria-hidden />}
      >
        {TEKST}
      </ButtonLink>
      <ButtonLink
        href="/"
        variant="default"
        iconEnd={<Icon name="arrow-right" aria-hidden />}
      >
        {TEKST}
      </ButtonLink>
      <ButtonLink
        href="/"
        variant="subtle"
        iconEnd={<Icon name="chevron-down" aria-hidden />}
      >
        {TEKST}
      </ButtonLink>
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
      <ButtonLink
        href="/"
        variant="strong"
        iconStart={<Icon name="check" aria-hidden />}
        iconEnd={<Icon name="arrow-right" aria-hidden />}
      >
        {TEKST}
      </ButtonLink>
      <ButtonLink
        href="/"
        variant="default"
        iconStart={<Icon name="edit" aria-hidden />}
        iconEnd={<Icon name="chevron-down" aria-hidden />}
      >
        {TEKST}
      </ButtonLink>
    </div>
  ),
};

export const IconSizes: Story = {
  name: 'Icon sizes per button size',
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <ButtonLink
        href="/"
        size="small"
        iconStart={<Icon name="check" aria-hidden />}
      >
        {TEKST}
      </ButtonLink>
      <ButtonLink
        href="/"
        size="default"
        iconStart={<Icon name="check" aria-hidden />}
      >
        {TEKST}
      </ButtonLink>
      <ButtonLink
        href="/"
        size="large"
        iconStart={<Icon name="check" aria-hidden />}
      >
        {TEKST}
      </ButtonLink>
    </div>
  ),
};

export const IconOnly: Story = {
  name: 'Icon only',
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <ButtonLink
        href="/"
        variant="strong"
        iconOnly
        iconStart={<Icon name="plus" aria-hidden />}
      >
        Toevoegen
      </ButtonLink>
      <ButtonLink
        href="/"
        variant="default"
        iconOnly
        iconStart={<Icon name="settings" aria-hidden />}
      >
        Instellingen
      </ButtonLink>
      <ButtonLink
        href="/"
        variant="subtle"
        iconOnly
        iconStart={<Icon name="x" aria-hidden />}
      >
        Sluiten
      </ButtonLink>
      <ButtonLink
        href="/"
        variant="strong-negative"
        iconOnly
        iconStart={<Icon name="trash" aria-hidden />}
      >
        Verwijderen
      </ButtonLink>
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
        <ButtonLink href="/">{TEKST}</ButtonLink>
        <ButtonLink href="/" variant="default">
          {TEKST}
        </ButtonLink>
        <ButtonLink href="/" variant="subtle">
          {TEKST}
        </ButtonLink>
      </div>
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <ButtonLink href="/" variant="strong-negative">
          {TEKST}
        </ButtonLink>
        <ButtonLink href="/" variant="default-negative">
          {TEKST}
        </ButtonLink>
        <ButtonLink href="/" variant="subtle-negative">
          {TEKST}
        </ButtonLink>
      </div>
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <ButtonLink href="/" variant="strong-positive">
          {TEKST}
        </ButtonLink>
        <ButtonLink href="/" variant="default-positive">
          {TEKST}
        </ButtonLink>
        <ButtonLink href="/" variant="subtle-positive">
          {TEKST}
        </ButtonLink>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  name: 'All sizes',
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <ButtonLink href="/" size="small">
        {TEKST}
      </ButtonLink>
      <ButtonLink href="/">{TEKST}</ButtonLink>
      <ButtonLink href="/" size="large">
        {TEKST}
      </ButtonLink>
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
      <ButtonLink href="/">{TEKST}</ButtonLink>
      <ButtonLink href="/" disabled>
        {TEKST}
      </ButtonLink>
      <ButtonLink href="https://example.com" external>
        {TEKST}
      </ButtonLink>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <ButtonLink href="/">{TEKST_AR}</ButtonLink>
      <ButtonLink href="/" iconStart={<Icon name="arrow-right" aria-hidden />}>
        {TEKST_AR}
      </ButtonLink>
      <ButtonLink href="/" iconEnd={<Icon name="arrow-left" aria-hidden />}>
        {TEKST_AR}
      </ButtonLink>
    </div>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  args: { children: VEEL_TEKST_AR },
};
