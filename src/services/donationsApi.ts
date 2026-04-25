import apiClient from './api';

export interface Donation {
  _id: string;
  userId: string;
  amount: number;
  currency: string;
  campaign?: string;
  status: 'Pending' | 'Success' | 'Failed';
  createdAt: string;
  updatedAt?: string;
}

export interface DonationPaymentResult {
  clientSecret: string;
  donationId: string;
}

const transformDonation = (data: any): Donation => ({
  _id: data._id || data.id,
  userId: data.userId || '',
  amount: data.amount || 0,
  currency: data.currency || 'USD',
  campaign: data.campaign || '',
  status: data.status || 'Pending',
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: data.updatedAt,
});

export const donationsAPI = {
  createDonation: async (data: {
    amount: number;
    campaign?: string;
    currency?: string;
  }): Promise<Donation> => {
    const response = await apiClient.post('/donation', data);
    return transformDonation(response.data?.data || response.data);
  },

  payDonation: async (donationId: string): Promise<DonationPaymentResult> => {
    const response = await apiClient.post(`/donation/${donationId}/pay`);
    const result = response.data?.data || response.data;
    return {
      clientSecret: result.clientSecret,
      donationId: donationId,
    };
  },

  getMyDonations: async (): Promise<Donation[]> => {
    const response = await apiClient.get('/donation/me');
    const raw = response.data?.data;
    const items = Array.isArray(raw) ? raw : (raw?.donations || []);
    return items.map(transformDonation);
  },

  getDonationById: async (donationId: string): Promise<Donation> => {
    const response = await apiClient.get(`/donation/${donationId}`);
    return transformDonation(response.data?.data || response.data);
  },
};
