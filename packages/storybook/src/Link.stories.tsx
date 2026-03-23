import type { Meta, StoryObj } from '@storybook/react';
import { Link, Icon } from '@dsn/components-react';
import type { IconName } from '@dsn/components-react/icon-registry.generated';
import DocsPage from './Link.docs.mdx';
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

const meta: Meta<typeof Link> = {
  title: 'Components/Link',
  component: Link,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const cls = [
          'dsn-link',
          args.size && args.size !== 'default' && `dsn-link--size-${args.size}`,
        ]
          .filter(Boolean)
          .join(' ');
        const attrParts: string[] = [`class="${cls}"`];
        if (!args.disabled) attrParts.push(`href="${args.href ?? '#'}"`);
        if (args.external)
          attrParts.push('target="_blank"', 'rel="noopener noreferrer"');
        if (args.disabled)
          attrParts.push('aria-disabled="true"', 'tabindex="-1"');
        if (args.current) attrParts.push('aria-current="page"');
        const text = `${args.children ?? 'Linktekst'}${args.external ? ' (opent nieuw tabblad)' : ''}`;
        return `<a ${attrParts.join(' ')}>${text}</a>`;
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'default', 'large'],
    },
    disabled: { control: 'boolean' },
    current: { control: 'boolean' },
    external: { control: 'boolean' },
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
    href: '#',
    children: TEKST,
    size: 'default',
  },
};

export default meta;
type Story = StoryObj<typeof Link>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const AllSizes: Story = {
  name: 'All sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Link href="#" size="small">
        {TEKST}
      </Link>
      <Link href="#" size="default">
        {TEKST}
      </Link>
      <Link href="#" size="large">
        {TEKST}
      </Link>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, children: TEKST },
};

export const Current: Story = {
  args: { current: true, children: TEKST },
};

export const External: Story = {
  args: { href: 'https://example.com', external: true, children: TEKST },
};

export const WithIconStart: Story = {
  name: 'With icon start',
  args: { iconStart: <Icon name="download" />, children: TEKST },
};

export const WithIconEnd: Story = {
  name: 'With icon end',
  args: { iconEnd: <Icon name="arrow-right" />, children: TEKST },
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Default</h3>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <Link href="#">{TEKST}</Link>
          <Link href="#" current>
            {TEKST} (current)
          </Link>
          <Link href="#" disabled>
            {TEKST} (disabled)
          </Link>
          <Link href="https://example.com" external>
            {TEKST} (external)
          </Link>
        </div>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Met iconen</h3>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <Link href="#" iconStart={<Icon name="download" />}>
            {TEKST}
          </Link>
          <Link href="#" iconEnd={<Icon name="arrow-right" />}>
            {TEKST}
          </Link>
        </div>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Alle maten</h3>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <Link href="#" size="small">
            {TEKST} (small)
          </Link>
          <Link href="#" size="default">
            {TEKST} (default)
          </Link>
          <Link href="#" size="large">
            {TEKST} (large)
          </Link>
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
      <Link href="#">{TEKST_AR}</Link>
      <Link href="#" iconStart={<Icon name="arrow-left" />}>
        {TEKST_AR}
      </Link>
      <Link href="#" iconEnd={<Icon name="arrow-right" />}>
        {TEKST_AR}
      </Link>
    </div>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  args: { children: VEEL_TEKST_AR },
};
