export type BibleLocale = 'en' | 'fr' | 'de';
export type BibleVersionCode = 'KJV' | 'NIV' | 'AMP' | 'NBS' | 'ELB' | 'LUT';
export type BibleTestament = 'old' | 'new';

export interface BibleBook {
  id: string;
  bookId: number;
  name: string;
  commonName: string;
  numberOfChapters: number;
  order: number;
  testament: BibleTestament;
}

export interface BibleTranslationOption {
  id: BibleVersionCode;
  shortName: BibleVersionCode;
  label: string;
  description: string;
  languageCode: BibleLocale;
}

interface RawBibleVerse {
  verse?: number | string;
  text?: string;
  [key: string]: unknown;
}

interface NormalizedVerseContentItem {
  text: string;
}

interface NormalizedVerseItem {
  type: 'verse';
  number: number;
  content: NormalizedVerseContentItem[];
}

export interface NormalizedBibleChapter {
  chapter: {
    content: NormalizedVerseItem[];
  };
}

interface BibleBookDefinition {
  bookId: number;
  chapters: number;
  names: Record<BibleLocale, string>;
}

const BOLLS_BASE_URL = 'https://bolls.life';

const CHAPTER_COUNT_OVERRIDES: Partial<
  Record<BibleVersionCode, Partial<Record<number, number>>>
> = {
  NBS: {
    29: 4,
    39: 3,
  },
  ELB: {
    29: 4,
    39: 3,
  },
  LUT: {
    29: 4,
    39: 3,
  },
};

const VERSION_LANGUAGE_MAP: Record<BibleVersionCode, BibleLocale> = {
  KJV: 'en',
  NIV: 'en',
  AMP: 'en',
  NBS: 'fr',
  ELB: 'de',
  LUT: 'de',
};

export const DEFAULT_BIBLE_TRANSLATION_ID: BibleVersionCode = 'KJV';

export const BIBLE_TRANSLATION_OPTIONS: BibleTranslationOption[] = [
  {
    id: 'KJV',
    shortName: 'KJV',
    label: 'King James Version 1769 with Apocrypha',
    description: 'English',
    languageCode: 'en',
  },
  {
    id: 'NIV',
    shortName: 'NIV',
    label: 'New International Version, 2011',
    description: 'English',
    languageCode: 'en',
  },
  {
    id: 'AMP',
    shortName: 'AMP',
    label: 'Amplified Bible, 2015',
    description: 'English',
    languageCode: 'en',
  },
  {
    id: 'NBS',
    shortName: 'NBS',
    label: 'Nouvelle Bible Segond, 2002',
    description: 'French',
    languageCode: 'fr',
  },
  {
    id: 'ELB',
    shortName: 'ELB',
    label: 'Elberfelder Bibel, 1871',
    description: 'German',
    languageCode: 'de',
  },
  {
    id: 'LUT',
    shortName: 'LUT',
    label: 'Luther (1912)',
    description: 'German',
    languageCode: 'de',
  },
];

const BIBLE_BOOK_DEFINITIONS: BibleBookDefinition[] = [
  { bookId: 1, chapters: 50, names: { en: 'Genesis', fr: 'Genèse', de: '1 Mose' } },
  { bookId: 2, chapters: 40, names: { en: 'Exodus', fr: 'Exode', de: '2 Mose' } },
  { bookId: 3, chapters: 27, names: { en: 'Leviticus', fr: 'Lévitique', de: '3 Mose' } },
  { bookId: 4, chapters: 36, names: { en: 'Numbers', fr: 'Nombres', de: '4 Mose' } },
  { bookId: 5, chapters: 34, names: { en: 'Deuteronomy', fr: 'Deutéronome', de: '5 Mose' } },
  { bookId: 6, chapters: 24, names: { en: 'Joshua', fr: 'Josué', de: 'Josua' } },
  { bookId: 7, chapters: 21, names: { en: 'Judges', fr: 'Juges', de: 'Richter' } },
  { bookId: 8, chapters: 4, names: { en: 'Ruth', fr: 'Ruth', de: 'Ruth' } },
  { bookId: 9, chapters: 31, names: { en: '1 Samuel', fr: '1 Samuel', de: '1 Samuel' } },
  { bookId: 10, chapters: 24, names: { en: '2 Samuel', fr: '2 Samuel', de: '2 Samuel' } },
  { bookId: 11, chapters: 22, names: { en: '1 Kings', fr: '1 Rois', de: '1 Könige' } },
  { bookId: 12, chapters: 25, names: { en: '2 Kings', fr: '2 Rois', de: '2 Könige' } },
  {
    bookId: 13,
    chapters: 29,
    names: { en: '1 Chronicles', fr: '1 Chroniques', de: '1 Chronik' },
  },
  {
    bookId: 14,
    chapters: 36,
    names: { en: '2 Chronicles', fr: '2 Chroniques', de: '2 Chronik' },
  },
  { bookId: 15, chapters: 10, names: { en: 'Ezra', fr: 'Esdras', de: 'Esra' } },
  { bookId: 16, chapters: 13, names: { en: 'Nehemiah', fr: 'Néhémie', de: 'Nehemia' } },
  { bookId: 17, chapters: 10, names: { en: 'Esther', fr: 'Esther', de: 'Ester' } },
  { bookId: 18, chapters: 42, names: { en: 'Job', fr: 'Job', de: 'Hiob' } },
  { bookId: 19, chapters: 150, names: { en: 'Psalms', fr: 'Psaumes', de: 'Psalmen' } },
  { bookId: 20, chapters: 31, names: { en: 'Proverbs', fr: 'Proverbes', de: 'Sprüche' } },
  {
    bookId: 21,
    chapters: 12,
    names: { en: 'Ecclesiastes', fr: 'Ecclésiaste', de: 'Prediger' },
  },
  {
    bookId: 22,
    chapters: 8,
    names: { en: 'Song of Songs', fr: 'Cantique des Cantiques', de: 'Hoheslied' },
  },
  { bookId: 23, chapters: 66, names: { en: 'Isaiah', fr: 'Ésaïe', de: 'Jesaja' } },
  { bookId: 24, chapters: 52, names: { en: 'Jeremiah', fr: 'Jérémie', de: 'Jeremia' } },
  {
    bookId: 25,
    chapters: 5,
    names: { en: 'Lamentations', fr: 'Lamentations', de: 'Klagelieder' },
  },
  { bookId: 26, chapters: 48, names: { en: 'Ezekiel', fr: 'Ézéchiel', de: 'Hesekiel' } },
  { bookId: 27, chapters: 12, names: { en: 'Daniel', fr: 'Daniel', de: 'Daniel' } },
  { bookId: 28, chapters: 14, names: { en: 'Hosea', fr: 'Osée', de: 'Hosea' } },
  { bookId: 29, chapters: 3, names: { en: 'Joel', fr: 'Joël', de: 'Joel' } },
  { bookId: 30, chapters: 9, names: { en: 'Amos', fr: 'Amos', de: 'Amos' } },
  { bookId: 31, chapters: 1, names: { en: 'Obadiah', fr: 'Abdias', de: 'Obadja' } },
  { bookId: 32, chapters: 4, names: { en: 'Jonah', fr: 'Jonas', de: 'Jona' } },
  { bookId: 33, chapters: 7, names: { en: 'Micah', fr: 'Michée', de: 'Micha' } },
  { bookId: 34, chapters: 3, names: { en: 'Nahum', fr: 'Nahum', de: 'Nahum' } },
  { bookId: 35, chapters: 3, names: { en: 'Habakkuk', fr: 'Habacuc', de: 'Habakuk' } },
  { bookId: 36, chapters: 3, names: { en: 'Zephaniah', fr: 'Sophonie', de: 'Zefanja' } },
  { bookId: 37, chapters: 2, names: { en: 'Haggai', fr: 'Aggée', de: 'Haggai' } },
  { bookId: 38, chapters: 14, names: { en: 'Zechariah', fr: 'Zacharie', de: 'Sacharja' } },
  { bookId: 39, chapters: 4, names: { en: 'Malachi', fr: 'Malachie', de: 'Maleachi' } },
  { bookId: 40, chapters: 28, names: { en: 'Matthew', fr: 'Matthieu', de: 'Matthäus' } },
  { bookId: 41, chapters: 16, names: { en: 'Mark', fr: 'Marc', de: 'Markus' } },
  { bookId: 42, chapters: 24, names: { en: 'Luke', fr: 'Luc', de: 'Lukas' } },
  { bookId: 43, chapters: 21, names: { en: 'John', fr: 'Jean', de: 'Johannes' } },
  {
    bookId: 44,
    chapters: 28,
    names: { en: 'Acts', fr: 'Actes', de: 'Apostelgeschichte' },
  },
  { bookId: 45, chapters: 16, names: { en: 'Romans', fr: 'Romains', de: 'Römer' } },
  {
    bookId: 46,
    chapters: 16,
    names: { en: '1 Corinthians', fr: '1 Corinthiens', de: '1 Korinther' },
  },
  {
    bookId: 47,
    chapters: 13,
    names: { en: '2 Corinthians', fr: '2 Corinthiens', de: '2 Korinther' },
  },
  { bookId: 48, chapters: 6, names: { en: 'Galatians', fr: 'Galates', de: 'Galater' } },
  { bookId: 49, chapters: 6, names: { en: 'Ephesians', fr: 'Éphésiens', de: 'Epheser' } },
  {
    bookId: 50,
    chapters: 4,
    names: { en: 'Philippians', fr: 'Philippiens', de: 'Philipper' },
  },
  { bookId: 51, chapters: 4, names: { en: 'Colossians', fr: 'Colossiens', de: 'Kolosser' } },
  {
    bookId: 52,
    chapters: 5,
    names: {
      en: '1 Thessalonians',
      fr: '1 Thessaloniciens',
      de: '1 Thessalonicher',
    },
  },
  {
    bookId: 53,
    chapters: 3,
    names: {
      en: '2 Thessalonians',
      fr: '2 Thessaloniciens',
      de: '2 Thessalonicher',
    },
  },
  {
    bookId: 54,
    chapters: 6,
    names: { en: '1 Timothy', fr: '1 Timothée', de: '1 Timotheus' },
  },
  {
    bookId: 55,
    chapters: 4,
    names: { en: '2 Timothy', fr: '2 Timothée', de: '2 Timotheus' },
  },
  { bookId: 56, chapters: 3, names: { en: 'Titus', fr: 'Tite', de: 'Titus' } },
  { bookId: 57, chapters: 1, names: { en: 'Philemon', fr: 'Philémon', de: 'Philemon' } },
  { bookId: 58, chapters: 13, names: { en: 'Hebrews', fr: 'Hébreux', de: 'Hebräer' } },
  { bookId: 59, chapters: 5, names: { en: 'James', fr: 'Jacques', de: 'Jakobus' } },
  { bookId: 60, chapters: 5, names: { en: '1 Peter', fr: '1 Pierre', de: '1 Petrus' } },
  { bookId: 61, chapters: 3, names: { en: '2 Peter', fr: '2 Pierre', de: '2 Petrus' } },
  {
    bookId: 62,
    chapters: 5,
    names: { en: '1 John', fr: '1 Jean', de: '1 Johannes' },
  },
  {
    bookId: 63,
    chapters: 1,
    names: { en: '2 John', fr: '2 Jean', de: '2 Johannes' },
  },
  {
    bookId: 64,
    chapters: 1,
    names: { en: '3 John', fr: '3 Jean', de: '3 Johannes' },
  },
  { bookId: 65, chapters: 1, names: { en: 'Jude', fr: 'Jude', de: 'Judas' } },
  {
    bookId: 66,
    chapters: 22,
    names: { en: 'Revelation', fr: 'Apocalypse', de: 'Offenbarung' },
  },
];

const normalizeLanguageCode = (value?: string | null): BibleLocale => {
  const normalized = (value ?? '').trim().toLowerCase().split(/[-_]/)[0];
  if (normalized === 'fr') {
    return 'fr';
  }
  if (normalized === 'de') {
    return 'de';
  }
  return 'en';
};

export const cleanVerseText = (text = ''): string =>
  text
    .replace(/<S>.*?<\/S>/g, '')
    .replace(/<\/?sup>/g, '')
    .replace(/<\/?i>/g, '')
    .trim();

const getBibleLanguageForVersion = (version: string): BibleLocale => {
  return VERSION_LANGUAGE_MAP[version as BibleVersionCode] ?? 'en';
};

const getChapterCount = (bookId: number, version: string): number => {
  const versionOverrides = CHAPTER_COUNT_OVERRIDES[version as BibleVersionCode];
  return versionOverrides?.[bookId] ?? BIBLE_BOOK_DEFINITIONS[bookId - 1]?.chapters ?? 1;
};

export const getBibleTranslationOptions = (): BibleTranslationOption[] => {
  return BIBLE_TRANSLATION_OPTIONS;
};

export const isBibleTranslationSupported = (translationId: string): boolean => {
  return BIBLE_TRANSLATION_OPTIONS.some((translation) => translation.id === translationId);
};

export const getPreferredBibleTranslationId = (currentLanguage: string): BibleVersionCode => {
  const languageCode = normalizeLanguageCode(currentLanguage);

  if (languageCode === 'fr') {
    return 'NBS';
  }

  if (languageCode === 'de') {
    return 'ELB';
  }

  return DEFAULT_BIBLE_TRANSLATION_ID;
};

export const getBibleBooks = (translationId: string): BibleBook[] => {
  const languageCode = getBibleLanguageForVersion(translationId);

  return BIBLE_BOOK_DEFINITIONS.map((book) => ({
    id: String(book.bookId),
    bookId: book.bookId,
    name: book.names[languageCode],
    commonName: `${book.names.en} ${book.names.fr} ${book.names.de}`,
    numberOfChapters: getChapterCount(book.bookId, translationId),
    order: book.bookId,
    testament: book.bookId <= 39 ? 'old' : 'new',
  }));
};

export async function fetchBibleChapter({
  version,
  bookId,
  chapter,
}: {
  version: string;
  bookId: number;
  chapter: number;
}): Promise<NormalizedBibleChapter> {
  const url = `${BOLLS_BASE_URL}/get-chapter/${version}/${bookId}/${chapter}/`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Bible request failed with status ${response.status}`);
  }

  const payload = await response.json();

  if (!Array.isArray(payload)) {
    throw new Error('Invalid Bible chapter response');
  }

  const content = payload.map((verse: RawBibleVerse, index: number) => ({
    type: 'verse' as const,
    number: Number(verse.verse ?? index + 1),
    content: [
      {
        text: cleanVerseText(verse.text ?? ''),
      },
    ],
  }));

  return {
    chapter: {
      content,
    },
  };
}
