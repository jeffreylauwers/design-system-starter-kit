import type { Meta, StoryObj } from '@storybook/react';
import { CheckboxGroup, CheckboxOption } from '@dsn/components-react';
import DocsPage from './CheckboxGroup.docs.mdx';
import {
  TEKST,
  WEINIG_TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof CheckboxGroup> = {
  title: 'Components/CheckboxGroup',
  component: CheckboxGroup,
  parameters: {
    docs: {
      page: DocsPage,
    },
  },
};

export default meta;
type Story = StoryObj<typeof CheckboxGroup>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  render: () => (
    <CheckboxGroup>
      <CheckboxOption label={TEKST} value="1" />
      <CheckboxOption label={TEKST} value="2" />
      <CheckboxOption label={TEKST} value="3" />
    </CheckboxGroup>
  ),
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Default group</h3>
        <CheckboxGroup>
          <CheckboxOption label={TEKST} value="1" />
          <CheckboxOption label={TEKST} value="2" checked readOnly />
          <CheckboxOption label={TEKST} value="3" indeterminate />
        </CheckboxGroup>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>With disabled options</h3>
        <CheckboxGroup>
          <CheckboxOption label={TEKST} value="1" />
          <CheckboxOption label={TEKST} value="2" disabled />
          <CheckboxOption label={TEKST} value="3" disabled checked readOnly />
          <CheckboxOption label={TEKST} value="4" />
        </CheckboxGroup>
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
    <CheckboxGroup>
      <CheckboxOption label={WEINIG_TEKST} value="1" />
      <CheckboxOption label={WEINIG_TEKST} value="2" />
      <CheckboxOption label={WEINIG_TEKST} value="3" />
    </CheckboxGroup>
  ),
};

export const LongText: Story = {
  name: 'Long text',
  render: () => (
    <CheckboxGroup>
      <CheckboxOption label={VEEL_TEKST} value="1" />
      <CheckboxOption label={VEEL_TEKST} value="2" />
      <CheckboxOption label={VEEL_TEKST} value="3" />
    </CheckboxGroup>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: () => (
    <CheckboxGroup>
      <CheckboxOption label={TEKST_AR} value="1" />
      <CheckboxOption label={TEKST_AR} value="2" checked readOnly />
      <CheckboxOption label={TEKST_AR} value="3" />
    </CheckboxGroup>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  render: () => (
    <CheckboxGroup>
      <CheckboxOption label={VEEL_TEKST_AR} value="1" />
      <CheckboxOption label={VEEL_TEKST_AR} value="2" />
      <CheckboxOption label={VEEL_TEKST_AR} value="3" />
    </CheckboxGroup>
  ),
};
