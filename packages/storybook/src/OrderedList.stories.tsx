import type { Meta, StoryObj } from '@storybook/react';
import { OrderedList } from '@dsn/components-react';
import DocsPage from './OrderedList.docs.mdx';
import {
  TEKST,
  WEINIG_TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof OrderedList> = {
  title: 'Components/OrderedList',
  component: OrderedList,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const attrs = [
          args.start && `start="${args.start}"`,
          args.reversed && 'reversed',
        ]
          .filter(Boolean)
          .join(' ');
        return `<ol class="dsn-ordered-list"${attrs ? ' ' + attrs : ''}>\n  <li>Item één</li>\n  <li>Item twee</li>\n  <li>Item drie</li>\n</ol>`;
      },
    },
  },
  argTypes: {
    start: { control: 'number' },
    reversed: { control: 'boolean' },
  },
  args: {
    children: (
      <>
        <li>{TEKST}</li>
        <li>{TEKST}</li>
        <li>{TEKST}</li>
      </>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof OrderedList>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Reversed: Story = {
  args: { reversed: true },
};

export const StartFrom: Story = {
  name: 'Start from number',
  args: { start: 5 },
};

export const Nested: Story = {
  name: 'Nested',
  render: () => (
    <OrderedList>
      <li>
        {TEKST}
        <OrderedList>
          <li>{TEKST}</li>
          <li>{TEKST}</li>
          <li>
            {TEKST}
            <OrderedList>
              <li>{TEKST}</li>
              <li>{TEKST}</li>
            </OrderedList>
          </li>
        </OrderedList>
      </li>
      <li>{TEKST}</li>
      <li>{TEKST}</li>
    </OrderedList>
  ),
};

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Default</h3>
        <OrderedList>
          <li>{TEKST}</li>
          <li>{TEKST}</li>
          <li>{TEKST}</li>
        </OrderedList>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Reversed</h3>
        <OrderedList reversed>
          <li>{TEKST}</li>
          <li>{TEKST}</li>
          <li>{TEKST}</li>
        </OrderedList>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Start from 5</h3>
        <OrderedList start={5}>
          <li>{TEKST}</li>
          <li>{TEKST}</li>
          <li>{TEKST}</li>
        </OrderedList>
      </div>
    </div>
  ),
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  name: 'Short text',
  render: () => (
    <OrderedList>
      <li>{WEINIG_TEKST}</li>
      <li>{WEINIG_TEKST}</li>
      <li>{WEINIG_TEKST}</li>
    </OrderedList>
  ),
};

export const LongText: Story = {
  name: 'Long text',
  render: () => (
    <OrderedList>
      <li>{VEEL_TEKST}</li>
      <li>{VEEL_TEKST}</li>
      <li>{VEEL_TEKST}</li>
    </OrderedList>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: () => (
    <OrderedList>
      <li>{TEKST_AR}</li>
      <li>{TEKST_AR}</li>
      <li>{TEKST_AR}</li>
    </OrderedList>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  render: () => (
    <OrderedList>
      <li>{VEEL_TEKST_AR}</li>
      <li>{VEEL_TEKST_AR}</li>
      <li>{VEEL_TEKST_AR}</li>
    </OrderedList>
  ),
};
