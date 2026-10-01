# DR-2026-12: ModalDialog, Drawer en Popover zetten de focus bij openen op de heading

**ID:** DR-2026-12
**Datum:** September 2026
**Status:** Accepted
**Auteurs:** Jeffrey Lauwers

---

## Context

Bij het openen van een dialoogvenster moet de focus ergens in het venster landen. Welk element dat is, bepaalt wat een screenreadergebruiker als eerste hoort, en vanaf welk punt hij verder leest.

ModalDialog, Drawer en Popover hebben dezelfde opbouw: een header met de heading en daarna de sluitknop, een body en een footer met acties. De heading is via `aria-labelledby` de toegankelijke naam van het dialoogvenster. De Popover is een niet-modale dialog (`role="dialog"`), dus dezelfde afweging geldt daar.

**De bevinding (issue #303).** Zonder eigen focusbeheer zet de browser de focus op het eerste focusbare element, en dat is de sluitknop. De accessibility review meldde dat VoiceOver in Safari dan de knop voorleest ("Sluiten, knop"), maar niet de titel uit `aria-labelledby`. Wie daarna verder leest, komt de titel ook niet meer tegen, want die staat in de DOM vóór de sluitknop. De gebruiker weet dus niet in welk venster hij zit. Opgelost in PR #389: de heading krijgt `tabindex="-1"` en bij openen de focus.

**Popover volgde tot nu toe optie 1.** De Popover zette de focus op het eerste interactieve element. Met een `PopoverHeader` is dat de sluitknop, dus precies de situatie uit #303. Bij het vastleggen van dit record is de Popover gelijkgetrokken met ModalDialog en Drawer.

**Waarom dit nu wordt vastgelegd.** De onderbouwing stond alleen in code-commentaar. Algemeen advies zegt iets anders: Hidde de Vries adviseert in [Dialogs, modality and popovers seem similar. How are they different?](https://hidde.blog/dialog-modal-popover-differences/) de focus bij openen op de minst destructieve actie of het eerste formulierveld te zetten. Wie dat artikel leest en daarna onze code, ziet de heading-focus al snel als fout. Dit record voorkomt dat het wordt teruggedraaid zonder de afweging te kennen.

Het advies en onze keuze spreken elkaar minder tegen dan het lijkt. Het dialoogpatroon in de ARIA Authoring Practices (APG) kent drie varianten: standaard focus op het eerste focusbare element; focus op een statisch element aan het begin, zoals de titel (met `tabindex="-1"`), wanneer de inhoud anders uit beeld scrolt; en focus op de minst destructieve actie bij een stap die niet makkelijk terug te draaien is. Welke past, hangt af van de inhoud. Voor een generiek component dat niet weet wat erin staat, is de vraag welke van de drie de veilige standaard is.

---

## Opties overwogen

### Optie 1: Browser-standaard, eerste focusbare element

Geen eigen focusbeheer. Bij onze opbouw is het eerste focusbare element altijd de sluitknop.

**Voordeel:** Geen code, en de sluitknop is meteen bereikbaar.
**Nadeel:** Precies het gemelde probleem: VoiceOver in Safari leest de titel niet voor, en de leesvolgorde komt hem daarna niet meer tegen. De gebruiker begint met "Sluiten", zonder te weten wat hij sluit.

### Optie 2: Eerste formulierveld

Focus op het eerste invoerveld in de body.

**Voordeel:** Voor een formulierdialoog kan de gebruiker direct typen. Dit is een van de twee adviezen uit het artikel.
**Nadeel:** Een generiek component weet niet of er een veld in staat; een bevestigingsdialoog heeft er geen. Heeft het veld een eigen label, dan hoort de gebruiker dat label, maar niet de titel van het venster en ook niet de tekst die in de body vóór het veld staat. Die leest hij pas terug als hij daar zelf naartoe navigeert.

### Optie 3: Minst destructieve knop

Focus op bijvoorbeeld "Annuleren" in de footer.

**Voordeel:** Beschermt tegen een onbedoelde Enter op een destructieve actie. Het andere advies uit het artikel, en het APG-patroon voor een bevestigingsdialoog.
**Nadeel:** Het component kan niet weten welke knop het minst destructief is; dat is betekenis, geen structuur. De focus staat bovendien in de footer, aan het eind van het venster: titel en uitleg staan ervóór en worden overgeslagen. Wie niet ziet, moet terugnavigeren om te begrijpen waar hij "Annuleren" op drukt.

### Optie 4: Het `<dialog>` zelf

Focus op het dialog-element (`tabindex="-1"`).

**Voordeel:** Werkt altijd, ook zonder heading. De toegankelijke naam komt uit `aria-labelledby`.
**Nadeel:** Wat er dan wordt voorgelezen verschilt per screenreader: de ene leest alleen de naam, de andere de hele inhoud van het venster in één keer. De focusomtrek komt om het hele venster te staan. En het leunt op dezelfde `aria-labelledby`-aankondiging die in optie 1 al niet betrouwbaar bleek.

### Optie 5: De heading (gekozen)

De heading krijgt `tabindex="-1"` en bij openen de focus. Zonder heading valt de focus terug op het `<dialog>` zelf (optie 4).

**Voordeel:** De titel wordt als eerste voorgelezen, als gewone tekst, en is dus niet afhankelijk van hoe een screenreader `aria-labelledby` bij focus aankondigt. De leesvolgorde loopt daarna vanzelf door naar de sluitknop, de inhoud en de acties, in DOM-volgorde, die gelijk is aan de visuele volgorde. Eén Tab brengt de gebruiker bij de sluitknop. Het werkt voor elke inhoud, zonder dat het component die hoeft te begrijpen. Het sluit aan op de APG-variant "focus op een statisch element aan het begin", die wij als standaard gebruiken in plaats van alleen bij lange inhoud.
**Nadeel:** Een formulierdialoog vraagt één Tab extra voordat de gebruiker kan typen. Een bevestigingsdialoog beschermt niet via de focus tegen een onbedoelde Enter op de destructieve actie (maar Enter op een heading doet niets, dus er gebeurt ook niets per ongeluk).

---

## Beslissing

**ModalDialog, Drawer en Popover zetten bij openen de focus op de heading (`ModalDialogHeading`, `DrawerHeading`, `PopoverHeading`, elk met `tabindex="-1"`). Zonder heading krijgt het dialoogvenster zelf de focus (optie 4): het `<dialog>`, of bij de Popover het paneel met `role="dialog"`. Dit geldt voor beide varianten van de Drawer, modaal en non-modaal.**

```html
<dialog class="dsn-modal-dialog" tabindex="-1" aria-labelledby="dialog-titel">
  <div class="dsn-modal-dialog__header">
    <h2 class="dsn-modal-dialog-heading" id="dialog-titel" tabindex="-1">
      Item verwijderen
    </h2>
    <button type="button" class="dsn-button …">…Sluiten…</button>
  </div>
  …
</dialog>
```

```js
dialog.showModal();
(heading ?? dialog).focus();
```

Daarbij horen deze deelbesluiten.

### 1. Geen DOM-volgorde omdraaien

De review opperde als workaround de sluitknop in de DOM vóór de titel te zetten, en alleen visueel erna. Dat doen we niet: DOM-volgorde en visuele volgorde lopen dan uiteen (WCAG 1.3.2), en de gebruiker begint nog steeds met "Sluiten". De focus op de heading lost hetzelfde op zonder die breuk.

### 2. Focusomtrek alleen bij toetsenbordgebruik

De heading krijgt geen zichtbare focusomtrek bij muisgebruik, wel bij toetsenbordgebruik, via `:focus-visible`. Een heading is geen bedieningselement, en een omtrek na een muisklik op "Openen" oogt als een fout.

### 3. Geen opt-out, voorlopig

Er komt geen prop om de initiële focus ergens anders te zetten (bijvoorbeeld `initialFocusRef` voor een formulierdialoog). Er is nog geen usecase die de extra Tab niet rechtvaardigt, en elke opt-out is een plek waar het probleem uit #303 terug kan komen.

Komt die usecase er wel, dan wordt het een expliciete prop die naar een element wijst. Geen heuristiek die zelf een "eerste veld" of "veilige knop" zoekt, om de redenen onder optie 2 en 3.

### 4. Het `autofocus`-attribuut wordt overschreven

`.showModal()` respecteert `autofocus` op een element in het venster, maar onze focus op de heading volgt daarna en wint. Dat is bewust, zie deelbesluit 3. Wie `autofocus` in een ModalDialog of Drawer zet, ziet er dus geen effect van.

### 5. Ook de alertdialog focust op de heading

Voor de alertdialog-variant van ModalDialog (`alert`, #415) is de afweging opnieuw gemaakt, omdat het APG-voorbeeld daar de minst destructieve knop focust. De uitkomst is dezelfde: de heading. De bescherming die die knop biedt, tegen een onbedoelde Enter op de destructieve actie, geeft de heading ook, want Enter op een heading doet niets. De boodschap zelf komt via `aria-describedby` naar de body mee. En het component kan nog steeds niet weten welke knop het minst destructief is, dus dat zou een opt-out vragen die deelbesluit 3 juist afwijst.

### Verificatie

Op 30 september 2026 getest met VoiceOver in Safari, het scenario uit #303: met de focus op de heading wordt de titel voorgelezen. Op 1 oktober 2026 ook de alertdialog (story `Alert`): titel en boodschap uit `aria-describedby` worden voorgelezen.

---

## Impact

| Dimensie                                    | Browser-standaard (optie 1)     | Heading (gekozen)                    |
| ------------------------------------------- | ------------------------------- | ------------------------------------ |
| Eerst voorgelezen                           | "Sluiten, knop"                 | De titel van het venster             |
| Titel voorgelezen bij openen                | niet in VoiceOver/Safari (#303) | ja, geverifieerd in VoiceOver/Safari |
| Tabs tot de sluitknop                       | 0                               | 1                                    |
| Tabs tot het eerste veld (formulierdialoog) | 1                               | 2                                    |
| DOM-volgorde = visuele volgorde             | ja                              | ja                                   |
| Afhankelijk van de inhoud van het venster   | nee                             | nee                                  |

---

## Gevolgen

**Wat makkelijker wordt:**

- Een screenreadergebruiker weet bij openen altijd in welk venster hij zit, ongeacht de inhoud.
- Consumers hoeven niets te regelen: de heading-focus zit in het component.

**Wat moeilijker wordt:**

- Een formulierdialoog kost één Tab extra tot het eerste veld.
- `autofocus` binnen een ModalDialog of Drawer heeft geen effect.

**Nieuwe verplichtingen voor contributors:**

- Geef een ModalDialog, Drawer of Popover met een titel altijd een heading-subcomponent. Zonder heading valt de focus op het hele venster, met de nadelen van optie 4.
- Verander de initiële focus niet naar "eerste veld" of "minst destructieve knop" op basis van algemeen advies zonder dit record te herzien. Test een wijziging met VoiceOver in Safari, het scenario uit #303.

**Buiten scope:**

- `PopoverMenu` zet de focus op het eerste item. Dat is bewust: het is geen dialog en het paneel heeft geen titel, de context zit in het label van de trigger.
- Het gedeelde gedrag van Popover en PopoverMenu (`usePopover` in `packages/components-react/src/utils/popover.ts`) kent daarom twee standen: met `initialFocusRef` (heading, anders het paneel) of zonder (eerste interactieve element).

---

## Supersedes / superseded by

Herzie dit record wanneer er een usecase komt voor een andere initiële focus (deelbesluit 3), of wanneer VoiceOver in Safari `aria-labelledby` bij focus op de sluitknop wel betrouwbaar voorleest.

---

## Gerelateerde records

- [DR-2026-01](DR-2026-01-button-label-span-over-aria-label.md): toegankelijke naam van de sluitknop via `dsn-button__label`
- Issue #303 en PR #389: de oorspronkelijke bevinding en fix
- Issue #414: aanleiding voor dit record
- ARIA Authoring Practices, Dialog (Modal) Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- WCAG 1.3.2 Betekenisvolle volgorde: https://nldesignsystem.nl/wcag/1.3.2/
