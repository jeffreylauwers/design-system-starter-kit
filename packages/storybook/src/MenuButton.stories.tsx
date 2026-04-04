import type { Meta, StoryObj } from '@storybook/react';
import { DotBadge, Icon, MenuButton } from '@dsn/components-react';
import type { IconName } from '@dsn/components-react/icon-registry.generated';
import DocsPage from './MenuButton.docs.mdx';
import {
  TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

// =============================================================================
// ICON OPTIONS (zelfde lijst als Link/Button/MenuLink stories)
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
// DOT BADGE OPTIONS
// =============================================================================

const dotBadgeOptions: Record<string, React.ReactNode> = {
  '(geen)': undefined,
  negative: <DotBadge variant="negative" />,
  positive: <DotBadge variant="positive" />,
  warning: <DotBadge variant="warning" />,
  info: <DotBadge variant="info" />,
  neutral: <DotBadge variant="neutral" />,
  'negative (pulse)': <DotBadge variant="negative" pulse />,
};

// =============================================================================
// META
// =============================================================================

const meta: Meta<typeof MenuButton> = {
  title: 'Components/MenuButton',
  component: MenuButton,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        return `<ul style="list-style: none; margin: 0; padding: 0;">\n  <li class="dsn-menu-button">\n    <button type="button" class="dsn-menu-button__button">\n      <span class="dsn-menu-button__label">${args.children ?? 'Dashboard'}</span>\n    </button>\n  </li>\n</ul>`;
      },
    },
  },
  argTypes: {
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
    dotBadge: {
      control: 'select',
      options: Object.keys(dotBadgeOptions),
      mapping: dotBadgeOptions,
    },
  },
  args: {
    children: TEKST,
  },
};

export default meta;
type Story = StoryObj<typeof MenuButton>;

// Helper: wikkelt een enkel MenuButton in een semantisch correcte <ul>
const renderSingle = (args: React.ComponentProps<typeof MenuButton>) => (
  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
    <MenuButton {...args} />
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

export const WithIconStart: Story = {
  name: 'With icon start',
  args: {
    iconStart: <Icon name="settings" aria-hidden />,
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

export const WithDotBadge: Story = {
  name: 'With DotBadge',
  args: {
    iconStart: <Icon name="bell" aria-hidden />,
    dotBadge: <DotBadge variant="negative" />,
    children: (
      <>
        Meldingen
        <span className="dsn-visually-hidden">
          , nieuwe meldingen beschikbaar
        </span>
      </>
    ),
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

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      <MenuButton>Standaard</MenuButton>
      <MenuButton iconStart={<Icon name="home" aria-hidden />}>
        Met icoon start
      </MenuButton>
      <MenuButton iconEnd={<Icon name="arrow-right" aria-hidden />}>
        Met icoon end
      </MenuButton>
      <MenuButton
        iconStart={<Icon name="bell" aria-hidden />}
        dotBadge={<DotBadge variant="negative" />}
      >
        Met DotBadge
      </MenuButton>
      <MenuButton
        iconStart={<Icon name="bell" aria-hidden />}
        dotBadge={<DotBadge variant="negative" pulse />}
      >
        Met DotBadge (pulse)
      </MenuButton>
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
      <MenuButton>{TEKST_AR}</MenuButton>
      <MenuButton iconStart={<Icon name="home" aria-hidden />}>
        {TEKST_AR}
      </MenuButton>
      <MenuButton iconEnd={<Icon name="arrow-left" aria-hidden />}>
        {TEKST_AR}
      </MenuButton>
      <MenuButton
        iconStart={<Icon name="bell" aria-hidden />}
        dotBadge={<DotBadge variant="negative" />}
      >
        {TEKST_AR}
      </MenuButton>
    </ul>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  args: { children: VEEL_TEKST_AR },
  render: renderSingle,
};
