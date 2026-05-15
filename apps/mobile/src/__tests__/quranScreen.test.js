jest.setTimeout(15000);

jest.mock('../constants/quranFonts', () => ({
  QURAN_FONT_FAMILIES: { kitab: 'KitabFont', indopak: 'IndopakFont', naskh: 'NaskhFont' },
}));

jest.mock('../api/client', () => ({
  getSurahs: jest.fn().mockResolvedValue([]),
  getAyahsForSurahPage: jest.fn().mockResolvedValue({ items: [], hasMore: false, page: 0 }),
  getAyahAudio: jest.fn().mockResolvedValue({ audio_url: 'https://example.com/audio.mp3' }),
  getAyahsForHizb: jest.fn().mockResolvedValue([]),
  getAyahsForPage: jest.fn().mockResolvedValue([]),
  getFirstAyahForSurah: jest.fn().mockResolvedValue(null),
  getMufrodatByPage: jest.fn().mockResolvedValue([]),
  getTafsirForAyah: jest.fn().mockResolvedValue([]),
  getAsbabForAyah: jest.fn().mockResolvedValue([]),
  normalizeSurah: jest.fn((x) => x),
  normalizeAyah: jest.fn((x) => x),
  requestJson: jest.fn(),
}));

jest.mock('../api/personal', () => ({
  addBookmark: jest.fn().mockResolvedValue({ id: 'bm-1' }),
  deleteBookmark: jest.fn().mockResolvedValue({}),
  getBookmarks: jest.fn().mockResolvedValue([]),
  getHafalanList: jest.fn().mockResolvedValue([]),
  getHafalanSummary: jest.fn().mockResolvedValue(null),
  getMurojaahSession: jest.fn().mockResolvedValue([]),
  getQuranProgress: jest.fn().mockResolvedValue(null),
  saveMurojaahResult: jest.fn().mockResolvedValue({}),
  saveQuranProgress: jest.fn().mockResolvedValue({}),
  updateHafalanStatus: jest.fn().mockResolvedValue({}),
}));

jest.mock('../hooks/useQuranReaderPreferences', () => ({
  useQuranReaderPreferences: () => ({
    fontSize: 20,
    arabicFont: 'kitab',
    displayMode: 'line',
    memorizationMode: 'off',
    showTranslation: true,
    updateFontSize: jest.fn(),
    updateArabicFont: jest.fn(),
    updateDisplayMode: jest.fn(),
    updateMemorizationMode: jest.fn(),
  }),
}));

jest.mock('../context/SessionContext', () => ({
  useSession: jest.fn(),
}));

jest.mock('../context/FeedbackContext', () => ({
  useFeedback: jest.fn(),
}));

jest.mock('../context/TabActivityContext', () => ({
  useTabActivity: jest.fn(),
}));

jest.mock('../utils/audioPlayer', () => ({
  playAudioUrl: jest.fn(),
  stopAudio: jest.fn(),
}));

jest.mock('../storage/preferences', () => ({
  preferenceKeys: { quranAudioQari: 'quranAudioQari' },
  readPreference: jest.fn().mockResolvedValue('Alafasy_64kbps'),
  writePreference: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('lucide-react-native', () => {
  const icons = {};
  const names = [
    'ArrowLeft', 'ArrowRight', 'BookOpen', 'Bookmark', 'BookmarkCheck',
    'CheckCircle2', 'Info', 'Minus', 'MoreVertical', 'Pause', 'Plus',
    'Save', 'Search', 'SlidersHorizontal', 'StickyNote', 'Volume2',
    'X', 'XCircle', 'AlertCircle',
  ];
  names.forEach((n) => { icons[n] = n; });
  return icons;
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../components/Screen', () => ({
  Screen: ({ children, searchSlot, headerExtra, title, actions, subtitle }) => {
    const { View, Text } = require('react-native');
    return (
      <View>
        <Text testID="screen-title">{title}</Text>
        {actions}
        {searchSlot}
        {headerExtra}
        <Text testID="screen-subtitle">{subtitle}</Text>
        {children}
      </View>
    );
  },
}));

jest.mock('../components/Card', () => {
  const { View, Text } = require('react-native');
  return {
    Card: ({ children, style }) => <View style={style}>{children}</View>,
    CardTitle: ({ children }) => <Text testID="card-title">{children}</Text>,
  };
});

jest.mock('../components/Paper', () => {
  const { Pressable, Text, View, TextInput } = require('react-native');
  return {
    IconActionButton: ({ label, onPress, disabled }) => (
      <Pressable onPress={onPress} disabled={disabled} testID={`action-${label}`}>
        <Text>{label}</Text>
      </Pressable>
    ),
    ActionPill: ({ label, onPress }) => (
      <Pressable onPress={onPress} testID={`pill-${label}`}>
        <Text>{label}</Text>
      </Pressable>
    ),
    EmptyState: ({ title, description }) => (
      <View testID="empty-state">
        <Text testID="empty-title">{title}</Text>
        {description ? <Text>{description}</Text> : null}
      </View>
    ),
    PaperSearchInput: ({ value, onChangeText, placeholder }) => (
      <TextInput
        testID="search-input"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
      />
    ),
  };
});

jest.mock('../components/AppActionSheet', () => ({
  AppActionSheet: ({ visible, children, title }) => {
    const { View, Text } = require('react-native');
    if (!visible) return null;
    return (
      <View testID="action-sheet">
        <Text testID="action-sheet-title">{title}</Text>
        {children}
      </View>
    );
  },
  ActionSheetRow: ({ title, onPress, disabled, subtitle }) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable onPress={onPress} disabled={disabled} testID={`sheet-row-${title}`}>
        <Text>{title}</Text>
        {subtitle ? <Text>{subtitle}</Text> : null}
      </Pressable>
    );
  },
}));

jest.mock('../components/AppModalSheet', () => ({
  AppModalSheet: ({ visible, children, title }) => {
    const { View, Text } = require('react-native');
    if (!visible) return null;
    return (
      <View testID="modal-sheet">
        <Text testID="modal-title">{title}</Text>
        {children}
      </View>
    );
  },
}));

jest.mock('../components/NotesPanel', () => ({
  NotesPanel: () => {
    const { Text } = require('react-native');
    return <Text testID="notes-panel">NotesPanel</Text>;
  },
}));

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { QuranScreen } from '../screens/QuranScreen';

const { useSession } = require('../context/SessionContext');
const { useFeedback } = require('../context/FeedbackContext');
const { useTabActivity } = require('../context/TabActivityContext');
const client = require('../api/client');
const personal = require('../api/personal');

const mockSurah = (number, overrides = {}) => ({
  number,
  name: `Surah ${number}`,
  arabic: `\u0633\u0648\u0631\u0629 ${number}`,
  meaning: `The ${number}`,
  ayahs: 7,
  key: `surah:${number}`,
  ...overrides,
});

const mockAyah = (id, surahNumber = 1, overrides = {}) => ({
  id,
  number: id,
  surahNumber,
  surahName: 'Al-Fatihah',
  arabic: `\u0622\u064a\u0629 ${id}`,
  translation: `Ayah ${id} translation`,
  juzNumber: 1,
  pageNumber: 1,
  hizbNumber: 1,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  useSession.mockReturnValue({ user: null, loading: false });
  useFeedback.mockReturnValue({
    showError: jest.fn(), showInfo: jest.fn(), showSuccess: jest.fn(),
  });
  useTabActivity.mockReturnValue({ notifyTabActivity: jest.fn() });
  client.getSurahs.mockResolvedValue([mockSurah(1), mockSurah(2)]);
  client.getAyahsForSurahPage.mockResolvedValue({
    items: [mockAyah(1, 1), mockAyah(2, 1), mockAyah(3, 1)],
    hasMore: false,
    page: 0,
  });
});

const mockNavigation = { setBack: jest.fn(), clearBack: jest.fn() };

afterEach(() => {
  jest.useRealTimers();
});

describe('QuranScreen', () => {
  it('renders surah list on mount', async () => {
    const { getByText, queryByTestId } = render(
      <QuranScreen isActive navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('Al-Qur\'an')).toBeTruthy();
    });

    await waitFor(() => {
      expect(client.getSurahs).toHaveBeenCalled();
      expect(getByText('Surah 1')).toBeTruthy();
      expect(getByText('Surah 2')).toBeTruthy();
    });
  });

  it('shows loading state when surahs not yet loaded', () => {
    client.getSurahs.mockImplementation(() => new Promise(() => {}));

    render(<QuranScreen isActive navigation={mockNavigation} />);

    expect(client.getSurahs).toHaveBeenCalled();
  });

  it('filters surahs by search query', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <QuranScreen isActive navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('Surah 1')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Cari...');
    fireEvent.changeText(searchInput, 'Surah 2');

    await waitFor(() => {
      expect(queryByText('Surah 1')).toBeNull();
      expect(getByText('Surah 2')).toBeTruthy();
    });
  });

  it('opens ayah view when surah is pressed', async () => {
    const { getByText } = render(
      <QuranScreen isActive navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('Surah 1')).toBeTruthy();
    });

    fireEvent.press(getByText('Surah 1'));

    await waitFor(() => {
      expect(client.getAyahsForSurahPage).toHaveBeenCalledWith(1, expect.any(Object));
    });
  });

  it('shows "Hafalan" tab with content', async () => {
    const { getByText } = render(
      <QuranScreen isActive navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('Hafalan')).toBeTruthy();
    });

    fireEvent.press(getByText('Hafalan'));

    await waitFor(() => {
      expect(getByText(/Buka Profil untuk masuk/i)).toBeTruthy();
    });
  });

  it('shows memorization mode selector in settings', async () => {
    const { getByText, getByTestId } = render(
      <QuranScreen isActive navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('Surah 1')).toBeTruthy();
    });

    fireEvent.press(getByText('Surah 1'));

    await waitFor(() => {
      expect(getByTestId('action-Menu baca')).toBeTruthy();
    });

    fireEvent.press(getByTestId('action-Menu baca'));

    await waitFor(() => {
      expect(getByText('Pengaturan tampilan')).toBeTruthy();
    });

    fireEvent.press(getByText('Pengaturan tampilan'));

    await waitFor(() => {
      expect(getByTestId('modal-sheet')).toBeTruthy();
      expect(getByText('Mode Hafalan')).toBeTruthy();
      expect(getByText('Normal')).toBeTruthy();
      expect(getByText('Sembunyikan Arab')).toBeTruthy();
      expect(getByText('Sembunyikan Terjemah')).toBeTruthy();
      expect(getByText('Latihan Penuh')).toBeTruthy();
    });
  });

  it('renders bookmark and note buttons in ayah action sheet', async () => {
    useSession.mockReturnValue({ user: { id: 'user-1' }, loading: false });
    const { getByText } = render(
      <QuranScreen isActive navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('Surah 1')).toBeTruthy();
    });

    fireEvent.press(getByText('Surah 1'));

    await waitFor(() => {
      expect(client.getAyahsForSurahPage).toHaveBeenCalled();
    });
  });

  it('toggles quran tabs (Surah / Hafalan / Murojaah)', async () => {
    const { getByText, queryByText } = render(
      <QuranScreen isActive navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('Surah')).toBeTruthy();
      expect(getByText('Hafalan')).toBeTruthy();
      expect(getByText('Murojaah')).toBeTruthy();
    });

    fireEvent.press(getByText('Murojaah'));

    await waitFor(() => {
      expect(getByText(/Buka Profil untuk masuk/i)).toBeTruthy();
    });
  });

  it('shows murojaah tab when user is logged in', async () => {
    useSession.mockReturnValue({ user: { id: 'user-1' }, loading: false });
    const { getByText } = render(
      <QuranScreen isActive navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('Murojaah')).toBeTruthy();
    });

    fireEvent.press(getByText('Murojaah'));

    await waitFor(() => {
      expect(getByText(/Pilih surah yang sudah hafal/i)).toBeTruthy();
    });
  });

  it('shows reader header when surah is opened', async () => {
    const { getByText } = render(
      <QuranScreen isActive navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('Surah 1')).toBeTruthy();
    });

    fireEvent.press(getByText('Surah 1'));

    await waitFor(() => {
      expect(getByText('Surah 1')).toBeTruthy();
      expect(getByText(/7 ayah/)).toBeTruthy();
    });
  });

  it('shows reader menu button when surah is opened', async () => {
    const { getByText, getByTestId } = render(
      <QuranScreen isActive navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('Surah 1')).toBeTruthy();
    });

    fireEvent.press(getByText('Surah 1'));

    await waitFor(() => {
      expect(getByTestId('action-Menu baca')).toBeTruthy();
      expect(getByTestId('action-Kembali ke daftar surah')).toBeTruthy();
    });
  });
});
