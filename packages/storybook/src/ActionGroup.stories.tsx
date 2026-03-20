import type { Meta, StoryObj } from '@storybook/react';
import { ActionGroup, Button, Link } from '@dsn/components-react';
import DocsPage from './ActionGroup.docs.mdx';
import { rtlDecorator } from './story-helpers';

const meta: Meta<typeof ActionGroup> = {
  title: 'Components/ActionGroup',
  component: ActionGroup,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const modifier =
          args.direction === 'vertical' ? ' dsn-action-group--vertical' : '';
        return `<div class="dsn-action-group${modifier}">
  <button class="dsn-button dsn-button--strong dsn-button--size-default">
    <span class="dsn-button__label">Opslaan</span>
  </button>
  <button class="dsn-button dsn-button--subtle dsn-button--size-default">
    <span class="dsn-button__label">Annuleren</span>
  </button>
</div>`;
      },
    },
  },
  argTypes: {
    direction: {
      control: { type: 'radio' },
      options: ['horizontal', 'vertical'],
    },
    children: { control: false },
  },
  args: {
    direction: 'horizontal',
    children: (
      <>
        <Button variant="strong">Opslaan</Button>
        <Button variant="subtle">Annuleren</Button>
      </>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof ActionGroup>;

export const Default: Story = {};

export const WithLink: Story = {
  name: 'With Link',
  args: {
    children: (
      <>
        <Button variant="strong">Volgende stap</Button>
        <Link href="/">Terug naar overzicht</Link>
      </>
    ),
  },
};

export const Vertical: Story = {
  args: {
    direction: 'vertical',
  },
};

export const Wrapping: Story = {
  name: 'Wrapping',
  render: () => (
    <div style={{ maxWidth: '280px' }}>
      <ActionGroup>
        <Button variant="strong">Opslaan</Button>
        <Button variant="subtle">Opslaan als concept</Button>
        <Button variant="subtle">Annuleren</Button>
      </ActionGroup>
    </div>
  ),
};

export const SingleAction: Story = {
  name: 'Single action',
  args: {
    children: <Button variant="strong">Verstuur aanvraag</Button>,
  },
};

export const ShortText: Story = {
  name: 'Short text',
  args: {
    children: (
      <>
        <Button variant="strong">Ok</Button>
        <Button variant="subtle">Nee</Button>
      </>
    ),
  },
};

export const LongText: Story = {
  name: 'Long text',
  args: {
    children: (
      <>
        <Button variant="strong">
          Bevestig en verstuur de volledige aanvraag
        </Button>
        <Button variant="subtle">
          Annuleer en ga terug naar het overzicht
        </Button>
      </>
    ),
  },
};

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: () => (
    <div dir="rtl">
      <ActionGroup>
        <Button variant="strong">حفظ</Button>
        <Button variant="subtle">إلغاء</Button>
      </ActionGroup>
    </div>
  ),
};
