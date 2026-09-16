import { api } from './api';

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  url: string;
  status?: string;
  badge?: string;
  highlights?: string[];
  relevance: number;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  total: number;
  time_ms: number;
}

export const searchService = {
  search: async (query: string) => {
    return api.get<SearchResponse>(`/search?q=${encodeURIComponent(query)}`);
  }
};
