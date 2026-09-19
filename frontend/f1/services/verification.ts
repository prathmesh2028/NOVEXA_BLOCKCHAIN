import { api } from './api';

export interface VerificationCheck {
  domain: string;
  status: 'VALID' | 'INVALID' | 'MISMATCH' | 'MISSING' | 'UNVERIFIED' | 'NOT_APPLICABLE';
  reason: string;
}

export interface VerificationResponse {
  asset_id: string;
  checks: VerificationCheck[];
  overall: 'VALID' | 'INVALID' | 'MISMATCH' | 'MISSING' | 'UNVERIFIED' | 'NOT_APPLICABLE';
}

export const verificationService = {
  verifyAsset: async (id: string) => {
    return api.get<VerificationResponse>(`/verification/asset/${encodeURIComponent(id)}`);
  },
};
