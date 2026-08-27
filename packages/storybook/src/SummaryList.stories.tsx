import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  SummaryList,
  SummaryListRow,
  SummaryListKey,
  SummaryListValue,
  SummaryListActions,
  Link,
  LinkButton,
  Icon,
} from '@dsn-starter-kit/components-react';
import DocsPage from './SummaryList.docs.mdx';
import { VEEL_TEKST } from './story-helpers';

const meta: Meta<typeof SummaryList> = {
  title: 'Components/SummaryList',
  component: SummaryList,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const cls = [
          'dsn-summary-list',
          args.noBorder && 'dsn-summary-list--no-border',
        ]
          .filter(Boolean)
          .join(' ');
        const row = (
          key: string,
          value: string
        ) => `  <div class="dsn-summary-list__row">
    <dt class="dsn-summary-list__key">${key}</dt>
    <dd class="dsn-summary-list__value">${value}</dd>
  </div>`;
        return `<dl class="${cls}">
${[
  row('Naam', 'Jeroen van Drouwen'),
  row('Geboortedatum', '9 december 1984'),
  row('Adres', 'Laan der Voorbeelden, 1440 VP, Westerhaar-Vriezenveensewijk'),
].join('\n')}
</dl>`;
      },
    },
  },
  argTypes: {
    noBorder: { control: 'boolean' },
    children: { control: false },
  },
  args: {
    noBorder: false,
  },
};

export default meta;
type Story = StoryObj<typeof SummaryList>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  render: (args) => (
    <SummaryList {...args}>
      <SummaryListRow>
        <SummaryListKey>Naam</SummaryListKey>
        <SummaryListValue>Jeroen van Drouwen</SummaryListValue>
      </SummaryListRow>
      <SummaryListRow>
        <SummaryListKey>Geboortedatum</SummaryListKey>
        <SummaryListValue>9 december 1984</SummaryListValue>
      </SummaryListRow>
      <SummaryListRow>
        <SummaryListKey>Adres</SummaryListKey>
        <SummaryListValue>
          Laan der Voorbeelden, 1440 VP, Westerhaar-Vriezenveensewijk
        </SummaryListValue>
      </SummaryListRow>
    </SummaryList>
  ),
};

// =============================================================================
// VARIANTEN
// =============================================================================

export const WithActions: Story = {
  render: () => (
    <SummaryList>
      <SummaryListRow>
        <SummaryListKey>Naam</SummaryListKey>
        <SummaryListValue>Jeroen van Drouwen</SummaryListValue>
        <SummaryListActions>
          <Link href="#" iconStart={<Icon name="pencil" />}>
            Wijzig<span className="dsn-visually-hidden"> naam</span>
          </Link>
        </SummaryListActions>
      </SummaryListRow>
      <SummaryListRow>
        <SummaryListKey>Geboortedatum</SummaryListKey>
        <SummaryListValue>9 december 1984</SummaryListValue>
        <SummaryListActions>
          <Link href="#" iconStart={<Icon name="pencil" />}>
            Wijzig<span className="dsn-visually-hidden"> geboortedatum</span>
          </Link>
        </SummaryListActions>
      </SummaryListRow>
      <SummaryListRow>
        <SummaryListKey>Adres</SummaryListKey>
        <SummaryListValue>
          Laan der Voorbeelden, 1440 VP, Westerhaar-Vriezenveensewijk
        </SummaryListValue>
        <SummaryListActions>
          <Link href="#" iconStart={<Icon name="pencil" />}>
            Wijzig<span className="dsn-visually-hidden"> adres</span>
          </Link>
        </SummaryListActions>
      </SummaryListRow>
    </SummaryList>
  ),
};

export const WithMultipleActions: Story = {
  render: () => (
    <SummaryList>
      <SummaryListRow>
        <SummaryListKey>Naam</SummaryListKey>
        <SummaryListValue>Jeroen van Drouwen</SummaryListValue>
        <SummaryListActions>
          <Link href="#" iconStart={<Icon name="pencil" />}>
            Wijzig<span className="dsn-visually-hidden"> naam</span>
          </Link>
          <LinkButton onClick={() => {}} iconStart={<Icon name="trash" />}>
            Verwijder<span className="dsn-visually-hidden"> naam</span>
          </LinkButton>
        </SummaryListActions>
      </SummaryListRow>
      <SummaryListRow>
        <SummaryListKey>Geboortedatum</SummaryListKey>
        <SummaryListValue>9 december 1984</SummaryListValue>
        <SummaryListActions>
          <Link href="#" iconStart={<Icon name="pencil" />}>
            Wijzig<span className="dsn-visually-hidden"> geboortedatum</span>
          </Link>
          <LinkButton onClick={() => {}} iconStart={<Icon name="trash" />}>
            Verwijder<span className="dsn-visually-hidden"> geboortedatum</span>
          </LinkButton>
        </SummaryListActions>
      </SummaryListRow>
      <SummaryListRow>
        <SummaryListKey>Adres</SummaryListKey>
        <SummaryListValue>
          Laan der Voorbeelden, 1440 VP, Westerhaar-Vriezenveensewijk
        </SummaryListValue>
        <SummaryListActions>
          <Link href="#" iconStart={<Icon name="pencil" />}>
            Wijzig<span className="dsn-visually-hidden"> adres</span>
          </Link>
          <LinkButton onClick={() => {}} iconStart={<Icon name="trash" />}>
            Verwijder<span className="dsn-visually-hidden"> adres</span>
          </LinkButton>
        </SummaryListActions>
      </SummaryListRow>
    </SummaryList>
  ),
};

export const MixedRows: Story = {
  render: () => (
    <SummaryList>
      <SummaryListRow>
        <SummaryListKey>Naam</SummaryListKey>
        <SummaryListValue>Jeroen van Drouwen</SummaryListValue>
        <SummaryListActions>
          <Link href="#" iconStart={<Icon name="pencil" />}>
            Wijzig<span className="dsn-visually-hidden"> naam</span>
          </Link>
        </SummaryListActions>
      </SummaryListRow>
      <SummaryListRow>
        <SummaryListKey>Geboortedatum</SummaryListKey>
        <SummaryListValue>9 december 1984</SummaryListValue>
        <SummaryListActions>
          <Link href="#" iconStart={<Icon name="pencil" />}>
            Wijzig<span className="dsn-visually-hidden"> geboortedatum</span>
          </Link>
        </SummaryListActions>
      </SummaryListRow>
      <SummaryListRow noActions>
        <SummaryListKey>Referentienummer</SummaryListKey>
        <SummaryListValue>ABC-123-XYZ</SummaryListValue>
      </SummaryListRow>
      <SummaryListRow noActions>
        <SummaryListKey>Aanvraagdatum</SummaryListKey>
        <SummaryListValue>6 mei 2026</SummaryListValue>
      </SummaryListRow>
    </SummaryList>
  ),
};

export const NoBorder: Story = {
  render: () => (
    <SummaryList noBorder>
      <SummaryListRow>
        <SummaryListKey>Status</SummaryListKey>
        <SummaryListValue>Actief</SummaryListValue>
      </SummaryListRow>
      <SummaryListRow>
        <SummaryListKey>Type</SummaryListKey>
        <SummaryListValue>Particulier</SummaryListValue>
      </SummaryListRow>
      <SummaryListRow>
        <SummaryListKey>Regio</SummaryListKey>
        <SummaryListValue>Noord-Holland</SummaryListValue>
      </SummaryListRow>
    </SummaryList>
  ),
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <div>
        <p style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Basic</p>
        <SummaryList>
          <SummaryListRow>
            <SummaryListKey>Naam</SummaryListKey>
            <SummaryListValue>Jeroen van Drouwen</SummaryListValue>
          </SummaryListRow>
          <SummaryListRow>
            <SummaryListKey>Geboortedatum</SummaryListKey>
            <SummaryListValue>9 december 1984</SummaryListValue>
          </SummaryListRow>
        </SummaryList>
      </div>

      <div>
        <p style={{ marginBottom: '1rem', fontWeight: 'bold' }}>With Actions</p>
        <SummaryList>
          <SummaryListRow>
            <SummaryListKey>Naam</SummaryListKey>
            <SummaryListValue>Jeroen van Drouwen</SummaryListValue>
            <SummaryListActions>
              <Link href="#" iconStart={<Icon name="pencil" />}>
                Wijzig<span className="dsn-visually-hidden"> naam</span>
              </Link>
            </SummaryListActions>
          </SummaryListRow>
          <SummaryListRow>
            <SummaryListKey>Geboortedatum</SummaryListKey>
            <SummaryListValue>9 december 1984</SummaryListValue>
            <SummaryListActions>
              <Link href="#" iconStart={<Icon name="pencil" />}>
                Wijzig
                <span className="dsn-visually-hidden"> geboortedatum</span>
              </Link>
            </SummaryListActions>
          </SummaryListRow>
        </SummaryList>
      </div>

      <div>
        <p style={{ marginBottom: '1rem', fontWeight: 'bold' }}>No Border</p>
        <SummaryList noBorder>
          <SummaryListRow>
            <SummaryListKey>Status</SummaryListKey>
            <SummaryListValue>Actief</SummaryListValue>
          </SummaryListRow>
          <SummaryListRow>
            <SummaryListKey>Type</SummaryListKey>
            <SummaryListValue>Particulier</SummaryListValue>
          </SummaryListRow>
        </SummaryList>
      </div>
    </div>
  ),
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  render: () => (
    <SummaryList>
      <SummaryListRow>
        <SummaryListKey>A</SummaryListKey>
        <SummaryListValue>B</SummaryListValue>
      </SummaryListRow>
      <SummaryListRow>
        <SummaryListKey>C</SummaryListKey>
        <SummaryListValue>D</SummaryListValue>
      </SummaryListRow>
    </SummaryList>
  ),
};

export const LongText: Story = {
  render: () => (
    <SummaryList>
      <SummaryListRow>
        <SummaryListKey>{VEEL_TEKST}</SummaryListKey>
        <SummaryListValue>{VEEL_TEKST}</SummaryListValue>
        <SummaryListActions>
          <Link href="#" iconStart={<Icon name="pencil" />}>
            Wijzig<span className="dsn-visually-hidden"> {VEEL_TEKST}</span>
          </Link>
        </SummaryListActions>
      </SummaryListRow>
      <SummaryListRow>
        <SummaryListKey>{VEEL_TEKST}</SummaryListKey>
        <SummaryListValue>{VEEL_TEKST}</SummaryListValue>
      </SummaryListRow>
    </SummaryList>
  ),
};
