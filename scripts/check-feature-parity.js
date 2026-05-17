#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(repoRoot, 'docs/features/feature-manifest.json');
const appRoot = path.join(repoRoot, 'apps/web/src/app');
const mobileFeaturesPath = path.join(repoRoot, 'apps/mobile/src/data/mobileFeatures.js');

const requiredFields = [
  'key',
  'title',
  'publicWebRoute',
  'dashboardWebRoute',
  'mobileRoute',
  'authRequired',
  'ctaLabel',
  'searchable',
  'status',
];

const validStatuses = new Set(['active', 'mobile-only', 'web-only', 'planned', 'deprecated']);
const knownTabs = new Set(['home', 'quran', 'hadith', 'ibadah', 'belajar', 'profile']);
const knownIbadahViews = new Set(['prayer', 'qibla', 'settings', 'khatam']);
const knownInternalViews = new Set(['global-search', 'feature-directory']);
const knownProfileViews = new Set(['settings', 'achievements']);
const ignoredMobileKeys = new Set([
  'bacaan',
  'ilmu',
  'alat',
  'personal',
  'kajian-artikel',
  'siroh-sejarah',
  'fiqh-panduan',
  'referensi',
  'evaluasi',
  'personal-ringkas',
]);
const ignoredPublicRoutes = new Set([
  '/',
  '/_not-found',
  '/apple-icon',
  '/auth/login',
  '/auth/register',
  '/contact',
  '/dev',
  '/forum/ask',
  '/icon',
  '/manifest.webmanifest',
  '/og',
  '/profile',
  '/quran/page-mushaf',
  '/robots.txt',
  '/sitemap.xml',
  '/zakat/history',
]);

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const normalizeRoute = (route) => {
  if (route == null) return null;
  if (typeof route !== 'string') return route;
  if (route === '/') return route;
  return route.replace(/\/+$/, '');
};

const routeToPagePath = (route) => {
  const normalized = normalizeRoute(route);
  if (!normalized || typeof normalized !== 'string' || !normalized.startsWith('/')) return null;
  const segments = normalized.split('/').filter(Boolean);
  return path.join(appRoot, ...segments, 'page.js');
};

const routeExists = (route) => {
  const pagePath = routeToPagePath(route);
  return Boolean(pagePath && fs.existsSync(pagePath));
};

const listPageRoutes = (dir, prefix = '') => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let routes = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      routes = routes.concat(listPageRoutes(entryPath, `${prefix}/${entry.name}`));
    } else if (entry.name === 'page.js') {
      routes.push(prefix || '/');
    }
  }

  return routes.map(normalizeRoute).sort();
};

const parseMobileFeatureKeys = () => {
  const source = fs.readFileSync(mobileFeaturesPath, 'utf8');
  const keys = new Set();
  const regex = /key:\s*['"]([^'"]+)['"]/g;
  let match;

  while ((match = regex.exec(source))) {
    if (!ignoredMobileKeys.has(match[1])) {
      keys.add(match[1]);
    }
  }

  return keys;
};

const mobileRouteExists = (mobileRoute, mobileFeatureKeys) => {
  if (mobileRoute == null) return true;
  if (typeof mobileRoute !== 'string') return false;
  const [kind, value] = mobileRoute.split(':');
  if (!kind || !value) return false;

  if (kind === 'feature') return mobileFeatureKeys.has(value);
  if (kind === 'tab') return knownTabs.has(value);
  if (kind === 'ibadah') return knownIbadahViews.has(value);
  if (kind === 'internal') return knownInternalViews.has(value);
  if (kind === 'profile') return knownProfileViews.has(value);
  return false;
};

const publicRouteNeedsManifest = (route) => {
  if (!route || ignoredPublicRoutes.has(route)) return false;
  if (route.includes('[')) return false;
  if (route.startsWith('/admin')) return false;
  if (route.startsWith('/dashboard')) return false;
  return route.split('/').filter(Boolean).length <= 2;
};

const main = () => {
  const manifest = readJson(manifestPath);
  const features = manifest.features ?? [];
  const mobileFeatureKeys = parseMobileFeatureKeys();
  const allWebRoutes = listPageRoutes(appRoot);
  const errors = [];
  const warnings = [];
  const manifestKeys = new Set();
  const manifestAliasKeys = new Set();
  const manifestRoutes = new Set();

  if (!Array.isArray(features) || features.length === 0) {
    errors.push('Manifest must contain a non-empty features array.');
  }

  for (const feature of features) {
    for (const field of requiredFields) {
      if (!(field in feature)) {
        errors.push(`${feature.key ?? '<unknown>'}: missing required field ${field}.`);
      }
    }

    if (manifestKeys.has(feature.key)) {
      errors.push(`${feature.key}: duplicate feature key.`);
    }
    manifestKeys.add(feature.key);

    for (const alias of feature.aliases ?? []) {
      manifestAliasKeys.add(alias);
    }

    if (!validStatuses.has(feature.status)) {
      errors.push(`${feature.key}: invalid status ${feature.status}.`);
    }

    if (typeof feature.authRequired !== 'boolean') {
      errors.push(`${feature.key}: authRequired must be boolean.`);
    }

    if (typeof feature.searchable !== 'boolean') {
      errors.push(`${feature.key}: searchable must be boolean.`);
    }

    for (const routeField of ['publicWebRoute', 'dashboardWebRoute']) {
      const route = normalizeRoute(feature[routeField]);
      if (route) {
        manifestRoutes.add(route);
        if (!route.startsWith('/')) {
          errors.push(`${feature.key}: ${routeField} must start with "/".`);
        } else if (!routeExists(route)) {
          errors.push(`${feature.key}: ${routeField} ${route} does not resolve to apps/web/src/app${route}/page.js.`);
        }
      }
    }

    if (!mobileRouteExists(feature.mobileRoute, mobileFeatureKeys)) {
      errors.push(`${feature.key}: mobileRoute ${feature.mobileRoute} is not known in mobile features/navigation.`);
    }
  }

  for (const mobileKey of mobileFeatureKeys) {
    if (!manifestKeys.has(mobileKey) && !manifestAliasKeys.has(mobileKey)) {
      errors.push(`Mobile feature key ${mobileKey} is missing from docs/features/feature-manifest.json.`);
    }
  }

  for (const route of allWebRoutes.filter(publicRouteNeedsManifest)) {
    if (!manifestRoutes.has(route)) {
      warnings.push(`Public route ${route} is not mapped directly in the feature manifest.`);
    }
  }

  if (warnings.length) {
    console.warn('Feature parity warnings:');
    for (const warning of warnings) console.warn(`- ${warning}`);
  }

  if (errors.length) {
    console.error('Feature parity check failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log('Feature parity check passed.');
  console.log(`- manifest features: ${features.length}`);
  console.log(`- mobile feature keys: ${mobileFeatureKeys.size}`);
  console.log(`- web app routes scanned: ${allWebRoutes.length}`);
};

main();
