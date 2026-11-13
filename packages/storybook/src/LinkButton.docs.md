# LinkButton

Een knop die semantisch een `<button>` is, maar visueel het uiterlijk van een [Link](/docs/components-link--docs) heeft.

## Doel

`LinkButton` vermindert de attentiewaarde van een actie op plekken waar een volwaardige Button te dominant zou zijn. Gebruik het wanneer een actie een JavaScript-handler of form-submit vereist: dus een echte `<button>` nodig is: maar de visuele prominentie van een Button niet past bij de context.

<!-- VOORBEELD -->

## Wel gebruiken als...

- De actie een JavaScript-handler of form-submit vereist en niet naar een andere URL navigeert.
- Je de visuele prominentie van een Button wilt verminderen, maar toch correcte button-semantiek nodig hebt.
- Je een secundaire actie naast een prominente primaire knop wilt tonen, waarbij andere secundaire acties wél echte Links zijn.
- Je inline tekstacties in een formulier wilt toevoegen, zoals "Wachtwoord vergeten?".
- Je een menu of paneel wilt openen, zoals "Mijn profiel" in een Page Header.

## Niet gebruiken als...

- De actie de gebruiker naar een andere pagina of URL navigeert: gebruik dan de [Link](/docs/components-link--docs) component.
- Je een duidelijke, prominente call-to-action wilt: gebruik dan de [Button](/docs/components-button--docs) component.
- Je de button als `<a>` element wilt renderen: gebruik dan Link, nooit een `<a>` met een click handler.

## Goed gebruik

- **Gebruik beschrijvende teksten.** Vermijd "klik hier". Gebruik teksten die de actie beschrijven, zoals "Wachtwoord vergeten?" of "Selectie wissen".
- **Geen loading state.** `LinkButton` heeft het uiterlijk van een Link. Een laadspinner past niet in dit visuele patroon; gebruik een Button als je een loading state nodig hebt.
- **Iconen verduidelijken betekenis.** Gebruik `iconStart` voor acties (bijv. een pijl terug) en `iconEnd` voor richtingen of voortgang.
- **Gebruik `size` alleen wanneer nodig.** Zonder expliciete `size` erft de LinkButton de lettergrootte van de omliggende tekst: ideaal voor inline gebruik.
- **`type="button"` is de default.** Dat voorkomt onbedoeld form-submit. Stel expliciet `type="submit"` in als je een formulier wilt versturen.

## Toegankelijkheid

- Semantisch een `<button>`: screenreaders kondigen het element aan als "knop", niet als "link". Gebruikers weten daardoor dat de actie geen navigatie veroorzaakt.
- `disabled` werkt native: toetsenbord en screenreader ondersteuning zijn out of the box correct.
- Iconen zijn altijd decoratief (`aria-hidden="true"`). De toegankelijke naam komt altijd uit `children`.

## Design tokens

`LinkButton` erft alle `--dsn-link-*` tokens van het [Link](/docs/components-link--docs) component via de `dsn-link` klasse. Er zijn geen eigen componenttokens.
