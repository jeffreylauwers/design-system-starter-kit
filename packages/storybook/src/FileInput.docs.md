# File Input

Een gestyled bestandsupload-invoerveld dat de native `<input type="file">` omhult met de knopstijl van het design system.

## Doel

De FileInput component biedt een consistent gestyled bestandsinvoerveld. De browser-native functionaliteit blijft intact: het besturingssysteem opent de eigen bestandskiezer, en de browser bepaalt welke tekst naast de knop verschijnt ("No file chosen", "Geen bestand geselecteerd", etc.). De knop wordt gestyled via het `::file-selector-button` CSS pseudo-element en ziet eruit als `dsn-button--default`. De tekst rechts van de knop wordt subtiel weergegeven zodat de knop visueel de primaire actie is.

<!-- VOORBEELD -->

## Use when

- Je de gebruiker een bestand wilt laten uploaden (bijlage, afbeelding, document).
- Je native browser file-selectie wilt met een consistent, gestyled uiterlijk.
- Je meerdere bestanden tegelijk wilt accepteren (via `multiple`).
- Je het bestandstype wilt beperken (via `accept`).

## Don't use when

- Je drag-and-drop functionaliteit nodig hebt: dat vereist een aparte component.
- Je een al gekozen of geüpload bestand wilt tonen: dat is de rol van de `File`-component. In een uploadstap zijn het geen alternatieven maar een paar, zie hieronder.

## Best practices

- **Koppel `FileInput` altijd aan `File`.** `FileInput` is het kiesmoment; wat er daarna met het bestand gebeurt (uploaden, geslaagd, geweigerd) toont `File`. Zonder die terugkoppeling ziet de gebruiker hooguit de tekst die de browser zelf naast de knop zet, en hoort een screenreadergebruiker niets over de afloop. Zie het patroon **Bestanden uploaden** onder Patronen/Formulieren, en het template **Form step: Upload**.
- **Labels zijn verplicht.** Koppel altijd een `<label>` via `htmlFor`, of gebruik `FormFieldLabel` binnen een `FormField`-structuur.
- **Gebruik `accept` voor filtering.** Beperk het bestandstype via `accept=".pdf,.docx"` om fouten te voorkomen. De browser toont alleen de toegestane bestandstypen in de native kiezer.
- **Valideer altijd server-side.** `accept` is een hint, geen validatie: gebruikers kunnen het omzeilen.
- **Gebruik `multiple` bewust.** Schakel meerdere bestanden in als het formulier dit daadwerkelijk ondersteunt.
- **Bestandsvereisten als lijst.** Als je meerdere bestandsvereisten wilt communiceren (typen, grootte), zet die dan in een [FormFieldDescription](/docs/components-formfielddescription--docs) met `as="div"` en een `id`, met daarin een `UnorderedList`, en koppel die via `aria-describedby`. `as="div"` is nodig omdat een `<ul>` niet binnen een `<p>` mag staan. Houd er rekening mee dat een screenreader deze lijst niet als lijst voorleest en dat VoiceOver in Safari de inhoud overslaat: schrijf elk item als een volledige zin en herhaal de eis in de foutmelding zodra een bestand wordt geweigerd.
- **Invalid state.** Visuele feedback bij een validatiefout wordt afgehandeld op het niveau van `FormField` (rode linkerborder), niet op de FileInput zelf. De `invalid` prop zet enkel `aria-invalid="true"` voor screenreaders.

## In form field context

Combineer FileInput met `FormFieldLabel` en een `FormFieldDescription` met `as="div"` voor de bestandsvereisten. Geef de description een `id` en verwijs ernaar via `aria-describedby`:

```html
<div class="dsn-form-field">
  <label class="dsn-form-field-label" for="bestand-upload">
    Bestand toevoegen
    <span class="dsn-form-field-label-suffix">(niet verplicht)</span>
  </label>
  <div class="dsn-form-field-description" id="bestand-upload-description">
    <ul class="dsn-unordered-list">
      <li>U kunt meerdere bestanden tegelijk toevoegen.</li>
      <li>U mag maximaal 10 MB aan bestanden toevoegen.</li>
      <li>
        Toegestane bestandstypen: doc, docx, xlsx, pdf, zip, jpg, png, bmp en
        gif.
      </li>
    </ul>
  </div>
  <input
    type="file"
    class="dsn-file-input"
    id="bestand-upload"
    aria-describedby="bestand-upload-description"
  />
</div>
```

## Design tokens

| Token                              | Beschrijving                                              |
| ---------------------------------- | --------------------------------------------------------- |
| `--dsn-file-input-color`           | Subtiele tekst kleur voor bestandsnaam / "no file chosen" |
| `--dsn-file-input-column-gap`      | Ruimte tussen knop en bestandsnaam tekst                  |
| `--dsn-file-input-font-family`     | Font family                                               |
| `--dsn-file-input-font-size`       | Font size                                                 |
| `--dsn-file-input-font-weight`     | Font weight                                               |
| `--dsn-file-input-line-height`     | Line height                                               |
| `--dsn-file-input-min-block-size`  | Minimale hoogte (WCAG touch target)                       |
| `--dsn-file-input-min-inline-size` | Minimale breedte (WCAG touch target)                      |
| `--dsn-file-input-disabled-color`  | Tekst kleur in disabled state                             |

De knop (`::file-selector-button`) gebruikt de `--dsn-button-default-*`, `--dsn-button-size-default-*` en `--dsn-button-disabled-*` tokens rechtstreeks, zodat knopstijl altijd in sync blijft met de Button component.

## Accessibility

- Altijd een `<label>` koppelen via `htmlFor` of wrap in `FormField`.
- De `invalid` prop zet `aria-invalid="true"` — visuele feedback voor invalid state wordt door `FormField` afgehandeld.
- Gebruik `aria-describedby` om foutmeldingen of hints (zoals de toegestane bestandstypen) te koppelen.
- Een lijst in een description wordt platgeslagen tot gewone tekst: er klinkt geen "lijst met 3 items" en VoiceOver in Safari slaat de inhoud over. Schrijf de items daarom als volledige zinnen en zorg dat de eisen ook in de foutmelding staan.
- De knop is toetsenbord-bedienbaar: `Tab` focust het veld, `Enter` of `Space` opent de native bestandskiezer.
- Screenreaders lezen de bestandsnaam voor zodra de gebruiker een bestand heeft geselecteerd.
- Minimum touch target grootte van 24x24px conform WCAG 2.5.5.
