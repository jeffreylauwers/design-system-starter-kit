import StyleDictionary from 'style-dictionary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  themes,
  modes,
  projectTypes,
  fullConfigs,
  densitySelectors,
  themeModeSelector,
  createHeroImageForceLightConfigs,
} from './config.js';
import { buildScopedFiles } from './scoped.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure dist directories exist
const distDirs = [
  'dist/css',
  'dist/css/scoped',
  'dist/scss',
  'dist/js',
  'dist/json',
];

distDirs.forEach((dir) => {
  const fullPath = path.join(__dirname, '..', '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

console.log('🎨 Building design tokens...\n');
console.log(`📊 Configuration matrix:`);
console.log(`   Themes: ${themes.join(', ')}`);
console.log(`   Modes: ${modes.join(', ')}`);
console.log(`   Project Types: ${projectTypes.join(', ')}`);
console.log(`   Total combinations: ${Object.keys(fullConfigs).length}\n`);

// =============================================================================
// BUILD FULL CONFIGURATIONS
// =============================================================================

console.log(
  '🔨 Building full configurations (Theme × Mode × Project Type)...\n'
);

const fullConfigNames = Object.keys(fullConfigs);

async function buildFullConfigs() {
  for (let index = 0; index < fullConfigNames.length; index++) {
    const name = fullConfigNames[index];
    const config = fullConfigs[name];
    console.log(
      `   [${index + 1}/${fullConfigNames.length}] Building ${name}...`
    );

    try {
      const sd = new StyleDictionary(config);
      await sd.buildAllPlatforms();
    } catch (error) {
      console.error(`   ❌ Error building ${name}:`, error.message);
      process.exit(1);
    }
  }
}

async function appendReducedMotion() {
  console.log(
    '\n🎬 Appending prefers-reduced-motion media query to CSS files...\n'
  );

  const reducedMotionBlock = `
@media (prefers-reduced-motion: reduce) {
  :root {
    --dsn-transition-duration-instant: 0ms;
    --dsn-transition-duration-fast: 0ms;
    --dsn-transition-duration-normal: 0ms;
    --dsn-transition-duration-slow: 0ms;
    --dsn-transition-duration-slower: 0ms;
  }
}
`;

  fullConfigNames.forEach((name) => {
    const cssFilePath = path.join(
      __dirname,
      '..',
      '..',
      `dist/css/${name}.css`
    );
    if (fs.existsSync(cssFilePath)) {
      fs.appendFileSync(cssFilePath, reducedMotionBlock);
      console.log(`   ✅ dist/css/${name}.css`);
    }
  });

  console.log('\n✅ prefers-reduced-motion media query appended\n');
}

// De scoped bestanden komen uit de volledige configs hierboven: zelfde
// declaraties, alleen de tokens die per thema, mode of density verschillen plus
// alles wat ernaar verwijst. Zie scoped.js en DR-2026-18.
function buildScoped() {
  console.log(
    '🔨 Building scoped files (for runtime theme/mode/density switching)...\n'
  );

  const results = buildScopedFiles({
    distDir: path.join(__dirname, '..', '..', 'dist/css'),
    themes,
    modes,
    projectTypes,
    themeModeSelector,
    densitySelectors,
  });

  for (const { file, count, missing } of results) {
    console.log(`   ✅ dist/css/scoped/${file} (${count} tokens)`);
    if (missing.length) {
      console.log(
        `      ⚠️  Ontbreekt in deze config, dus niet gescoopt: ${missing.join(', ')}`
      );
    }
  }
  console.log();
}

function createBackwardCompatibilityAliases() {
  console.log('🔗 Creating backward compatibility aliases...\n');

  const aliasMap = [
    // Old file → New file
    ['dist/css/variables.css', 'dist/css/start-light-default.css'],
    ['dist/css/variables-dark.css', 'dist/css/start-dark-default.css'],
    ['dist/scss/_variables.scss', 'dist/scss/_start-light-default.scss'],
    ['dist/scss/_variables-dark.scss', 'dist/scss/_start-dark-default.scss'],
    ['dist/js/tokens.js', 'dist/js/start-light-default.js'],
    ['dist/js/tokens.d.ts', 'dist/js/start-light-default.d.ts'],
    ['dist/js/tokens-dark.js', 'dist/js/start-dark-default.js'],
    ['dist/js/tokens-dark.d.ts', 'dist/js/start-dark-default.d.ts'],
    ['dist/json/tokens.json', 'dist/json/start-light-default.json'],
    ['dist/json/tokens-dark.json', 'dist/json/start-dark-default.json'],
  ];

  aliasMap.forEach(([aliasPath, sourcePath]) => {
    const fullAliasPath = path.join(__dirname, '..', '..', aliasPath);
    const fullSourcePath = path.join(__dirname, '..', '..', sourcePath);

    if (fs.existsSync(fullSourcePath)) {
      fs.copyFileSync(fullSourcePath, fullAliasPath);
      console.log(`   ${aliasPath} → ${sourcePath}`);
    }
  });

  // Create the special dark scoped file for backward compatibility
  const darkScopedSource = path.join(
    __dirname,
    '..',
    '..',
    'dist/css/scoped/start-dark.css'
  );
  const darkScopedDest = path.join(
    __dirname,
    '..',
    '..',
    'dist/css/variables-dark-scoped.css'
  );
  if (fs.existsSync(darkScopedSource)) {
    fs.copyFileSync(darkScopedSource, darkScopedDest);
    console.log(
      `   dist/css/variables-dark-scoped.css → dist/css/scoped/start-dark.css`
    );
  }

  console.log('\n✅ Backward compatibility aliases created\n');
}

function printSummary() {
  console.log('📁 Generated files:\n');

  console.log('   Full configurations (CSS + SCSS + JS + JSON):');
  fullConfigNames.forEach((name) => {
    console.log(`   - ${name}`);
  });

  console.log('\n   Scoped configurations (CSS only, for runtime switching):');
  console.log(
    '   - dist/css/scoped/{theme}-{mode}.css (theme and mode tokens + dependents)'
  );
  console.log(
    '   - dist/css/scoped/density-*.css (font-size and space tokens + dependents)'
  );
  console.log('   - dist/css/scoped/*-hero-image.css (light colors in a hero)');

  console.log('\n   Backward compatibility aliases:');
  console.log('   - dist/css/variables.css');
  console.log('   - dist/css/variables-dark.css');
  console.log('   - dist/css/variables-dark-scoped.css');
  console.log('   - dist/scss/_variables.scss, _variables-dark.scss');
  console.log('   - dist/js/tokens.js, tokens-dark.js');
  console.log('   - dist/json/tokens.json, tokens-dark.json');

  console.log('\n🎉 Build complete!\n');
}

async function buildHeroImageForceLightConfigs() {
  console.log(
    '🦸 Building hero image force-light configs (light-mode colors scoped to .dsn-hero--image per theme)...\n'
  );
  const configs = createHeroImageForceLightConfigs();
  for (const config of configs) {
    const destination = config.platforms.css.files[0].destination;
    try {
      const sd = new StyleDictionary(config);
      await sd.buildAllPlatforms();
      console.log(`   ✅ dist/css/scoped/${destination}`);
    } catch (error) {
      console.error(`   ❌ Error building ${destination}:`, error.message);
      process.exit(1);
    }
  }
  console.log();
}

async function main() {
  await buildFullConfigs();
  await appendReducedMotion();
  buildScoped();
  await buildHeroImageForceLightConfigs();
  createBackwardCompatibilityAliases();
  printSummary();
}

main().catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});
