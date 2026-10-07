import { Injectable } from '@nestjs/common';
import { getEnvConfig, EnvConfig } from './env.validation';

@Injectable()
export class ConfigService {
  private readonly config: EnvConfig;

  constructor() {
    this.config = getEnvConfig();
  }

  get nodeEnv(): string { return this.config.NODE_ENV; }
  get appEnv(): string { return this.config.APP_ENV; }
  get isDevelopment(): boolean { return this.config.NODE_ENV === 'development' || this.config.NODE_ENV === 'demo'; }
  get isProduction(): boolean { return this.config.NODE_ENV === 'production'; }
  get isTest(): boolean { return this.config.NODE_ENV === 'test'; }
  get isDemoMode(): boolean { return this.config.APP_ENV === 'demo' || this.config.NODE_ENV === 'demo'; }
  get port(): number { return this.config.PORT; }
  get apiPrefix(): string { return this.config.API_PREFIX; }
  get logLevel(): string { return this.config.LOG_LEVEL; }

  // Database
  get databaseUrl(): string { return this.config.DATABASE_URL; }

  // JWT
  get jwtSecret(): string { return this.config.JWT_SECRET; }
  get jwtIssuer(): string { return this.config.JWT_ISSUER; }
  get jwtAudience(): string { return this.config.JWT_AUDIENCE; }
  get jwtExpiry(): string { return this.config.JWT_EXPIRY; }

  // OIDC
  get oidcIssuerUrl(): string { return this.config.OIDC_ISSUER_URL || ''; }
  get oidcClientId(): string { return this.config.OIDC_CLIENT_ID || ''; }

  // MinIO
  get minioEndpoint(): string { return this.config.MINIO_ENDPOINT; }
  get minioPort(): number { return this.config.MINIO_PORT; }
  get minioUseSsl(): boolean { return this.config.MINIO_USE_SSL; }
  get minioAccessKey(): string { return this.config.MINIO_ACCESS_KEY; }
  get minioSecretKey(): string { return this.config.MINIO_SECRET_KEY; }
  get minioBucket(): string { return this.config.MINIO_BUCKET; }

  // Blockchain
  get blockchainRpcUrl(): string { return this.config.BLOCKCHAIN_RPC_URL; }
  get blockchainChainId(): number { return this.config.BLOCKCHAIN_CHAIN_ID; }
  get blockchainPrivateKey(): string { return this.config.BLOCKCHAIN_PRIVATE_KEY; }
  get contractAddress(): string { return this.config.CONTRACT_ADDRESS; }
  get blockchainNetworkName(): string { return this.config.BLOCKCHAIN_NETWORK_NAME; }
  get blockchainMode(): string { return this.config.BLOCKCHAIN_MODE; }
  get blockchainConfirmationsRequired(): number { return this.config.BLOCKCHAIN_CONFIRMATIONS_REQUIRED; }
  get defaultNftRecipient(): string { return this.config.DEFAULT_NFT_RECIPIENT || ''; }

  // Encryption
  get aesKey(): string { return this.config.AES_KEY; }

  // CORS
  get corsOrigins(): string[] {
    const raw = this.config.CORS_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);
    const origins = new Set<string>();
    for (const o of raw) {
      origins.add(o);
      origins.add(o.replace(/\/+$/, ''));
    }
    return Array.from(origins);
  }

  // Sentry
  get sentryDsn(): string { return this.config.SENTRY_DSN || ''; }

  // WebAuthn
  get webauthnRpName(): string { return this.config.WEBAUTHN_RP_NAME; }
  get webauthnRpId(): string { return this.config.WEBAUTHN_RP_ID; }
  get webauthnOrigin(): string { return this.config.WEBAUTHN_ORIGIN; }
}
