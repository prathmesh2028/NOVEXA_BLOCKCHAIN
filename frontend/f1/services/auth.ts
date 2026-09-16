import { api } from './api';
import type { Role } from '../context/RoleContext';

export interface ActorResponse {
  id: string;
  did: string;
  credential_status: string;
  identity_status: string;
  wallet_address: string | null;
}

export interface UserMeResponse {
  id: string;
  email: string;
  name: string;
  status: string;
  roles: string[];
  actor: ActorResponse | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  login: async (email: string, password: string = 'password') => {
    const data = await api.post<LoginResponse>('/auth/login', { email, password });
    localStorage.setItem('kavach_token', data.access_token);
    return data;
  },

  getMe: async () => {
    return api.get<UserMeResponse>('/auth/me');
  },

  logout: () => {
    localStorage.removeItem('kavach_token');
    // We don't necessarily need to call the backend logout for now, 
    // but we can to be thorough.
    try {
      api.post('/auth/logout', {});
    } catch(e) {}
  }
};
