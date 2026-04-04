import type { Meta, StoryObj } from '@storybook/react';
import { Icon, MenuLink, NumberBadge } from '@dsn/components-react';
import type { IconName } from '@dsn/components-react/icon-registry.generated';
import DocsPage from './MenuLink.docs.mdx';
import {
  TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

// =============================================================================
// ICON OPTIONS (zelfde lijst als Link/Button stories)
// =============================================================================

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

const iconMapping = iconOptions.reduce(
  (acc, icon) => {
    acc[icon ?? 'undefined'] = icon ? (
      <Icon name={icon} aria-hidden />
    ) : undefined;
    return acc;
  },
  {} as Record<string, React.ReactNode>
);

// =============================================================================
// NUMBER BADGE OPTIONS
// =============================================================================

const badgeOptions: Record<string, React.ReactNode> = {
  '(geen)': undefined,
  '5 (negative)': <NumberBadge variant="negative">5</NumberBadge>,
  '12 (negative)': <NumberBadge variant="negative">12</NumberBadge>,
  '99 (neutral)': <NumberBadge variant="neutral">99</NumberBadge>,
};

// =============================================================================
// META
// =============================================================================

const meta: Meta<typeof MenuLink> = {
  title: 'Components/MenuLink',
  component: MenuLink,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const level =
          args.level && args.level > 1
            ? ` dsn-menu-link--level-${args.level}`
            : '';
        const ariaCurrent = args.current ? ' aria-current="page"' : '';
        return `<ul style="list-style: none; margin: 0; padding: 0;">\n  <li class="dsn-menu-link${level}">\n    <a class="dsn-menu-link__link" href="/pagina"${ariaCurrent}>\n      <span class="dsn-menu-link__label">${args.children ?? 'Dashboard'}</span>\n    </a>\n  </li>\n</ul>`;
      },
    },
  },
  argTypes: {
    level: {
      control: 'select',
      options: [1, 2, 3, 4],
    },
    current: { control: 'boolean' },
    subItems: { control: 'boolean' },
    expanded: { control: 'boolean' },
    children: { control: 'text' },
    iconStart: {
      control: 'select',
      options: iconOptions,
      mapping: iconMapping,
    },
    iconEnd: {
      control: 'select',
      options: iconOptions,
      mapping: iconMapping,
    },
    numberBadge: {
      control: 'select',
      options: Object.keys(badgeOptions),
      mapping: badgeOptions,
    },
  },
  args: {
    href: '/dashboard',
    children: TEKST,
    level: 1,
    current: false,
    subItems: false,
    expanded: false,
  },
};

export default meta;
type Story = StoryObj<typeof MenuLink>;

// Helper: wikkelt een enkel MenuLink in een semantisch correcte <ul>
const renderSingle = (args: React.ComponentProps<typeof MenuLink>) => (
  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
    <MenuLink {...args} />
  </ul>
);

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  render: renderSingle,
};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Current: Story = {
  name: 'Current (active page)',
  args: { current: true },
  render: renderSingle,
};

export const WithIconStart: Story = {
  name: 'With icon start',
  args: {
    iconStart: <Icon name="home" aria-hidden />,
  },
  render: renderSingle,
};

export const WithIconEnd: Story = {
  name: 'With icon end',
  args: {
    iconEnd: <Icon name="arrow-right" aria-hidden />,
  },
  render: renderSingle,
};

export const WithNumberBadge: Story = {
  name: 'With NumberBadge',
  args: {
    href: '/inbox',
    iconStart: <Icon name="mail" aria-hidden />,
    numberBadge: <NumberBadge variant="negative">5</NumberBadge>,
    children: 'Inbox',
  },
  render: renderSingle,
};

export const WithExpandButton: Story = {
  name: 'With expand button (subItems)',
  args: {
    href: '/rapporten',
    children: 'Rapporten',
    subItems: true,
    expanded: false,
  },
  render: renderSingle,
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const LongText: Story = {
  name: 'Long text',
  args: { children: VEEL_TEKST },
  render: renderSingle,
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const Levels: Story = {
  name: 'Level hierarchy (level 1–4)',
  render: () => (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      <MenuLink href="/rapporten" current>
        Rapporten
      </MenuLink>
      <MenuLink href="/rapporten/maandelijks" level={2}>
        Maandelijks
      </MenuLink>
      <MenuLink href="/rapporten/maandelijks/januari" level={3}>
        Januari
      </MenuLink>
      <MenuLink href="/rapporten/maandelijks/januari/week-1" level={4}>
        Week 1
      </MenuLink>
    </ul>
  ),
};

export const ExpandedWithSubItems: Story = {
  name: 'Expanded with sub-pages',
  render: () => (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      <MenuLink
        href="/rapporten"
        iconStart={<Icon name="file-description" aria-hidden />}
        subItems
        expanded
      >
        Rapporten
      </MenuLink>
      <MenuLink href="/rapporten/maandelijks" level={2}>
        Maandelijks
      </MenuLink>
      <MenuLink href="/rapporten/kwartaal" level={2} current>
        Kwartaal
      </MenuLink>
      <MenuLink href="/rapporten/jaarlijks" level={2}>
        Jaarlijks
      </MenuLink>
    </ul>
  ),
};

export const FullNavigation: Story = {
  name: 'Full navigation menu',
  render: () => (
    <nav aria-label="Primaire navigatie" style={{ maxWidth: '280px' }}>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        <MenuLink
          href="/dashboard"
          iconStart={<Icon name="home" aria-hidden />}
        >
          Dashboard
        </MenuLink>

        <MenuLink
          href="/inbox"
          iconStart={<Icon name="mail" aria-hidden />}
          numberBadge={<NumberBadge variant="negative">5</NumberBadge>}
        >
          Inbox
        </MenuLink>

        <MenuLink
          href="/rapporten"
          iconStart={<Icon name="file-description" aria-hidden />}
          subItems
          expanded
          current
        >
          Rapporten
        </MenuLink>

        <MenuLink href="/rapporten/maandelijks" level={2}>
          Maandelijks
        </MenuLink>

        <MenuLink href="/rapporten/kwartaal" level={2}>
          Kwartaal
        </MenuLink>

        <MenuLink
          href="/instellingen"
          iconStart={<Icon name="settings" aria-hidden />}
        >
          Instellingen
        </MenuLink>
      </ul>
    </nav>
  ),
};

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      <MenuLink href="/standaard">Standaard</MenuLink>
      <MenuLink href="/actief" current>
        Actief (current)
      </MenuLink>
      <MenuLink href="/icoon" iconStart={<Icon name="home" aria-hidden />}>
        Met icoon start
      </MenuLink>
      <MenuLink
        href="/icoon-end"
        iconEnd={<Icon name="arrow-right" aria-hidden />}
      >
        Met icoon end
      </MenuLink>
      <MenuLink
        href="/badge"
        iconStart={<Icon name="mail" aria-hidden />}
        numberBadge={<NumberBadge variant="negative">12</NumberBadge>}
      >
        Met NumberBadge
      </MenuLink>
      <MenuLink href="/uitklap" subItems>
        Met uitklapknop
      </MenuLink>
      <MenuLink href="/level-2" level={2}>
        Level 2
      </MenuLink>
      <MenuLink href="/level-3" level={3}>
        Level 3
      </MenuLink>
      <MenuLink href="/level-4" level={4}>
        Level 4
      </MenuLink>
    </ul>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: () => (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      <MenuLink href="/pagina">{TEKST_AR}</MenuLink>
      <MenuLink href="/pagina" iconStart={<Icon name="home" aria-hidden />}>
        {TEKST_AR}
      </MenuLink>
      <MenuLink href="/pagina" iconEnd={<Icon name="arrow-left" aria-hidden />}>
        {TEKST_AR}
      </MenuLink>
      <MenuLink href="/pagina" current>
        {TEKST_AR}
      </MenuLink>
      <MenuLink
        href="/pagina"
        iconStart={<Icon name="mail" aria-hidden />}
        numberBadge={<NumberBadge variant="negative">5</NumberBadge>}
      >
        {TEKST_AR}
      </MenuLink>
    </ul>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  args: { children: VEEL_TEKST_AR },
  render: renderSingle,
};
