import axios from 'axios';

const ASAAS_API_KEY = import.meta.env.VITE_ASAAS_API_KEY;
const ASAAS_ENVIRONMENT = import.meta.env.VITE_ASAAS_ENVIRONMENT || 'sandbox';

const BASE_URL = ASAAS_ENVIRONMENT === 'production'
  ? 'https://www.asaas.com/api/v3'
  : 'https://sandbox.asaas.com/api/v3';

const asaasApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'access_token': ASAAS_API_KEY,
  },
});

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  cpfCnpj: string;
  personType: 'FISICA' | 'JURIDICA';
  companyName?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  externalReference?: string;
  disabled: boolean;
  additionalEmails?: string;
  municipalInscription?: string;
  stateInscription?: string;
  observations?: string;
}

export interface AsaasSubscription {
  id: string;
  customer: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
  value: number;
  nextDueDate: string;
  description?: string;
  cycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
  status: 'ACTIVE' | 'EXPIRED' | 'INACTIVE';
  externalReference?: string;
  paymentLink?: string;
}

export interface CreateCustomerData {
  name: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  cpfCnpj: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  city?: string;
  state?: string;
  country?: string;
  personType?: 'FISICA' | 'JURIDICA';
  companyName?: string;
  externalReference?: string;
}

export interface CreateSubscriptionData {
  customer: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
  value: number;
  nextDueDate: string;
  description?: string;
  cycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
  externalReference?: string;
}

export class AsaasService {
  static async createCustomer(data: CreateCustomerData): Promise<AsaasCustomer> {
    try {
      const response = await asaasApi.post('/customers', data);
      return response.data;
    } catch (error) {
      console.error('Error creating Asaas customer:', error);
      throw error;
    }
  }

  static async getCustomer(customerId: string): Promise<AsaasCustomer> {
    try {
      const response = await asaasApi.get(`/customers/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting Asaas customer:', error);
      throw error;
    }
  }

  static async createSubscription(data: CreateSubscriptionData): Promise<AsaasSubscription> {
    try {
      const response = await asaasApi.post('/subscriptions', data);
      return response.data;
    } catch (error) {
      console.error('Error creating Asaas subscription:', error);
      throw error;
    }
  }

  static async getSubscription(subscriptionId: string): Promise<AsaasSubscription> {
    try {
      const response = await asaasApi.get(`/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting Asaas subscription:', error);
      throw error;
    }
  }

  static async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await asaasApi.delete(`/subscriptions/${subscriptionId}`);
    } catch (error) {
      console.error('Error canceling Asaas subscription:', error);
      throw error;
    }
  }

  static async getSubscriptionPayments(subscriptionId: string): Promise<any[]> {
    try {
      const response = await asaasApi.get(`/subscriptions/${subscriptionId}/payments`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting subscription payments:', error);
      throw error;
    }
  }

  static async createPayment(data: {
    customer: string;
    billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
    value: number;
    dueDate: string;
    description?: string;
    externalReference?: string;
  }): Promise<any> {
    try {
      const response = await asaasApi.post('/payments', data);
      return response.data;
    } catch (error) {
      console.error('Error creating Asaas payment:', error);
      throw error;
    }
  }

  static async getPayment(paymentId: string): Promise<any> {
    try {
      const response = await asaasApi.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting Asaas payment:', error);
      throw error;
    }
  }
}

export default AsaasService;