import { renderHook, act } from '@testing-library/react';
import { useQuranFont, QURAN_FONTS } from '@/lib/useQuranFont';

describe('useQuranFont', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('defaults to first font (kitab)', () => {
    const { result } = renderHook(() => useQuranFont());
    expect(result.current.fontId).toBe('kitab');
    expect(result.current.fontCls).toBe('font-kitab');
  });

  test('setFont changes font', () => {
    const { result } = renderHook(() => useQuranFont());
    act(() => result.current.setFont('indopak'));
    expect(result.current.fontId).toBe('indopak');
    expect(result.current.fontCls).toBe('font-nh');
  });

  test('setFont persists to localStorage', () => {
    const { result } = renderHook(() => useQuranFont());
    act(() => result.current.setFont('naskh'));
    expect(localStorage.getItem('quranFont')).toBe('naskh');
  });

  test('reads persisted font from localStorage', () => {
    localStorage.setItem('quranFont', 'naskh');
    const { result } = renderHook(() => useQuranFont());
    expect(result.current.fontId).toBe('naskh');
    expect(result.current.fontCls).toBe('font-scheherazade');
  });

  test('ignores invalid persisted font', () => {
    localStorage.setItem('quranFont', 'invalid-font');
    const { result } = renderHook(() => useQuranFont());
    expect(result.current.fontId).toBe('kitab');
  });

  test('QURAN_FONTS has correct structure', () => {
    expect(QURAN_FONTS).toHaveLength(3);
    QURAN_FONTS.forEach((f) => {
      expect(f).toHaveProperty('id');
      expect(f).toHaveProperty('label');
      expect(f).toHaveProperty('cls');
    });
  });
});
