import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { eventsAPI, eventRegistrationAPI, Event, EventRegistration } from '../../services/eventsApi';

interface Props {
  navigation?: any;
  route?: { params?: { eventId?: string } };
}

// Tag configuration mapping
const tagConfig: Record<string, { colorClass: string; bgClass: string }> = {
  'HIGH OUTREACH': { colorClass: 'text-emerald-600', bgClass: 'bg-emerald-100' },
  'SPIRITUAL GROWTH': { colorClass: 'text-violet-600', bgClass: 'bg-violet-100' },
  'SERVICE': { colorClass: 'text-amber-600', bgClass: 'bg-amber-100' },
  'YOUTH': { colorClass: 'text-pink-600', bgClass: 'bg-pink-100' },
  'WORSHIP': { colorClass: 'text-blue-600', bgClass: 'bg-blue-100' },
  'PRAYER': { colorClass: 'text-indigo-600', bgClass: 'bg-indigo-100' },
};

const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const EventsOutreachScreen: React.FC<Props> = ({ navigation, route }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<EventRegistration[]>([]);
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showMyEvents, setShowMyEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registering, setRegistering] = useState(false);
  
  // Search state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { eventId } = route?.params || {};

  // Fetch events and user registrations
  useEffect(() => {
    console.log('[EventsScreen] Component mounted, fetching initial data...');
    fetchData();
  }, []);

  // Handle deep linking
  useEffect(() => {
    console.log('[EventsScreen] Deep linking check:', {
      hasEventId: !!eventId,
      eventId,
      eventsCount: events.length,
    });

    if (eventId && events.length > 0) {
      const eventToOpen = events.find((event) => event.id === eventId);
      if (eventToOpen) {
        console.log('[EventsScreen] Opening event from deep link:', eventToOpen.title);
        setSelectedEvent(eventToOpen);
        setShowEventDetailModal(true);
      } else {
        console.warn('[EventsScreen] Event not found for deep link:', eventId);
      }
    }
  }, [eventId, events]);

  const fetchData = async () => {
    console.log('[EventsScreen] Starting fetchData...');
    try {
      setLoading(true);
      console.log('[EventsScreen] Fetching events and registrations...');

      const [eventsData, registrationsData] = await Promise.all([
        eventsAPI.getAllEvents(),
        eventRegistrationAPI.getUserRegistrations(),
      ]);

      console.log('[EventsScreen] Data fetched successfully:', {
        eventsCount: eventsData.length,
        registrationsCount: registrationsData.length,
        events: eventsData.map((e) => ({ id: e.id, title: e.title, date: e.date })),
        registrations: registrationsData.map((r) => ({
          id: r.id,
          eventId: r.eventId,
          status: r.status,
        })),
      });

      setEvents(eventsData);
      setUserRegistrations(registrationsData);

      console.log('[EventsScreen] State updated with new data');
    } catch (error: any) {
      console.error('[EventsScreen] Error fetching data:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });
      Alert.alert('Error', error.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
      console.log('[EventsScreen] Loading state set to false');
    }
  };

  const onRefresh = async () => {
    console.log('[EventsScreen] Pull to refresh triggered');
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    console.log('[EventsScreen] Refresh complete');
  };

  // Helper function to parse event date and extract day
  const getEventDay = (dateString: string): number => {
    const date = new Date(dateString);
    return date.getDate();
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  // Helper function to get tag configuration
  const getTagConfig = (tag: string) => {
    return tagConfig[tag.toUpperCase()] || { colorClass: 'text-gray-600', bgClass: 'bg-gray-100' };
  };

  // Check if user is registered for an event
  const isUserRegistered = (checkEventId: string): boolean => {
    return userRegistrations.some(
      (reg) => reg.eventId === checkEventId && reg.status !== 'cancelled'
    );
  };

  // Check if a date has any registered events
  const hasRegisteredEventOnDate = (day: number): boolean => {
    return events.some((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentMonth.getMonth() &&
        eventDate.getFullYear() === currentMonth.getFullYear() &&
        isUserRegistered(event.id)
      );
    });
  };

  // Get registered events only
  const registeredEvents = useMemo(() => {
    return events
      .filter((event) => isUserRegistered(event.id))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, userRegistrations]);

  // Search filtered events
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    return events.filter((event) => {
      const titleMatch = event.title.toLowerCase().includes(query);
      const descriptionMatch = event.description?.toLowerCase().includes(query);
      const locationMatch = event.location?.toLowerCase().includes(query);
      const tagMatch = event.tag?.toLowerCase().includes(query);
      
      return titleMatch || descriptionMatch || locationMatch || tagMatch;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, searchQuery]);

  const handleRegister = async (regEventId: string) => {
    console.log('[EventsScreen] handleRegister called for eventId:', regEventId);
    try {
      setRegistering(true);
      console.log('[EventsScreen] Attempting to register for event...');

      const result = await eventRegistrationAPI.registerForEvent(regEventId);
      console.log('[EventsScreen] Registration successful:', result);

      Alert.alert('Success', 'You have been registered for this event!');

      const registrationsData = await eventRegistrationAPI.getUserRegistrations();
      setUserRegistrations(registrationsData);
    } catch (error: any) {
      console.error('═══════════════════════════════════════');
      console.error('REGISTRATION ERROR DETAILS:');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Error Message:', error.message);
      console.error('═══════════════════════════════════════');

      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.errors?.[0]?.msg ||
        error.message;

      Alert.alert('Registration Failed', backendMessage, [{ text: 'OK' }]);
    } finally {
      setRegistering(false);
      console.log('[EventsScreen] Registration process complete');
    }
  };

  // Generate calendar days for current month (with leading nulls for weekday offset)
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [currentMonth]);

  // Filter events for selected date
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === selectedDate &&
        eventDate.getMonth() === currentMonth.getMonth() &&
        eventDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  }, [events, selectedDate, currentMonth]);

  // Get all events sorted by date
  const allEventsSorted = useMemo(() => {
    return [...events].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [events]);

  // Find next closest event
  const nextEvent = useMemo(() => {
    if (filteredEvents.length > 0) return null;

    const selectedDateObj = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      selectedDate
    );

    const futureEvents = events
      .filter((event) => new Date(event.date) > selectedDateObj)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (futureEvents.length > 0) {
      return futureEvents[0];
    }

    return allEventsSorted[0];
  }, [events, selectedDate, filteredEvents, currentMonth, allEventsSorted]);

  // Check if a date has events
  const hasEventOnDate = (day: number) => {
    return events.some((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentMonth.getMonth() &&
        eventDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };

  // Handle search result selection
  const handleSearchResultPress = (event: Event) => {
    setSelectedEvent(event);
    setShowSearchModal(false);
    setSearchQuery('');
    setShowEventDetailModal(true);
  };

  // ═══════════════════════════════════════════════════════
  // CALENDAR DAY
  // ═══════════════════════════════════════════════════════
  const renderCalendarDay = (day: number) => {
    const isSelected = day === selectedDate;
    const isToday =
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear();
    const hasEvent = hasEventOnDate(day);
    const hasRegistered = hasRegisteredEventOnDate(day);

    return (
      <TouchableOpacity
        key={`day-${day}`}
        className="w-9 h-9 justify-center items-center rounded-full"
        style={
          isSelected
            ? { backgroundColor: hasRegistered ? '#22C55E' : '#040725' }
            : isToday
            ? { backgroundColor: '#EEF2FF', borderWidth: 2, borderColor: '#6366F1' }
            : undefined
        }
        onPress={() => setSelectedDate(day)}
      >
        <Text
          className={`text-sm ${
            isSelected
              ? 'text-white font-semibold'
              : isToday
              ? 'text-indigo-600 font-semibold'
              : 'text-gray-700'
          }`}
        >
          {day}
        </Text>
        {hasEvent && !isSelected && (
          <View
            className="absolute bottom-1 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: hasRegistered ? '#22C55E' : '#040725' }}
          />
        )}
      </TouchableOpacity>
    );
  };

  // ═══════════════════════════════════════════════════════
  // EVENT CARD
  // ═══════════════════════════════════════════════════════
  const renderEventCard = (event: Event, isCompact: boolean = false, onPress?: () => void) => {
    const tagConf = getTagConfig(event.tag);
    const registered = isUserRegistered(event.id);

    return (
      <TouchableOpacity
        key={event.id}
        className={`bg-white rounded-2xl mb-4 overflow-hidden shadow-md ${isCompact ? 'mx-0' : ''}`}
        style={{
          borderWidth: 1,
          borderColor: registered ? '#86EFAC' : '#F3F4F6',
          borderLeftWidth: registered ? 4 : 1,
          borderLeftColor: registered ? '#22C55E' : '#F3F4F6',
        }}
        onPress={onPress ? onPress : () => {
          setSelectedEvent(event);
          setShowEventDetailModal(true);
        }}
        activeOpacity={0.7}
      >
        {/* Event Image */}
        <View className="relative">
          <Image
            source={{ uri: event.image }}
            className={`w-full ${isCompact ? 'h-28' : 'h-36'}`}
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/20" />

          {/* Tag */}
          <View className={`absolute top-3 left-3 ${tagConf.bgClass} px-2.5 py-1 rounded`}>
            <Text className={`text-[10px] font-bold tracking-wide ${tagConf.colorClass}`}>
              {event.tag.toUpperCase()}
            </Text>
          </View>

          {/* Registration Badge on image */}
          {registered && (
            <View
              className="absolute top-3 right-3 rounded flex-row items-center"
              style={{ backgroundColor: '#22C55E', paddingHorizontal: 10, paddingVertical: 4, gap: 4 }}
            >
              <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" />
              <Text className="text-[10px] font-bold tracking-wide text-white">REGISTERED</Text>
            </View>
          )}
        </View>

        {/* Event Content */}
        <View className={`${isCompact ? 'p-3' : 'p-4'}`}>
          <Text
            className={`font-semibold text-gray-900 mb-2 ${isCompact ? 'text-base' : 'text-lg'}`}
          >
            {event.title}
          </Text>

          {/* Date row */}
          <View className="flex-row items-center mb-2" style={{ gap: 6 }}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={registered ? '#22C55E' : '#6B7280'}
            />
            <Text
              style={{ fontSize: 13, color: registered ? '#16A34A' : '#6B7280' }}
            >
              {formatDate(event.date)} • {event.time}
            </Text>
          </View>

          {!isCompact && (
            <Text className="text-sm text-gray-500 leading-5 mb-4" numberOfLines={2}>
              {event.description}
            </Text>
          )}

          <View className="flex-row justify-between items-center">
            {event.hasLiveStream || event.hasLocation ? (
              <View className="flex-row gap-2">
                {event.hasLiveStream && (
                  <View className="w-9 h-9 rounded-full bg-gray-100 justify-center items-center">
                    <Ionicons name="videocam" size={18} color="#040725" />
                  </View>
                )}
                {event.hasLocation && (
                  <View className="w-9 h-9 rounded-full bg-gray-100 justify-center items-center">
                    <Ionicons name="location" size={18} color="#040725" />
                  </View>
                )}
              </View>
            ) : (
              <View />
            )}

            {registered ? (
              <View
                className="flex-row items-center rounded-lg"
                style={{
                  backgroundColor: '#F0FDF4',
                  borderWidth: 1,
                  borderColor: '#BBF7D0',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  gap: 8,
                }}
              >
                <View
                  className="rounded-full justify-center items-center"
                  style={{ width: 28, height: 28, backgroundColor: '#22C55E' }}
                >
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                </View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#16A34A' }}>
                  Registered
                </Text>
              </View>
            ) : (
              <View className="px-6 py-2.5 rounded-lg bg-[#040725]">
                <Text className="text-sm font-semibold text-white">Register</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ═══════════════════════════════════════════════════════
  // SEARCH RESULT ITEM (Compact version for search)
  // ═══════════════════════════════════════════════════════
  const renderSearchResultItem = (event: Event) => {
    const tagConf = getTagConfig(event.tag);
    const registered = isUserRegistered(event.id);

    return (
      <TouchableOpacity
        key={event.id}
        className="flex-row bg-white rounded-xl mb-3 overflow-hidden border border-gray-100"
        style={{
          borderLeftWidth: registered ? 4 : 1,
          borderLeftColor: registered ? '#22C55E' : '#F3F4F6',
        }}
        onPress={() => handleSearchResultPress(event)}
        activeOpacity={0.7}
      >
        {/* Event Image Thumbnail */}
        <Image
          source={{ uri: event.image }}
          className="w-20 h-20"
          resizeMode="cover"
        />

        {/* Event Info */}
        <View className="flex-1 p-3 justify-center">
          <View className="flex-row items-center mb-1" style={{ gap: 6 }}>
            <View className={`${tagConf.bgClass} px-2 py-0.5 rounded`}>
              <Text className={`text-[9px] font-bold ${tagConf.colorClass}`}>
                {event.tag.toUpperCase()}
              </Text>
            </View>
            {registered && (
              <View className="flex-row items-center" style={{ gap: 2 }}>
                <Ionicons name="checkmark-circle" size={12} color="#22C55E" />
                <Text className="text-[9px] font-semibold text-green-600">REGISTERED</Text>
              </View>
            )}
          </View>
          
          <Text className="font-semibold text-gray-900 text-sm" numberOfLines={1}>
            {event.title}
          </Text>
          
          <View className="flex-row items-center mt-1" style={{ gap: 4 }}>
            <Ionicons name="calendar-outline" size={12} color="#6B7280" />
            <Text className="text-xs text-gray-500">
              {formatDate(event.date)} • {event.time}
            </Text>
          </View>
        </View>

        <View className="justify-center pr-3">
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  // ═══════════════════════════════════════════════════════
  // NO EVENTS MESSAGE
  // ═══════════════════════════════════════════════════════
  const renderNoEventsMessage = () => (
    <View className="bg-gray-50 rounded-2xl p-6 mb-4 items-center border border-gray-100">
      <View className="w-16 h-16 rounded-full bg-gray-100 justify-center items-center mb-4">
        <Ionicons name="calendar-outline" size={32} color="#040725" />
      </View>
      <Text className="text-gray-900 text-lg font-semibold mb-2">No Events on This Date</Text>
      <Text className="text-gray-500 text-sm text-center mb-4">
        There are no events scheduled for{' '}
        {currentMonth.toLocaleString('default', { month: 'long' })} {selectedDate}.
      </Text>

      {nextEvent && (
        <View className="w-full">
          <Text className="text-gray-400 text-xs text-center mb-3">Next upcoming event:</Text>
          <TouchableOpacity
            className="bg-[#040725]/10 rounded-xl p-4 flex-row items-center"
            onPress={() => {
              const nextEventDate = new Date(nextEvent.date);
              setCurrentMonth(nextEventDate);
              setSelectedDate(nextEventDate.getDate());
            }}
          >
            <View className="bg-[#040725] rounded-lg p-3 mr-3">
              <Text className="text-white font-bold text-lg">{getEventDay(nextEvent.date)}</Text>
              <Text className="text-white/80 text-xs">
                {new Date(nextEvent.date)
                  .toLocaleString('default', { month: 'short' })
                  .toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold">{nextEvent.title}</Text>
              <Text className="text-gray-500 text-xs mt-1">{nextEvent.time}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#040725" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // ═══════════════════════════════════════════════════════
  // SEARCH MODAL
  // ═══════════════════════════════════════════════════════
  const renderSearchModal = () => (
    <Modal
      visible={showSearchModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        setShowSearchModal(false);
        setSearchQuery('');
      }}
    >
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Search Header */}
          <View className="px-4 py-3 border-b border-gray-100">
            <View className="flex-row items-center" style={{ gap: 12 }}>
              {/* Search Input */}
              <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                <Ionicons name="search" size={20} color="#6B7280" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search events..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-base text-gray-900"
                  autoFocus
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Cancel Button */}
              <TouchableOpacity
                onPress={() => {
                  setShowSearchModal(false);
                  setSearchQuery('');
                  Keyboard.dismiss();
                }}
              >
                <Text className="text-[#040725] font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Results */}
          <ScrollView 
            className="flex-1 px-4 pt-4"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={() => Keyboard.dismiss()}
          >
            {searchQuery.trim() === '' ? (
              // Empty state - show suggestions
              <View className="items-center py-12">
                <View className="w-16 h-16 rounded-full bg-gray-100 justify-center items-center mb-4">
                  <Ionicons name="search" size={32} color="#9CA3AF" />
                </View>
                <Text className="text-gray-900 text-lg font-semibold mb-2">Search Events</Text>
                <Text className="text-gray-500 text-sm text-center px-8">
                  Search by event name, description, location, or tag
                </Text>
                
                {/* Quick Tags */}
                <View className="mt-6 w-full">
                  <Text className="text-gray-400 text-xs mb-3 text-center">QUICK FILTERS</Text>
                  <View className="flex-row flex-wrap justify-center" style={{ gap: 8 }}>
                    {Object.keys(tagConfig).slice(0, 4).map((tag) => {
                      const conf = tagConfig[tag];
                      return (
                        <TouchableOpacity
                          key={tag}
                          className={`${conf.bgClass} px-4 py-2 rounded-full`}
                          onPress={() => setSearchQuery(tag.toLowerCase())}
                        >
                          <Text className={`text-sm font-medium ${conf.colorClass}`}>
                            {tag}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            ) : searchResults.length > 0 ? (
              // Show results
              <>
                <Text className="text-sm text-gray-500 mb-4">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                </Text>
                {searchResults.map((event) => renderSearchResultItem(event))}
              </>
            ) : (
              // No results
              <View className="items-center py-12">
                <View className="w-16 h-16 rounded-full bg-gray-100 justify-center items-center mb-4">
                  <Ionicons name="search-outline" size={32} color="#9CA3AF" />
                </View>
                <Text className="text-gray-900 text-lg font-semibold mb-2">No Results Found</Text>
                <Text className="text-gray-500 text-sm text-center px-8">
                  No events match "{searchQuery}". Try a different search term.
                </Text>
              </View>
            )}
            <View className="h-8" />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

  // ═══════════════════════════════════════════════════════
  // EVENT DETAIL MODAL
  // ═══════════════════════════════════════════════════════
  const renderEventDetailModal = () => {
    if (!selectedEvent) return null;

    const tagConf = getTagConfig(selectedEvent.tag);
    const registered = isUserRegistered(selectedEvent.id);

    return (
      <Modal
        visible={showEventDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEventDetailModal(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <StatusBar barStyle="dark-content" />

          {/* Header Image */}
          <View className="h-64 relative">
            <Image
              source={{ uri: selectedEvent.image }}
              className="w-full h-full"
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black/40" />

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setShowEventDetailModal(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 justify-center items-center"
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Registered pill on modal image */}
            {registered && (
              <View
                className="absolute top-4 left-4 rounded-full flex-row items-center"
                style={{
                  backgroundColor: '#22C55E',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  gap: 6,
                }}
              >
                <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                  REGISTERED
                </Text>
              </View>
            )}

            {/* Title Overlay */}
            <View className="absolute bottom-4 left-4 right-4">
              <View className={`${tagConf.bgClass} px-3 py-1 rounded-md self-start mb-2`}>
                <Text className={`${tagConf.colorClass} text-xs font-bold`}>
                  {selectedEvent.tag.toUpperCase()}
                </Text>
              </View>
              <Text className="text-white text-2xl font-bold">{selectedEvent.title}</Text>
            </View>
          </View>

          {/* Content */}
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
            {/* Date & Time */}
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="calendar-outline"
                size={18}
                color={registered ? '#22C55E' : '#6B7280'}
              />
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 8,
                  color: registered ? '#16A34A' : '#374151',
                }}
              >
                {formatDate(selectedEvent.date)} • {selectedEvent.time}
              </Text>
            </View>

            {/* Location */}
            {selectedEvent.location && (
              <View className="flex-row items-center mb-4">
                <Ionicons name="location-outline" size={18} color="#6B7280" />
                <Text className="text-gray-700 text-base ml-2">{selectedEvent.location}</Text>
              </View>
            )}

            {/* Registration status banner */}
            {registered && (
              <View
                className="rounded-xl mb-4 flex-row items-center"
                style={{
                  backgroundColor: '#F0FDF4',
                  borderWidth: 1,
                  borderColor: '#BBF7D0',
                  padding: 16,
                }}
              >
                <View
                  className="rounded-full justify-center items-center"
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: '#22C55E',
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#166534', fontWeight: '600', fontSize: 15 }}>
                    You're registered!
                  </Text>
                  <Text style={{ color: '#16A34A', fontSize: 13, marginTop: 2 }}>
                    We'll remind you before the event
                  </Text>
                </View>
              </View>
            )}

            {/* Description */}
            <Text className="text-gray-800 text-base leading-6 mb-6">
              {selectedEvent.description}
            </Text>

            {/* Action Buttons */}
            {(selectedEvent.hasLiveStream || selectedEvent.hasLocation) && (
              <View className="mb-6" style={{ gap: 12 }}>
                {selectedEvent.hasLiveStream && (
                  <TouchableOpacity 
                    className="flex-row items-center rounded-2xl p-4"
                    style={{
                      backgroundColor: '#EFF6FF',
                      borderWidth: 1,
                      borderColor: '#BFDBFE',
                    }}
                    activeOpacity={0.7}
                  >
                    <View 
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{ backgroundColor: '#3B82F6' }}
                    >
                      <Ionicons name="videocam" size={24} color="#FFFFFF" />
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="text-base font-semibold text-gray-900">Join Livestream</Text>
                      <Text className="text-sm text-gray-500 mt-0.5">Watch the event live online</Text>
                    </View>
                    <View 
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: '#3B82F6' }}
                    >
                      <Ionicons name="play" size={18} color="#FFFFFF" />
                    </View>
                  </TouchableOpacity>
                )}
                
                {selectedEvent.hasLocation && (
                  <TouchableOpacity 
                    className="flex-row items-center rounded-2xl p-4"
                    style={{
                      backgroundColor: '#FEF2F2',
                      borderWidth: 1,
                      borderColor: '#FECACA',
                    }}
                    activeOpacity={0.7}
                  >
                    <View 
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{ backgroundColor: '#EF4444' }}
                    >
                      <Ionicons name="location" size={24} color="#FFFFFF" />
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="text-base font-semibold text-gray-900">Get Directions</Text>
                      <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
                        {selectedEvent.location || 'Navigate to venue'}
                      </Text>
                    </View>
                    <View 
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: '#EF4444' }}
                    >
                      <Ionicons name="navigate" size={18} color="#FFFFFF" />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Register / Already Registered Button */}
            <TouchableOpacity
              className="py-4 rounded-xl flex-row items-center justify-center"
              style={{ backgroundColor: registered ? '#22C55E' : '#040725' }}
              onPress={() => !registered && handleRegister(selectedEvent.id)}
              disabled={registered || registering}
            >
              {registering ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  {registered && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#FFFFFF"
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text className="text-white text-lg font-bold">
                    {registered ? 'Already Registered' : 'Register for Event'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  // ═══════════════════════════════════════════════════════
  // SEE ALL EVENTS MODAL
  // ═══════════════════════════════════════════════════════
  const renderSeeAllModal = () => (
    <Modal visible={showAllEvents} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-100">
          <Text className="text-xl font-bold text-gray-900">All Events</Text>
          <TouchableOpacity
            onPress={() => setShowAllEvents(false)}
            className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
          >
            <Ionicons name="close" size={24} color="#040725" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          <Text className="text-sm text-gray-500 mb-4">
            {events.length} event{events.length !== 1 ? 's' : ''} in{' '}
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
          {allEventsSorted.map((event) => renderEventCard(event, true))}
          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  // ═══════════════════════════════════════════════════════
  // MY REGISTERED EVENTS MODAL
  // ═══════════════════════════════════════════════════════
  const renderMyEventsModal = () => (
    <Modal visible={showMyEvents} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        {/* Modal Header */}
        <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-100">
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <View
              className="rounded-full justify-center items-center"
              style={{ width: 32, height: 32, backgroundColor: '#22C55E' }}
            >
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            </View>
            <Text className="text-xl font-bold text-gray-900">My Events</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowMyEvents(false)}
            className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
          >
            <Ionicons name="close" size={24} color="#040725" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {registeredEvents.length > 0 ? (
            <>
              <Text className="text-sm text-gray-500 mb-4">
                You're registered for {registeredEvents.length} event
                {registeredEvents.length !== 1 ? 's' : ''}
              </Text>
              {registeredEvents.map((event) => renderEventCard(event, true))}
            </>
          ) : (
            <View className="items-center py-16">
              <View
                className="rounded-full justify-center items-center mb-4"
                style={{ width: 64, height: 64, backgroundColor: '#F3F4F6' }}
              >
                <Ionicons name="calendar-outline" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-gray-900 text-lg font-semibold mb-2">No Registered Events</Text>
              <Text className="text-gray-500 text-sm text-center px-8">
                You haven't registered for any events yet. Browse events and tap Register to get started!
              </Text>
              <TouchableOpacity
                className="mt-6 px-6 py-3 rounded-xl bg-[#040725]"
                onPress={() => setShowMyEvents(false)}
              >
                <Text className="text-white font-semibold">Browse Events</Text>
              </TouchableOpacity>
            </View>
          )}
          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
    setSelectedDate(1);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#040725" />
        <Text className="text-gray-500 mt-4">Loading events...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ═══════════════════════════════════════════════════ */}
      {/* HEADER — search icon + title on left, My Events button on right */}
      {/* ═══════════════════════════════════════════════════ */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center gap-2.5">
          <TouchableOpacity 
            className="w-10 h-10 rounded-full bg-[#040725] justify-center items-center"
            onPress={() => setShowSearchModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Events & Outreach</Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center rounded-full"
          style={{
            backgroundColor: '#F0FDF4',
            borderWidth: 1,
            borderColor: '#BBF7D0',
            paddingHorizontal: 14,
            paddingVertical: 8,
            gap: 6,
          }}
          onPress={() => setShowMyEvents(true)}
        >
          <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#16A34A' }}>
            My Events
          </Text>
          {registeredEvents.length > 0 && (
            <View
              className="rounded-full justify-center items-center"
              style={{
                width: 20,
                height: 20,
                backgroundColor: '#22C55E',
                marginLeft: 2,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                {registeredEvents.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Calendar Section */}
        <View className="bg-gray-50 mx-4 rounded-2xl p-4 mt-4 border border-gray-100">
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity
              className="w-8 h-8 rounded-full bg-white justify-center items-center"
              onPress={() => changeMonth('prev')}
            >
              <Ionicons name="chevron-back" size={20} color="#040725" />
            </TouchableOpacity>
            <Text className="text-base font-semibold text-gray-900">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity
              className="w-8 h-8 rounded-full bg-white justify-center items-center"
              onPress={() => changeMonth('next')}
            >
              <Ionicons name="chevron-forward" size={20} color="#040725" />
            </TouchableOpacity>
          </View>

          {/* Week Days */}
          <View className="flex-row justify-around mb-3">
            {daysOfWeek.map((day) => (
              <Text key={day} className="text-[11px] font-semibold text-gray-400 w-9 text-center">
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View className="gap-2">
            {Array.from(
              { length: Math.ceil(calendarDays.length / 7) },
              (_, weekIndex) => (
                <View key={weekIndex} className="flex-row justify-around">
                  {calendarDays
                    .slice(weekIndex * 7, weekIndex * 7 + 7)
                    .map((day, idx) =>
                      day !== null ? (
                        renderCalendarDay(day)
                      ) : (
                        <View key={`empty-start-${idx}`} className="w-9 h-9" />
                      )
                    )}
                  {Array.from(
                    {
                      length:
                        7 - calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7).length,
                    },
                    (_, i) => (
                      <View key={`empty-${i}`} className="w-9 h-9" />
                    )
                  )}
                </View>
              )
            )}
          </View>
        </View>

        {/* Events Section */}
        <View className="px-4 mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">
              {filteredEvents.length > 0
                ? `Events on ${currentMonth.toLocaleString('default', { month: 'short' })} ${selectedDate}`
                : 'Upcoming Events'}
            </Text>
            <TouchableOpacity onPress={() => setShowAllEvents(true)}>
              <Text className="text-sm font-semibold text-[#040725]">See All</Text>
            </TouchableOpacity>
          </View>

          {filteredEvents.length > 0
            ? filteredEvents.map((event) => renderEventCard(event))
            : renderNoEventsMessage()}
        </View>

        <View className="h-8" />
      </ScrollView>

      {renderSearchModal()}
      {renderEventDetailModal()}
      {renderSeeAllModal()}
      {renderMyEventsModal()}
    </SafeAreaView>
  );
};

export default EventsOutreachScreen;