import type { Meta, StoryObj } from '@storybook/react';
import { Paragraph } from '@dsn/components-react';
import DocsPage from './Paragraph.docs.mdx';
import {
  TEKST,
  WEINIG_TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof Paragraph> = {
  title: 'Components/Paragraph',
  component: Paragraph,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const variant = args.variant ?? 'default';
        return `<p class="dsn-paragraph dsn-paragraph--${variant}">${args.children ?? 'Tekst'}</p>`;
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'lead', 'small-print'],
    },
  },
  args: {
    variant: 'default',
    children: TEKST,
  },
};

export default meta;
type Story = StoryObj<typeof Paragraph>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Lead</h3>
        <Paragraph variant="lead">{TEKST}</Paragraph>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Default</h3>
        <Paragraph variant="default">{TEKST}</Paragraph>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Small print</h3>
        <Paragraph variant="small-print">{TEKST}</Paragraph>
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

export const LongTextAllVariants: Story = {
  name: 'Long text — all variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Lead</h3>
        <Paragraph variant="lead">{VEEL_TEKST}</Paragraph>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Default</h3>
        <Paragraph variant="default">{VEEL_TEKST}</Paragraph>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Small print</h3>
        <Paragraph variant="small-print">{VEEL_TEKST}</Paragraph>
      </div>
    </div>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  args: { children: TEKST_AR },
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Paragraph variant="lead">{VEEL_TEKST_AR}</Paragraph>
      <Paragraph variant="default">{VEEL_TEKST_AR}</Paragraph>
      <Paragraph variant="small-print">{VEEL_TEKST_AR}</Paragraph>
    </div>
  ),
};

// =============================================================================
// HIGH CONTRAST
// =============================================================================
