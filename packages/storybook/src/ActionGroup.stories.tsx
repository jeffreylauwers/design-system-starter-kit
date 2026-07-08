import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ActionGroup,
  Button,
  Link,
  LinkButton,
} from '@dsn-starter-kit/components-react';
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
        const ariaLabel = args['aria-label'] || 'Acties';
        return `<ul class="dsn-action-group${modifier}" aria-label="${ariaLabel}">
  <li class="dsn-action-group__item">
    <button class="dsn-button dsn-button--strong dsn-button--size-default">
      <span class="dsn-button__label">Opslaan</span>
    </button>
  </li>
  <li class="dsn-action-group__item">
    <button class="dsn-button dsn-button--subtle dsn-button--size-default">
      <span class="dsn-button__label">Annuleren</span>
    </button>
  </li>
</ul>`;
      },
    },
  },
  argTypes: {
    direction: {
      control: { type: 'radio' },
      options: ['horizontal', 'vertical'],
    },
    'aria-label': { control: 'text' },
    children: { control: false },
  },
  args: {
    direction: 'horizontal',
    'aria-label': 'Acties',
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

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

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

export const CustomAriaLabel: Story = {
  name: 'Custom aria-label',
  args: {
    'aria-label': 'Formulierknoppen',
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

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

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

export const WithLinkButton: Story = {
  name: 'With LinkButton',
  args: {
    children: (
      <>
        <Button variant="strong">Volgende stap</Button>
        <LinkButton>Opslaan en later verder</LinkButton>
        <LinkButton>Stoppen met formulier</LinkButton>
      </>
    ),
  },
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: () => (
    <ActionGroup>
      <Button variant="strong">حفظ</Button>
      <Button variant="subtle">إلغاء</Button>
    </ActionGroup>
  ),
};
