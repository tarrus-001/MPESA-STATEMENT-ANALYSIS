import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-f9f965c0`;

interface ApiOptions {
  method?: string;
  body?: any;
}

async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body } = options;

  const headers: HeadersInit = {
    'Authorization': `Bearer ${publicAnonKey}`,
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      console.error(`API Error (${endpoint}):`, data);
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Customer API
export const customerApi = {
  getAll: () => apiCall('/customers'),

  getById: (id: string) => apiCall(`/customers/${id}`),

  search: (searchTerm: string) => apiCall('/customers/search', {
    method: 'POST',
    body: { searchTerm },
  }),

  create: (customerData: any) => apiCall('/customers', {
    method: 'POST',
    body: customerData,
  }),

  update: (id: string, customerData: any) => apiCall(`/customers/${id}`, {
    method: 'PUT',
    body: customerData,
  }),

  deleteAll: () => apiCall('/customers', {
    method: 'DELETE',
  }),

  delete: (id: string) => apiCall(`/customers/${id}`, {
    method: 'DELETE',
  }),
};

// M-Pesa API
export const mpesaApi = {
  analyze: (customerId: string, fileName: string, fileSize: number) => apiCall('/mpesa/analyze', {
    method: 'POST',
    body: { customerId, fileName, fileSize },
  }),

  getByCustomer: (customerId: string) => apiCall(`/mpesa/${customerId}`),
};

// Activity API
export const activityApi = {
  getAll: () => apiCall('/activities'),
};

// Seed API
export const seedData = () => apiCall('/seed', { method: 'POST' });
