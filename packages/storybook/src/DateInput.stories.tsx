import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateInput } from '@dsn-starter-kit/components-react';
import DocsPage from './DateInput.docs.mdx';
import { rtlDecorator } from './story-helpers';

const meta: Meta<typeof DateInput> = {
  title: 'Components/DateInput',
  component: DateInput,
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
type Story = StoryObj<typeof DateInput>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const WithValue: Story = {
  name: 'With value',
  args: { defaultValue: '2026-03-15' },
};

export const Disabled: Story = {
  args: { disabled: true, value: '2026-03-15' },
};

export const ReadOnly: Story = {
  name: 'Read-only',
  args: { readOnly: true, value: '2026-03-15' },
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
        <DateInput />
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
        <DateInput defaultValue="2026-03-15" />
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
        <DateInput disabled value="2026-03-15" />
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
        <DateInput readOnly value="2026-03-15" />
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
        <DateInput invalid />
      </div>
    </div>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  decorators: [rtlDecorator],
  args: { defaultValue: '2026-03-15' },
};
