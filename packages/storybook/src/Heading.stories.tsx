import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from '@dsn/components-react';
import DocsPage from './Heading.docs.mdx';
import {
  TEKST,
  WEINIG_TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof Heading> = {
  title: 'Components/Heading',
  component: Heading,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const level = args.level ?? 2;
        const appearance = args.appearance ?? `heading-${level}`;
        return `<h${level} class="dsn-heading dsn-heading--${appearance}">${args.children ?? 'Tekst'}</h${level}>`;
      },
    },
  },
  argTypes: {
    level: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
    },
    appearance: {
      control: 'select',
      options: [
        'heading-1',
        'heading-2',
        'heading-3',
        'heading-4',
        'heading-5',
        'heading-6',
      ],
    },
  },
  args: {
    level: 2,
    children: TEKST,
  },
};

export default meta;
type Story = StoryObj<typeof Heading>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const AllLevels: Story = {
  name: 'All levels',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Heading level={1}>{TEKST}</Heading>
      <Heading level={2}>{TEKST}</Heading>
      <Heading level={3}>{TEKST}</Heading>
      <Heading level={4}>{TEKST}</Heading>
      <Heading level={5}>{TEKST}</Heading>
      <Heading level={6}>{TEKST}</Heading>
    </div>
  ),
};

export const SemanticVsVisual: Story = {
  name: 'Semantic vs visual',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <p
          style={{
            marginBlockEnd: '0.5rem',
            fontSize: '0.875rem',
            color: '#666',
          }}
        >
          Semantisch h2, visueel heading-1:
        </p>
        <Heading level={2} appearance="heading-1">
          {TEKST}
        </Heading>
      </div>
      <div>
        <p
          style={{
            marginBlockEnd: '0.5rem',
            fontSize: '0.875rem',
            color: '#666',
          }}
        >
          Semantisch h3, visueel heading-5:
        </p>
        <Heading level={3} appearance="heading-5">
          {TEKST}
        </Heading>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Heading level={1}>{TEKST_AR}</Heading>
      <Heading level={2}>{TEKST_AR}</Heading>
      <Heading level={3}>{TEKST_AR}</Heading>
    </div>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  args: { children: VEEL_TEKST_AR },
};
