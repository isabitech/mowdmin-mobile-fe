import apiClient from './api';

export interface OrderItem {
  productId: string;
  quantity: number;
  name?: string;
  price?: number;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentResult {
  clientSecret: string;
  orderId: string;
}

const transformOrder = (data: any): Order => ({
  _id: data._id || data.id,
  userId: data.userId || '',
  items: data.items || [],
  totalAmount: data.totalAmount || 0,
  status: data.status || 'Pending',
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: data.updatedAt,
});

export const ordersAPI = {
  createOrder: async (items: OrderItem[], totalAmount: number): Promise<Order> => {
    const response = await apiClient.post('/orders/create', { items, totalAmount });
    const data = response.data?.data || response.data;
    return transformOrder(data);
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get('/orders/user');
    const items = response.data?.data || response.data || [];
    return Array.isArray(items) ? items.map(transformOrder) : [];
  },

  getOrder: async (orderId: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return transformOrder(response.data?.data || response.data);
  },

  payOrder: async (orderId: string): Promise<PaymentResult> => {
    const response = await apiClient.post(`/orders/${orderId}/pay`);
    const data = response.data?.data || response.data;
    return {
      clientSecret: data.clientSecret,
      orderId: orderId,
    };
  },
};
