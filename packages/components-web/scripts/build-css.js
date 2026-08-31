/**
 * Resolves CSS @import statements and generates TypeScript modules
 * that export CSS as string constants, plus generates icon path data.
 *
 * This ensures the Web Component Shadow DOM CSS stays in sync with
 * the shared HTML/CSS styles (single source of truth).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveImports(cssContent, baseDir) {
  return cssContent.replace(
    /@import\s+['"]([^'"]+)['"]\s*;/g,
    (match, importPath) => {
      const resolved = path.resolve(baseDir, importPath);
      if (!fs.existsSync(resolved)) {
        throw new Error(`CSS import not found: ${resolved}`);
      }
      const imported = fs.readFileSync(resolved, 'utf-8');
      return resolveImports(imported, path.dirname(resolved));
    }
  );
}

function buildComponentCss(shadowCssPath, outputPath, varName) {
  const rawCss = fs.readFileSync(shadowCssPath, 'utf-8');
  const resolvedCss = resolveImports(rawCss, path.dirname(shadowCssPath));

  const output = `// Auto-generated — do not edit manually.\n// Source: ${path.basename(shadowCssPath)} + components-html source\nexport const ${varName} = ${JSON.stringify(resolvedCss)};\n`;

  fs.writeFileSync(outputPath, output, 'utf-8');
  console.log(`Generated ${path.basename(outputPath)}`);
}

function buildIconPaths() {
  const iconsDir = path.resolve(
    __dirname,
    '../../components-html/assets/icons'
  );
  const outputPath = path.resolve(
    __dirname,
    '../src/icon/icon-paths.generated.ts'
  );

  if (!fs.existsSync(iconsDir)) {
    console.error(`Error: Icons directory not found at ${iconsDir}`);
    process.exit(1);
  }

  const svgFiles = fs
    .readdirSync(iconsDir)
    .filter((f) => f.endsWith('.svg'))
    .sort();

  if (svgFiles.length === 0) {
    console.warn('Warning: No .svg files found');
  }

  // Extract path `d` attributes from each SVG
  const entries = svgFiles.map((file) => {
    const name = file.replace('.svg', '');
    const content = fs.readFileSync(path.join(iconsDir, file), 'utf-8');
    const paths = [];
    const re = /d="([^"]+)"/g;
    let match;
    while ((match = re.exec(content)) !== null) {
      paths.push(match[1]);
    }
    return `  '${name}': ${JSON.stringify(paths)},`;
  });

  const output = `// Auto-generated — do not edit manually.\n// Run: node scripts/build-css.js\nexport const iconPaths: Record<string, string[]> = {\n${entries.join('\n')}\n};\n`;

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, output, 'utf-8');
  console.log(
    `Generated icon-paths.generated.ts with ${svgFiles.length} icons`
  );
}

// Build button styles
buildComponentCss(
  path.resolve(__dirname, '../src/button/button.shadow.css'),
  path.resolve(__dirname, '../src/button/button-styles.generated.ts'),
  'buttonStyles'
);

// Build icon styles
buildComponentCss(
  path.resolve(__dirname, '../src/icon/icon.shadow.css'),
  path.resolve(__dirname, '../src/icon/icon-styles.generated.ts'),
  'iconStyles'
);

// Build paragraph styles
buildComponentCss(
  path.resolve(__dirname, '../src/paragraph/paragraph.shadow.css'),
  path.resolve(__dirname, '../src/paragraph/paragraph-styles.generated.ts'),
  'paragraphStyles'
);

// Build heading styles
buildComponentCss(
  path.resolve(__dirname, '../src/heading/heading.shadow.css'),
  path.resolve(__dirname, '../src/heading/heading-styles.generated.ts'),
  'headingStyles'
);

// Build link styles
buildComponentCss(
  path.resolve(__dirname, '../src/link/link.shadow.css'),
  path.resolve(__dirname, '../src/link/link-styles.generated.ts'),
  'linkStyles'
);

// Build unordered list styles
buildComponentCss(
  path.resolve(__dirname, '../src/unordered-list/unordered-list.shadow.css'),
  path.resolve(
    __dirname,
    '../src/unordered-list/unordered-list-styles.generated.ts'
  ),
  'unorderedListStyles'
);

// Build ordered list styles
buildComponentCss(
  path.resolve(__dirname, '../src/ordered-list/ordered-list.shadow.css'),
  path.resolve(
    __dirname,
    '../src/ordered-list/ordered-list-styles.generated.ts'
  ),
  'orderedListStyles'
);

// Build icon path data
buildIconPaths();
