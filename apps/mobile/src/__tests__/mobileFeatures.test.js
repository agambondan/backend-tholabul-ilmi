import { allFeatures, belajarFeatureGroups } from '../data/mobileFeatures';

describe('allFeatures', () => {
  test('is a non-empty array', () => {
    expect(Array.isArray(allFeatures)).toBe(true);
    expect(allFeatures.length).toBeGreaterThan(0);
  });

  test('each feature has required fields', () => {
    for (const feature of allFeatures) {
      expect(feature).toHaveProperty('key');
      expect(feature).toHaveProperty('title');
      expect(feature).toHaveProperty('subtitle');
      expect(feature).toHaveProperty('group');
      expect(feature).toHaveProperty('type');
    }
  });

  test('all features have unique keys', () => {
    const keys = allFeatures.map((f) => f.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('belajarFeatureGroups', () => {
  test('has expected groups', () => {
    const labels = belajarFeatureGroups.map((g) => g.label);
    expect(labels).toEqual(
      expect.arrayContaining([
        'Kajian & Artikel',
        'Siroh & Sejarah',
        'Fiqh & Panduan',
        'Referensi',
        'Evaluasi',
        'Personal Ringkas',
      ]),
    );
  });

  test('all feature keys in each group are unique', () => {
    for (const group of belajarFeatureGroups) {
      const keys = group.features.map((f) => f.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
});
