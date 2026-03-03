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

export const DefaultVariant: Story = {
  name: 'Default variant',
  args: { variant: 'default' },
};

export const Subtle: Story = {
  args: { variant: 'subtle' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const External: Story = {
  args: { href: 'https://example.com', external: true },
};

export const WithIconStart: Story = {
  name: 'With icon start',
  args: { iconStart: <Icon name="arrow-left" aria-hidden /> },
};

export const WithIconEnd: Story = {
  name: 'With icon end',
  args: { iconEnd: <Icon name="arrow-right" aria-hidden /> },
};

export const IconOnly: Story = {
  name: 'Icon only',
  args: {
    iconOnly: true,
    iconStart: <Icon name="download" aria-hidden />,
    children: 'Download',
  },
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
        <ButtonLink href="/">{TEKST} (strong)</ButtonLink>
        <ButtonLink href="/" variant="default">
          {TEKST} (default)
        </ButtonLink>
        <ButtonLink href="/" variant="subtle">
          {TEKST} (subtle)
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
          {TEKST} (strong-negative)
        </ButtonLink>
        <ButtonLink href="/" variant="default-negative">
          {TEKST} (default-negative)
        </ButtonLink>
        <ButtonLink href="/" variant="subtle-negative">
          {TEKST} (subtle-negative)
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
          {TEKST} (strong-positive)
        </ButtonLink>
        <ButtonLink href="/" variant="default-positive">
          {TEKST} (default-positive)
        </ButtonLink>
        <ButtonLink href="/" variant="subtle-positive">
          {TEKST} (subtle-positive)
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
        <ButtonLink href="/" size="small">
          {TEKST} (small)
        </ButtonLink>
        <ButtonLink href="/">{TEKST} (default)</ButtonLink>
        <ButtonLink href="/" size="large">
          {TEKST} (large)
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
        <ButtonLink href="/" disabled>
          {TEKST} (disabled)
        </ButtonLink>
        <ButtonLink href="https://example.com" external>
          {TEKST} (external)
        </ButtonLink>
      </div>
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
