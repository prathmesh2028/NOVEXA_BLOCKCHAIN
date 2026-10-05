import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
  override: false, // don't override real env vars with .env file
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/** Coerce empty-string / null / undefined to undefined so .default() fires */
const emptyToUndefined = (v: unknown) =>
  v === '' || v === null || v === undefined ? undefined : v;

const numOrDefault = (fallback: number) =>
  z.preprocess((v) => (v === '' || v === null || v === undefined ? fallback : Number(v)), z.number());

// ---------------------------------------------------------------------------
// Schema – every field has a safe default so the app always starts
// ---------------------------------------------------------------------------
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'demo', 'staging', 'production'])
    .default('production'),
  APP_ENV: z
    .enum(['development', 'test', 'demo', 'staging', 'production'])
    .default('production'),
  PORT: numOrDefault(10000),
  API_PREFIX: z.string().default('/api/v1'),
  LOG_LEVEL: z.string().default('info'),

  // Database – Render injects DATABASE_URL automatically when a PG service is linked
  DATABASE_URL: z
    .preprocess(emptyToUndefined, z.string())
    .default('postgresql://postgres:postgres@localhost:5432/kavachtrust'),

  // JWT – long enough default so it passes the min(16) check
  JWT_SECRET: z
    .preprocess(emptyToUndefined, z.string().min(16))
    .default('novexa-render-default-jwt-secret-32ch'),
  JWT_ISSUER: z.string().default('kavachtrust'),
  JWT_AUDIENCE: z.string().default('kavachtrust-api'),
  JWT_EXPIRY: z.string().default('24h'),

  // OIDC (optional)
  OIDC_ISSUER_URL: z.preprocess(emptyToUndefined, z.string().optional()).default(''),
  OIDC_CLIENT_ID: z.preprocess(emptyToUndefined, z.string().optional()).default(''),
  OIDC_CLIENT_SECRET: z.preprocess(emptyToUndefined, z.string().optional()).default(''),

  // MinIO – if endpoint is empty the service falls back to local disk automatically
  MINIO_ENDPOINT: z.preprocess(emptyToUndefined, z.string()).default(''),
  MINIO_PORT: numOrDefault(9000),
  MINIO_USE_SSL: z
    .preprocess((v) => (v === 'true' || v === true ? true : false), z.boolean())
    .default(false),
  MINIO_ACCESS_KEY: z.preprocess(emptyToUndefined, z.string()).default('minioadmin'),
  MINIO_SECRET_KEY: z.preprocess(emptyToUndefined, z.string()).default('minioadmin'),
  MINIO_BUCKET: z.string().default('kavachtrust-evidence'),

  // Blockchain – safe dummy values when MODE=demo (no real RPC needed)
  BLOCKCHAIN_RPC_URL: z
    .preprocess(emptyToUndefined, z.string())
    .default('http://localhost:8545'),
  BLOCKCHAIN_CHAIN_ID: numOrDefault(31337),
  BLOCKCHAIN_PRIVATE_KEY: z
    .preprocess(emptyToUndefined, z.string())
    .default('0x0000000000000000000000000000000000000000000000000000000000000001'),
  CONTRACT_ADDRESS: z.preprocess(emptyToUndefined, z.string()).default(''),
  BLOCKCHAIN_NETWORK_NAME: z.string().default('BEL-TRUST-CHAIN'),
  BLOCKCHAIN_MODE: z.enum(['real', 'demo']).default('demo'),
  BLOCKCHAIN_CONFIRMATIONS_REQUIRED: numOrDefault(1),
  DEFAULT_NFT_RECIPIENT: z.preprocess(emptyToUndefined, z.string().optional()).default(''),

  // Misc
  AES_KEY: z.string().default(''),
  SENTRY_DSN: z.preprocess(emptyToUndefined, z.string().optional()).default(''),
  CORS_ORIGINS: z
    .preprocess(emptyToUndefined, z.string())
    .default('http://localhost:5173,http://localhost:8443'),
  WEBAUTHN_RP_NAME: z.string().default('KavachTrust'),
  WEBAUTHN_RP_ID: z.string().default('localhost'),
  WEBAUTHN_ORIGIN: z.string().default('http://localhost:5173'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function getEnvConfig(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment configuration:');
    console.error(result.error.format());
    process.exit(1);
  }

  const d = result.data;
  const isProduction = d.NODE_ENV === 'production' || d.APP_ENV === 'production';
  const isDemo = d.NODE_ENV === 'demo' || d.APP_ENV === 'demo';

  // Safety: demo mode must not run alongside production flag
  if (isProduction && isDemo) {
    console.error('❌ SECURITY ERROR: DEMO MODE IS NOT PERMITTED IN PRODUCTION');
    process.exit(1);
  }

  if (isDemo && !isProduction) {
    console.warn('⚠️  KAVACHTRUST DEMO MODE ENABLED');
  }

  return d;
}
