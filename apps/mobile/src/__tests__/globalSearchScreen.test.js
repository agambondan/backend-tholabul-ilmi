jest.mock('../api/client', () => ({
  searchGlobal: jest.fn(),
  getSurahs: jest.fn().mockResolvedValue([]),
}));

jest.mock('../storage/recentSearches', () => ({
  readRecentSearches: jest.fn().mockResolvedValue([]),
  rememberRecentSearch: jest.fn().mockResolvedValue([]),
}));

jest.mock('../data/mobileFeatures', () => ({
  allFeatures: [
    { key: 'doa', title: 'Doa', subtitle: 'Kumpulan doa', group: 'Ibadah', type: 'internal' },
    { key: 'kiblat', title: 'Kiblat', subtitle: 'Arah kiblat', group: 'Ibadah', type: 'internal' },
  ],
}));

jest.mock('lucide-react-native', () => {
  const icons = {};
  const names = [
    'ArrowLeft', 'Book', 'BookOpen', 'Languages', 'Layers', 'Search', 'UserRound',
    'CheckCircle2', 'MoreVertical', 'Info', 'X', 'XCircle', 'AlertCircle',
  ];
  names.forEach((n) => { icons[n] = n; });
  return icons;
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../components/Screen', () => ({
  Screen: ({ children, searchSlot, headerExtra, title }) => {
    const { View, Text } = require('react-native');
    return (
      <View>
        <Text testID="screen-title">{title}</Text>
        {searchSlot}
        {headerExtra}
        {children}
      </View>
    );
  },
}));

jest.mock('../components/Paper', () => {
  const { TextInput, Pressable, Text, View } = require('react-native');
  return {
    PaperSearchInput: ({ value, onChangeText, placeholder }) => (
      <TextInput
        testID="search-input"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
      />
    ),
    IconActionButton: ({ label, onPress }) => (
      <Pressable onPress={onPress} testID={`action-${label}`}>
        <Text>{label}</Text>
      </Pressable>
    ),
    EmptyState: ({ title, description }) => (
      <View testID="empty-state">
        <Text testID="empty-title">{title}</Text>
        {description ? <Text>{description}</Text> : null}
      </View>
    ),
    ActionPill: ({ label, onPress }) => (
      <Pressable onPress={onPress} testID={`pill-${label}`}>
        <Text>{label}</Text>
      </Pressable>
    ),
  };
});

jest.mock('../components/ContentCard', () => {
  const { Pressable, Text } = require('react-native');
  return {
    ContentCard: ({ title, subtitle, onPress, meta }) => (
      <Pressable onPress={onPress} testID="content-card">
        <Text testID="card-title">{title}</Text>
        {subtitle ? <Text testID="card-subtitle">{subtitle}</Text> : null}
        {meta ? <Text testID="card-meta">{meta}</Text> : null}
      </Pressable>
    ),
  };
});

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { GlobalSearchScreen } from '../screens/GlobalSearchScreen';

const client = require('../api/client');
const recentSearches = require('../storage/recentSearches');

const mockAyah = (id, overrides = {}) => ({
  id, number: id, surahNumber: 1, surahName: 'Al-Fatihah',
  translation: 'In the name of Allah', arabic: 'بِسْمِ اللَّهِ',
  juzNumber: 1, pageNumber: 1,
  ...overrides,
});

const mockHadith = (id, overrides = {}) => ({
  id, book: 'Bukhari', title: `Hadith ${id}`, translation: 'Narrated...',
  ...overrides,
});

const mockDoa = (id, overrides = {}) => ({
  id, title: `Doa ${id}`, body: 'Doa text', meta: 'Pagi',
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  client.searchGlobal.mockResolvedValue({});
  client.getSurahs.mockResolvedValue([]);
  recentSearches.readRecentSearches.mockResolvedValue([]);
  recentSearches.rememberRecentSearch.mockResolvedValue([]);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('GlobalSearchScreen', () => {
  it('renders search input and filter chips', () => {
    const { getByTestId, getByText } = render(
      <GlobalSearchScreen onBack={jest.fn()} onOpenTab={jest.fn()} />,
    );

    expect(getByTestId('search-input')).toBeTruthy();
    expect(getByText('Semua')).toBeTruthy();
    expect(getByText('Quran')).toBeTruthy();
    expect(getByText('Hadis')).toBeTruthy();
    expect(getByText('Doa')).toBeTruthy();
    expect(getByText('Kajian')).toBeTruthy();
    expect(getByText('Kamus')).toBeTruthy();
    expect(getByText('Perawi')).toBeTruthy();
    expect(getByText('Fitur')).toBeTruthy();
  });

  it('shows quick suggestions when no query', () => {
    const { getByText } = render(
      <GlobalSearchScreen onBack={jest.fn()} onOpenTab={jest.fn()} />,
    );

    expect(getByText('Cari cepat')).toBeTruthy();
    expect(getByText('shalat')).toBeTruthy();
    expect(getByText('sabar')).toBeTruthy();
    expect(getByText('zakat')).toBeTruthy();
    expect(getByText('tafsir')).toBeTruthy();
  });

  it('shows recent searches when available', async () => {
    recentSearches.readRecentSearches.mockResolvedValue(['zakat', 'ikhlas']);

    const { getByText, queryByText } = render(
      <GlobalSearchScreen onBack={jest.fn()} onOpenTab={jest.fn()} />,
    );

    await waitFor(() => {
      expect(getByText('Terakhir dicari')).toBeTruthy();
    });
    expect(getByText('zakat')).toBeTruthy();
    expect(getByText('ikhlas')).toBeTruthy();
    expect(queryByText('Cari cepat')).toBeNull();
  });

  it('calls searchGlobal when query changes', async () => {
    client.searchGlobal.mockResolvedValue({ ayahs: [mockAyah(1)], total: 1, ayahTotal: 1 });

    const { getByTestId } = render(
      <GlobalSearchScreen onBack={jest.fn()} onOpenTab={jest.fn()} />,
    );

    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'fatihah');

    act(() => { jest.advanceTimersByTime(350); });

    await waitFor(() => {
      expect(client.searchGlobal).toHaveBeenCalledWith('fatihah', expect.any(Object));
    });
  });

  it('displays results for each category', async () => {
    client.searchGlobal.mockImplementation((query, { type } = {}) => {
      if (type === 'ayah') return { ayahs: [mockAyah(1)], ayahTotal: 1, total: 1 };
      if (type === 'hadith') return { hadiths: [mockHadith(1)], hadithTotal: 1, total: 1 };
      if (type === 'doa') return { doas: [mockDoa(1)], doaTotal: 1, total: 1 };
      return {};
    });

    const { getByTestId, getByText } = render(
      <GlobalSearchScreen onBack={jest.fn()} onOpenTab={jest.fn()} />,
    );

    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'islam');

    act(() => { jest.advanceTimersByTime(350); });

    await waitFor(() => {
      expect(client.searchGlobal).toHaveBeenCalled();
      expect(getByText('Al-Quran')).toBeTruthy();
      expect(getByText('Hadis')).toBeTruthy();
      expect(getByText('Doa')).toBeTruthy();
    });
  });

  it('shows "Lihat Semua" button in "Semua" tab when there are more results', async () => {
    const ayahs = Array.from({ length: 3 }, (_, i) => mockAyah(i + 1));
    client.searchGlobal.mockImplementation((query, { type } = {}) => {
      if (type === 'ayah') return { ayahs, ayahTotal: 10, total: 10 };
      return {};
    });

    const { getByTestId, getByText } = render(
      <GlobalSearchScreen onBack={jest.fn()} onOpenTab={jest.fn()} />,
    );

    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'islam');

    act(() => { jest.advanceTimersByTime(350); });

    await waitFor(() => {
      expect(getByText(/Lihat semua/i)).toBeTruthy();
    });
  });

  it('shows "Muat Lainnya" when in a specific tab with more results', async () => {
    const ayahs = Array.from({ length: 3 }, (_, i) => mockAyah(i + 1));
    client.searchGlobal.mockImplementation((query, { type } = {}) => {
      if (type === 'ayah') return { ayahs, ayahTotal: 25, total: 25 };
      return {};
    });

    const { getByTestId, getByText } = render(
      <GlobalSearchScreen onBack={jest.fn()} onOpenTab={jest.fn()} />,
    );

    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'islam');
    act(() => { jest.advanceTimersByTime(350); });

    // Switch to Quran tab
    await waitFor(() => {
      fireEvent.press(getByText('Quran'));
    });

    await waitFor(() => {
      expect(getByText('Muat Lainnya')).toBeTruthy();
    });
  });

  it('shows loading state', async () => {
    client.searchGlobal.mockImplementation(() => new Promise(() => {}));

    const { getByTestId, getByText } = render(
      <GlobalSearchScreen onBack={jest.fn()} onOpenTab={jest.fn()} />,
    );

    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'islam');

    act(() => { jest.advanceTimersByTime(350); });

    await waitFor(() => {
      expect(getByText(/Mencari/)).toBeTruthy();
    });
  });

  it('shows empty results state', async () => {
    client.searchGlobal.mockResolvedValue({});

    const { getByTestId, getByText } = render(
      <GlobalSearchScreen onBack={jest.fn()} onOpenTab={jest.fn()} />,
    );

    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'zzzzz');

    act(() => { jest.advanceTimersByTime(350); });

    await waitFor(() => {
      expect(getByText('Belum ada hasil')).toBeTruthy();
    });
  });

  it('handles error during search with message', async () => {
    client.searchGlobal.mockRejectedValue(new Error('Network error'));

    const { getByTestId, getByText } = render(
      <GlobalSearchScreen onBack={jest.fn()} onOpenTab={jest.fn()} />,
    );

    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'islam');

    act(() => { jest.advanceTimersByTime(350); });

    await waitFor(() => {
      expect(getByText(/Sebagian hasil/i)).toBeTruthy();
    });
  });

  it('pressing a quick suggestion sets the query', () => {
    const { getByText, getByTestId } = render(
      <GlobalSearchScreen onBack={jest.fn()} onOpenTab={jest.fn()} />,
    );

    fireEvent.press(getByText('shalat'));

    expect(getByTestId('search-input').props.value).toBe('shalat');
  });

  it('shows feature results when matching', async () => {
    client.searchGlobal.mockResolvedValue({});

    const { getByTestId, getByText } = render(
      <GlobalSearchScreen onBack={jest.fn()} onOpenTab={jest.fn()} />,
    );

    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'kiblat');

    act(() => { jest.advanceTimersByTime(350); });

    await waitFor(() => {
      expect(getByText('Fitur')).toBeTruthy();
      expect(getByText('Kiblat')).toBeTruthy();
    });
  });

  it('calls onOpenTab with correct params when pressing a result', async () => {
    const onOpenTab = jest.fn();
    client.searchGlobal.mockImplementation((query, { type } = {}) => {
      if (type === 'ayah') return { ayahs: [mockAyah(1)], ayahTotal: 1, total: 1 };
      return {};
    });

    const { getByTestId, getAllByTestId } = render(
      <GlobalSearchScreen onBack={jest.fn()} onOpenTab={onOpenTab} />,
    );

    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'fatihah');
    act(() => { jest.advanceTimersByTime(350); });

    await waitFor(() => {
      const cards = getAllByTestId('content-card');
      expect(cards.length).toBeGreaterThan(0);
      fireEvent.press(cards[0]);
    });

    expect(onOpenTab).toHaveBeenCalledWith('quran', {
      ayahId: 1,
      ayahNumber: 1,
      surahNumber: 1,
    });
  });
});
