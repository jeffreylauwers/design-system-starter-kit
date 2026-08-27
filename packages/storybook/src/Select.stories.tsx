import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from '@dsn-starter-kit/components-react';
import DocsPage from './Select.docs.mdx';
import { rtlDecorator } from './story-helpers';

const OPTIONS = (
  <>
    <option value="">Kies een optie</option>
    <option value="nl">Nederland</option>
    <option value="be">België</option>
    <option value="de">Duitsland</option>
    <option value="fr">Frankrijk</option>
    <option value="gb">Verenigd Koninkrijk</option>
  </>
);

const OPTIONS_AR = (
  <>
    <option value="">اختر خيارًا</option>
    <option value="nl">هولندا</option>
    <option value="be">بلجيكا</option>
    <option value="de">ألمانيا</option>
    <option value="fr">فرنسا</option>
    <option value="gb">المملكة المتحدة</option>
  </>
);

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const wrapperCls = [
          'dsn-select-wrapper',
          args.width && `dsn-select-wrapper--width-${args.width}`,
        ]
          .filter(Boolean)
          .join(' ');
        const inputAttrs = [
          args.disabled && 'disabled',
          args.required && 'required',
          args.invalid && 'aria-invalid="true"',
        ]
          .filter(Boolean)
          .join(' ');
        const icon = !args.disabled
          ? '\n  <svg class="dsn-icon dsn-select__icon" aria-hidden="true"><!-- chevron-down --></svg>'
          : '';
        // Serialiseer <option> elementen uit args.children (ook binnen fragments)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const options: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const collect = (n: any) => {
          if (!n) return;
          if (Array.isArray(n)) return n.forEach(collect);
          if (n.type === 'option') options.push(n);
          else if (n.props?.children) collect(n.props.children);
        };
        collect(args.children);
        const optionsHtml = options.length
          ? options
              .map(
                (o) =>
                  `    <option value="${o.props.value ?? ''}">${o.props.children}</option>`
              )
              .join('\n')
          : '    <option value="">Kies een optie</option>';
        return `<div class="${wrapperCls}">\n  <select class="dsn-text-input dsn-select"${inputAttrs ? ' ' + inputAttrs : ''}>\n${optionsHtml}\n  </select>${icon}\n</div>`;
      },
    },
  },
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    width: {
      control: 'select',
      options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl', 'full'],
    },
  },
  args: {
    disabled: false,
    invalid: false,
    required: false,
    children: OPTIONS,
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const WithValue: Story = {
  name: 'With value',
  args: { defaultValue: 'nl' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'nl' },
};

export const Invalid: Story = {
  args: { invalid: true },
};

export const Widths: Story = {
  name: 'Width variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Select width="xs">{OPTIONS}</Select>
      <Select width="sm">{OPTIONS}</Select>
      <Select width="md">{OPTIONS}</Select>
      <Select width="lg">{OPTIONS}</Select>
      <Select width="xl">{OPTIONS}</Select>
      <Select width="full">{OPTIONS}</Select>
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
        <Select>{OPTIONS}</Select>
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
        <Select defaultValue="nl">{OPTIONS}</Select>
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
        <Select disabled defaultValue="nl">
          {OPTIONS}
        </Select>
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
        <Select invalid>{OPTIONS}</Select>
      </div>
    </div>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  decorators: [rtlDecorator],
  render: () => <Select defaultValue="nl">{OPTIONS_AR}</Select>,
};
