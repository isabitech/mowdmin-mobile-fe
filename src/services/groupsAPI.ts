import apiClient from './api';

export interface GroupMember {
  _id: string;
  name: string;
  photo?: string;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  creatorId: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  memberCount?: number;
  image?: string;
  avatar?: string;
  lastMessage?: string;
  time?: string;
  members?: GroupMember[];
}

export type GroupDetail = Group;

export interface GroupMessage {
  _id: string;
  groupId: string;
  sender: {
    _id: string;
    name: string;
    photo?: string;
  };
  message: string;
  type?: 'text' | 'image' | 'prayer_card' | 'scripture';
  createdAt: string;
  updatedAt?: string;
}

// Normalize backend message shape (senderId/content/avatar → sender/message/photo)
const normalizeMessage = (raw: any): GroupMessage => {
  const s = raw.senderId || raw.sender;
  let sender: GroupMessage['sender'];
  if (typeof s === 'object' && s !== null) {
    const name = s.name || [s.firstName, s.lastName].filter(Boolean).join(' ') || 'Unknown';
    sender = { _id: s._id || '', name, photo: s.photo || s.avatar || '' };
  } else {
    sender = { _id: typeof s === 'string' ? s : '', name: 'Unknown', photo: '' };
  }
  return {
    _id: raw._id,
    groupId: raw.groupId,
    sender,
    message: raw.message || raw.content || '',
    type: raw.type,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

export interface DiscoverGroupsResponse {
  status: string;
  message: string;
  data: Group[];
  meta?: any;
}

export interface MyGroupsResponse {
  status: string;
  message: string;
  data: Group[];
  meta?: any;
}

export interface JoinGroupResponse {
  status: string;
  message: string;
  data: {
    groupId: string;
    userId: string;
    joinedAt: string;
  };
}

class GroupsAPI {
  async getDiscoverGroups(): Promise<Group[]> {
    try {
      const response = await apiClient.get<DiscoverGroupsResponse>('/groups/discover');
      return response.data.data || [];
    } catch (error) {
      console.error('[GroupsAPI] getDiscoverGroups error:', error);
      throw error;
    }
  }

  async getMyGroups(): Promise<Group[]> {
    try {
      const response = await apiClient.get<MyGroupsResponse>('/groups/me');
      return response.data.data || [];
    } catch (error) {
      console.error('[GroupsAPI] getMyGroups error:', error);
      throw error;
    }
  }

  async getGroupDetails(groupId: string): Promise<Group> {
    try {
      const response = await apiClient.get<{ status: string; data: Group }>(`/groups/${groupId}`);
      return response.data.data;
    } catch (error) {
      console.error('[GroupsAPI] getGroupDetails error:', error);
      throw error;
    }
  }

  // Alias for compatibility
  async getGroupById(groupId: string): Promise<Group> {
    return this.getGroupDetails(groupId);
  }

  async joinGroup(groupId: string): Promise<JoinGroupResponse['data']> {
    try {
      const response = await apiClient.post<JoinGroupResponse>(`/groups/${groupId}/join`);
      return response.data.data;
    } catch (error) {
      console.error('[GroupsAPI] joinGroup error:', error);
      throw error;
    }
  }

  async leaveGroup(groupId: string): Promise<void> {
    try {
      await apiClient.delete(`/groups/${groupId}/leave`);
    } catch (error) {
      console.error('[GroupsAPI] leaveGroup error:', error);
      throw error;
    }
  }

  async createGroup(groupData: {
    name: string;
    description: string;
    isPrivate?: boolean;
    image?: string;
  }): Promise<Group> {
    try {
      const response = await apiClient.post<{ status: string; message: string; data: Group }>(
        '/groups/create',
        groupData
      );
      return response.data.data;
    } catch (error) {
      console.error('[GroupsAPI] createGroup error:', error);
      throw error;
    }
  }

  async getGroupMessages(groupId: string): Promise<GroupMessage[]> {
    try {
      const response = await apiClient.get(
        `/groups/${groupId}/messages`
      );
      const raw = response.data.data || [];
      return Array.isArray(raw) ? raw.map(normalizeMessage) : [];
    } catch (error) {
      console.error('[GroupsAPI] getGroupMessages error:', error);
      throw error;
    }
  }

  async sendMessage(groupId: string, message: string, type: string = 'text'): Promise<GroupMessage> {
    try {
      const response = await apiClient.post(
        `/groups/${groupId}/messages`,
        { content: message, message, type }
      );
      return normalizeMessage(response.data.data);
    } catch (error) {
      console.error('[GroupsAPI] sendMessage error:', error);
      throw error;
    }
  }

  // Alias for compatibility
  async sendGroupMessage(groupId: string, content: string): Promise<GroupMessage> {
    return this.sendMessage(groupId, content);
  }
}

export const groupsAPI = new GroupsAPI();
export default groupsAPI;
