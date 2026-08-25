import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  FileInput,
  FormFieldDescription,
  FormFieldLabel,
} from '@dsn-starter-kit/components-react';
import DocsPage from './FileInput.docs.mdx';

const meta: Meta<typeof FileInput> = {
  title: 'Components/FileInput',
  component: FileInput,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const attrs = [
          args.disabled && 'disabled',
          args.required && 'required',
          args.multiple && 'multiple',
          args.invalid && 'aria-invalid="true"',
          args.accept && `accept="${args.accept}"`,
        ]
          .filter(Boolean)
          .join(' ');
        return `<input type="file" class="dsn-file-input"${attrs ? ' ' + attrs : ''} />`;
      },
    },
  },
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    multiple: { control: 'boolean' },
    accept: { control: 'text' },
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof FileInput>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Disabled: Story = {
  args: { disabled: true },
};

export const Invalid: Story = {
  args: { invalid: true },
};

export const Required: Story = {
  args: { required: true },
};

export const Multiple: Story = {
  name: 'Multiple files',
  args: { multiple: true },
};

export const WithAccept: Story = {
  name: 'With accept filter',
  args: { accept: '.pdf,.docx,.xlsx' },
};

// =============================================================================
// OVERZICHTSSTORY
// =============================================================================

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
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
        <FileInput />
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
        <FileInput disabled />
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
        <FileInput invalid />
      </div>
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
          }}
        >
          Multiple
        </label>
        <FileInput multiple />
      </div>
    </div>
  ),
};

// =============================================================================
// IN FORM FIELD CONTEXT
// =============================================================================

export const InFormFieldSingle: Story = {
  name: 'Within Form Field: Single file',
  render: () => (
    <div className="dsn-form-field">
      <FormFieldLabel htmlFor="bestand-upload" suffix="(niet verplicht)">
        Bestand toevoegen
      </FormFieldLabel>
      <FormFieldDescription id="bestand-upload-description">
        Het bestand mag maximaal 10 MB zijn. Toegestane bestandstypen: doc,
        docx, xlsx, pdf, zip, jpg, png, bmp en gif.
      </FormFieldDescription>
      <FileInput
        id="bestand-upload"
        aria-describedby="bestand-upload-description"
      />
    </div>
  ),
};

export const InFormFieldMultiple: Story = {
  name: 'Within Form Field: Multiple files',
  render: () => (
    <div className="dsn-form-field">
      <FormFieldLabel htmlFor="bestanden-upload" suffix="(niet verplicht)">
        Bestanden toevoegen
      </FormFieldLabel>
      <FormFieldDescription id="bestanden-upload-description">
        U kunt meerdere bestanden tegelijk toevoegen, samen maximaal 10 MB.
        Toegestane bestandstypen: doc, docx, xlsx, pdf, zip, jpg, png, bmp en
        gif.
      </FormFieldDescription>
      <FileInput
        id="bestanden-upload"
        aria-describedby="bestanden-upload-description"
        multiple
      />
    </div>
  ),
};
