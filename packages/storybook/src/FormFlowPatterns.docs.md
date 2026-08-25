# Formulierpatronen

Richtlijnen voor het ontwerpen en uitwerken van formulierflows.

---

## Enkelvoudig vs meerstappenformulier

Gebruik een **enkelvoudig formulier** (één pagina) als:

- Het formulier weinig velden heeft
- Het geen gevoelige informatie betreft of een gevoelig onderwerp
- Groepering in stappen geen meerwaarde heeft

Bij een enkelvoudig formulier:

- Geen introductiepagina
- Geen reviewpagina: na submit direct naar de bevestigingspagina
- Voorbeelden: zoekfilter, simpele aanmelding, voorkeurinstellingen

Gebruik een **meerstappenformulier** zodra het formulier substantieel is, gevoelige informatie bevat, of de gebruiker er baat bij heeft om stap voor stap begeleid te worden.

---

## Flow structuur meerstappenformulier

```
Introductiepagina (optioneel, zie richtlijn)
  ↓
Formulierstap 1
  ↓
Formulierstap 2
  ↓  (...)
Reviewpagina
  ↓
Bevestigingspagina
```

---

## Introductiepagina

Gebruik een introductiepagina:

- Bij formulieren met meer dan 3 stappen, zodat de gebruiker weet wat er komen gaat
- Als de gebruiker iets moet voorbereiden om het formulier in te kunnen vullen (denk aan documenten, referentienummers, inloggegevens)

Bij twijfel: voeg de introductiepagina toe. Het is vrijwel altijd een verbetering.

**Wat staat er op de introductiepagina:**

- Een korte introductie van het formulier
- Wat de gebruiker nodig heeft om het formulier in te vullen
- De stappen die doorlopen worden, bij naam. Bijvoorbeeld: "Dit formulier bestaat uit de volgende stappen: X, Y, Z en het controleren van de ingevulde informatie."
- Dat niet-verplichte velden worden aangegeven
- Of het formulier tussendoor opgeslagen kan worden
- Wat er na het versturen gebeurt (bevestigingsmail, downloadoptie)

**Knop op introductiepagina:** "Doorgaan" (`ButtonLink` variant="strong")

Zie ook het template **Introduction page** in Storybook.

---

## Formulierstappen

### Indeling van stappen

Groepeer gerelateerde vragen samen op één stap. Als een logische groepering moeilijk te maken is en het formulier daardoor niet te lang wordt, mag één vraag per stap ook.

Gebruik voor elke stap:

- `Heading` level 1 voor de **titel van het formulier** (consistent op elke stap)
- `<h2>` voor de **titel van de stap**
- `Paragraph` als instructietekst: "Vul alles in. Als iets niet verplicht is, staat dat erbij."
- `<form noValidate>` met `Stack space="3xl"` voor de velden
- Navigatielink "Vorige stap" (`Link` met `arrow-left` icoon) boven de titel van de stap

### Niet-verplichte velden

Ga er vanuit dat een formulier alleen de broodnodige velden bevat. De meeste velden zijn daardoor verplicht. Niet-verplichte velden zijn de uitzondering: markeer ze door de tekst "(niet verplicht)" op te nemen als `labelSuffix` op `FormField` of `FormFieldset`.

```tsx
<FormField
  label="Tussenvoegsel"
  htmlFor="tussenvoegsel"
  labelSuffix="(niet verplicht)"
>
  <TextInput id="tussenvoegsel" width="xs" />
</FormField>
```

### ActionGroup per stap

```tsx
<ActionGroup
  direction="vertical"
  style={{ marginBlockStart: 'var(--dsn-space-block-3xl)' }}
>
  <Button variant="strong" type="submit">
    Volgende stap
  </Button>
  <LinkButton onClick={() => setActiveModal('save')}>
    Opslaan en later verder
  </LinkButton>
  <LinkButton onClick={() => setActiveModal('stop')}>
    Stoppen met het formulier
  </LinkButton>
</ActionGroup>
```

"Opslaan en later verder" en "Stoppen met het formulier" openen elk een `ModalDialog` ter bevestiging.

Zie ook de templates **Form step: Simple details** en **Form step: Extended details** in Storybook.

### Voortgang tonen

Standaard: toon geen voortgangsindicator. Voeg er een toe alleen als gebruikersonderzoek aantoont dat gebruikers hier behoefte aan hebben.

---

## Formuliercontroles kiezen

### RadioGroup vs Select

- Gebruik **`RadioGroup`** bij 12 opties of minder
- Gebruik **`RadioGroup`** als de stap puur bestaat uit een keuzelijst, ongeacht het aantal opties: toon alle opties direct en gebruik nooit een `Select`
- Gebruik **`Select`** alleen als er meer dan 12 opties zijn én de keuze onderdeel is van een bredere stap met meer velden

### Checkbox

- Checkboxen komen vrijwel altijd in een **`CheckboxGroup`**
- Een alleenstaande `Checkbox` is bedoeld voor het akkoord gaan met iets (bijv. voorwaarden)
- Zet **nooit een link in het label** van een checkbox of radiobutton. Zet de link vóór de checkbox:

```tsx
{/* ✅ Link vóór de checkbox */}
<Link href="/voorwaarden">Bekijk de voorwaarden</Link>
<CheckboxOption id="akkoord" name="akkoord" label="Ik ga akkoord met de voorwaarden" />

{/* ❌ Link ín het label */}
<CheckboxOption label={<>Ik ga akkoord met de <Link href="/voorwaarden">voorwaarden</Link></>} />
```

### Datum uitvragen

Kies op basis van de situatie:

| Situatie                                                                 | Gebruik                                                                      |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Datum die men uit het hoofd weet (geboortedatum, vervaldatum creditcard) | `DateInputGroup`                                                             |
| Keuze uit een beperkt aantal aanstaande datums                           | `RadioGroup` met labels zoals "morgen", "overmorgen", "maandag 22 juni 2026" |
| Datum die verderweg in de toekomst kan liggen, of vrije datumkeuze       | `DateInput`                                                                  |

Gebruik `DateInputGroup` altijd voor data die men kent of kan opzoeken. Gebruik `DateInput` wanneer de gebruiker een datum moet kiezen en de precieze datum niet van tevoren kent.

### Veldbreedte

De breedte van een invulveld communiceert de verwachte invoerlengte. Beschikbare breedtes: `xs`, `sm`, `md`, `lg`, `xl`, `full` (default).

| Invulveld                   | Breedte          |
| --------------------------- | ---------------- |
| Huisnummer, postcode, getal | `xs`             |
| Tussenvoegsel, toevoeging   | `xs`             |
| Telefoonnummer              | `md`             |
| Straat, woonplaats          | `xl`             |
| E-mailadres                 | `xl`             |
| Naam, achternaam            | `full` (default) |
| Tekstvlak (`TextArea`)      | `full` (default) |

---

## Bestanden uploaden

Een uploadstap gebruikt altijd twee componenten. `FileInput` is het kiesmoment, `File` is de terugkoppeling daarna. `FileInput` alleen is niet genoeg: een native `<input type="file">` toont hooguit "3 bestanden gekozen" en zegt niets over wat er daarna met die bestanden gebeurt.

| Component   | Rol                                                                        |
| ----------- | -------------------------------------------------------------------------- |
| `FileInput` | Het veld waarmee de gebruiker bestanden kiest                              |
| `File`      | Toont per bestand de naam, het type, de grootte en de status van de upload |
| `FileList`  | Wrapper zodra er meer dan één bestand kan zijn                             |

### Voorwaarden vooraf tonen

Zet de eisen (maximale grootte, toegestane bestandstypen) boven het veld. Wie de eisen vooraf leest, loopt minder vaak tegen een afwijzing aan.

Zijn het één of twee eisen, dan passen ze als lopende tekst in een `FormFieldDescription`, gekoppeld via `aria-describedby`:

```tsx
<FormFieldDescription id="bestand-upload-description">
  Het bestand mag maximaal 10 MB zijn. Toegestane bestandstypen: doc, docx,
  xlsx, pdf, zip, jpg, png, bmp en gif.
</FormFieldDescription>
<FileInput
  id="bestand-upload"
  aria-describedby="bestand-upload-description"
  multiple
/>
```

Zijn het er te veel voor een leesbare zin, zet de opsomming dan als gewone `UnorderedList` boven het hele form field, buiten de `aria-describedby`-koppeling:

```tsx
<Paragraph>Voor de bestanden die u toevoegt geldt:</Paragraph>
<UnorderedList>
  <li>Het bestand mag maximaal 10 MB zijn.</li>
  <li>Toegestane bestandstypen: doc, docx, xlsx, pdf, zip, jpg, png, bmp en gif.</li>
</UnorderedList>

<div className="dsn-form-field">
  <FormFieldLabel htmlFor="bestand-upload">Bestand toevoegen</FormFieldLabel>
  <FileInput id="bestand-upload" multiple />
</div>
```

Zet de lijst nooit binnen de `FormFieldDescription` zelf. De inhoud van een `aria-describedby`-koppeling wordt platgeslagen tot één tekst, en VoiceOver in Safari leest een lijst daarbinnen helemaal niet voor: de eisen ontbreken dan volledig voor die gebruikers. Als gewone pagina-inhoud houdt de `<ul>` zijn lijstsemantiek en wordt hij wel voorgelezen. Herhaal de eis daarnaast in de foutmelding zodra een bestand wordt geweigerd. Zet ook nooit een link in een description: die is vanuit de aankondiging niet te bereiken en wordt niet als link voorgelezen.

### De vier statussen

Elk gekozen bestand doorloopt een eigen cyclus, los van de andere bestanden in de lijst.

| Status     | Wanneer                      | Wat de gebruiker ziet         | Wat er wordt aangekondigd           |
| ---------- | ---------------------------- | ----------------------------- | ----------------------------------- |
| `loading`  | Upload loopt                 | Spinner                       | Niets                               |
| `uploaded` | Upload geslaagd              | Vinkje, 2 seconden lang       | "{bestandsnaam} succesvol geüpload" |
| `default`  | Bestand staat klaar          | Verwijderknop                 | Niets                               |
| `error`    | Bestand geweigerd of mislukt | Rode rand plus de foutmelding | Bestandsnaam gevolgd door de reden  |

De aankondigingen komen uit de `aria-live` regio die `File` zelf meebrengt. Zie de Accessibility-sectie van de File-documentatie voor de exacte teksten en hoe je ze overschrijft.

### Controleer bij het kiezen, niet pas bij submit

Grootte en bestandstype zijn direct te controleren zodra de gebruiker een bestand kiest. Wacht daar niet mee tot submit: dan is de gebruiker al doorgelopen naar de volgende velden en moet die terug. Dit is de uitzondering op de regel [valideer bij submit](#wanneer-valideren), die geldt voor invoer die de gebruiker nog aan het typen is.

Een geweigerd bestand verdwijnt niet uit de lijst. Het blijft staan als `File` in de error-status, met de reden eronder, en met een verwijderknop. Zo ziet de gebruiker wat er precies is afgewezen.

Gebruik de vaste foutmeldingsteksten uit [Patronen per inputtype](#patronen-per-inputtype), aangevuld met de reden:

```
Het gekozen bestand is te groot. Het bestand mag maximaal 10 MB zijn.
Het gekozen bestandstype is niet toegestaan. Kies een doc, docx, xlsx, pdf, zip, jpg, png, bmp of gif.
```

### Verwijderen

Geef elk bestand een `onDelete`. De verwijderknop van `File` bevat de volledige bestandsnaam als visueel verborgen tekst, zodat "Verwijder" in een lijst van vijf bestanden alsnog eenduidig is.

### Meerdere bestanden

Zet `multiple` op de `FileInput` en verzamel de keuzes in een `FileList`. Leeg na elke keuze de waarde van de input (`event.target.value = ''`), anders kan de gebruiker hetzelfde bestand niet opnieuw kiezen nadat het is verwijderd.

Juist bij meerdere bestanden verdient de bestandsnaam in de aankondiging zijn plek: "Upload mislukt" zonder naam is onbruikbaar zodra er drie uploads tegelijk lopen.

Zie het template **Form step: Upload** in Storybook voor een werkend voorbeeld met alle statussen, de controle op grootte en type, en het verwijderen van bestanden.

---

## Validatie

### Wanneer valideren

Valideer bij **submit**, niet on-blur en niet tijdens het typen.

Gebruik `noValidate` op het `<form>`-element om browser-validatie uit te schakelen:

```tsx
<form noValidate>
```

### Forgiving validatie

Verwijder onnodige spaties aan de achterkant stil (trimmen). Leg die verantwoordelijkheid niet bij de gebruiker.

### Foutmelding structuur

Bij één of meer fouten na submit:

1. Pas de **paginatitel** (`<title>`) aan zodat het aantal fouten daarin vermeld staat. Schermlezers lezen de titel voor bij het inladen van de pagina. Gebruik het formaat: `{n} foutmeldingen - {Titel van de stap} - {Naam van de organisatie}`. Voorbeeld: `2 foutmeldingen - Uw gegevens - Gemeente Voorbeeld`.
2. Toon een **`Alert` variant="negative"** direct boven de titel van de stap (`<h2>`)
3. Toon een **inline foutmelding** bij elk veld via de `error` prop op `FormField` of `FormFieldset`
4. De tekst in de `Alert` en bij het veld is **identiek**
5. In de `Alert` zijn de foutmeldingen ankerlinkjes die naar het betreffende veld springen

De heading benoemt de fout al, dus onderdruk het automatische variant-label van de Alert met `variantLabel=""` om een dubbele aankondiging ("Foutmelding: Er is een foutmelding") te voorkomen.

**Eén fout:**

```tsx
<Alert variant="negative" heading="Er is een foutmelding" variantLabel="">
  <Link href="#veld-id">Foutmeldingstekst</Link>
</Alert>
```

**Meerdere fouten:**

```tsx
<Alert variant="negative" heading="Er zijn 3 foutmeldingen" variantLabel="">
  <UnorderedList>
    <li>
      <Link href="#veld-id-1">Foutmeldingstekst 1</Link>
    </li>
    <li>
      <Link href="#veld-id-2">Foutmeldingstekst 2</Link>
    </li>
    <li>
      <Link href="#veld-id-3">Foutmeldingstekst 3</Link>
    </li>
  </UnorderedList>
</Alert>
```

Zie ook het template **Form step: Extended details** in Storybook voor een werkend voorbeeld met één en meerdere fouten.

---

## Foutmeldingsteksten

### Verplicht veld niet ingevuld

```
Vul een {onderwerp} in.
```

Voorbeelden:

- "Vul een e-mailadres in."
- "Vul een voornaam in."
- "Vul een KVK-nummer in."

### Ingevuld maar ongeldig (minimaal)

```
Ingevulde {onderwerp} is niet toegestaan.
```

Gebruik dit als er geen specifieke reden of goed voorbeeld te geven is.

Voorbeelden:

- "Ingevulde e-mailadres is niet toegestaan."
- "Ingevulde voornaam is niet toegestaan."

### Ingevuld maar ongeldig + reden

```
Ingevulde {onderwerp} is niet toegestaan. {Reden}.
```

Voorbeelden:

- "Ingevulde e-mailadres is niet toegestaan. Er mist een @."
- "Ingevulde voornaam is niet toegestaan. Gebruik alleen letters."
- "Ingevulde KVK-nummer is niet toegestaan. Gebruik alleen cijfers."
- "Ingevulde datum is niet toegestaan. De datum moet in de toekomst liggen."

### Ingevuld maar ongeldig + goed voorbeeld

Gebruik dit als het formaat bepalend is én er nog geen voorbeeld als `FormFieldDescription` staat.

```
Ingevulde {onderwerp} is niet toegestaan. Vul een {onderwerp} in, zoals {voorbeeld}.
```

Voorbeelden:

- "Ingevulde e-mailadres is niet toegestaan. Vul een e-mailadres in, zoals naam@emailadres.nl."
- "Ingevulde postcode is niet toegestaan. Vul een Nederlandse postcode in, zoals 1234AB."

Als het goede voorbeeld al als `FormFieldDescription` bij het veld staat: herhaal het niet in de foutmelding.

### Patronen per type fout

| Fouttype            | Patroon                                                           |
| ------------------- | ----------------------------------------------------------------- |
| Leeg verplicht veld | "Vul een {onderwerp} in."                                         |
| Te lang             | "{Onderwerp} moet {aantal} tekens of minder zijn."                |
| Te kort             | "{Onderwerp} moet {aantal} tekens of meer zijn."                  |
| Ongeldige tekens    | "{Onderwerp} mag geen {karakter} bevatten."                       |
| Ongeldig formaat    | "Ingevulde {onderwerp} is niet toegestaan. {reden of voorbeeld}." |

### Patronen per inputtype

| Inputtype                       | Patroon leeg veld                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| `TextInput`, `EmailInput`, etc. | "Vul een {onderwerp} in."                                                           |
| `CheckboxGroup`                 | "Kies een of meer {opties}."                                                        |
| `RadioGroup`                    | "Kies een {onderwerp}."                                                             |
| `Select`                        | "Kies een {onderwerp}."                                                             |
| `FileInput`                     | "Het gekozen bestand is te groot." / "Het gekozen bestandstype is niet toegestaan." |

### Schrijfregels voor foutmeldingen

- Geen "uw": de gegevens zijn niet altijd van de persoon die het formulier invult
- Geen "geldig" of "correct": niet eenvoudig taalgebruik en legt de schuld bij de gebruiker
- Geen "selecteer": gebruik altijd "kies"
- Geen lidwoord voor "ingevulde": schrijf "Ingevulde {onderwerp}...", niet "De/Het ingevulde {onderwerp}..."
- Zet een punt aan het eind van elke foutmelding: dit geeft een pauze voor schermlezers
- Schrijf foutmeldingen zo dat ze ook als opsomming in de foutmelding-samenvatting bovenaan het formulier werken

---

## Reviewpagina

De reviewpagina toont alle ingevulde gegevens, gegroepeerd per stap.

**Structuur per stap:**

1. `<h3>` met de titel van de stap
2. `Link` met "Wijzig" + visueel verborgen contexttekst (bijv. `<span className="dsn-visually-hidden"> Uw gegevens</span>`) en `pencil`-icoon
3. `SummaryList` met de ingevulde waarden

**ActionGroup onderaan de reviewpagina:**

```tsx
<ActionGroup
  direction="vertical"
  style={{ marginBlockStart: 'var(--dsn-space-block-3xl)' }}
>
  <Button variant="strong-positive" type="submit">
    Versturen
  </Button>
  <LinkButton>Opslaan en later verder</LinkButton>
  <LinkButton>Stoppen met het formulier</LinkButton>
</ActionGroup>
```

Zie ook het template **Review page** in Storybook.

---

## Aanpassen vanuit de reviewpagina

Als de gebruiker op "Wijzig" klikt bij een stap op de reviewpagina:

1. De gebruiker gaat naar de bewuste formulierstap, met de al ingevulde gegevens pre-filled
2. Dit is een uitstapje vanuit de reviewpagina: geen stap in de reguliere flow
3. De pagina toont een navigatielink "Terug" (niet "Vorige stap") linksboven
4. De ActionGroup op deze pagina heeft:
   - "Opslaan en terug" als primaire knop (`Button` variant="strong")
   - "Annuleren" als secundaire knop (`Button` variant="default")
5. Na "Opslaan en terug" keert de gebruiker terug naar de reviewpagina

Zie ook het template **Form step: Edit from review** in Storybook.

---

## Bevestigingspagina

**Structuur:**

1. `Note variant="positive"` als eerste element:
   - Heading: "{Onderwerp} is verstuurd"
   - Body: kenmerk of referentienummer

2. Sectie "Dit gaat er nu gebeuren":
   - `<h2>` met de sectietitel
   - `UnorderedList` met wat de gebruiker kan verwachten (tijdsindicaties, vervolgstappen)

3. `ActionGroup` met vervolgacties:
   - Print-link (`Link` met `printer`-icoon)
   - Download als PDF-link (`Link` met `download`-icoon)
   - Terug naar website-link

De bevestigingspagina is de plek om de relatie met de gebruiker te beginnen: geef duidelijkheid over wat er nu gaat gebeuren en hoe men de voortgang kan volgen.

Zie ook het template **Confirmation page** in Storybook.
