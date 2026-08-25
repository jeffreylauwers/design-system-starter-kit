import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  FileInput,
  FormFieldDescription,
  FormFieldLabel,
  UnorderedList,
} from '@dsn-starter-kit/components-react';
import DocsPage from './FormFieldDescription.docs.mdx';
import {
  TEKST,
  WEINIG_TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof FormFieldDescription> = {
  title: 'Components/FormFieldDescription',
  component: FormFieldDescription,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const idAttr = args.id ? ` id="${args.id}"` : '';
        return `<p class="dsn-form-field-description"${idAttr}>${args.children ?? 'Tekst'}</p>`;
      },
    },
  },
  argTypes: {
    id: { control: 'text' },
  },
  args: {
    children: TEKST,
  },
};

export default meta;
type Story = StoryObj<typeof FormFieldDescription>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  name: 'Short text',
  args: { children: WEINIG_TEKST },
};

export const LongText: Story = {
  name: 'Long text',
  args: { children: VEEL_TEKST },
};

// =============================================================================
// MET LIJST (alleen op de docs-pagina)
// =============================================================================

/**
 * Voorbeeld van een description met een lijst, alleen zichtbaar op de docs-pagina.
 *
 * Deze story staat bewust niet in de zijbalk (`tags: ['!dev']`): een lijst in een
 * description wordt door screenreaders niet als lijst voorgelezen en VoiceOver in
 * Safari slaat de inhoud over. Het voorbeeld hoort daarom alleen thuis naast de
 * uitleg op de docs-pagina, niet als losse story om uit over te nemen.
 */
export const WithList: Story = {
  name: 'With list',
  tags: ['!dev'],
  parameters: {
    dsn: {
      htmlTemplate: () => `<div class="dsn-form-field">
  <label class="dsn-form-field-label" for="bestand-upload">Bestand toevoegen</label>
  <div class="dsn-form-field-description" id="bestand-upload-description">
    <ul class="dsn-unordered-list">
      <li>Het bestand mag maximaal 10 MB zijn.</li>
      <li>Toegestane bestandstypen: doc, docx, xlsx, pdf, zip, jpg, png, bmp en gif.</li>
    </ul>
  </div>
  <input type="file" class="dsn-file-input" id="bestand-upload" aria-describedby="bestand-upload-description" multiple />
</div>`,
    },
  },
  render: () => (
    <div className="dsn-form-field">
      <FormFieldLabel htmlFor="bestand-upload">
        Bestand toevoegen
      </FormFieldLabel>
      <FormFieldDescription as="div" id="bestand-upload-description">
        <UnorderedList>
          <li>Het bestand mag maximaal 10 MB zijn.</li>
          <li>
            Toegestane bestandstypen: doc, docx, xlsx, pdf, zip, jpg, png, bmp
            en gif.
          </li>
        </UnorderedList>
      </FormFieldDescription>
      <FileInput
        id="bestand-upload"
        aria-describedby="bestand-upload-description"
        multiple
      />
    </div>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  args: { children: TEKST_AR },
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  args: { children: VEEL_TEKST_AR },
};
