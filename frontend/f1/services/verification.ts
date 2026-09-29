import { api } from './api';

export interface VerificationCheck {
  domain: string;
  status: 'VALID' | 'INVALID' | 'MISMATCH' | 'MISSING' | 'UNVERIFIED' | 'NOT_APPLICABLE' | 'BLOCKCHAIN_UNAVAILABLE';
  reason: string;
}

export interface VerificationResponse {
  asset_id: string;
  checks: VerificationCheck[];
  overall: 'VALID' | 'INVALID' | 'MISMATCH' | 'MISSING' | 'UNVERIFIED' | 'NOT_APPLICABLE';
}

export const verificationService = {
  verifyAsset: async (id: string) => {
    if (typeof id !== 'string') {
      throw new Error(`verifyAsset requires a string ID, received ${typeof id}: ${JSON.stringify(id)}`);
    }
    return api.get<VerificationResponse>(`/verification/asset/${encodeURIComponent(id)}`);
  },
};
