import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconList, IconListItem } from '@dsn-starter-kit/components-react';
import DocsPage from './IconList.docs.mdx';
import {
  WEINIG_TEKST,
  VEEL_TEKST,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof IconList> = {
  title: 'Components/IconList',
  component: IconList,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        // Serialiseer IconListItem-children naar HTML/CSS-markup
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const collect = (n: any) => {
          if (!n) return;
          if (Array.isArray(n)) return n.forEach(collect);
          if (n.props?.icon) items.push(n);
          else if (n.props?.children) collect(n.props.children);
        };
        collect(args.children);

        const tag = args.as === 'ol' ? 'ol' : 'ul';
        const style = args.iconColor
          ? ` style="--dsn-icon-list-icon-color: ${args.iconColor}"`
          : '';
        const itemsHtml = items
          .map(
            (item) =>
              `  <li class="dsn-icon-list__item">\n` +
              `    <svg class="dsn-icon dsn-icon-list__icon" aria-hidden="true"><!-- ${item.props.icon} --></svg>\n` +
              `    ${typeof item.props.children === 'string' ? item.props.children : 'Tekst'}\n` +
              `  </li>`
          )
          .join('\n');

        return `<${tag} class="dsn-icon-list" role="list"${style}>\n${itemsHtml}\n</${tag}>`;
      },
    },
  },
  args: {
    children: (
      <>
        <IconListItem icon="calendar-event">
          Afspraak op maandag 24 maart
        </IconListItem>
        <IconListItem icon="clock">Duurt 30 minuten</IconListItem>
        <IconListItem icon="info-circle">
          Meer informatie over de procedure
        </IconListItem>
      </>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof IconList>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Ordered: Story = {
  args: {
    as: 'ol',
    children: (
      <>
        <IconListItem icon="calendar-event">Maak een afspraak</IconListItem>
        <IconListItem icon="clock">Wacht op bevestiging</IconListItem>
        <IconListItem icon="check">
          Kom langs op het afgesproken moment
        </IconListItem>
      </>
    ),
  },
};

// =============================================================================
// KLEUREN
// =============================================================================

export const PositiveColor: Story = {
  args: {
    iconColor: 'var(--dsn-color-positive-color-default)',
    children: (
      <>
        <IconListItem icon="check">Aanvraag goedgekeurd</IconListItem>
        <IconListItem icon="check">Documenten ontvangen</IconListItem>
        <IconListItem icon="check">Betaling verwerkt</IconListItem>
      </>
    ),
  },
};

export const NegativeColor: Story = {
  args: {
    iconColor: 'var(--dsn-color-negative-color-default)',
    children: (
      <>
        <IconListItem icon="x">Aanvraag afgewezen</IconListItem>
        <IconListItem icon="x">Documenten ontbreken</IconListItem>
        <IconListItem icon="x">Betaling mislukt</IconListItem>
      </>
    ),
  },
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  args: {
    children: (
      <>
        <IconListItem icon="calendar-event">{WEINIG_TEKST}</IconListItem>
        <IconListItem icon="clock">{WEINIG_TEKST}</IconListItem>
        <IconListItem icon="info-circle">{WEINIG_TEKST}</IconListItem>
      </>
    ),
  },
};

export const LongText: Story = {
  args: {
    children: (
      <>
        <IconListItem icon="calendar-event">{VEEL_TEKST}</IconListItem>
        <IconListItem icon="clock">{VEEL_TEKST}</IconListItem>
        <IconListItem icon="info-circle">{VEEL_TEKST}</IconListItem>
      </>
    ),
  },
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  decorators: [rtlDecorator],
  args: {
    children: (
      <>
        <IconListItem icon="calendar-event">{VEEL_TEKST_AR}</IconListItem>
        <IconListItem icon="clock">{VEEL_TEKST_AR}</IconListItem>
        <IconListItem icon="info-circle">{VEEL_TEKST_AR}</IconListItem>
      </>
    ),
  },
};
