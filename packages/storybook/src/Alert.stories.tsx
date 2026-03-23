import type { Meta, StoryObj } from '@storybook/react';
import { Icon, Alert, Paragraph, UnorderedList } from '@dsn/components-react';
import type { IconName } from '@dsn/components-react/icon-registry.generated';
import DocsPage from './Alert.docs.mdx';
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

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const variant = args.variant ?? 'info';
        const cls = [
          'dsn-alert',
          variant !== 'info' && `dsn-alert--${variant}`,
          args.iconStart === 'null' && 'dsn-alert--no-icon',
        ]
          .filter(Boolean)
          .join(' ');

        const preferredIcons: Record<string, string> = {
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
          ? `\n  <span class="dsn-alert__icon" aria-hidden="true">\n    <svg class="dsn-icon" aria-hidden="true"><!-- ${iconName} --></svg>\n  </span>`
          : '';

        const heading = args.heading ?? 'Heading';
        const childrenText =
          typeof args.children === 'string' ? args.children : TEKST;
        const children = args.children
          ? `\n  <div class="dsn-alert__content">\n    <p class="dsn-paragraph">${childrenText}</p>\n  </div>`
          : '';

        return `<div class="${cls}" role="alert">${icon}\n  <strong class="dsn-alert__heading dsn-heading dsn-heading--3">${heading}</strong>${children}\n</div>`;
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'positive', 'negative', 'warning'],
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
    variant: 'info',
    children: <Paragraph>{TEKST}</Paragraph>,
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Positive: Story = {
  args: {
    variant: 'positive',
    heading: 'Gelukt',
    iconStart: 'circle-check',
  },
};

export const Negative: Story = {
  args: {
    variant: 'negative',
    heading: 'Er is een fout opgetreden',
    iconStart: 'exclamation-circle',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    heading: 'Let op',
    iconStart: 'alert-triangle',
  },
};

export const NoIcon: Story = {
  name: 'No icon',
  args: {
    iconStart: null,
  },
};

export const WithList: Story = {
  name: 'With list (validation)',
  render: () => (
    <Alert
      variant="negative"
      heading="Er zijn fouten opgetreden. Controleer de volgende velden:"
    >
      <UnorderedList>
        <li>Voornaam is verplicht</li>
        <li>E-mailadres is ongeldig</li>
        <li>Telefoonnummer ontbreekt</li>
      </UnorderedList>
    </Alert>
  ),
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Alert variant="info" heading="Informatief bericht">
        <Paragraph>{TEKST}</Paragraph>
      </Alert>
      <Alert variant="positive" heading="Gelukt">
        <Paragraph>{TEKST}</Paragraph>
      </Alert>
      <Alert variant="negative" heading="Er is een fout opgetreden">
        <Paragraph>{TEKST}</Paragraph>
      </Alert>
      <Alert variant="warning" heading="Let op">
        <Paragraph>{TEKST}</Paragraph>
      </Alert>
    </div>
  ),
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  name: 'Short text',
  render: () => (
    <Alert heading="Heading">
      <Paragraph>{WEINIG_TEKST}</Paragraph>
    </Alert>
  ),
};

export const LongText: Story = {
  name: 'Long text',
  render: () => (
    <Alert heading="Heading bij lange inhoud">
      <Paragraph>{VEEL_TEKST}</Paragraph>
    </Alert>
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
      <Alert variant="info" heading={TEKST_AR}>
        <Paragraph>{TEKST_AR}</Paragraph>
      </Alert>
    </div>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  render: () => (
    <div dir="rtl" lang="ar">
      <Alert variant="info" heading={TEKST_AR}>
        <Paragraph>{VEEL_TEKST_AR}</Paragraph>
      </Alert>
    </div>
  ),
};
