#!/usr/bin/env node
/**
 * Resolves CSS @import chains and copies self-contained CSS files to dist.
 *
 * tsc does not copy .css files, so this script runs before tsc to ensure
 * that `import './Button.css'` in compiled JS resolves correctly when
 * the package is installed from npm.
 *
 * Also writes dist/index.css bundling all component styles for consumers
 * who prefer a single global import.
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '../src');
const DIST_DIR = path.resolve(__dirname, '../dist');

/**
 * Resolves a package import (e.g. '@scope/pkg/subpath') to an absolute path.
 * Walks up the directory tree searching for node_modules, then uses package.json
 * exports to find the actual file.
 */
function resolvePackageImport(importPath, startDir) {
  const parts = importPath.split('/');
  const packageName = importPath.startsWith('@')
    ? parts.slice(0, 2).join('/')
    : parts[0];
  const subPath = importPath.startsWith('@')
    ? parts.slice(2).join('/')
    : parts.slice(1).join('/');

  let dir = startDir;
  while (dir !== path.dirname(dir)) {
    const packageDir = path.join(
      dir,
      'node_modules',
      ...packageName.split('/')
    );
    if (fs.existsSync(packageDir)) {
      const pkgJsonPath = path.join(packageDir, 'package.json');
      if (fs.existsSync(pkgJsonPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
        const exportKey = subPath ? `./${subPath}` : '.';
        const exports = pkg.exports || {};
        if (exports[exportKey]) {
          const entry = exports[exportKey];
          const filePath =
            typeof entry === 'string' ? entry : entry.default || entry.import;
          return path.join(packageDir, filePath);
        }
      }
      // Fallback: direct subpath within the package
      if (subPath) {
        return path.join(packageDir, subPath);
      }
    }
    dir = path.dirname(dir);
  }
  throw new Error(
    `Package not found: ${packageName} (imported from ${startDir})`
  );
}

function resolveImports(cssContent, baseDir) {
  return cssContent.replace(
    /@import\s+['"]([^'"]+)['"]\s*;/g,
    (match, importPath) => {
      // Package import: doesn't start with . or /
      const isPackageImport =
        !importPath.startsWith('.') && !importPath.startsWith('/');
      const resolved = isPackageImport
        ? resolvePackageImport(importPath, baseDir)
        : path.resolve(baseDir, importPath);

      if (!fs.existsSync(resolved)) {
        throw new Error(
          `CSS import not found: ${resolved} (imported from ${baseDir})`
        );
      }
      const imported = fs.readFileSync(resolved, 'utf-8');
      return resolveImports(imported, path.dirname(resolved));
    }
  );
}

const allCss = [];
let count = 0;

const entries = fs.readdirSync(SRC_DIR, { withFileTypes: true });
for (const entry of entries) {
  if (!entry.isDirectory()) continue;

  const cssFile = path.join(SRC_DIR, entry.name, `${entry.name}.css`);
  if (!fs.existsSync(cssFile)) continue;

  const css = fs.readFileSync(cssFile, 'utf-8');
  const resolved = resolveImports(css, path.dirname(cssFile));

  const distDir = path.join(DIST_DIR, entry.name);
  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(path.join(distDir, `${entry.name}.css`), resolved);

  allCss.push(resolved);
  count++;
}

fs.mkdirSync(DIST_DIR, { recursive: true });
fs.writeFileSync(path.join(DIST_DIR, 'index.css'), allCss.join('\n'));

console.log(`Built CSS for ${count} components → dist/index.css`);
