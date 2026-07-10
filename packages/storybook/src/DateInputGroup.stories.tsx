import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  DateInputGroup,
  DateInputGroupValue,
  FormFieldset,
} from '@dsn-starter-kit/components-react';
import DocsPage from './DateInputGroup.docs.mdx';
import { rtlDecorator } from './story-helpers';

const meta: Meta<typeof DateInputGroup> = {
  title: 'Components/DateInputGroup',
  component: DateInputGroup,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const inputAttrs = [
          args.invalid && 'aria-invalid="true"',
          args.disabled && 'disabled',
        ]
          .filter(Boolean)
          .join(' ');
        const field = (
          id: string,
          label: string,
          width: string,
          placeholder: string,
          min: number,
          max: number
        ) => `  <div class="dsn-date-input-group__field">
    <label class="dsn-date-input-group__label" for="${id}">${label}</label>
    <input type="text" inputmode="numeric" pattern="[0-9]*" class="dsn-text-input dsn-text-input--width-${width}" id="${id}" value="" placeholder="${placeholder}" min="${min}" max="${max}" autocomplete="off"${inputAttrs ? ' ' + inputAttrs : ''} />
  </div>`;
        return `<div class="dsn-date-input-group">
${field('datum-dag', 'Dag', 'xs', 'DD', 1, 31)}
${field('datum-maand', 'Maand', 'xs', 'MM', 1, 12)}
${field('datum-jaar', 'Jaar', 'sm', 'JJJJ', 1, 9999)}
</div>`;
      },
    },
  },
  argTypes: {
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    invalid: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof DateInputGroup>;

// Helper components
function DefaultStory(args: React.ComponentProps<typeof DateInputGroup>) {
  const [value, setValue] = useState<DateInputGroupValue>({
    day: '',
    month: '',
    year: '',
  });
  return (
    <DateInputGroup {...args} id="datum" value={value} onChange={setValue} />
  );
}

function WithValueStory(args: React.ComponentProps<typeof DateInputGroup>) {
  const [value, setValue] = useState<DateInputGroupValue>({
    day: '15',
    month: '03',
    year: '1990',
  });
  return (
    <DateInputGroup {...args} id="datum" value={value} onChange={setValue} />
  );
}

function WithFormFieldsetStory(
  args: React.ComponentProps<typeof DateInputGroup>
) {
  const [value, setValue] = useState<DateInputGroupValue>({
    day: '',
    month: '',
    year: '',
  });
  return (
    <FormFieldset legend="Geboortedatum" description="Bijvoorbeeld: 15 3 1990">
      <DateInputGroup
        {...args}
        id="geboortedatum"
        value={value}
        onChange={setValue}
      />
    </FormFieldset>
  );
}

function InvalidStory(args: React.ComponentProps<typeof DateInputGroup>) {
  const [value, setValue] = useState<DateInputGroupValue>({
    day: '31',
    month: '02',
    year: '1990',
  });
  return (
    <FormFieldset legend="Geboortedatum" error="Voer een geldige datum in">
      <DateInputGroup
        {...args}
        id="geboortedatum"
        value={value}
        onChange={setValue}
        invalid
      />
    </FormFieldset>
  );
}

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  render: (args) => <DefaultStory {...args} />,
};

// =============================================================================
// VARIANTEN
// =============================================================================

export const WithValue: Story = {
  name: 'With value',
  render: (args) => <WithValueStory {...args} />,
};

export const WithFormFieldset: Story = {
  name: 'Within Form Fieldset',
  render: (args) => <WithFormFieldsetStory {...args} />,
};

export const Invalid: Story = {
  render: (args) => <InvalidStory {...args} />,
};

export const Disabled: Story = {
  render: (args) => (
    <FormFieldset legend="Geboortedatum">
      <DateInputGroup
        {...args}
        id="geboortedatum"
        value={{ day: '15', month: '03', year: '1990' }}
        disabled
      />
    </FormFieldset>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: (args) => <WithValueStory {...args} />,
};
