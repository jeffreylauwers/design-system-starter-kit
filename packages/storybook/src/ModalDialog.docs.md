# ModalDialog

Modaal dialoogvenster voor korte, gefocuste acties die de volledige aandacht van de gebruiker vereisen.

## Doel

Het ModalDialog component toont een tijdelijk overlay-venster dat de achtergrond blokkeert zolang het open is. Het is gebaseerd op het native `<dialog>` element en biedt ingebakken focus-trap, Escape-sluit-gedrag en automatische achtergrond-inert via `.showModal()`. Gebruik het voor bevestigingsdialogen, korte formulieren of keuzes die buiten de normale paginastroom vallen.

<!-- VOORBEELD -->

## Use when

- De gebruiker moet een onomkeerbare actie bevestigen (bijv. verwijderen, annuleren van een bestelling).
- Een actie of formulier vereist een gefocuste modale context zonder afleiding van de achtergrond.
- Er een korte, zelfstandige keuze nodig is die geen eigen URL rechtvaardigt.

## Don't use when

- De gebruiker de achtergrondpagina voor context nodig heeft — gebruik dan **Drawer**.
- Rij- of itemdetails naast een lijst bekijken of bewerken — gebruik dan **Drawer**.
- Resultaten live filteren terwijl je de lijst bijhoudt — gebruik dan **Drawer** (non-modal).
- De inhoud een volwaardige werkstroom is die een eigen URL rechtvaardigt — gebruik dan een aparte pagina.
- Er meer dan één primaire actie tegelijk aangeboden wordt — splits in twee aparte dialoogvensters of heroverweeg de flow.

## Best practices

### ModalDialog vs. Drawer

| Situatie                                              | Component          |
| ----------------------------------------------------- | ------------------ |
| Korte, gefocuste actie (bevestigen, kleine keuze)     | ModalDialog        |
| Bevestigen van permanent verwijderen                  | ModalDialog        |
| Gebruiker heeft achtergrondpagina nodig voor context  | Drawer             |
| Rij- of itemdetails bekijken/bewerken naast een lijst | Drawer             |
| Filterpaneel met live-bijwerkende resultaten          | Drawer (non-modal) |
| Inhoud verdient een eigen URL                         | Aparte pagina      |

### Sluitgedrag

- **Sluitknop** in de header sluit het dialoogvenster altijd — altijd aanwezig.
- **Escape-toets** sluit het dialoogvenster via het native `cancel`-event.
- **Primaire actie** (bijv. Bevestigen) sluit het dialoogvenster en voert de actie uit.
- **Secundaire actie** (bijv. Annuleren) sluit het dialoogvenster zonder actie.

### Actieknoppenorde

- Zet de **primaire actie links** in de `ActionGroup` (bijv. Bevestigen of Opslaan).
- Zet **Annuleren rechts** — consistent met platformconventies.
- Gebruik maximaal twee primaire acties. Bij meer opties: herontwerp de flow.

### Heading-niveau

- Gebruik `level={2}` (standaard) als de paginatitel `<h1>` is.
- Kies het niveau op basis van de documenthiërarchie — het visuele uiterlijk is altijd gelijk.

### Lange inhoud

- De `ModalDialogBody` scrollt automatisch bij lange inhoud (scroll-affordance schaduw).
- Header en footer blijven sticky zichtbaar tijdens scrollen.
- Houd inhoud beknopt — als er veel tekst nodig is, overweeg dan een aparte pagina.

## Design tokens

| Token                                           | Beschrijving                               |
| ----------------------------------------------- | ------------------------------------------ |
| `--dsn-modal-dialog-background`                 | Achtergrondkleur (bg-elevated)             |
| `--dsn-modal-dialog-border-radius`              | Afgeronde hoeken (12px)                    |
| `--dsn-modal-dialog-border-width`               | Randbreedte                                |
| `--dsn-modal-dialog-border-color`               | Randkleur (neutral.border-subtle)          |
| `--dsn-modal-dialog-box-shadow`                 | Schaduw (box-shadow.lg — hoogste elevatie) |
| `--dsn-modal-dialog-max-width`                  | Maximale breedte (40rem / 640px)           |
| `--dsn-modal-dialog-heading-font-family`        | Lettertype van de heading                  |
| `--dsn-modal-dialog-heading-font-weight`        | Vetgedrukt van de heading                  |
| `--dsn-modal-dialog-heading-font-size`          | Tekstgrootte van de heading                |
| `--dsn-modal-dialog-heading-line-height`        | Regelafstand van de heading                |
| `--dsn-modal-dialog-heading-color`              | Kleur van de heading                       |
| `--dsn-modal-dialog-header-padding-block-start` | Bovenkant padding van de header (16px)     |
| `--dsn-modal-dialog-header-padding-block-end`   | Onderkant padding van de header (16px)     |
| `--dsn-modal-dialog-header-padding-inline`      | Horizontale padding van de header (16px)   |
| `--dsn-modal-dialog-body-padding-block`         | Verticale padding van de body (24px)       |
| `--dsn-modal-dialog-body-padding-inline`        | Horizontale padding van de body (16px)     |
| `--dsn-modal-dialog-footer-padding-block-start` | Bovenkant padding van de footer (16px)     |
| `--dsn-modal-dialog-footer-padding-block-end`   | Onderkant padding van de footer (16px)     |
| `--dsn-modal-dialog-footer-padding-inline`      | Horizontale padding van de footer (16px)   |

## Accessibility

- Het dialoogvenster gebruikt het native `<dialog>` element met impliciete `role="dialog"` semantiek.
- `.showModal()` activeert automatisch de native focus-trap, `aria-modal`-gedrag en `inert`-attribuut op de achtergrond.
- `aria-labelledby` koppelt het dialoogvenster automatisch aan de `ModalDialogHeading` — geen handmatige ID nodig.
- De sluitknop gebruikt `dsn-button__label` met de tekst "Sluiten" — nooit `aria-label`.
- Focus keert terug naar het element dat het dialoogvenster opende bij sluiten (native browsergedrag).
- Escape sluit het dialoogvenster via het native `cancel`-event.
- Animaties zijn uitgeschakeld bij `prefers-reduced-motion: reduce`.
