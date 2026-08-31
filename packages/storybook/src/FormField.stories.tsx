import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  FormField,
  TextInput,
  TextArea,
} from '@dsn-starter-kit/components-react';
import DocsPage from './FormField.docs.mdx';
import {
  TEKST,
  WEINIG_TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof FormField> = {
  title: 'Components/FormField',
  component: FormField,
  parameters: {
    docs: {
      page: DocsPage,
    },
  },
  argTypes: {
    label: { control: 'text' },
    labelSuffix: { control: 'text' },
    htmlFor: { control: 'text' },
    description: { control: 'text' },
    error: { control: 'text' },
    status: { control: 'text' },
    statusVariant: {
      control: 'select',
      options: ['default', 'positive', 'warning'],
    },
    statusLive: { control: 'boolean' },
  },
  args: {
    label: TEKST,
    htmlFor: 'demo-field',
  },
};

export default meta;
type Story = StoryObj<typeof FormField>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  args: {
    label: TEKST,
    htmlFor: 'input-1',
  },
  render: (args) => (
    <FormField {...args}>
      <TextInput id="input-1" />
    </FormField>
  ),
};

// =============================================================================
// VARIANTEN
// =============================================================================

export const WithDescription: Story = {
  args: {
    description: 'Tekst',
  },

  name: 'With description',

  render: (args) => (
    <FormField {...args} label={TEKST} htmlFor="input-desc" description={TEKST}>
      <TextInput id="input-desc" />
    </FormField>
  ),
};

export const WithError: Story = {
  name: 'With error',
  render: (args) => (
    <FormField {...args} label={TEKST} htmlFor="input-err" error={TEKST}>
      <TextInput id="input-err" invalid />
    </FormField>
  ),
};

export const WithStatus: Story = {
  name: 'With status',
  render: (args) => (
    <FormField {...args} label={TEKST} htmlFor="input-status" status={TEKST}>
      <TextInput id="input-status" />
    </FormField>
  ),
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Basic</h3>
        <FormField label={TEKST} htmlFor="s1">
          <TextInput id="s1" />
        </FormField>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>With description</h3>
        <FormField label={TEKST} htmlFor="s2" description={TEKST}>
          <TextInput id="s2" />
        </FormField>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>With optional suffix</h3>
        <FormField label={TEKST} htmlFor="s3" labelSuffix="(niet verplicht)">
          <TextInput id="s3" />
        </FormField>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>With error</h3>
        <FormField label={TEKST} htmlFor="s4" error={TEKST}>
          <TextInput id="s4" invalid />
        </FormField>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>With status (positive)</h3>
        <FormField
          label={TEKST}
          htmlFor="s5"
          status={TEKST}
          statusVariant="positive"
        >
          <TextInput id="s5" />
        </FormField>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>With status (warning)</h3>
        <FormField
          label={TEKST}
          htmlFor="s6"
          status={TEKST}
          statusVariant="warning"
        >
          <TextInput id="s6" />
        </FormField>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>With TextArea</h3>
        <FormField label={TEKST} htmlFor="s7" description={TEKST}>
          <TextArea id="s7" rows={4} />
        </FormField>
      </div>
    </div>
  ),
};

// =============================================================================
// LIVE STATUS
// =============================================================================

export const LiveStatus: Story = {
  name: 'Live status',
  parameters: {
    docs: {
      description: {
        story:
          'Een status die tijdens het typen verandert, hoort een live region te zijn. Zet daarvoor `statusLive`. Laat het uit bij een status die niet verandert: die wordt dan dubbel voorgelezen.',
      },
    },
  },
  render: () => {
    const MAX = 50;
    const CharacterCounter = () => {
      const [waarde, setWaarde] = React.useState('');
      return (
        <FormField
          label={TEKST}
          htmlFor="live-status"
          description={TEKST}
          status={`${waarde.length} van ${MAX} tekens gebruikt`}
          statusLive
        >
          <TextArea
            id="live-status"
            rows={3}
            maxLength={MAX}
            value={waarde}
            onChange={(event) => setWaarde(event.target.value)}
          />
        </FormField>
      );
    };
    return <CharacterCounter />;
  },
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  name: 'Short text',
  render: (args) => (
    <FormField {...args} label={WEINIG_TEKST} htmlFor="st-1">
      <TextInput id="st-1" defaultValue={WEINIG_TEKST} />
    </FormField>
  ),
};

export const LongText: Story = {
  name: 'Long text',
  render: (args) => (
    <FormField
      {...args}
      label={VEEL_TEKST}
      htmlFor="lt-1"
      description={VEEL_TEKST}
    >
      <TextInput id="lt-1" defaultValue={VEEL_TEKST} />
    </FormField>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  decorators: [rtlDecorator],
  render: (args) => (
    <FormField
      {...args}
      label={TEKST_AR}
      htmlFor="rtl-1"
      description={TEKST_AR}
    >
      <TextInput id="rtl-1" defaultValue={TEKST_AR} />
    </FormField>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  render: (args) => (
    <FormField
      {...args}
      label={VEEL_TEKST_AR}
      htmlFor="rtl-2"
      description={VEEL_TEKST_AR}
      error={VEEL_TEKST_AR}
    >
      <TextInput id="rtl-2" defaultValue={VEEL_TEKST_AR} invalid />
    </FormField>
  ),
};
