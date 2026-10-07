import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  businessId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('bizinvoice_token'),
  isAuthenticated: !!localStorage.getItem('bizinvoice_token'),
  setAuth: (user: User, token: string) => {
    localStorage.setItem('bizinvoice_token', token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('bizinvoice_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
