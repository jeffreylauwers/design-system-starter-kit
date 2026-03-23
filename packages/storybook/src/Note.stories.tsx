import type { Meta, StoryObj } from '@storybook/react';
import {
  Icon,
  Note,
  Paragraph,
  Link,
  UnorderedList,
} from '@dsn/components-react';
import type { IconName } from '@dsn/components-react/icon-registry.generated';
import DocsPage from './Note.docs.mdx';
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

const meta: Meta<typeof Note> = {
  title: 'Components/Note',
  component: Note,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const variant = args.variant ?? 'neutral';
        const noHeading = !args.heading;
        const cls = [
          'dsn-note',
          variant !== 'neutral' && `dsn-note--${variant}`,
          noHeading && 'dsn-note--no-heading',
        ]
          .filter(Boolean)
          .join(' ');

        const preferredIcons: Record<string, string> = {
          neutral: 'info-circle',
          info: 'info-circle',
          positive: 'circle-check',
          negative: 'exclamation-circle',
          warning: 'alert-triangle',
        };
        const iconName =
          args.iconStart &&
          args.iconStart !== 'undefined' &&
          args.iconStart !== 'null'
            ? args.iconStart
            : args.iconStart === 'null'
              ? null
              : preferredIcons[variant];

        const icon = iconName
          ? `\n  <span class="dsn-note__icon" aria-hidden="true">\n    <svg class="dsn-icon" aria-hidden="true"><!-- ${iconName} --></svg>\n  </span>`
          : '';

        const heading = args.heading
          ? `\n  <strong class="dsn-heading dsn-heading--3 dsn-note__heading">${args.heading}</strong>`
          : '';
        const childrenText =
          typeof args.children === 'string' ? args.children : TEKST;
        const children = args.children
          ? `\n  <div class="dsn-note__content">\n    <p class="dsn-paragraph">${childrenText}</p>\n  </div>`
          : '';

        const as = args.as ?? 'div';
        return `<${as} class="${cls}">${icon}${heading}${children}\n</${as}>`;
      },
    },
  },
  argTypes: {
    as: {
      control: 'select',
      options: ['div', 'aside', 'nav', 'section'],
    },
    variant: {
      control: 'select',
      options: ['neutral', 'info', 'positive', 'negative', 'warning'],
    },
    heading: { control: 'text' },
    headingLevel: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
    },
    iconStart: {
      control: 'select',
      options: [undefined, null, ...iconOptions.filter(Boolean)],
      mapping: {
        undefined: undefined,
        null: null,
        ...iconOptions.filter(Boolean).reduce(
          (acc, icon) => {
            acc[icon as string] = (
              <Icon name={icon as IconName} size="xl" aria-hidden />
            );
            return acc;
          },
          {} as Record<string, React.ReactNode>
        ),
      },
    },
    children: { control: false },
  },
  args: {
    heading: 'Heading',
    variant: 'neutral',
    children: <Paragraph>{TEKST}</Paragraph>,
  },
};

export default meta;
type Story = StoryObj<typeof Note>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Info: Story = {
  args: {
    variant: 'info',
    heading: 'Informatie',
    iconStart: 'info-circle',
  },
};

export const Positive: Story = {
  args: {
    variant: 'positive',
    heading: 'Tip',
    iconStart: 'circle-check',
  },
};

export const Negative: Story = {
  args: {
    variant: 'negative',
    heading: 'Let op',
    iconStart: 'exclamation-circle',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    heading: 'Waarschuwing',
    iconStart: 'alert-triangle',
  },
};

export const WithoutHeading: Story = {
  name: 'Without heading',
  args: {
    heading: undefined,
  },
};

export const WithList: Story = {
  name: 'With list',
  render: () => (
    <Note variant="negative" heading="Er zijn fouten opgetreden">
      <UnorderedList>
        <li>Voornaam is verplicht</li>
        <li>E-mailadres is ongeldig</li>
        <li>Telefoonnummer ontbreekt</li>
      </UnorderedList>
    </Note>
  ),
};

export const AsNav: Story = {
  name: 'As nav (inhoudsopgave)',
  render: () => (
    <Note as="nav" variant="neutral" heading="Op deze pagina" headingLevel={2}>
      <UnorderedList>
        <li>
          <Link href="#sectie-1">Sectie 1: Inleiding</Link>
        </li>
        <li>
          <Link href="#sectie-2">Sectie 2: Aanvraag</Link>
        </li>
        <li>
          <Link href="#sectie-3">Sectie 3: Documenten</Link>
        </li>
      </UnorderedList>
    </Note>
  ),
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Note variant="neutral" heading="Neutral">
        <Paragraph>{TEKST}</Paragraph>
      </Note>
      <Note variant="info" heading="Info">
        <Paragraph>{TEKST}</Paragraph>
      </Note>
      <Note variant="positive" heading="Positive">
        <Paragraph>{TEKST}</Paragraph>
      </Note>
      <Note variant="negative" heading="Negative">
        <Paragraph>{TEKST}</Paragraph>
      </Note>
      <Note variant="warning" heading="Warning">
        <Paragraph>{TEKST}</Paragraph>
      </Note>
    </div>
  ),
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  name: 'Short text',
  render: () => (
    <Note heading="Heading">
      <Paragraph>{WEINIG_TEKST}</Paragraph>
    </Note>
  ),
};

export const LongText: Story = {
  name: 'Long text',
  render: () => (
    <Note heading="Heading bij lange inhoud">
      <Paragraph>{VEEL_TEKST}</Paragraph>
    </Note>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: () => (
    <div dir="rtl" lang="ar">
      <Note variant="info" heading={TEKST_AR}>
        <Paragraph>{TEKST_AR}</Paragraph>
      </Note>
    </div>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  render: () => (
    <div dir="rtl" lang="ar">
      <Note variant="info" heading={TEKST_AR}>
        <Paragraph>{VEEL_TEKST_AR}</Paragraph>
      </Note>
    </div>
  ),
};
