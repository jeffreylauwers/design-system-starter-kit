import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  DateInputGroup,
  DateInputGroupValue,
  FormFieldset,
} from '@dsn/components-react';
import DocsPage from './DateInputGroup.docs.mdx';
import { rtlDecorator } from './story-helpers';

const meta: Meta<typeof DateInputGroup> = {
  title: 'Components/DateInputGroup',
  component: DateInputGroup,
  parameters: {
    docs: {
      page: DocsPage,
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
  name: 'With FormFieldset (complete form field)',
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
