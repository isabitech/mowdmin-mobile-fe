# Bible API Guide for Expo Mobile

This document is based on the current Bible implementation in:

- `src/Components/Bible/BibleApp.jsx`
- `src/HandyBibleApp/Books/English/OldTestament.jsx`
- `src/HandyBibleApp/Books/English/Newtestament.jsx`
- `src/HandyBibleApp/Books/French/OldTestamentFrench.jsx`
- `src/HandyBibleApp/Books/French/NewTestamentFrench.jsx`
- `src/HandyBibleApp/Books/German/OldTestamentGerman.jsx`
- `src/HandyBibleApp/Books/German/NewTestamentGerman.jsx`
- `src/Translate.jsx`

## Summary

There are **two Bible API patterns** in this repo:

1. `bible-api.com`
   Used in `src/Components/Bible/BibleApp.jsx` for quick verse lookup by text reference such as `Genesis 1`.

2. `bolls.life`
   Used in the multilingual Bible reader under `src/HandyBibleApp/Books/*`.
   This is the API flow the Expo mobile app should reuse for English, French, and German.

For the mobile app, treat `bolls.life` as the main Bible content API.

## 1. Main API for Expo

### Endpoint

```text
GET https://bolls.life/get-chapter/{version}/{bookId}/{chapter}/
```

### Path params

- `version`: Bible translation/version code
- `bookId`: numeric Bible book id
- `chapter`: numeric chapter number

### Example

```text
https://bolls.life/get-chapter/KJV/43/3/
```

That example means:

- `KJV` = English translation
- `43` = John
- `3` = chapter 3

## 2. Version Codes by Language

These are the active translation/version codes exposed by the current codebase.

### English

| Code | Translation |
| --- | --- |
| `KJV` | King James Version 1769 with Apocrypha |
| `NIV` | New International Version, 2011 |
| `AMP` | Amplified Bible, 2015 |

### French

| Code | Translation |
| --- | --- |
| `NBS` | Nouvelle Bible Segond, 2002 |

### German

| Code | Translation |
| --- | --- |
| `ELB` | Elberfelder Bibel, 1871 |
| `LUT` | Luther (1912) |

### Important note about German defaults

The German components currently initialize `selectedVersion` with `MB`, but `MB` is commented out and is **not** in the active version list shown to users.

For Expo, default German to `ELB` or `LUT` unless `MB` is explicitly re-enabled and verified.

## 3. Book IDs

The multilingual Bible reader uses the same numeric `bookId` values across English, French, and German.

- `1` to `39` = Old Testament
- `40` to `66` = New Testament

Examples:

| Book ID | Book |
| --- | --- |
| `1` | Genesis |
| `19` | Psalm |
| `40` | Matthew |
| `43` | John |
| `45` | Romans |
| `66` | Revelation |

For the full book list and chapter counts, reuse the existing `bookSelect` arrays from:

- `src/HandyBibleApp/Books/English/OldTestament.jsx`
- `src/HandyBibleApp/Books/English/Newtestament.jsx`

For mobile, move that data into one shared static file, for example `bibleBooks.ts` or `bibleBooks.js`.

## 4. Expected Response Shape

The current code treats the `bolls.life` response as an array of verse objects.

The fields actually used by the repo are:

- `verse`
- `text`

The API may return more fields, but the current UI only depends on those two.

Example normalized shape:

```ts
type BibleVerse = {
  verse: number | string;
  text: string;
  [key: string]: unknown;
};
```

## 5. Verse Text Cleanup

The current web implementation strips markup from the API response before rendering.

### Current behavior in the repo

- English removes `<S>...</S>` and `<sup>`
- German removes `<S>...</S>`, `<sup>`, and `<i>`
- French currently renders the raw verse text without cleanup

### Recommended Expo behavior

Use one shared cleanup function for all supported languages:

```js
export const cleanVerseText = (text = "") =>
  text
    .replace(/<S>.*?<\/S>/g, "")
    .replace(/<\/?sup>/g, "")
    .replace(/<\/?i>/g, "")
    .trim();
```

This keeps mobile output consistent across English, French, and German.

## 6. Recommended Fetch Helper for Expo

```js
const BOLLS_BASE_URL = "https://bolls.life";

export const BIBLE_VERSIONS = {
  en: [
    { code: "KJV", label: "King James Version 1769 with Apocrypha" },
    { code: "NIV", label: "New International Version, 2011" },
    { code: "AMP", label: "Amplified Bible, 2015" },
  ],
  fr: [
    { code: "NBS", label: "Nouvelle Bible Segond, 2002" },
  ],
  de: [
    { code: "ELB", label: "Elberfelder Bibel, 1871" },
    { code: "LUT", label: "Luther (1912)" },
  ],
};

export const cleanVerseText = (text = "") =>
  text
    .replace(/<S>.*?<\/S>/g, "")
    .replace(/<\/?sup>/g, "")
    .replace(/<\/?i>/g, "")
    .trim();

export async function fetchBibleChapter({ version, bookId, chapter }) {
  const url = `${BOLLS_BASE_URL}/get-chapter/${version}/${bookId}/${chapter}/`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Bible request failed with status ${response.status}`);
  }

  const payload = await response.json();

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map((verse) => ({
    ...verse,
    verse: Number(verse.verse ?? 0),
    text: cleanVerseText(verse.text ?? ""),
  }));
}
```

## 7. Suggested Mobile State Shape

```ts
type AppLocale = "en" | "fr" | "de";
type BibleVersion = "KJV" | "NIV" | "AMP" | "NBS" | "ELB" | "LUT";

type BibleReaderState = {
  locale: AppLocale;
  version: BibleVersion;
  bookId: number;
  chapter: number;
};
```

Suggested defaults:

- English: `KJV`, `bookId: 1`, `chapter: 1`
- French: `NBS`, `bookId: 1`, `chapter: 1`
- German: `ELB`, `bookId: 1`, `chapter: 1`

## 8. How Translations Work

There are **two different translation concepts** in this codebase.

### A. Bible text translations

This is the actual Bible content translation.

It is controlled by the `version` segment in the `bolls.life` URL.

Examples:

- English KJV: `/get-chapter/KJV/43/3/`
- French NBS: `/get-chapter/NBS/43/3/`
- German ELB: `/get-chapter/ELB/43/3/`

So if the user changes the Bible translation, the app should call the same endpoint again with a different `version`.

### B. UI translations

This is translation for app labels such as:

- Select language
- Select book
- Select chapter
- Loading
- Unable to fetch Bible verses

The current web app handles this separately in `src/Translate.jsx` by loading the Google Translate browser script and manipulating DOM elements like:

- `window.googleTranslateElementInit`
- `document.querySelector(...)`
- `select.goog-te-combo`

That approach is **web-only** and should **not** be reused in Expo.

## 9. How to Handle UI Translation in Expo

For the mobile app, keep UI translations in local dictionaries instead of trying to reuse `src/Translate.jsx`.

Example:

```js
export const uiStrings = {
  en: {
    selectLanguage: "Select preferred language",
    selectBook: "Select book",
    selectChapter: "Select chapter",
    loading: "Loading",
    fetchError: "Unable to fetch Bible verses. Kindly try again later.",
  },
  fr: {
    selectLanguage: "Choisir la langue",
    selectBook: "Choisir le livre",
    selectChapter: "Choisir le chapitre",
    loading: "Chargement",
    fetchError: "Impossible de recuperer les versets. Veuillez reessayer plus tard.",
  },
  de: {
    selectLanguage: "Sprache auswaehlen",
    selectBook: "Buch auswaehlen",
    selectChapter: "Kapitel auswaehlen",
    loading: "Wird geladen",
    fetchError: "Die Bibelverse konnten nicht geladen werden. Bitte spaeter erneut versuchen.",
  },
};

export const t = (locale, key) =>
  uiStrings[locale]?.[key] ?? uiStrings.en[key] ?? key;
```

Recommended separation:

- `locale` controls app UI text
- `version` controls Bible content translation

Those two values are related, but they are not the same thing.

Example:

- `locale = "fr"` can default `version = "NBS"`
- `locale = "de"` can default `version = "ELB"`
- `locale = "en"` can default `version = "KJV"`

## 10. Optional Quick Verse Search API

The older `BibleApp.jsx` component uses a second provider for text-based reference lookup:

```text
GET https://bible-api.com/{reference}?translation=kjv
```

Example:

```text
https://bible-api.com/Genesis%201?translation=kjv
```

The current component builds references like:

- `Genesis 1`
- `Exodus 2`

and then reads `data.verses`.

Example Expo helper:

```js
export async function searchBibleReference(reference, translation = "kjv") {
  const encodedReference = encodeURIComponent(reference.trim());
  const url = `https://bible-api.com/${encodedReference}?translation=${translation}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Reference lookup failed with status ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data.verses) ? data.verses : [];
}
```

### When to use this endpoint

Use `bible-api.com` only if the mobile app needs a free-text search box where a user types a reference manually.

For the main English/French/German reading experience, stay with `bolls.life`.

## 11. Implementation Notes from the Current Repo

- The multilingual reader does not use authentication headers or API keys.
- All current Bible requests are simple `GET` requests.
- Some web components always reload chapter `1` when a new book or version is selected. That is a good default behavior for mobile too.
- The French components make an extra request to `https://bolls.life/get-books/YLT/`, but the response is only logged and is not required for rendering. The Expo app can skip that request unless book metadata is needed for a future feature.
- The older `src/Components/Bible/BibleApp.jsx` is much more limited. It only exposes a small Old Testament selector and always requests `kjv`.

## 12. Recommended Expo Flow

1. User chooses app locale: `en`, `fr`, or `de`
2. App assigns a default Bible version for that locale
3. User selects testament, book, and chapter
4. App calls `GET /get-chapter/{version}/{bookId}/{chapter}/`
5. App cleans verse text before rendering
6. User can switch Bible translation by changing the `version`
7. App refetches the same `bookId` and `chapter` with the new `version`

## 13. Recommended File Split in the Mobile App

Example structure:

```text
mobile/
  src/
    bible/
      bibleApi.js
      bibleBooks.js
      bibleVersions.js
      cleanVerseText.js
    i18n/
      uiStrings.js
```

This keeps:

- API logic separate from UI
- Bible content translation separate from app UI translation
- book metadata reusable across all screens
