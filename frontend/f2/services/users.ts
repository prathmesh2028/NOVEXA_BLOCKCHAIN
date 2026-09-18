import { api } from './api';

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  status: string;
  roles: string[];
  did: string | null;
  identity_status: string | null;
  last_active: string;
  created_at: string;
}

export interface UserListResponse {
  items: UserResponse[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export const usersService = {
  listUsers: async (params: { search?: string; status?: string; role?: string; page?: number; page_size?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.role) query.append('role', params.role);
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());
    
    return api.get<UserListResponse>(`/users?${query.toString()}`);
  }
};
