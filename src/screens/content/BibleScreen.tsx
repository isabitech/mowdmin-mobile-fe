import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#040725';
const ACCENT = '#3B82F6';

// API Base URL
const API_BASE = 'https://bible.helloao.org/api';
const DEFAULT_TRANSLATION = 'BSB';

interface BibleBook {
  id: string;
  name: string;
  commonName: string;
  numberOfChapters: number;
  order: number;
}

interface Props {
  navigation?: any;
}

const BibleScreen = ({ navigation }: Props) => {
  // States
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [chapterContent, setChapterContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingChapter, setLoadingChapter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'old' | 'new'>('all');
  const [showBookDropdown, setShowBookDropdown] = useState(false);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [error, setError] = useState<string | null>(null);

  // Old Testament book IDs
  const oldTestamentIds = [
    'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
    '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
    'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
    'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'
  ];



  // Load books on mount
  useEffect(() => {
    fetchBooks();
  }, []);

  // Fetch all books
  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/${DEFAULT_TRANSLATION}/books.json`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      
      const data = await response.json();
      
      if (data && data.books && Array.isArray(data.books)) {
        setBooks(data.books);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err: any) {
      console.error('Error fetching books:', err);
      setError(err.message || 'Failed to load Bible books');
    } finally {
      setLoading(false);
    }
  };

  // Fetch chapter content
  const fetchChapter = async (bookId: string, chapter: number) => {
    try {
      setLoadingChapter(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/${DEFAULT_TRANSLATION}/${bookId}/${chapter}.json`);
      
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
  };

  // Get testament for a book
  const getTestament = (bookId: string): 'old' | 'new' => {
    return oldTestamentIds.includes(bookId) ? 'old' : 'new';
  };

  // Filter books based on search and tab
  const getFilteredBooks = (): BibleBook[] => {
    if (!books || books.length === 0) return [];
    
    let filtered = [...books];
    
    if (activeTab === 'old') {
      filtered = filtered.filter(book => oldTestamentIds.includes(book.id));
    } else if (activeTab === 'new') {
      filtered = filtered.filter(book => !oldTestamentIds.includes(book.id));
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(book =>
        book.name.toLowerCase().includes(query) ||
        book.commonName.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  // Handle book selection
  const handleBookSelect = (book: BibleBook) => {
    setSelectedBook(book);
    setSelectedChapter(1);
    setShowBookDropdown(false);
    fetchChapter(book.id, 1);
  };

  // Handle chapter selection
  const handleChapterSelect = (chapter: number) => {
    setSelectedChapter(chapter);
    if (selectedBook) {
      fetchChapter(selectedBook.id, chapter);
    }
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setShowBookDropdown(false);
    setShowChapterDropdown(false);
  };

  // Render verse content with Jesus words in red
  const renderVerseContent = (content: any) => {
    if (!content) return null;
    if (typeof content === 'string') {
      return <Text style={{ color: PRIMARY, fontSize: fontSize }}>{content}</Text>;
    }
    if (!Array.isArray(content)) return null;
    
    return content.map((item: any, idx: number) => {
      if (typeof item === 'string') {
        return <Text key={idx} style={{ color: PRIMARY, fontSize: fontSize }}>{item}</Text>;
      }
      if (item && typeof item === 'object') {
        if (item.text) {
          // Check if this is Jesus speaking (words of Jesus)
          const isJesusWords = item.person === 'Jesus' || item.wordsOfJesus === true;
          return (
            <Text 
              key={idx} 
              style={{ 
                color: isJesusWords ? '#DC2626' : PRIMARY, 
                fontSize: fontSize,
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

  // Parse verse content to simple string (for headings/subtitles)
  const parseVerseContent = (content: any): string => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    if (!Array.isArray(content)) return '';
    
    return content
      .map((item: any) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          if (item.text) return item.text;
          if (item.lineBreak) return '\n';
        }
        return '';
      })
      .join('');
  };

  // Render chapter content
  const renderChapterContent = () => {
    if (!chapterContent) {
      return null;
    }

    // Try to find content in different possible locations
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
      if (!item) return null;

      // Verse
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

      // Heading
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

      // Hebrew subtitle
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

      // Line break
      if (item.type === 'line_break') {
        return <View key={`br-${index}`} style={{ height: 12 }} />;
      }

      return null;
    });
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={{ color: '#6B7280', marginTop: 16 }}>Loading Bible...</Text>
      </SafeAreaView>
    );
  }

  // Error state (only show if no books loaded)
  if (error && books.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Ionicons name="cloud-offline" size={64} color="#9CA3AF" />
        <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: 'bold', marginTop: 16, textAlign: 'center' }}>
          Connection Error
        </Text>
        <Text style={{ color: '#6B7280', marginTop: 8, textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity
          onPress={fetchBooks}
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
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
      }}>
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
          <Text style={{ color: PRIMARY, fontSize: 22, fontWeight: 'bold', marginLeft: 16 }}>Bible</Text>
        </View>
        <View style={{
          backgroundColor: '#E0F2FE',
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 8,
        }}>
          <Text style={{ color: ACCENT, fontSize: 11, fontWeight: '600' }}>BSB</Text>
        </View>
      </View>

      {/* Fixed Controls with Dropdowns */}
      {selectedBook && (
        <View style={{ 
          paddingHorizontal: 20, 
          paddingTop: 20,
          paddingBottom: 16,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#F3F4F6',
        }}>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            {/* Book Dropdown */}
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowBookDropdown(!showBookDropdown);
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
                  borderColor: showBookDropdown ? ACCENT : '#E5E7EB',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '500', marginBottom: 2 }}>
                    BOOK
                  </Text>
                  <Text style={{ color: PRIMARY, fontSize: 16, fontWeight: '700' }} numberOfLines={1}>
                    {selectedBook.name}
                  </Text>
                </View>
                <Ionicons name={showBookDropdown ? "chevron-up" : "chevron-down"} size={20} color={PRIMARY} />
              </TouchableOpacity>
            </View>

            {/* Chapter Dropdown */}
            <View style={{ width: 140 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowChapterDropdown(!showChapterDropdown);
                  setShowBookDropdown(false);
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
                  <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '500', marginBottom: 2 }}>
                    CHAPTER
                  </Text>
                  <Text style={{ color: PRIMARY, fontSize: 16, fontWeight: '700' }}>
                    {selectedChapter}
                  </Text>
                </View>
                <Ionicons name={showChapterDropdown ? "chevron-up" : "chevron-down"} size={20} color={PRIMARY} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Book Dropdown Content */}
          {showBookDropdown && (
            <View style={{
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
            }}>
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
                    <Text style={{
                      color: selectedBook.id === book.id ? ACCENT : PRIMARY,
                      fontSize: 15,
                      fontWeight: selectedBook.id === book.id ? '600' : '400',
                      flex: 1,
                    }}>
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
            <View style={{
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
            }}>
              <ScrollView 
                style={{ maxHeight: 300 }}
                showsVerticalScrollIndicator={true}
                persistentScrollbar={true}
              >
                {Array.from({ length: selectedBook.numberOfChapters }, (_, i) => i + 1).map((chapter, index) => (
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
                      borderBottomWidth: index === selectedBook.numberOfChapters - 1 ? 0 : 1,
                      borderBottomColor: '#F3F4F6',
                    }}
                  >
                    <Text style={{
                      color: selectedChapter === chapter ? ACCENT : PRIMARY,
                      fontSize: 15,
                      fontWeight: selectedChapter === chapter ? '600' : '400',
                    }}>
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
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            backgroundColor: '#F9FAFB',
            borderRadius: 14,
            padding: 4,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8 }}>
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
        </View>
      )}

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
                  <Text style={{ color: '#6B7280', marginTop: 16, fontSize: 15 }}>Loading chapter...</Text>
                </View>
              ) : (
                <View style={{ 
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                }}>
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
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F9FAFB',
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                }}>
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
              <View style={{
                flexDirection: 'row',
                marginHorizontal: 20,
                marginBottom: 20,
                backgroundColor: '#F9FAFB',
                borderRadius: 14,
                padding: 4,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}>
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
                    <Text style={{
                      textAlign: 'center',
                      fontWeight: '600',
                      fontSize: 14,
                      color: activeTab === tab ? PRIMARY : '#9CA3AF',
                    }}>
                      {tab === 'all' ? 'All Books' : tab === 'old' ? 'Old Testament' : 'New Testament'}
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
                      <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: testament === 'old' ? '#FEF3C7' : '#DBEAFE',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <Ionicons
                          name="book"
                          size={22}
                          color={testament === 'old' ? '#F59E0B' : ACCENT}
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={{ color: PRIMARY, fontSize: 16, fontWeight: '600', marginBottom: 2 }}>
                          {book.name}
                        </Text>
                        <Text style={{ color: '#9CA3AF', fontSize: 13 }}>
                          {book.numberOfChapters} {book.numberOfChapters === 1 ? 'Chapter' : 'Chapters'}
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