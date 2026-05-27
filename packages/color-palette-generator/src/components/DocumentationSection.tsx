import './DocumentationSection.css';

export function DocumentationSection() {
  return (
    <section className="doc-section" aria-label="Documentatie">
      {/* 1 — Waarvoor */}
      <div className="doc-block">
        <h2 className="doc-block__title">Waarvoor dient deze tool?</h2>
        <p>
          De DSN Color Palette Generator maakt een volledig semantisch
          kleurenpalet op basis van één basiskleur per kleurgroep. Het resultaat
          is direct bruikbaar als design-token JSON voor{' '}
          <a
            className="doc-link"
            href="https://styledictionary.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Style Dictionary
          </a>{' '}
          en volgt het{' '}
          <a
            className="doc-link"
            href="https://design-tokens.github.io/community-group/format/"
            target="_blank"
            rel="noopener noreferrer"
          >
            DTCG-formaat
          </a>
          .
        </p>
        <p>De tool is bedoeld voor:</p>
        <ul className="doc-list">
          <li>
            <strong>Design system teams</strong> die een nieuw kleurthema willen
            opzetten of een bestaand thema willen uitbreiden.
          </li>
          <li>
            <strong>Designers</strong> die snel willen verkennen hoe een
            merkkleur uitpakt als volledig semantisch palet.
          </li>
          <li>
            <strong>Developers</strong> die tokens rechtstreeks willen
            exporteren naar hun token-pipeline zonder handmatig contrast te
            berekenen.
          </li>
        </ul>
        <p>
          Het contrast van elke tint wordt automatisch gecontroleerd conform{' '}
          <strong>WCAG 2.x</strong>: tekst- en icoontokens halen minimaal 4,5:1
          op hun achtergrond, bordertokens minimaal 3:1.
        </p>
      </div>

      {/* 2 — Hoe gebruiken */}
      <div className="doc-block">
        <h2 className="doc-block__title">Hoe gebruik je de tool?</h2>
        <ol className="doc-list doc-list--ordered">
          <li>
            <strong>Kies een basiskleur</strong> per kleurgroep via het kleurvak
            links in elke rij. De basiskleur bepaalt de tint (hue) van het
            volledige palet. Je kunt meerdere groepen tegelijk beheren voor
            bijvoorbeeld <em>accent</em>, <em>neutral</em> en <em>negative</em>.
          </li>
          <li>
            <strong>Hernoem een groep</strong> door op de groepsnaam te klikken.
            De naam wordt gebruikt als tokennaam bij export (bijv.{' '}
            <code className="doc-code">accent-1</code> wordt{' '}
            <code className="doc-code">dsn.color.accent-1.*</code>).
          </li>
          <li>
            <strong>Pas de intensiteit aan</strong> via de schuifregelaar (0,3×
            tot 2×). Lagere intensiteit geeft gedempte, neutrale tinten; hogere
            intensiteit geeft levendigere kleuren. De standaard is 1×.
          </li>
          <li>
            <strong>Wissel tussen light en dark modus</strong> om te zien hoe
            het palet eruitziet op donkere achtergronden. Exporteer elke modus
            apart als <code className="doc-code">colors-light.json</code> en{' '}
            <code className="doc-code">colors-dark.json</code>.
          </li>
          <li>
            <strong>Toon de inverse tokens</strong> via de
            &ldquo;Inverse&rdquo;-knop. Inverse tokens zijn bedoeld voor
            UI-elementen die op een gekleurde achtergrond staan, zoals een
            banner in de merkkleur.
          </li>
          <li>
            <strong>Kopieer een kleurwaarde</strong> door op een swatch te
            klikken. De waarde wordt gekopieerd in het formaat dat je hebt
            gekozen (HEX of OKLCH).
          </li>
          <li>
            <strong>Exporteer de tokens</strong> via de knoppen rechts in de
            toolbar:
            <ul className="doc-list doc-list--nested">
              <li>
                <strong>DTCG</strong> — JSON in het W3C Design Token Community
                Group-formaat, klaar voor Style Dictionary v4.
              </li>
              <li>
                <strong>Generic</strong> — een platte JSON met alle hex-waarden
                voor gebruik in tools die DTCG niet ondersteunen.
              </li>
            </ul>
          </li>
        </ol>
      </div>

      {/* 3 — Hoe werkt het */}
      <div className="doc-block">
        <h2 className="doc-block__title">Hoe werkt het op de achtergrond?</h2>
        <p>
          Het palet is opgebouwd uit drie functionele <em>tracks</em>. Elke
          track heeft een ander doel, en daarom ook een andere kleursterkte:
        </p>
        <div className="doc-tracks">
          <div className="doc-track">
            <span className="doc-track__label">Backgrounds</span>
            <p className="doc-track__desc">
              Heel lichte, subtiel gekleurde tinten. Hoge kleursterkte hier zou
              de pagina onrustig maken; de tint is er puur om kleuridentiteit te
              geven.
            </p>
          </div>
          <div className="doc-track">
            <span className="doc-track__label">Borders</span>
            <p className="doc-track__desc">
              Middelmatige kleursterkte. Borders zijn structureel en hoeven niet
              te schreeuwen, maar moeten wel zichtbaar zijn tegen hun
              achtergrond.
            </p>
          </div>
          <div className="doc-track">
            <span className="doc-track__label">Colors</span>
            <p className="doc-track__desc">
              Tekst- en icoontokens krijgen de hoogste kleursterkte. De
              helderheid wordt vervolgens automatisch bijgesteld totdat het
              contrast voldoende is.
            </p>
          </div>
        </div>
        <p>
          Elk token toont een <strong>✓</strong> of <strong>✗</strong> met de
          gemeten contrastverhouding. Bij een ✗ is het contrast automatisch
          gecorrigeerd door de helderheid (L) stapsgewijs aan te passen totdat
          de WCAG-drempel gehaald wordt.
        </p>

        <details className="doc-details">
          <summary className="doc-details__summary">
            Technische details voor developers
          </summary>
          <div className="doc-details__body">
            <p>
              Alle kleuren worden intern berekend in <strong>OKLCH</strong>{' '}
              (Lightness, Chroma, Hue). OKLCH heeft ten opzichte van HSL als
              voordeel dat gelijke L-waarden ook perceptueel even licht ogen,
              ongeacht de tint. Dat maakt het mogelijk om paletten van
              verschillende kleuren visueel te aligneren op dezelfde raster.
            </p>
            <p>De drie assen:</p>
            <ul className="doc-list">
              <li>
                <code className="doc-code">L</code> (0–1) — perceptuele
                helderheid; 0 = zwart, 1 = wit.
              </li>
              <li>
                <code className="doc-code">C</code> (0–∞, praktisch ≤ 0,4) —
                chroma, de &ldquo;kleursterkte&rdquo;. Hoe hoger, hoe
                levendiger.
              </li>
              <li>
                <code className="doc-code">H</code> (0–360°) — tint. Wordt
                altijd overgenomen van de basiskleur en nooit aangepast.
              </li>
            </ul>
            <p>
              Per track worden de volgende chroma-vermenigvuldigers gebruikt:
            </p>
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Track</th>
                  <th>Token</th>
                  <th>Chroma-factor (light)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Backgrounds</td>
                  <td>
                    <code className="doc-code">bg-document / bg-elevated</code>
                  </td>
                  <td>baseC × 0,06</td>
                </tr>
                <tr>
                  <td>Backgrounds</td>
                  <td>
                    <code className="doc-code">bg-subtle … bg-active</code>
                  </td>
                  <td>baseC × 0,10 – 0,22</td>
                </tr>
                <tr>
                  <td>Borders</td>
                  <td>
                    <code className="doc-code">border-subtle</code>
                  </td>
                  <td>baseC × 0,45</td>
                </tr>
                <tr>
                  <td>Borders</td>
                  <td>
                    <code className="doc-code">
                      border-default … border-active
                    </code>
                  </td>
                  <td>baseC × 1,0</td>
                </tr>
                <tr>
                  <td>Colors</td>
                  <td>
                    <code className="doc-code">
                      color-default … color-active
                    </code>
                  </td>
                  <td>baseC × 1,0</td>
                </tr>
              </tbody>
            </table>
            <p>
              De intensiteitsregelaar werkt als globale vermenigvuldiger bovenop
              deze factoren:{' '}
              <code className="doc-code">
                effectiefC = baseC × trackFactor × intensity
              </code>
              .
            </p>
            <p>
              Voor contrast-correctie gebruikt de engine{' '}
              <code className="doc-code">adjustLForContrast()</code>: de
              L-waarde wordt in stappen van 0,005 aangepast (verduisterd of
              verlicht) totdat
              <code className="doc-code">wcagContrast()</code> via de
              culori-library de vereiste verhouding haalt, of totdat L de grens
              (0 of 1) bereikt.
            </p>
            <p>
              Ten slotte wordt elke kleur door{' '}
              <code className="doc-code">clampToSRGB()</code> geleid:{' '}
              <code className="doc-code">clampChroma()</code> van culori
              reduceert C totdat de kleur binnen het sRGB-gamut valt. Kleuren
              buiten dat gamut zijn niet weergefbaar in standaard browsers en
              monitors.
            </p>
          </div>
        </details>
      </div>

      {/* 4 — Feedback */}
      <div className="doc-block doc-block--feedback">
        <h2 className="doc-block__title">Feedback geven</h2>
        <p>
          Werkt iets niet zoals verwacht, of heb je een idee voor verbetering?
          Maak een issue aan op GitHub. Goede feedback bevat: welke basiskleur
          je gebruikte, welk gedrag je verwachtte en wat je zag, en eventueel
          een screenshot.
        </p>
        <a
          className="doc-feedback-btn"
          href="https://github.com/jeffreylauwers/design-system-starter-kit/issues/new?labels=color-palette-generator&title=%5BColor+Palette+Generator%5D+"
          target="_blank"
          rel="noopener noreferrer"
        >
          Issue aanmaken op GitHub
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </section>
  );
}
