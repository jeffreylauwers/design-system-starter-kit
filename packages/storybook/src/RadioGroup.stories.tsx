import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioOption } from '@dsn/components-react';
import DocsPage from './RadioGroup.docs.mdx';
import {
  TEKST,
  WEINIG_TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  parameters: {
    docs: {
      page: DocsPage,
    },
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  render: () => (
    <RadioGroup>
      <RadioOption name="demo" label={TEKST} value="1" />
      <RadioOption name="demo" label={TEKST} value="2" />
      <RadioOption name="demo" label={TEKST} value="3" />
    </RadioGroup>
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
        <RadioGroup>
          <RadioOption name="demo-1" label={TEKST} value="1" />
          <RadioOption name="demo-1" label={TEKST} value="2" checked readOnly />
          <RadioOption name="demo-1" label={TEKST} value="3" />
        </RadioGroup>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>With disabled options</h3>
        <RadioGroup>
          <RadioOption name="demo-2" label={TEKST} value="1" />
          <RadioOption name="demo-2" label={TEKST} value="2" disabled />
          <RadioOption
            name="demo-2"
            label={TEKST}
            value="3"
            disabled
            checked
            readOnly
          />
          <RadioOption name="demo-2" label={TEKST} value="4" />
        </RadioGroup>
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
    <RadioGroup>
      <RadioOption name="short" label={WEINIG_TEKST} value="1" />
      <RadioOption name="short" label={WEINIG_TEKST} value="2" />
      <RadioOption name="short" label={WEINIG_TEKST} value="3" />
    </RadioGroup>
  ),
};

export const LongText: Story = {
  name: 'Long text',
  render: () => (
    <RadioGroup>
      <RadioOption name="long" label={VEEL_TEKST} value="1" />
      <RadioOption name="long" label={VEEL_TEKST} value="2" />
      <RadioOption name="long" label={VEEL_TEKST} value="3" />
    </RadioGroup>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: () => (
    <RadioGroup>
      <RadioOption name="rtl-1" label={TEKST_AR} value="1" />
      <RadioOption name="rtl-1" label={TEKST_AR} value="2" checked readOnly />
      <RadioOption name="rtl-1" label={TEKST_AR} value="3" />
    </RadioGroup>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  render: () => (
    <RadioGroup>
      <RadioOption name="rtl-long" label={VEEL_TEKST_AR} value="1" />
      <RadioOption name="rtl-long" label={VEEL_TEKST_AR} value="2" />
      <RadioOption name="rtl-long" label={VEEL_TEKST_AR} value="3" />
    </RadioGroup>
  ),
};
