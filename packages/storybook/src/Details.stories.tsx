import type { Meta, StoryObj } from '@storybook/react';
import { Details, Paragraph, UnorderedList } from '@dsn/components-react';
import DocsPage from './Details.docs.mdx';
import {
  TEKST,
  WEINIG_TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof Details> = {
  title: 'Components/Details',
  component: Details,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const summaryLabel = args.summary ?? 'Label';
        const open = args.defaultOpen ? ' open' : '';
        return `<details class="dsn-details"${open}>
  <summary class="dsn-details__summary">
    <svg class="dsn-icon dsn-details__icon" aria-hidden="true"><!-- chevron-down --></svg>
    <span class="dsn-details__summary-label">${summaryLabel}</span>
  </summary>
  <div class="dsn-details__content">
    <p class="dsn-paragraph">${TEKST}</p>
  </div>
</details>`;
      },
    },
  },
  argTypes: {
    summary: { control: 'text' },
    defaultOpen: { control: 'boolean' },
    onToggle: { control: false },
    children: { control: false },
  },
  args: {
    summary: 'Label',
    defaultOpen: false,
    children: <Paragraph>{TEKST}</Paragraph>,
  },
};

export default meta;
type Story = StoryObj<typeof Details>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Open: Story = {
  name: 'Open (defaultOpen)',
  args: {
    defaultOpen: true,
  },
};

export const WithList: Story = {
  name: 'With list',
  render: () => (
    <Details summary="Welke documenten heb ik nodig?">
      <UnorderedList>
        <li>Geldig identiteitsbewijs</li>
        <li>Bankafschrift van de afgelopen 3 maanden</li>
        <li>Bewijs van inschrijving</li>
      </UnorderedList>
    </Details>
  ),
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const Multiple: Story = {
  name: 'Multiple',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Details summary="Wat is de levertijd?">
        <Paragraph>Standaard levertijd is 3 tot 5 werkdagen.</Paragraph>
      </Details>
      <Details summary="Kan ik mijn bestelling annuleren?">
        <Paragraph>
          Ja, u kunt uw bestelling annuleren zolang deze nog niet verzonden is.
        </Paragraph>
      </Details>
      <Details summary="Hoe neem ik contact op?">
        <Paragraph>
          Neem contact op via het contactformulier op onze website.
        </Paragraph>
      </Details>
    </div>
  ),
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  name: 'Short text',
  args: {
    summary: WEINIG_TEKST,
    children: <Paragraph>{WEINIG_TEKST}</Paragraph>,
  },
};

export const LongText: Story = {
  name: 'Long text',
  render: () => (
    <Details summary="Uitgebreide toelichting" defaultOpen>
      <Paragraph>{VEEL_TEKST}</Paragraph>
    </Details>
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
      <Details summary={TEKST_AR}>
        <Paragraph>{TEKST_AR}</Paragraph>
      </Details>
    </div>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  render: () => (
    <div dir="rtl" lang="ar">
      <Details summary={TEKST_AR} defaultOpen>
        <Paragraph>{VEEL_TEKST_AR}</Paragraph>
      </Details>
    </div>
  ),
};
