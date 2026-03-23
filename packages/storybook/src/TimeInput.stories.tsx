import type { Meta, StoryObj } from '@storybook/react';
import { TimeInput } from '@dsn/components-react';
import DocsPage from './TimeInput.docs.mdx';
import { rtlDecorator } from './story-helpers';

const meta: Meta<typeof TimeInput> = {
  title: 'Components/TimeInput',
  component: TimeInput,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const attrs = [
          args.disabled && 'disabled',
          args.readOnly && 'readonly',
          args.required && 'required',
          args.invalid && 'aria-invalid="true"',
        ]
          .filter(Boolean)
          .join(' ');
        const button =
          !args.disabled && !args.readOnly
            ? '\n  <button type="button" class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only dsn-time-input__button">\n    <svg class="dsn-icon" aria-hidden="true"><!-- icon --></svg>\n    <span class="dsn-button__label">Tijdkiezer openen</span>\n  </button>'
            : '';
        return `<div class="dsn-time-input-wrapper">\n  <input type="time" class="dsn-text-input dsn-time-input"${attrs ? ' ' + attrs : ''} />${button}\n</div>`;
      },
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
  name: 'RTL',
  decorators: [rtlDecorator],
  args: { defaultValue: '14:30' },
};
