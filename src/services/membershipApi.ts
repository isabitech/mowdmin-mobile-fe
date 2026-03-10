import apiClient from './api';

export interface MembershipApplication {
  _id: string;
  userId: string;
  baptismInterest: boolean;
  communionAlert: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

export const membershipAPI = {
  apply: async (data: {
    baptismInterest: boolean;
    communionAlert: boolean;
  }): Promise<MembershipApplication> => {
    const response = await apiClient.post('/membership/create', data);
    return response.data?.data || response.data;
  },

  getAll: async (): Promise<MembershipApplication[]> => {
    const response = await apiClient.get('/membership');
    const items = response.data?.data || response.data || [];
    return Array.isArray(items) ? items : [];
  },
};
