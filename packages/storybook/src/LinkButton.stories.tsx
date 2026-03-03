import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LinkButton, Icon } from '@dsn/components-react';
import type { IconName } from '@dsn/components-react/icon-registry.generated';
import DocsPage from './LinkButton.docs.mdx';
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

const meta: Meta<typeof LinkButton> = {
  title: 'Components/LinkButton',
  component: LinkButton,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const cls = [
          'dsn-link',
          'dsn-link-button',
          args.size && `dsn-link--size-${args.size}`,
        ]
          .filter(Boolean)
          .join(' ');
        const disabled = args.disabled ? ' disabled' : '';
        const type =
          args.type && args.type !== 'button'
            ? ` type="${args.type}"`
            : ' type="button"';
        const iconStart = args.iconStart
          ? `\n  <svg class="dsn-icon" aria-hidden="true"><!-- icon --></svg>`
          : '';
        const iconEnd = args.iconEnd
          ? `\n  <svg class="dsn-icon" aria-hidden="true"><!-- icon --></svg>`
          : '';
        const text = args.children ?? 'Linktekst';
        const inner = `${iconStart}\n  ${text}${iconEnd}`;
        return `<button${type} class="${cls}"${disabled}>${inner}\n</button>`;
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'default', 'large'],
    },
    disabled: { control: 'boolean' },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
    },
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
    size: 'default',
  },
};

export default meta;
type Story = StoryObj<typeof LinkButton>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithIconStart: Story = {
  name: 'With icon start',
  args: { iconStart: <Icon name="arrow-left" aria-hidden /> },
};

export const WithIconEnd: Story = {
  name: 'With icon end',
  args: { iconEnd: <Icon name="arrow-right" aria-hidden /> },
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>States</h3>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <LinkButton>{TEKST}</LinkButton>
          <LinkButton disabled>{TEKST} (disabled)</LinkButton>
        </div>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Met iconen</h3>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <LinkButton iconStart={<Icon name="arrow-left" aria-hidden />}>
            {TEKST}
          </LinkButton>
          <LinkButton iconEnd={<Icon name="arrow-right" aria-hidden />}>
            {TEKST}
          </LinkButton>
        </div>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Alle maten</h3>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <LinkButton size="small">{TEKST} (small)</LinkButton>
          <LinkButton size="default">{TEKST} (default)</LinkButton>
          <LinkButton size="large">{TEKST} (large)</LinkButton>
        </div>
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
      <LinkButton>{TEKST_AR}</LinkButton>
      <LinkButton iconStart={<Icon name="arrow-right" aria-hidden />}>
        {TEKST_AR}
      </LinkButton>
      <LinkButton iconEnd={<Icon name="arrow-left" aria-hidden />}>
        {TEKST_AR}
      </LinkButton>
    </div>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  args: { children: VEEL_TEKST_AR },
};
