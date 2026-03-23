import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Table, Icon, Checkbox, Link } from '@dsn/components-react';
import type { TableProps } from '@dsn/components-react';
import DocsPage from './Table.docs.mdx';
import { rtlDecorator } from './story-helpers';

/**
 * Drie sorteericonen in één fragment — de CSS toont er één op basis van
 * aria-sort op de bovenliggende <th>. Gebruik samen met dsn-button--icon-only.
 */
const SortIcons = () => (
  <>
    <Icon
      name="arrows-sort"
      className="dsn-table__sort-icon--none"
      aria-hidden
    />
    <Icon
      name="sort-ascending"
      className="dsn-table__sort-icon--ascending"
      aria-hidden
    />
    <Icon
      name="sort-descending"
      className="dsn-table__sort-icon--descending"
      aria-hidden
    />
  </>
);

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const caption = args.caption ?? 'Tabeloverzicht';
        const scrollable = args.scrollable ?? false;

        const tableHtml = `<table class="dsn-table">
  <caption class="dsn-table__caption">${caption}</caption>
  <thead>
    <tr>
      <th scope="col">Product</th>
      <th scope="col" class="dsn-table__cell--numeric">Prijs</th>
      <th scope="col" class="dsn-table__cell--numeric">Voorraad</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Laptop</td>
      <td class="dsn-table__cell--numeric">€999</td>
      <td class="dsn-table__cell--numeric">12</td>
    </tr>
    <tr>
      <td>Muis</td>
      <td class="dsn-table__cell--numeric">€29</td>
      <td class="dsn-table__cell--numeric">84</td>
    </tr>
  </tbody>
</table>`;

        if (scrollable) {
          return `<div class="dsn-table-wrapper" role="region" aria-labelledby="tabel-caption-id" tabindex="0">
  ${tableHtml.replace('class="dsn-table__caption"', 'id="tabel-caption-id" class="dsn-table__caption"')}
</div>`;
        }

        return tableHtml;
      },
    },
  },
  argTypes: {
    caption: { control: 'text' },
    scrollable: { control: 'boolean' },
    captionId: { control: false },
    children: { control: false },
  },
  args: {
    caption: 'Productoverzicht',
    scrollable: false,
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  render: (args: TableProps) => (
    <Table {...args}>
      <thead>
        <tr>
          <th scope="col">Product</th>
          <th scope="col" className="dsn-table__cell--numeric">
            Prijs
          </th>
          <th scope="col" className="dsn-table__cell--numeric">
            Voorraad
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Laptop</td>
          <td className="dsn-table__cell--numeric">€999</td>
          <td className="dsn-table__cell--numeric">12</td>
        </tr>
        <tr>
          <td>Muis</td>
          <td className="dsn-table__cell--numeric">€29</td>
          <td className="dsn-table__cell--numeric">84</td>
        </tr>
        <tr>
          <td>Toetsenbord</td>
          <td className="dsn-table__cell--numeric">€79</td>
          <td className="dsn-table__cell--numeric">34</td>
        </tr>
      </tbody>
    </Table>
  ),
};

// =============================================================================
// VARIANTEN
// =============================================================================

export const WithRowHeaders: Story = {
  name: 'With row headers',
  render: (args: TableProps) => (
    <Table {...args} caption="Kwartaalresultaten">
      <thead>
        <tr>
          <th scope="col">Kwartaal</th>
          <th scope="col" className="dsn-table__cell--numeric">
            Omzet
          </th>
          <th scope="col" className="dsn-table__cell--numeric">
            Kosten
          </th>
          <th scope="col" className="dsn-table__cell--numeric">
            Winst
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Q1 2025</th>
          <td className="dsn-table__cell--numeric">€120.000</td>
          <td className="dsn-table__cell--numeric">€80.000</td>
          <td className="dsn-table__cell--numeric">€40.000</td>
        </tr>
        <tr>
          <th scope="row">Q2 2025</th>
          <td className="dsn-table__cell--numeric">€145.000</td>
          <td className="dsn-table__cell--numeric">€90.000</td>
          <td className="dsn-table__cell--numeric">€55.000</td>
        </tr>
        <tr>
          <th scope="row">Q3 2025</th>
          <td className="dsn-table__cell--numeric">€138.000</td>
          <td className="dsn-table__cell--numeric">€85.000</td>
          <td className="dsn-table__cell--numeric">€53.000</td>
        </tr>
      </tbody>
    </Table>
  ),
};

export const WithFooter: Story = {
  name: 'With footer (tfoot)',
  render: (args: TableProps) => (
    <Table {...args} caption="Productoverzicht met totaal">
      <thead>
        <tr>
          <th scope="col">Product</th>
          <th scope="col" className="dsn-table__cell--numeric">
            Prijs
          </th>
          <th scope="col" className="dsn-table__cell--numeric">
            Voorraad
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Laptop</th>
          <td className="dsn-table__cell--numeric">€999</td>
          <td className="dsn-table__cell--numeric">12</td>
        </tr>
        <tr>
          <th scope="row">Muis</th>
          <td className="dsn-table__cell--numeric">€29</td>
          <td className="dsn-table__cell--numeric">84</td>
        </tr>
        <tr>
          <th scope="row">Toetsenbord</th>
          <td className="dsn-table__cell--numeric">€79</td>
          <td className="dsn-table__cell--numeric">34</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">Totaal</th>
          <td className="dsn-table__cell--numeric">—</td>
          <td className="dsn-table__cell--numeric">130</td>
        </tr>
      </tfoot>
    </Table>
  ),
};

export const Scrollable: Story = {
  name: 'Scrollable (scroll-wrapper)',
  args: {
    scrollable: true,
    caption: 'Brede datatable met scroll',
  },
  render: (args: TableProps) => (
    <Table {...args}>
      <thead>
        <tr>
          <th scope="col">Naam</th>
          <th scope="col">Afdeling</th>
          <th scope="col">Functie</th>
          <th scope="col">Locatie</th>
          <th scope="col">Startdatum</th>
          <th scope="col">Contract</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Anna de Vries</th>
          <td>Engineering</td>
          <td>Senior Frontend Developer</td>
          <td>Amsterdam</td>
          <td>1 maart 2021</td>
          <td>Vast</td>
          <td>Actief</td>
        </tr>
        <tr>
          <th scope="row">Bas Jansen</th>
          <td>Design</td>
          <td>UX Designer</td>
          <td>Utrecht</td>
          <td>15 juni 2022</td>
          <td>Vast</td>
          <td>Actief</td>
        </tr>
        <tr>
          <th scope="row">Claire Bakker</th>
          <td>Product</td>
          <td>Product Manager</td>
          <td>Rotterdam</td>
          <td>1 januari 2020</td>
          <td>Vast</td>
          <td>Verlof</td>
        </tr>
      </tbody>
    </Table>
  ),
};

export const SortableColumns: Story = {
  name: 'Sortable columns (HTML markup demo)',
  render: () => (
    <table className="dsn-table">
      <caption className="dsn-table__caption">
        Medewerkers — gesorteerd op naam (oplopend)
      </caption>
      <thead>
        <tr>
          {/* Gesorteerde kolom: oplopend */}
          <th scope="col" aria-sort="ascending">
            <span className="dsn-table__header-content">
              Naam
              <button
                className="dsn-button dsn-button--size-small dsn-button--subtle dsn-button--icon-only dsn-table__sort-button"
                type="button"
              >
                <SortIcons />
                <span className="dsn-button__label">Sorteer op Naam</span>
              </button>
            </span>
          </th>
          {/* Ongesorteerde sorteerbare kolom */}
          <th scope="col" aria-sort="none">
            <span className="dsn-table__header-content">
              Afdeling
              <button
                className="dsn-button dsn-button--size-small dsn-button--subtle dsn-button--icon-only dsn-table__sort-button"
                type="button"
              >
                <SortIcons />
                <span className="dsn-button__label">Sorteer op Afdeling</span>
              </button>
            </span>
          </th>
          {/* Niet-sorteerbare kolom: geen button, geen aria-sort */}
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Anna de Vries</th>
          <td>Engineering</td>
          <td>Actief</td>
        </tr>
        <tr>
          <th scope="row">Bas Jansen</th>
          <td>Design</td>
          <td>Actief</td>
        </tr>
        <tr>
          <th scope="row">Claire Bakker</th>
          <td>Product</td>
          <td>Verlof</td>
        </tr>
      </tbody>
    </table>
  ),
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllFeatures: Story = {
  name: 'All features (scrollable + tfoot + sortable)',
  args: {
    scrollable: true,
    caption: 'Volledig uitgerust tableoverzicht',
  },
  render: (args: TableProps) => (
    <Table {...args}>
      <thead>
        <tr>
          <th scope="col" aria-sort="ascending">
            <span className="dsn-table__header-content">
              Product
              <button
                className="dsn-button dsn-button--size-small dsn-button--subtle dsn-button--icon-only dsn-table__sort-button"
                type="button"
              >
                <SortIcons />
                <span className="dsn-button__label">Sorteer op Product</span>
              </button>
            </span>
          </th>
          <th scope="col" aria-sort="none" className="dsn-table__cell--numeric">
            <span className="dsn-table__header-content">
              Prijs
              <button
                className="dsn-button dsn-button--size-small dsn-button--subtle dsn-button--icon-only dsn-table__sort-button"
                type="button"
              >
                <SortIcons />
                <span className="dsn-button__label">Sorteer op Prijs</span>
              </button>
            </span>
          </th>
          <th scope="col" className="dsn-table__cell--numeric">
            Voorraad
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Laptop</th>
          <td className="dsn-table__cell--numeric">€999</td>
          <td className="dsn-table__cell--numeric">12</td>
        </tr>
        <tr>
          <th scope="row">Muis</th>
          <td className="dsn-table__cell--numeric">€29</td>
          <td className="dsn-table__cell--numeric">84</td>
        </tr>
        <tr>
          <th scope="row">Toetsenbord</th>
          <td className="dsn-table__cell--numeric">€79</td>
          <td className="dsn-table__cell--numeric">34</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">Totaal</th>
          <td className="dsn-table__cell--numeric">—</td>
          <td className="dsn-table__cell--numeric">130</td>
        </tr>
      </tfoot>
    </Table>
  ),
};

// =============================================================================
// INTERACTIESTORIES
// =============================================================================

/* ===== Selecteerbare rijen ===== */

const products = [
  {
    id: '1',
    name: 'Laptop Pro',
    category: 'Hardware',
    price: '€999',
    stock: 12,
  },
  {
    id: '2',
    name: 'Muis Ergonomisch',
    category: 'Accessoires',
    price: '€79',
    stock: 84,
  },
  {
    id: '3',
    name: 'Toetsenbord Compact',
    category: 'Accessoires',
    price: '€129',
    stock: 34,
  },
];

const SelectableRowsTable = (args: TableProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = selected.size === products.length;
  const someSelected = selected.size > 0 && !allSelected;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)));
  };

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  return (
    <Table {...args}>
      <thead>
        <tr>
          <th scope="col">
            <Checkbox
              id="select-all"
              checked={allSelected}
              indeterminate={someSelected}
              onChange={toggleAll}
            />
            <label htmlFor="select-all" className="dsn-visually-hidden">
              Selecteer alle rijen
            </label>
          </th>
          <th scope="col">Product</th>
          <th scope="col">Categorie</th>
          <th scope="col" className="dsn-table__cell--numeric">
            Prijs
          </th>
          <th scope="col" className="dsn-table__cell--numeric">
            Voorraad
          </th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id} aria-selected={selected.has(product.id)}>
            <td>
              <Checkbox
                id={`select-row-${product.id}`}
                checked={selected.has(product.id)}
                onChange={() => toggleRow(product.id)}
              />
              <label
                htmlFor={`select-row-${product.id}`}
                className="dsn-visually-hidden"
              >
                Selecteer {product.name}
              </label>
            </td>
            <td>{product.name}</td>
            <td>{product.category}</td>
            <td className="dsn-table__cell--numeric">{product.price}</td>
            <td className="dsn-table__cell--numeric">{product.stock}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export const SelectableRows: Story = {
  name: 'Selectable rows (met checkboxes)',
  args: {
    caption: 'Productoverzicht — selecteerbare rijen',
  },
  render: (args: TableProps) => <SelectableRowsTable {...args} />,
};

/* ===== Link in eerste cel ===== */

export const WithLink: Story = {
  name: 'With link in first cell',
  args: {
    caption: 'Producten met links',
  },
  render: (args: TableProps) => (
    <Table {...args}>
      <thead>
        <tr>
          <th scope="col">Product</th>
          <th scope="col">Categorie</th>
          <th scope="col" className="dsn-table__cell--numeric">
            Prijs
          </th>
          <th scope="col" className="dsn-table__cell--numeric">
            Voorraad
          </th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td>
              <Link href="#">{product.name}</Link>
            </td>
            <td>{product.category}</td>
            <td className="dsn-table__cell--numeric">{product.price}</td>
            <td className="dsn-table__cell--numeric">{product.stock}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  ),
};

/* ===== Verwijder-actie ===== */

export const WithDeleteAction: Story = {
  name: 'With delete action',
  args: {
    caption: 'Producten met verwijderactie',
  },
  render: (args: TableProps) => (
    <Table {...args}>
      <thead>
        <tr>
          <th scope="col">Product</th>
          <th scope="col">Categorie</th>
          <th scope="col" className="dsn-table__cell--numeric">
            Prijs
          </th>
          <th scope="col">Actie</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <th scope="row">{product.name}</th>
            <td>{product.category}</td>
            <td className="dsn-table__cell--numeric">{product.price}</td>
            <td>
              <button
                type="button"
                className="dsn-button dsn-button--subtle-negative dsn-button--size-small"
              >
                <Icon name="trash" aria-hidden />
                <span className="dsn-button__label">
                  Verwijder
                  <span className="dsn-visually-hidden"> {product.name}</span>
                </span>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  ),
};

/* ===== Actiemenu ===== */

export const WithActionsMenu: Story = {
  name: 'With actions menu',
  args: {
    caption: 'Producten met actiemenu',
  },
  render: (args: TableProps) => (
    <Table {...args}>
      <thead>
        <tr>
          <th scope="col">Product</th>
          <th scope="col">Categorie</th>
          <th scope="col" className="dsn-table__cell--numeric">
            Prijs
          </th>
          <th scope="col">Acties</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <th scope="row">{product.name}</th>
            <td>{product.category}</td>
            <td className="dsn-table__cell--numeric">{product.price}</td>
            <td>
              <button
                type="button"
                className="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only"
              >
                <Icon name="dots-vertical" aria-hidden />
                <span className="dsn-button__label">
                  Toon acties
                  <span className="dsn-visually-hidden">
                    {' '}
                    voor {product.name}
                  </span>
                </span>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  ),
};

/* ===== Alles gecombineerd ===== */

const AllTogetherTable = (args: TableProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = selected.size === products.length;
  const someSelected = selected.size > 0 && !allSelected;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)));
  };

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  return (
    <Table {...args}>
      <thead>
        <tr>
          <th scope="col">
            <Checkbox
              id="combined-select-all"
              checked={allSelected}
              indeterminate={someSelected}
              onChange={toggleAll}
            />
            <label
              htmlFor="combined-select-all"
              className="dsn-visually-hidden"
            >
              Selecteer alle rijen
            </label>
          </th>
          <th scope="col">Product</th>
          <th scope="col">Categorie</th>
          <th scope="col" className="dsn-table__cell--numeric">
            Prijs
          </th>
          <th scope="col" className="dsn-table__cell--numeric">
            Voorraad
          </th>
          <th scope="col">Acties</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id} aria-selected={selected.has(product.id)}>
            <td>
              <Checkbox
                id={`combined-select-row-${product.id}`}
                checked={selected.has(product.id)}
                onChange={() => toggleRow(product.id)}
              />
              <label
                htmlFor={`combined-select-row-${product.id}`}
                className="dsn-visually-hidden"
              >
                Selecteer {product.name}
              </label>
            </td>
            <td>
              <Link href="#">{product.name}</Link>
            </td>
            <td>{product.category}</td>
            <td className="dsn-table__cell--numeric">{product.price}</td>
            <td className="dsn-table__cell--numeric">{product.stock}</td>
            <td>
              <button
                type="button"
                className="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only"
              >
                <Icon name="dots-vertical" aria-hidden />
                <span className="dsn-button__label">
                  Toon acties
                  <span className="dsn-visually-hidden">
                    {' '}
                    voor {product.name}
                  </span>
                </span>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td />
          <th scope="row">Totaal</th>
          <td />
          <td className="dsn-table__cell--numeric">€1.207</td>
          <td className="dsn-table__cell--numeric">130</td>
          <td />
        </tr>
      </tfoot>
    </Table>
  );
};

export const AllTogether: Story = {
  name: 'All together',
  args: {
    caption: 'Productoverzicht — alle interacties',
    scrollable: true,
  },
  render: (args: TableProps) => <AllTogetherTable {...args} />,
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: () => (
    <Table caption="جدول المنتجات">
      <thead>
        <tr>
          <th scope="col">المنتج</th>
          <th scope="col" className="dsn-table__cell--numeric">
            السعر
          </th>
          <th scope="col" className="dsn-table__cell--numeric">
            المخزون
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>كمبيوتر محمول</td>
          <td className="dsn-table__cell--numeric">٩٩٩ €</td>
          <td className="dsn-table__cell--numeric">١٢</td>
        </tr>
        <tr>
          <td>فأرة</td>
          <td className="dsn-table__cell--numeric">٢٩ €</td>
          <td className="dsn-table__cell--numeric">٨٤</td>
        </tr>
        <tr>
          <td>لوحة المفاتيح</td>
          <td className="dsn-table__cell--numeric">٧٩ €</td>
          <td className="dsn-table__cell--numeric">٣٤</td>
        </tr>
      </tbody>
    </Table>
  ),
};
