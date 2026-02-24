import type { Meta, StoryObj } from '@storybook/react';
import { TelephoneInput } from '@dsn/components-react';
import DocsPage from './TelephoneInput.docs.mdx';
import {
  WEINIG_TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof TelephoneInput> = {
  title: 'Components/TelephoneInput',
  component: TelephoneInput,
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
        const attrs = [
          args.disabled && 'disabled',
          args.readOnly && 'readonly',
          args.required && 'required',
          args.invalid && 'aria-invalid="true"',
          args.placeholder && `placeholder="${args.placeholder}"`,
        ]
          .filter(Boolean)
          .join(' ');
        return `<input type="tel" inputmode="tel" class="${cls}" autocomplete="tel"${attrs ? ' ' + attrs : ''} />`;
      },
    },
  },
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
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
  },
};

export default meta;
type Story = StoryObj<typeof TelephoneInput>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const WithValue: Story = {
  name: 'With value',
  args: { defaultValue: '06 12345678' },
};

export const International: Story = {
  name: 'International format',
  args: { defaultValue: '+31 6 12345678' },
};

export const WithPlaceholder: Story = {
  name: 'With placeholder',
  args: { placeholder: '06 12345678' },
};

export const Disabled: Story = {
  args: { disabled: true, value: '06 12345678' },
};

export const ReadOnly: Story = {
  name: 'Read-only',
  args: { readOnly: true, value: '06 12345678' },
};

export const Invalid: Story = {
  args: { invalid: true, value: 'geen nummer' },
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
          <TelephoneInput width={w} />
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
        <TelephoneInput />
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
        <TelephoneInput defaultValue="06 12345678" />
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
        <TelephoneInput disabled value="06 12345678" />
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
        <TelephoneInput readOnly value="06 12345678" />
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
        <TelephoneInput invalid value="geen nummer" />
      </div>
    </div>
  ),
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  name: 'Short text',
  args: { defaultValue: WEINIG_TEKST },
};

export const LongText: Story = {
  name: 'Long text',
  args: { defaultValue: VEEL_TEKST },
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  args: { defaultValue: TEKST_AR },
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  args: { defaultValue: VEEL_TEKST_AR },
};

// =============================================================================
// HIGH CONTRAST
// =============================================================================
