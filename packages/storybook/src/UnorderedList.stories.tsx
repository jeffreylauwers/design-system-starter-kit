import type { Meta, StoryObj } from '@storybook/react';
import { UnorderedList } from '@dsn/components-react';
import DocsPage from './UnorderedList.docs.mdx';
import {
  TEKST,
  WEINIG_TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof UnorderedList> = {
  title: 'Components/UnorderedList',
  component: UnorderedList,
  parameters: {
    docs: {
      page: DocsPage,
    },
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
type Story = StoryObj<typeof UnorderedList>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Nested: Story = {
  name: 'Nested',
  render: () => (
    <UnorderedList>
      <li>
        {TEKST}
        <UnorderedList>
          <li>{TEKST}</li>
          <li>{TEKST}</li>
          <li>
            {TEKST}
            <UnorderedList>
              <li>{TEKST}</li>
              <li>{TEKST}</li>
            </UnorderedList>
          </li>
        </UnorderedList>
      </li>
      <li>{TEKST}</li>
      <li>{TEKST}</li>
    </UnorderedList>
  ),
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  name: 'Short text',
  render: () => (
    <UnorderedList>
      <li>{WEINIG_TEKST}</li>
      <li>{WEINIG_TEKST}</li>
      <li>{WEINIG_TEKST}</li>
    </UnorderedList>
  ),
};

export const LongText: Story = {
  name: 'Long text',
  render: () => (
    <UnorderedList>
      <li>{VEEL_TEKST}</li>
      <li>{VEEL_TEKST}</li>
      <li>{VEEL_TEKST}</li>
    </UnorderedList>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: () => (
    <UnorderedList>
      <li>{TEKST_AR}</li>
      <li>{TEKST_AR}</li>
      <li>{TEKST_AR}</li>
    </UnorderedList>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  render: () => (
    <UnorderedList>
      <li>{VEEL_TEKST_AR}</li>
      <li>{VEEL_TEKST_AR}</li>
      <li>{VEEL_TEKST_AR}</li>
    </UnorderedList>
  ),
};
