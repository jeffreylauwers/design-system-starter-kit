import type { Meta, StoryObj } from '@storybook/react';
import { SearchInput } from '@dsn/components-react';
import DocsPage from './SearchInput.docs.mdx';
import {
  TEKST,
  WEINIG_TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof SearchInput> = {
  title: 'Components/SearchInput',
  component: SearchInput,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const wrapperCls = [
          'dsn-search-input-wrapper',
          args.width && `dsn-search-input-wrapper--width-${args.width}`,
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
        return `<div class="${wrapperCls}">\n  <!-- search icon (decoratief) -->\n  <input type="search" class="dsn-text-input dsn-search-input"${attrs ? ' ' + attrs : ''} />\n</div>`;
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
type Story = StoryObj<typeof SearchInput>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const WithValue: Story = {
  name: 'With value',
  args: { defaultValue: TEKST },
};

export const WithPlaceholder: Story = {
  name: 'With placeholder',
  args: { placeholder: 'Zoeken...' },
};

export const Disabled: Story = {
  args: { disabled: true, value: TEKST },
};

export const ReadOnly: Story = {
  name: 'Read-only',
  args: { readOnly: true, value: TEKST },
};

export const Invalid: Story = {
  args: { invalid: true, value: TEKST },
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
          <SearchInput width={w} />
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
        <SearchInput />
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
        <SearchInput defaultValue={TEKST} />
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
        <SearchInput disabled value={TEKST} />
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
        <SearchInput readOnly value={TEKST} />
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
        <SearchInput invalid value={TEKST} />
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
