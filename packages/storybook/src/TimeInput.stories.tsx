import type { Meta, StoryObj } from '@storybook/react-vite';
import { TimeInput } from '@dsn-starter-kit/components-react';
import DocsPage from './TimeInput.docs.mdx';
import { rtlDecorator } from './story-helpers';

const meta: Meta<typeof TimeInput> = {
  title: 'Components/TimeInput',
  component: TimeInput,
  parameters: {
    docs: {
      page: DocsPage,
    },
  },
  argTypes: {
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    disabled: false,
    readOnly: false,
    invalid: false,
    required: false,
  },
};

export default meta;
type Story = StoryObj<typeof TimeInput>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const WithValue: Story = {
  name: 'With value',
  args: { defaultValue: '14:30' },
};

export const Disabled: Story = {
  args: { disabled: true, value: '14:30' },
};

export const ReadOnly: Story = {
  name: 'Read-only',
  args: { readOnly: true, value: '14:30' },
};

export const Invalid: Story = {
  args: { invalid: true },
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
          }}
        >
          Default
        </label>
        <TimeInput />
      </div>
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
          }}
        >
          With value
        </label>
        <TimeInput defaultValue="14:30" />
      </div>
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
          }}
        >
          Disabled
        </label>
        <TimeInput disabled value="14:30" />
      </div>
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
          }}
        >
          Read-only
        </label>
        <TimeInput readOnly value="14:30" />
      </div>
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
          }}
        >
          Invalid
        </label>
        <TimeInput invalid />
      </div>
    </div>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  decorators: [rtlDecorator],
  args: { defaultValue: '14:30' },
};
