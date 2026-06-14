import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../contexts/LanguageContext';

const PRIMARY = '#040725';
const ACCENT = '#3B82F6';

const API_BASE = 'https://bible.helloao.org/api';
const BIBLE_TRANSLATION_STORAGE_KEY = '@bible_translation';
const DEFAULT_TRANSLATION_ID = 'engbsb';

const oldTestamentIds = [
  'GEN',
  'EXO',
  'LEV',
  'NUM',
  'DEU',
  'JOS',
  'JDG',
  'RUT',
  '1SA',
  '2SA',
  '1KI',
  '2KI',
  '1CH',
  '2CH',
  'EZR',
  'NEH',
  'EST',
  'JOB',
  'PSA',
  'PRO',
  'ECC',
  'SNG',
  'ISA',
  'JER',
  'LAM',
  'EZK',
  'DAN',
  'HOS',
  'JOL',
  'AMO',
  'OBA',
  'JON',
  'MIC',
  'NAM',
  'HAB',
  'ZEP',
  'HAG',
  'ZEC',
  'MAL',
];

interface BibleBook {
  id: string;
  name: string;
  commonName: string;
  numberOfChapters: number;
  order: number;
}

interface ApiBibleTranslation {
  id: string;
  name?: string;
  shortName?: string;
  englishName?: string;
  language?: string;
  languageEnglishName?: string;
}

interface BibleTranslationOption {
  id: string;
  shortName: string;
  label: string;
  description: string;
  languageCode: string;
}

interface Props {
  navigation?: any;
}

const FALLBACK_TRANSLATIONS: BibleTranslationOption[] = [
  {
    id: DEFAULT_TRANSLATION_ID,
    shortName: 'BSB',
    label: 'Berean Standard Bible',
    description: 'English',
    languageCode: 'en',
  },
  {
    id: 'fra_lsg',
    shortName: 'LSG',
    label: 'Louis Segond 1910',
    description: 'French',
    languageCode: 'fr',
  },
];

const normalizeValue = (value?: string | null): string => (value ?? '').trim().toLowerCase();

const getFirstNonEmptyValue = (...values: (string | undefined)[]): string =>
  values.find((value) => value && value.trim().length > 0)?.trim() ?? '';

const getTranslationSearchText = (translation: ApiBibleTranslation): string =>
  [
    translation.id,
    translation.name,
    translation.shortName,
    translation.englishName,
    translation.language,
    translation.languageEnglishName,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const extractTranslations = (payload: any): ApiBibleTranslation[] => {
  const translations: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.translations)
      ? payload.translations
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.availableTranslations)
          ? payload.availableTranslations
          : [];

  return translations.filter(
    (translation): translation is ApiBibleTranslation =>
      typeof translation === 'object' &&
      translation !== null &&
      'id' in translation &&
      typeof translation.id === 'string' &&
      translation.id.length > 0
  );
};

const toTranslationOption = (
  translation: ApiBibleTranslation,
  fallback: Omit<BibleTranslationOption, 'id'>
): BibleTranslationOption => ({
  id: translation.id,
  shortName: getFirstNonEmptyValue(translation.shortName, fallback.shortName),
  label: getFirstNonEmptyValue(translation.name, translation.englishName, fallback.label),
  description: getFirstNonEmptyValue(
    translation.englishName,
    translation.languageEnglishName,
    translation.name,
    fallback.description
  ),
  languageCode: normalizeValue(translation.language).split(/[-_]/)[0] || fallback.languageCode,
});

const dedupeTranslations = (
  translations: (BibleTranslationOption | null | undefined)[]
): BibleTranslationOption[] =>
  translations
    .filter((translation): translation is BibleTranslationOption => Boolean(translation))
    .filter(
      (translation, index, array) =>
        array.findIndex((candidate) => candidate.id === translation.id) === index
    );

const buildTranslationOptions = (
  translations: ApiBibleTranslation[]
): BibleTranslationOption[] => {
  const englishTranslation =
    translations.find((translation) => {
      const text = getTranslationSearchText(translation);
      return (
        normalizeValue(translation.id) === DEFAULT_TRANSLATION_ID ||
        normalizeValue(translation.shortName) === 'bsb' ||
        text.includes('berean standard bible')
      );
    }) ?? null;

  const frenchTranslation =
    translations.find((translation) => {
      const text = getTranslationSearchText(translation);
      const languageCode = normalizeValue(translation.language);
      return (
        normalizeValue(translation.id) === 'fra_lsg' ||
        ((languageCode.startsWith('fr') || text.includes('french')) &&
          (text.includes('louis segond') || normalizeValue(translation.shortName) === 'lsg'))
      );
    }) ?? null;

  const germanTranslation =
    translations.find((translation) => {
      const text = getTranslationSearchText(translation);
      const languageCode = normalizeValue(translation.language);
      const isGermanLanguage = languageCode.startsWith('de') || text.includes('german');
      return (
        isGermanLanguage &&
        (text.includes('luther') ||
          text.includes('schlachter') ||
          text.includes('elberfelder') ||
          text.includes('hoffnung'))
      );
    }) ??
    translations.find((translation) => {
      const text = getTranslationSearchText(translation);
      const languageCode = normalizeValue(translation.language);
      return languageCode.startsWith('de') || text.includes('german');
    }) ??
    null;

  return dedupeTranslations([
    englishTranslation
      ? toTranslationOption(englishTranslation, {
          shortName: 'BSB',
          label: 'Berean Standard Bible',
          description: 'English',
          languageCode: 'en',
        })
      : FALLBACK_TRANSLATIONS[0],
    frenchTranslation
      ? toTranslationOption(frenchTranslation, {
          shortName: 'LSG',
          label: 'Louis Segond 1910',
          description: 'French',
          languageCode: 'fr',
        })
      : FALLBACK_TRANSLATIONS[1],
    germanTranslation
      ? toTranslationOption(germanTranslation, {
          shortName: getFirstNonEmptyValue(germanTranslation.shortName, 'DE'),
          label: getFirstNonEmptyValue(
            germanTranslation.name,
            germanTranslation.englishName,
            'German Bible'
          ),
          description: 'German',
          languageCode: 'de',
        })
      : null,
  ]);
};

const getPreferredTranslationId = (
  currentLanguage: string,
  translations: BibleTranslationOption[]
): string => {
  const languageCode = normalizeValue(currentLanguage).split(/[-_]/)[0];

  if (languageCode === 'fr') {
    return (
      translations.find((translation) => translation.languageCode === 'fr')?.id ??
      DEFAULT_TRANSLATION_ID
    );
  }

  if (languageCode === 'de') {
    return (
      translations.find((translation) => translation.languageCode === 'de')?.id ??
      translations.find((translation) => translation.languageCode === 'en')?.id ??
      DEFAULT_TRANSLATION_ID
    );
  }

  return (
    translations.find(
      (translation) =>
        translation.id === DEFAULT_TRANSLATION_ID || normalizeValue(translation.shortName) === 'bsb'
    )?.id ??
    translations.find((translation) => translation.languageCode === 'en')?.id ??
    translations[0]?.id ??
    DEFAULT_TRANSLATION_ID
  );
};

const BibleScreen = ({ navigation }: Props) => {
  const { currentLanguage } = useLanguage();
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [availableTranslations, setAvailableTranslations] =
    useState<BibleTranslationOption[]>(FALLBACK_TRANSLATIONS);
  const [selectedTranslationId, setSelectedTranslationId] =
    useState<string>(DEFAULT_TRANSLATION_ID);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [chapterContent, setChapterContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingChapter, setLoadingChapter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'old' | 'new'>('all');
  const [showTranslationDropdown, setShowTranslationDropdown] = useState(false);
  const [showBookDropdown, setShowBookDropdown] = useState(false);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [error, setError] = useState<string | null>(null);

  const selectedTranslation =
    availableTranslations.find((translation) => translation.id === selectedTranslationId) ??
    availableTranslations[0] ??
    FALLBACK_TRANSLATIONS[0];

  const fetchChapter = useCallback(async (translationId: string, bookId: string, chapter: number) => {
    try {
      setLoadingChapter(true);
      setError(null);

      const response = await fetch(`${API_BASE}/${translationId}/${bookId}/${chapter}.json`);

      if (!response.ok) {
        throw new Error('Failed to fetch chapter');
      }

      const data = await response.json();
      setChapterContent(data);
      setShowChapterDropdown(false);
    } catch (err: any) {
      console.error('Error fetching chapter:', err);
      setError(err.message || 'Failed to load chapter');
    } finally {
      setLoadingChapter(false);
    }
  }, []);

  const fetchBooks = useCallback(async (
    translationId: string,
    options: {
      preserveBook?: BibleBook | null;
      preserveChapter?: number;
    } = {}
  ) => {
    const { preserveBook = null, preserveChapter = 1 } = options;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/${translationId}/books.json`);

      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }

      const data = await response.json();
      const nextBooks: BibleBook[] = Array.isArray(data?.books) ? data.books : [];

      if (nextBooks.length === 0) {
        throw new Error('Invalid data format');
      }

      setBooks(nextBooks);

      if (!preserveBook) {
        setSelectedBook(null);
        setSelectedChapter(1);
        setChapterContent(null);
        return;
      }

      const matchingBook =
        nextBooks.find((book) => book.id === preserveBook.id) ?? null;

      if (!matchingBook) {
        setSelectedBook(null);
        setSelectedChapter(1);
        setChapterContent(null);
        return;
      }

      setSelectedBook(matchingBook);
      setSelectedChapter(preserveChapter);
      await fetchChapter(translationId, matchingBook.id, preserveChapter);
    } catch (err: any) {
      console.error('Error fetching books:', err);
      setError(err.message || 'Failed to load Bible books');
    } finally {
      setLoading(false);
    }
  }, [fetchChapter]);

  useEffect(() => {
    const initializeBible = async () => {
      let nextTranslations = FALLBACK_TRANSLATIONS;

      try {
        const response = await fetch(`${API_BASE}/available_translations.json`);

        if (response.ok) {
          const data = await response.json();
          const discoveredTranslations = buildTranslationOptions(extractTranslations(data));
          if (discoveredTranslations.length > 0) {
            nextTranslations = discoveredTranslations;
          }
        }
      } catch (translationError) {
        console.warn('Error fetching available Bible translations:', translationError);
      }

      let savedTranslationId: string | null = null;

      try {
        savedTranslationId = await AsyncStorage.getItem(BIBLE_TRANSLATION_STORAGE_KEY);
      } catch (storageError) {
        console.warn('Error reading saved Bible translation:', storageError);
      }

      const nextTranslationId =
        savedTranslationId &&
        nextTranslations.some((translation) => translation.id === savedTranslationId)
          ? savedTranslationId
          : getPreferredTranslationId(currentLanguage, nextTranslations);

      setAvailableTranslations(nextTranslations);
      setSelectedTranslationId(nextTranslationId);
      await fetchBooks(nextTranslationId);
    };

    void initializeBible();
  }, [currentLanguage, fetchBooks]);

  const getTestament = (bookId: string): 'old' | 'new' =>
    oldTestamentIds.includes(bookId) ? 'old' : 'new';

  const getFilteredBooks = (): BibleBook[] => {
    if (books.length === 0) {
      return [];
    }

    let filtered = [...books];

    if (activeTab === 'old') {
      filtered = filtered.filter((book) => oldTestamentIds.includes(book.id));
    } else if (activeTab === 'new') {
      filtered = filtered.filter((book) => !oldTestamentIds.includes(book.id));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.name.toLowerCase().includes(query) ||
          book.commonName.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const handleTranslationSelect = async (translation: BibleTranslationOption) => {
    setShowTranslationDropdown(false);
    setShowBookDropdown(false);
    setShowChapterDropdown(false);

    if (translation.id === selectedTranslationId) {
      return;
    }

    setSelectedTranslationId(translation.id);

    try {
      await AsyncStorage.setItem(BIBLE_TRANSLATION_STORAGE_KEY, translation.id);
    } catch (storageError) {
      console.warn('Error saving Bible translation:', storageError);
    }

    await fetchBooks(translation.id, {
      preserveBook: selectedBook,
      preserveChapter: selectedChapter,
    });
  };

  const handleBookSelect = (book: BibleBook) => {
    setSelectedBook(book);
    setSelectedChapter(1);
    setShowBookDropdown(false);
    void fetchChapter(selectedTranslationId, book.id, 1);
  };

  const handleChapterSelect = (chapter: number) => {
    setSelectedChapter(chapter);
    if (selectedBook) {
      void fetchChapter(selectedTranslationId, selectedBook.id, chapter);
    }
  };

  const closeAllDropdowns = () => {
    setShowTranslationDropdown(false);
    setShowBookDropdown(false);
    setShowChapterDropdown(false);
  };

  const renderVerseContent = (content: any) => {
    if (!content) {
      return null;
    }

    if (typeof content === 'string') {
      return <Text style={{ color: PRIMARY, fontSize }}>{content}</Text>;
    }

    if (!Array.isArray(content)) {
      return null;
    }

    return content.map((item: any, idx: number) => {
      if (typeof item === 'string') {
        return (
          <Text key={idx} style={{ color: PRIMARY, fontSize }}>
            {item}
          </Text>
        );
      }

      if (item && typeof item === 'object') {
        if (item.text) {
          const isJesusWords = item.person === 'Jesus' || item.wordsOfJesus === true;
          return (
            <Text
              key={idx}
              style={{
                color: isJesusWords ? '#DC2626' : PRIMARY,
                fontSize,
                fontWeight: isJesusWords ? '500' : '400',
              }}
            >
              {item.text}
            </Text>
          );
        }

        if (item.lineBreak) {
          return <Text key={idx}>{'\n'}</Text>;
        }
      }

      return null;
    });
  };

  const parseVerseContent = (content: any): string => {
    if (!content) {
      return '';
    }

    if (typeof content === 'string') {
      return content;
    }

    if (!Array.isArray(content)) {
      return '';
    }

    return content
      .map((item: any) => {
        if (typeof item === 'string') {
          return item;
        }

        if (item && typeof item === 'object') {
          if (item.text) {
            return item.text;
          }

          if (item.lineBreak) {
            return '\n';
          }
        }

        return '';
      })
      .join('');
  };

  const renderChapterContent = () => {
    if (!chapterContent) {
      return null;
    }

    let content = null;

    if (chapterContent.chapter && chapterContent.chapter.content) {
      content = chapterContent.chapter.content;
    } else if (chapterContent.content) {
      content = chapterContent.content;
    } else if (Array.isArray(chapterContent)) {
      content = chapterContent;
    }

    if (!content || !Array.isArray(content)) {
      return (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: '#6B7280' }}>Unable to display content</Text>
        </View>
      );
    }

    return content.map((item: any, index: number) => {
      if (!item) {
        return null;
      }

      if (item.type === 'verse' && item.number !== undefined) {
        return (
          <Text key={`verse-${index}`} style={{ marginBottom: 12, lineHeight: fontSize * 1.6 }}>
            <Text style={{ color: ACCENT, fontSize: fontSize - 4, fontWeight: 'bold' }}>
              {item.number}{' '}
            </Text>
            {renderVerseContent(item.content)}
          </Text>
        );
      }

      if (item.type === 'heading') {
        const headingText = parseVerseContent(item.content);
        return (
          <Text
            key={`heading-${index}`}
            style={{
              color: PRIMARY,
              fontSize: fontSize + 2,
              fontWeight: 'bold',
              marginTop: 20,
              marginBottom: 12,
            }}
          >
            {headingText}
          </Text>
        );
      }

      if (item.type === 'hebrew_subtitle') {
        const subtitleText = parseVerseContent(item.content);
        return (
          <Text
            key={`subtitle-${index}`}
            style={{
              color: '#6B7280',
              fontSize: fontSize - 2,
              fontStyle: 'italic',
              marginBottom: 12,
            }}
          >
            {subtitleText}
          </Text>
        );
      }

      if (item.type === 'line_break') {
        return <View key={`br-${index}`} style={{ height: 12 }} />;
      }

      return null;
    });
  };

  if (loading && books.length === 0) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={{ color: '#6B7280', marginTop: 16 }}>Loading Bible...</Text>
      </SafeAreaView>
    );
  }

  if (error && books.length === 0) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
        }}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Ionicons name="cloud-offline" size={64} color="#9CA3AF" />
        <Text
          style={{
            color: PRIMARY,
            fontSize: 18,
            fontWeight: 'bold',
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          Connection Error
        </Text>
        <Text style={{ color: '#6B7280', marginTop: 8, textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity
          onPress={() => void fetchBooks(selectedTranslationId)}
          style={{
            backgroundColor: ACCENT,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
            marginTop: 24,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const filteredBooks = getFilteredBooks();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#F3F4F6',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#F3F4F6',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={22} color={PRIMARY} />
          </TouchableOpacity>
          <Text
            style={{
              color: PRIMARY,
              fontSize: 22,
              fontWeight: 'bold',
              marginLeft: 16,
            }}
          >
            Bible
          </Text>
        </View>
        <View
          style={{
            backgroundColor: '#E0F2FE',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: ACCENT, fontSize: 11, fontWeight: '600' }}>
            {selectedTranslation.shortName}
          </Text>
        </View>
      </View>

      {/* Fixed Controls with Dropdowns */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 16,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#F3F4F6',
        }}
      >
        {/* Translation Dropdown */}
        <View style={{ marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => {
              setShowTranslationDropdown(!showTranslationDropdown);
              setShowBookDropdown(false);
              setShowChapterDropdown(false);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderWidth: 2,
              borderColor: showTranslationDropdown ? ACCENT : '#E5E7EB',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text
                style={{
                  color: '#9CA3AF',
                  fontSize: 11,
                  fontWeight: '500',
                  marginBottom: 2,
                }}
              >
                TRANSLATION
              </Text>
              <Text style={{ color: PRIMARY, fontSize: 16, fontWeight: '700' }} numberOfLines={1}>
                {selectedTranslation.label}
              </Text>
              <Text
                style={{
                  color: '#6B7280',
                  fontSize: 12,
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                {selectedTranslation.shortName} · {selectedTranslation.description}
              </Text>
            </View>
            <Ionicons
              name={showTranslationDropdown ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={PRIMARY}
            />
          </TouchableOpacity>
        </View>

        {showTranslationDropdown && (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              marginBottom: 16,
              maxHeight: 260,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <ScrollView
              style={{ maxHeight: 260 }}
              showsVerticalScrollIndicator={true}
              persistentScrollbar={true}
            >
              {availableTranslations.map((translation, index) => {
                const isSelected = translation.id === selectedTranslationId;

                return (
                  <TouchableOpacity
                    key={translation.id}
                    onPress={() => {
                      void handleTranslationSelect(translation);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      backgroundColor: isSelected ? '#F0F9FF' : 'transparent',
                      borderBottomWidth: index === availableTranslations.length - 1 ? 0 : 1,
                      borderBottomColor: '#F3F4F6',
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 4,
                        }}
                      >
                        <Text
                          style={{
                            color: isSelected ? ACCENT : PRIMARY,
                            fontSize: 15,
                            fontWeight: isSelected ? '700' : '600',
                            flex: 1,
                          }}
                        >
                          {translation.label}
                        </Text>
                        <View
                          style={{
                            backgroundColor: isSelected ? '#DBEAFE' : '#F3F4F6',
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 999,
                            marginLeft: 8,
                          }}
                        >
                          <Text
                            style={{
                              color: isSelected ? ACCENT : '#6B7280',
                              fontSize: 10,
                              fontWeight: '700',
                            }}
                          >
                            {translation.shortName}
                          </Text>
                        </View>
                      </View>
                      <Text style={{ color: '#6B7280', fontSize: 12 }}>
                        {translation.description}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={ACCENT} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {selectedBook && (
          <>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {/* Book Dropdown */}
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowBookDropdown(!showBookDropdown);
                    setShowChapterDropdown(false);
                    setShowTranslationDropdown(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    borderWidth: 2,
                    borderColor: showBookDropdown ? ACCENT : '#E5E7EB',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text
                      style={{
                        color: '#9CA3AF',
                        fontSize: 11,
                        fontWeight: '500',
                        marginBottom: 2,
                      }}
                    >
                      BOOK
                    </Text>
                    <Text
                      style={{ color: PRIMARY, fontSize: 16, fontWeight: '700' }}
                      numberOfLines={1}
                    >
                      {selectedBook.name}
                    </Text>
                  </View>
                  <Ionicons
                    name={showBookDropdown ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={PRIMARY}
                  />
                </TouchableOpacity>
              </View>

              {/* Chapter Dropdown */}
              <View style={{ width: 140 }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowChapterDropdown(!showChapterDropdown);
                    setShowBookDropdown(false);
                    setShowTranslationDropdown(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    borderWidth: 2,
                    borderColor: showChapterDropdown ? ACCENT : '#E5E7EB',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: '#9CA3AF',
                        fontSize: 11,
                        fontWeight: '500',
                        marginBottom: 2,
                      }}
                    >
                      CHAPTER
                    </Text>
                    <Text style={{ color: PRIMARY, fontSize: 16, fontWeight: '700' }}>
                      {selectedChapter}
                    </Text>
                  </View>
                  <Ionicons
                    name={showChapterDropdown ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={PRIMARY}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Book Dropdown Content */}
            {showBookDropdown && (
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  marginBottom: 16,
                  maxHeight: 300,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <ScrollView
                  style={{ maxHeight: 300 }}
                  showsVerticalScrollIndicator={true}
                  persistentScrollbar={true}
                >
                  {books.map((book, index) => (
                    <TouchableOpacity
                      key={book.id}
                      onPress={() => handleBookSelect(book)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        backgroundColor: selectedBook.id === book.id ? '#F0F9FF' : 'transparent',
                        borderBottomWidth: index === books.length - 1 ? 0 : 1,
                        borderBottomColor: '#F3F4F6',
                      }}
                    >
                      <Text
                        style={{
                          color: selectedBook.id === book.id ? ACCENT : PRIMARY,
                          fontSize: 15,
                          fontWeight: selectedBook.id === book.id ? '600' : '400',
                          flex: 1,
                        }}
                      >
                        {book.name}
                      </Text>
                      {selectedBook.id === book.id && (
                        <Ionicons name="checkmark-circle" size={20} color={ACCENT} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Chapter Dropdown Content */}
            {showChapterDropdown && (
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  marginBottom: 16,
                  maxHeight: 300,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <ScrollView
                  style={{ maxHeight: 300 }}
                  showsVerticalScrollIndicator={true}
                  persistentScrollbar={true}
                >
                  {Array.from(
                    { length: selectedBook.numberOfChapters },
                    (_, i) => i + 1
                  ).map((chapter, index) => (
                    <TouchableOpacity
                      key={chapter}
                      onPress={() => handleChapterSelect(chapter)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        backgroundColor: selectedChapter === chapter ? '#F0F9FF' : 'transparent',
                        borderBottomWidth:
                          index === selectedBook.numberOfChapters - 1 ? 0 : 1,
                        borderBottomColor: '#F3F4F6',
                      }}
                    >
                      <Text
                        style={{
                          color: selectedChapter === chapter ? ACCENT : PRIMARY,
                          fontSize: 15,
                          fontWeight: selectedChapter === chapter ? '600' : '400',
                        }}
                      >
                        Chapter {chapter}
                      </Text>
                      {selectedChapter === chapter && (
                        <Ionicons name="checkmark-circle" size={20} color={ACCENT} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Font Size Controls */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#F9FAFB',
                borderRadius: 14,
                padding: 4,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingLeft: 8,
                }}
              >
                <Ionicons name="text" size={18} color="#6B7280" />
                <Text style={{ color: '#6B7280', fontSize: 13, fontWeight: '500' }}>
                  Font Size
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setFontSize(Math.max(14, fontSize - 2))}
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                >
                  <Text style={{ color: PRIMARY, fontSize: 16, fontWeight: '700' }}>A-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFontSize(Math.min(28, fontSize + 2))}
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                >
                  <Text style={{ color: PRIMARY, fontSize: 20, fontWeight: '700' }}>A+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Scrollable Content Area */}
      <TouchableWithoutFeedback onPress={closeAllDropdowns}>
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {/* Chapter Content */}
          {selectedBook && (
            <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
              {loadingChapter ? (
                <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={ACCENT} />
                  <Text style={{ color: '#6B7280', marginTop: 16, fontSize: 15 }}>
                    Loading chapter...
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: '#F3F4F6',
                  }}
                >
                  {renderChapterContent()}
                </View>
              )}
            </View>
          )}

          {/* Show book list if no book selected */}
          {!selectedBook && (
            <>
              {/* Search Bar */}
              <View style={{ paddingHorizontal: 20, marginTop: 20, marginBottom: 20 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#F9FAFB',
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                >
                  <Ionicons name="search" size={20} color="#9CA3AF" />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search books..."
                    placeholderTextColor="#9CA3AF"
                    style={{
                      flex: 1,
                      marginLeft: 12,
                      fontSize: 15,
                      color: PRIMARY,
                    }}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Testament Tabs */}
              <View
                style={{
                  flexDirection: 'row',
                  marginHorizontal: 20,
                  marginBottom: 20,
                  backgroundColor: '#F9FAFB',
                  borderRadius: 14,
                  padding: 4,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                }}
              >
                {(['all', 'old', 'new'] as const).map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 11,
                      backgroundColor: activeTab === tab ? '#FFFFFF' : 'transparent',
                      shadowColor: activeTab === tab ? '#000' : 'transparent',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: activeTab === tab ? 0.05 : 0,
                      shadowRadius: 2,
                      elevation: activeTab === tab ? 1 : 0,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: 14,
                        color: activeTab === tab ? PRIMARY : '#9CA3AF',
                      }}
                    >
                      {tab === 'all'
                        ? 'All Books'
                        : tab === 'old'
                          ? 'Old Testament'
                          : 'New Testament'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Books Count */}
              <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
                <Text style={{ color: '#6B7280', fontSize: 14, fontWeight: '500' }}>
                  {filteredBooks.length} Books Available
                </Text>
              </View>

              {/* Books List */}
              <View style={{ paddingHorizontal: 20 }}>
                {filteredBooks.map((book) => {
                  const testament = getTestament(book.id);
                  return (
                    <TouchableOpacity
                      key={book.id}
                      onPress={() => handleBookSelect(book)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 14,
                        padding: 16,
                        marginBottom: 10,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.03,
                        shadowRadius: 2,
                        elevation: 1,
                      }}
                    >
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          backgroundColor: testament === 'old' ? '#FEF3C7' : '#DBEAFE',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Ionicons
                          name="book"
                          size={22}
                          color={testament === 'old' ? '#F59E0B' : ACCENT}
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text
                          style={{
                            color: PRIMARY,
                            fontSize: 16,
                            fontWeight: '600',
                            marginBottom: 2,
                          }}
                        >
                          {book.name}
                        </Text>
                        <Text style={{ color: '#9CA3AF', fontSize: 13 }}>
                          {book.numberOfChapters}{' '}
                          {book.numberOfChapters === 1 ? 'Chapter' : 'Chapters'}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default BibleScreen;
