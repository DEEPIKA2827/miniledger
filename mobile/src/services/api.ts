import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { CreateLoanPayload, LedgerSummary, Loan, User } from '../types';

// Android Emulator uses 10.0.2.2 to reach host. Web/iOS/Desktop uses localhost.
export const DEFAULT_API_BASE =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

const TOKEN_KEY = '@miniledger_user_token';
const USER_KEY = '@miniledger_user_data';

class ApiClient {
  private baseUrl: string = DEFAULT_API_BASE;

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  }

  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  async getUser(): Promise<User | null> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  async setUser(user: User): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  async clearSession(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg =
          data.message || data.error || `HTTP request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      return data as T;
    } catch (err: any) {
      if (err.message && err.message.includes('Network request failed')) {
        throw new Error(
          `Cannot connect to MiniLedger backend at ${this.baseUrl}. Check if the server is running.`
        );
      }
      throw err;
    }
  }

  // --- Auth Endpoints ---
  async sendOtp(phone: string): Promise<{ success: boolean; message: string; expiresInSeconds: number }> {
    return this.request('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyOtp(phone: string, otp: string): Promise<{ success: boolean; token: string; user: User }> {
    return this.request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
  }

  // --- Loans Endpoints ---
  async getSummary(): Promise<{ success: boolean; summary: LedgerSummary }> {
    return this.request('/api/loans/summary', {
      method: 'GET',
    });
  }

  async getLoans(): Promise<{ success: boolean; loans: Loan[] }> {
    return this.request('/api/loans', {
      method: 'GET',
    });
  }

  async createLoan(payload: CreateLoanPayload): Promise<{ success: boolean; loan: Loan }> {
    return this.request('/api/loans', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async repayLoan(id: string): Promise<{ success: boolean; loan: Loan }> {
    return this.request(`/api/loans/${id}/repay`, {
      method: 'PATCH',
    });
  }
}

export const api = new ApiClient();
