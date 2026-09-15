import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'demo', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(8000),
  API_PREFIX: z.string().default('/api/v1'),
  LOG_LEVEL: z.string().default('debug'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_ISSUER: z.string().default('kavachtrust'),
  JWT_AUDIENCE: z.string().default('kavachtrust-api'),
  JWT_EXPIRY: z.string().default('24h'),
  OIDC_ISSUER_URL: z.string().optional().default(''),
  OIDC_CLIENT_ID: z.string().optional().default(''),
  OIDC_CLIENT_SECRET: z.string().optional().default(''),
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_USE_SSL: z.coerce.boolean().default(false),
  MINIO_ACCESS_KEY: z.string().default('kavach_minio_dev'),
  MINIO_SECRET_KEY: z.string().default('kavach_minio_secret_dev'),
  MINIO_BUCKET: z.string().default('kavachtrust-evidence'),
  BLOCKCHAIN_RPC_URL: z.string().default('http://localhost:8545'),
  BLOCKCHAIN_CHAIN_ID: z.coerce.number().default(1337),
  BLOCKCHAIN_PRIVATE_KEY: z.string().default(''),
  CONTRACT_ADDRESS: z.string().default(''),
  BLOCKCHAIN_NETWORK_NAME: z.string().default('BEL-TRUST-CHAIN'),
  AES_KEY: z.string().default(''),
  SENTRY_DSN: z.string().optional().default(''),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:8443'),
  WEBAUTHN_RP_NAME: z.string().default('KavachTrust'),
  WEBAUTHN_RP_ID: z.string().default('localhost'),
  WEBAUTHN_ORIGIN: z.string().default('http://localhost:5173'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let _config: EnvConfig | null = null;

export function getEnvConfig(): EnvConfig {
  if (!_config) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.error('❌ Invalid environment configuration:');
      console.error(result.error.format());
      // In production, fail closed
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
      // In dev, use defaults
      _config = envSchema.parse({
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://kavach:kavach_dev_2026@localhost:5432/kavachtrust',
        JWT_SECRET: process.env.JWT_SECRET || 'kavachtrust-dev-secret-change-in-production-2026',
      });
    } else {
      _config = result.data;
    }
  }
  return _config;
}
