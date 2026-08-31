import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckboxOption } from '@dsn-starter-kit/components-react';
import DocsPage from './CheckboxOption.docs.mdx';
import {
  TEKST,
  WEINIG_TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof CheckboxOption> = {
  title: 'Components/CheckboxOption',
  component: CheckboxOption,
  parameters: {
    docs: {
      page: DocsPage,
    },
  },
  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    label: TEKST,
  },
};

export default meta;
type Story = StoryObj<typeof CheckboxOption>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Checked: Story = {
  args: { checked: true, readOnly: true, label: TEKST },
};

export const Indeterminate: Story = {
  args: { indeterminate: true, label: TEKST },
};

export const Disabled: Story = {
  args: { disabled: true, label: TEKST },
};

export const Invalid: Story = {
  args: { invalid: true, label: TEKST },
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Default states</h3>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <CheckboxOption label={TEKST} />
          <CheckboxOption checked label={TEKST} readOnly />
          <CheckboxOption indeterminate label={TEKST} />
        </div>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Disabled states</h3>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <CheckboxOption disabled label={TEKST} />
          <CheckboxOption checked disabled label={TEKST} readOnly />
          <CheckboxOption indeterminate disabled label={TEKST} />
        </div>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Invalid state</h3>
        <CheckboxOption invalid label={TEKST} />
      </div>
    </div>
  ),
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  name: 'Short text',
  args: { label: WEINIG_TEKST },
};

export const LongText: Story = {
  name: 'Long text',
  args: { label: VEEL_TEKST },
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  decorators: [rtlDecorator],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <CheckboxOption label={TEKST_AR} />
      <CheckboxOption checked label={TEKST_AR} readOnly />
    </div>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  args: { label: VEEL_TEKST_AR },
};
