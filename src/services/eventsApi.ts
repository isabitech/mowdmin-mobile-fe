import apiClient from './api';

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  image: string;
  tag: string;
  hasLiveStream?: boolean;
  hasLocation?: boolean;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  ticketCode?: string;
  status: 'registered' | 'attended' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to get event image based on content
const getEventImage = (event: any): string => {
  const title = (event.title || '').toLowerCase();
  const description = (event.description || '').toLowerCase();
  const type = (event.type || event.tag || '').toLowerCase();
  
  // Combine all text to search for keywords
  const searchText = `${title} ${description} ${type}`;
  
  // Map keywords to local images (using exact filenames from assets/images/events/)
  if (searchText.includes('lord supper') || searchText.includes('communion') || searchText.includes('supper')) {
    return "https://mowdmin.vercel.app/static/media/supper.184705300ad542064f87.jpg"
  }
  
  if (searchText.includes('baptism') || searchText.includes('water baptism')) {
    return "https://mowdmin.vercel.app/static/media/baptism.94d65a6bb04d05266818.jpg"
  }
  
  if (searchText.includes('holy spirit convention') || searchText.includes('convention')) {
    return "https://mowdmin.vercel.app/static/media/conference.a0f2d2c92cef86f5fbc0.jpg"
  }
  
  if (searchText.includes('evangelism') || searchText.includes('power') || searchText.includes('open-air') || searchText.includes('open air')) {
    // Use crusade image as fallback for evangelism since evangelism.jpg doesn't exist
    return "https://mowdmin.vercel.app/static/media/crusade.2e7365c491b34512df3e.jpg";
  }
  
  if (searchText.includes('seminar') || searchText.includes('workshop') || searchText.includes('dayspring')) {
    // Use conference image as fallback for seminar since seminar.jpg doesn't exist
    return "https://mowdmin.vercel.app/static/media/conference.a0f2d2c92cef86f5fbc0.jpg";
  }
  
  if (searchText.includes('truth') || searchText.includes('voice') ) {
    return "https://mowdmin.vercel.app/static/media/conference.a0f2d2c92cef86f5fbc0.jpg";
  }
  
  if (searchText.includes('symposium')) {
    return "https://mowdmin.vercel.app/static/media/sympossium.cb3f8cb72c9aa40afb65.jpg"
  }
  
  if (searchText.includes('concert') || searchText.includes('music') || searchText.includes('gospel music') || searchText.includes('people')) {
    return "https://mowdmin.vercel.app/static/media/concertImg.5335e56293c0e2327c44.jpg";
  }
  
  if (searchText.includes('crusade')) {
    return "https://mowdmin.vercel.app/static/media/crusade.2e7365c491b34512df3e.jpg"
  }
  
  // If backend provides an image URL, use it
  if (event.image && event.image.trim()) {
    return event.image;
  }
  
  // Ultimate fallback - use Unsplash image
  return 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400';
  // return '../assets/images/events/events-placeholder.png';
};

// Helper: extract a string ID from a value that could be a string, ObjectId, or populated object
const extractId = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return String(value._id || value.id || '');
  }
  return String(value);
};

// Helper function to transform backend data to frontend Event format
const transformEvent = (backendEvent: any): Event => {
  console.log('[EventsAPI] Transforming event:', backendEvent._id || backendEvent.id);
  return {
    id: backendEvent._id || backendEvent.id,
    title: backendEvent.title || 'Untitled Event',
    date: backendEvent.date,
    time: backendEvent.time || '12:00 PM',
    description: backendEvent.description || 'No description available',
    image: getEventImage(backendEvent),
    tag: backendEvent.type || backendEvent.tag || 'EVENT',
    hasLiveStream: backendEvent.hasLiveStream || false,
    hasLocation: !!backendEvent.location,
    location: backendEvent.location || '',
    createdAt: backendEvent.createdAt,
    updatedAt: backendEvent.updatedAt,
  };
};

// Helper function to transform backend registration data
// Handles TWO backend response formats:
//   1. Registration object: { _id, eventId, userId, status, ... }
//   2. Event object (from /user endpoint): { _id, title, date, registrations, ... }
const transformRegistration = (backendReg: any): EventRegistration => {
  let eventId = '';
  let userId = '';
  let status: 'registered' | 'attended' | 'cancelled' = 'registered';

  // Check if this is an event object (has title/date/type but no eventId)
  // The /event-registration/user endpoint returns the EVENTS the user registered for
  const isEventObject = !!(backendReg.title || backendReg.date || backendReg.type) && !backendReg.eventId && !backendReg.event;

  if (isEventObject) {
    // This is an event object — the _id IS the event ID
    eventId = backendReg._id || backendReg.id || '';
    userId = ''; // Not available in this format
    status = 'registered'; // If it's returned, user is registered
  } else {
    // This is a proper registration object
    const rawEventId = backendReg.eventId || backendReg.event || backendReg.event_id || '';
    eventId = extractId(rawEventId);
    const rawUserId = backendReg.userId || backendReg.user || backendReg.user_id || '';
    userId = extractId(rawUserId);
    status = backendReg.status || 'registered';
  }

  console.log('[EventsAPI] Transforming registration:', {
    regId: backendReg._id || backendReg.id,
    isEventObject,
    extractedEventId: eventId,
    status,
  });

  return {
    id: backendReg._id || backendReg.id,
    eventId,
    userId,
    ticketCode: backendReg.ticketCode,
    status,
    createdAt: backendReg.createdAt,
    updatedAt: backendReg.updatedAt,
  };
};

export const eventsAPI = {
  // Get all events
  getAllEvents: async (): Promise<Event[]> => {
    console.log('[EventsAPI] getAllEvents called');
    try {
      const response = await apiClient.get('/event');
      console.log('[EventsAPI] getAllEvents response:', {
        status: response.status,
        dataCount: response.data.data?.length,
        data: response.data.data,
      });

      const events = (response.data.data || []).map(transformEvent);
      console.log('[EventsAPI] Transformed events:', events);

      return events;
    } catch (error) {
      console.error('[EventsAPI] getAllEvents error:', error);
      throw error;
    }
  },

  // Get single event by ID
  getEventById: async (id: string): Promise<Event> => {
    const response = await apiClient.get(`/event/${id}`);
    return transformEvent(response.data.data);
  },

  // Create new event (admin only)
  createEvent: async (eventData: FormData): Promise<Event> => {
    const response = await apiClient.post('/events/create', eventData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Update event (admin only)
  updateEvent: async (id: string, eventData: FormData): Promise<Event> => {
    const response = await apiClient.put(`/events/${id}`, eventData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Delete event (admin only)
  deleteEvent: async (id: string): Promise<void> => {
    await apiClient.delete(`/events/${id}`);
  },
};

export const eventRegistrationAPI = {
  // Unregister from an event
  unregisterFromEvent: async (eventId: string): Promise<void> => {
    await apiClient.delete(`/event-registration/unregister/${eventId}`);
  },

  // Register for an event
  registerForEvent: async (eventId: string, ticketCode?: string): Promise<EventRegistration> => {
    console.log('[EventRegistrationAPI] registerForEvent called:', { eventId, ticketCode });
    try {
      const response = await apiClient.post('/event-registration/register', {
        eventId,
        ticketCode,
      });
      console.log('[EventRegistrationAPI] registerForEvent response:', {
        status: response.status,
        data: response.data.data,
      });
      return transformRegistration(response.data.data);
    } catch (error) {
      console.error('[EventRegistrationAPI] registerForEvent error:', error);
      throw error;
    }
  },

  // Get all registrations for current user
  getUserRegistrations: async (): Promise<EventRegistration[]> => {
    console.log('[EventRegistrationAPI] getUserRegistrations called');
    try {
      const response = await apiClient.get('/event-registration/user');

      // Log the RAW backend data to see exact shape
      console.log('[EventRegistrationAPI] RAW backend registrations:', JSON.stringify(response.data.data, null, 2));

      const registrations = (response.data.data || []).map(transformRegistration);

      // Log transformed data to verify eventId is now correctly populated
      console.log('[EventRegistrationAPI] Transformed registrations:', registrations.map((r) => ({
        id: r.id,
        eventId: r.eventId,
        status: r.status,
      })));

      return registrations;
    } catch (error) {
      console.error('[EventRegistrationAPI] getUserRegistrations error:', error);
      throw error;
    }
  },

  // Get all registrations for a specific event (admin)
  getEventRegistrations: async (eventId: string): Promise<EventRegistration[]> => {
    const response = await apiClient.get(`/event-registration/event/${eventId}`);
    return response.data.data;
  },

  // Get single registration by ID
  getRegistrationById: async (id: string): Promise<EventRegistration> => {
    const response = await apiClient.get(`/event-registration/${id}`);
    return response.data.data;
  },

  // Update registration
  updateRegistration: async (id: string, updates: Partial<EventRegistration>): Promise<EventRegistration> => {
    const response = await apiClient.put(`/event-registration/${id}`, updates);
    return response.data.data;
  },

  // Delete/cancel registration
  deleteRegistration: async (id: string): Promise<void> => {
    await apiClient.delete(`/event-registration/${id}`);
  },

  // Get all registrations (admin)
  getAllRegistrations: async (): Promise<EventRegistration[]> => {
    const response = await apiClient.get('/event-registration');
    return response.data.data;
  },
};