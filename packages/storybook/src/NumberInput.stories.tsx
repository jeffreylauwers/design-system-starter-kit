import type { Meta, StoryObj } from '@storybook/react';
import { NumberInput } from '@dsn/components-react';
import DocsPage from './NumberInput.docs.mdx';
import { rtlDecorator } from './story-helpers';

const meta: Meta<typeof NumberInput> = {
  title: 'Components/NumberInput',
  component: NumberInput,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const cls = [
          'dsn-text-input',
          args.width && `dsn-text-input--width-${args.width}`,
        ]
          .filter(Boolean)
          .join(' ');
        const inputMode = args.allowDecimals ? 'decimal' : 'numeric';
        const pattern = args.allowDecimals ? '' : ' pattern="[0-9]*"';
        const attrs = [
          args.disabled && 'disabled',
          args.readOnly && 'readonly',
          args.required && 'required',
          args.invalid && 'aria-invalid="true"',
          args.placeholder && `placeholder="${args.placeholder}"`,
        ]
          .filter(Boolean)
          .join(' ');
        return `<input type="text" inputmode="${inputMode}"${pattern} class="${cls}" autocomplete="off"${attrs ? ' ' + attrs : ''} />`;
      },
    },
  },
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    allowDecimals: { control: 'boolean' },
    width: {
      control: 'select',
      options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl', 'full'],
    },
  },
  args: {
    disabled: false,
    readOnly: false,
    invalid: false,
    required: false,
    allowDecimals: false,
  },
};

export default meta;
type Story = StoryObj<typeof NumberInput>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const WithDecimals: Story = {
  name: 'With decimals (allowDecimals)',
  args: {
    allowDecimals: true,
    defaultValue: '1234',
  },
};

export const WithPlaceholder: Story = {
  name: 'With placeholder',
  args: { placeholder: '0' },
};

export const WithValue: Story = {
  name: 'With value',
  args: { defaultValue: '42' },
};

export const Disabled: Story = {
  args: { disabled: true, value: '42' },
};

export const ReadOnly: Story = {
  name: 'Read-only',
  args: { readOnly: true, value: '42' },
};

export const Invalid: Story = {
  args: { invalid: true, value: 'abc' },
};

export const Widths: Story = {
  name: 'Width variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const).map((w) => (
        <div key={w}>
          <p
            style={{
              margin: '0 0 0.25rem',
              fontWeight: 'bold',
              fontSize: '0.875rem',
            }}
          >
            {w}
          </p>
          <NumberInput width={w} />
        </div>
      ))}
    </div>
  ),
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        maxWidth: '400px',
      }}
    >
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
        <NumberInput />
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
        <NumberInput defaultValue="42" />
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
        <NumberInput disabled value="42" />
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
        <NumberInput readOnly value="42" />
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
        <NumberInput invalid value="abc" />
      </div>
    </div>
  ),
};

// =============================================================================
// LARGE TEXT
// =============================================================================

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  args: { defaultValue: '٤٢' },
};

// =============================================================================
// HIGH CONTRAST
// =============================================================================
