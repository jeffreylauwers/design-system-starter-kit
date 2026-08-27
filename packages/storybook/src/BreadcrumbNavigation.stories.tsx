import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BreadcrumbNavigation,
  BreadcrumbNavigationItem,
  type BreadcrumbNavigationProps,
} from '@dsn-starter-kit/components-react';
import DocsPage from './BreadcrumbNavigation.docs.mdx';
import { rtlDecorator } from './story-helpers';

const meta: Meta<typeof BreadcrumbNavigation> = {
  title: 'Components/BreadcrumbNavigation',
  component: BreadcrumbNavigation,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const compact = args.variant === 'compact';
        const cls = [
          'dsn-breadcrumb-navigation',
          compact && 'dsn-breadcrumb-navigation--compact',
        ]
          .filter(Boolean)
          .join(' ');
        const ariaLabel = args['aria-label'] ?? 'Broodkruimelpad';
        const items = [
          { href: '/home', label: 'Home' },
          { href: '/supermarkt', label: 'Supermarkt' },
          { href: '/fruit', label: 'Fruit' },
          { label: 'Appel', current: true },
        ];
        const separator = `      <svg class="dsn-icon dsn-breadcrumb-navigation__separator" aria-hidden="true"><!-- chevron-right --></svg>`;
        const itemsHtml = items
          .map((item, index) => {
            const isParentOfCurrent = compact && index === items.length - 2;

            // Het huidige item is geen link: platte tekst met aria-current op de <li>
            if (item.current) {
              return `    <li
      class="dsn-breadcrumb-navigation__item dsn-breadcrumb-navigation__item--current"
      aria-current="page"
    >
      ${item.label}
${separator}
    </li>`;
            }

            const backIcon = isParentOfCurrent
              ? `\n        <svg class="dsn-icon dsn-breadcrumb-navigation__back-icon" aria-hidden="true"><!-- arrow-left --></svg>`
              : '';
            return `    <li class="dsn-breadcrumb-navigation__item">
      <a href="${item.href}" class="dsn-breadcrumb-navigation__link">${backIcon}${backIcon ? `\n        ${item.label}\n      ` : item.label}</a>
${separator}
    </li>`;
          })
          .join('\n');
        return `<nav class="${cls}" aria-label="${ariaLabel}">
  <ol class="dsn-breadcrumb-navigation__list">
${itemsHtml}
  </ol>
</nav>`;
      },
    },
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['default', 'compact'],
    },
    'aria-label': { control: 'text' },
    children: { control: false },
  },
  args: {
    variant: 'default',
    'aria-label': 'Broodkruimelpad',
  },
};

export default meta;
type Story = StoryObj<typeof BreadcrumbNavigation>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  render: (args: BreadcrumbNavigationProps) => (
    <BreadcrumbNavigation {...args}>
      <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/supermarkt">
        Supermarkt
      </BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/fruit">Fruit</BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem current>Appel</BreadcrumbNavigationItem>
    </BreadcrumbNavigation>
  ),
};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Compact: Story = {
  render: (args: BreadcrumbNavigationProps) => (
    <BreadcrumbNavigation {...args} variant="compact">
      <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/supermarkt">
        Supermarkt
      </BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/fruit">Fruit</BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem current>Appel</BreadcrumbNavigationItem>
    </BreadcrumbNavigation>
  ),
};

export const TwoItems: Story = {
  name: 'Two items — minimal path',
  render: (args: BreadcrumbNavigationProps) => (
    <BreadcrumbNavigation {...args}>
      <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem current>Appel</BreadcrumbNavigationItem>
    </BreadcrumbNavigation>
  ),
};

export const ManyItems: Story = {
  name: 'Many items — long path',
  render: (args: BreadcrumbNavigationProps) => (
    <BreadcrumbNavigation {...args}>
      <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/supermarkt">
        Supermarkt
      </BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/afdeling">
        Afdeling
      </BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/categorie">
        Categorie
      </BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/subcategorie">
        Subcategorie
      </BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/fruit">Fruit</BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem current>Appel</BreadcrumbNavigationItem>
    </BreadcrumbNavigation>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  decorators: [rtlDecorator],
  render: (args: BreadcrumbNavigationProps) => (
    <div dir="rtl" lang="ar">
      <BreadcrumbNavigation {...args} aria-label="مسار التنقل">
        <BreadcrumbNavigationItem href="/home">
          الرئيسية
        </BreadcrumbNavigationItem>
        <BreadcrumbNavigationItem href="/supermarkt">
          السوبرماركت
        </BreadcrumbNavigationItem>
        <BreadcrumbNavigationItem current>الفاكهة</BreadcrumbNavigationItem>
      </BreadcrumbNavigation>
    </div>
  ),
};
