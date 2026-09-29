-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED', 'PENDING');

-- CreateEnum
CREATE TYPE "IdentityStatus" AS ENUM ('VERIFIED', 'PENDING', 'REVOKED');

-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('ADMIN', 'NFT_CREATOR', 'TECHNICIAN', 'AUDITOR');

-- CreateEnum
CREATE TYPE "DataClassification" AS ENUM ('PUBLIC', 'INTERNAL', 'SENSITIVE', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "LifecycleState" AS ENUM ('UNREGISTERED', 'SUPPLIER_DECLARED', 'RECEIVED', 'INSPECTION_RECORDED', 'ACCEPTED_FOR_ASSEMBLY', 'REJECTED_QUARANTINED', 'INSPECTION_OVERDUE');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('VERIFIED', 'REVIEW_REQUIRED', 'FAILED', 'UNAVAILABLE', 'PENDING');

-- CreateEnum
CREATE TYPE "EvidenceStatus" AS ENUM ('COMPLETE', 'PROCESSING', 'HASHING', 'FAILED', 'INVALID', 'DUPLICATE', 'UPLOADING');

-- CreateEnum
CREATE TYPE "CertStatus" AS ENUM ('CONFIRMED', 'PENDING', 'FAILED', 'REVOKED', 'NOT_CERTIFIED');

-- CreateEnum
CREATE TYPE "TxStatus" AS ENUM ('CREATED', 'SUBMITTED', 'PENDING', 'MINED', 'VERIFIED', 'FAILED', 'REVERTED', 'MISMATCH', 'CONFIRMED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'CLAIMED', 'PROCESSING', 'COMPLETED', 'FAILED', 'TERMINAL');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ApprovalStage" AS ENUM ('QA_REVIEW', 'QC_SIGN_OFF', 'COMMAND_AUTHORIZATION', 'CERTIFICATION_CLEARANCE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EXPIRY_WARNING', 'APPROVAL_REQUIRED', 'APPROVAL_DECIDED', 'INSPECTION_FAILED', 'CERTIFICATION_MINTED', 'SYSTEM_ALERT');

-- CreateEnum
CREATE TYPE "NotificationSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "last_active" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "AppRole" NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "granted_by" TEXT,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actors" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "did" TEXT NOT NULL,
    "wallet_address" TEXT,
    "credential_status" "IdentityStatus" NOT NULL DEFAULT 'PENDING',
    "identity_status" "IdentityStatus" NOT NULL DEFAULT 'PENDING',
    "public_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "did_documents" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "did" TEXT NOT NULL,
    "document" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "did_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credentials" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3),
    "credential_subject" JSONB NOT NULL,
    "credential_status" "IdentityStatus" NOT NULL DEFAULT 'PENDING',
    "proof" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batches" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "description" TEXT,
    "supplier" TEXT,
    "received_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "batch_ref_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "description" TEXT,
    "supplier" TEXT,
    "lifecycle_state" "LifecycleState" NOT NULL DEFAULT 'UNREGISTERED',
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "evidence_count" INTEGER NOT NULL DEFAULT 0,
    "evidence_status" "EvidenceStatus" NOT NULL DEFAULT 'PROCESSING',
    "cert_status" "CertStatus" NOT NULL DEFAULT 'NOT_CERTIFIED',
    "cert_id" TEXT,
    "registered_by_id" TEXT,
    "registered_by_name" TEXT,
    "classification" "DataClassification" NOT NULL DEFAULT 'INTERNAL',
    "version" INTEGER NOT NULL DEFAULT 1,
    "inspection_due_date" TIMESTAMP(3),
    "shelf_life_expiry" TIMESTAMP(3),
    "warranty_expiry" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "physical_bindings" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "binding_type" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "physical_bindings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technical_records" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "record_type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "classification" "DataClassification" NOT NULL DEFAULT 'INTERNAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence" (
    "id" TEXT NOT NULL,
    "evidence_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_kb" DOUBLE PRECISION NOT NULL,
    "status" "EvidenceStatus" NOT NULL DEFAULT 'PROCESSING',
    "hash" TEXT NOT NULL,
    "object_key" TEXT,
    "event" TEXT NOT NULL,
    "integrity_verified" BOOLEAN NOT NULL DEFAULT false,
    "blockchain_tx" TEXT,
    "uploaded_by_id" TEXT,
    "uploaded_by_name" TEXT,
    "uploaded_by_role" TEXT,
    "classification" "DataClassification" NOT NULL DEFAULT 'INTERNAL',
    "encrypted_key" TEXT,
    "current_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_versions" (
    "id" TEXT NOT NULL,
    "evidence_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "object_key" TEXT NOT NULL,
    "actor_id" TEXT,
    "actor_did" TEXT,
    "previous_hash" TEXT,
    "status" "EvidenceStatus" NOT NULL DEFAULT 'PROCESSING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidence_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspections" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "inspector_id" TEXT,
    "inspector_did" TEXT,
    "result" TEXT NOT NULL,
    "notes" TEXT,
    "evidence_ids" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lifecycle_events" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "from_state" "LifecycleState" NOT NULL,
    "to_state" "LifecycleState" NOT NULL,
    "actor_id" TEXT,
    "actor_did" TEXT,
    "actor_role" TEXT,
    "reason" TEXT,
    "evidence_ids" TEXT[],
    "idempotency_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lifecycle_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expected_transitions" (
    "id" TEXT NOT NULL,
    "from_state" "LifecycleState" NOT NULL,
    "to_state" "LifecycleState" NOT NULL,
    "allowed_role" "AppRole" NOT NULL,
    "permission" TEXT NOT NULL,
    "requires_evidence" BOOLEAN NOT NULL DEFAULT false,
    "requires_inspection" BOOLEAN NOT NULL DEFAULT false,
    "requires_credential" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,

    CONSTRAINT "expected_transitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" TEXT NOT NULL,
    "cert_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "batch_ref_id" TEXT NOT NULL,
    "token_id" TEXT,
    "contract_address" TEXT,
    "network" TEXT,
    "tx_hash" TEXT,
    "block_number" INTEGER,
    "status" "CertStatus" NOT NULL DEFAULT 'PENDING',
    "issued_by_id" TEXT,
    "issued_by_name" TEXT,
    "issued_by_did" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "mint_request_id" TEXT,
    "revoked_at" TIMESTAMP(3),
    "revoked_by" TEXT,
    "revoke_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchain_transactions" (
    "id" TEXT NOT NULL,
    "tx_hash" TEXT,
    "network" TEXT NOT NULL,
    "block_number" INTEGER,
    "status" "TxStatus" NOT NULL DEFAULT 'CREATED',
    "action" TEXT NOT NULL,
    "asset_id" TEXT,
    "cert_id" TEXT,
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "gas_used" INTEGER,
    "from_address" TEXT,
    "contract_address" TEXT,
    "token_id" TEXT,
    "input_data" TEXT,
    "error_message" TEXT,
    "idempotency_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blockchain_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchain_verifications" (
    "id" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "contract_address" TEXT NOT NULL,
    "token_id" TEXT,
    "expected_status" TEXT NOT NULL,
    "actual_status" TEXT NOT NULL,
    "is_match" BOOLEAN NOT NULL,
    "details" JSONB,
    "verified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blockchain_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "actor_id" TEXT,
    "actor_did" TEXT,
    "actor_role" TEXT,
    "actor_name" TEXT,
    "action" TEXT NOT NULL,
    "resource_type" TEXT,
    "resource_id" TEXT,
    "result" TEXT NOT NULL DEFAULT 'SUCCESS',
    "details" TEXT,
    "payload" JSONB,
    "payload_hash" TEXT,
    "previous_hash" TEXT,
    "request_id" TEXT,
    "blockchain_tx_hash" TEXT,
    "classification" "DataClassification" NOT NULL DEFAULT 'INTERNAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkpoints" (
    "id" TEXT NOT NULL,
    "range_start" TIMESTAMP(3) NOT NULL,
    "range_end" TIMESTAMP(3) NOT NULL,
    "event_count" INTEGER NOT NULL,
    "merkle_root" TEXT NOT NULL,
    "policy" TEXT NOT NULL DEFAULT 'PROPOSED',
    "witness_metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "idempotency_key" TEXT NOT NULL,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "next_attempt_at" TIMESTAMP(3),
    "last_error" TEXT,
    "claimed_by" TEXT,
    "claimed_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_bindings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chain_id" INTEGER,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_bindings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_challenges" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approvals" (
    "id" TEXT NOT NULL,
    "approval_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "stage" "ApprovalStage" NOT NULL DEFAULT 'QA_REVIEW',
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "requested_by_id" TEXT NOT NULL,
    "requested_by_name" TEXT,
    "requested_by_role" TEXT,
    "approver_id" TEXT,
    "approver_name" TEXT,
    "approver_role" "AppRole",
    "comments" TEXT,
    "digital_signature" TEXT,
    "decided_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipient_id" TEXT,
    "recipient_role" "AppRole",
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM_ALERT',
    "severity" "NotificationSeverity" NOT NULL DEFAULT 'INFO',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_key" ON "user_roles"("user_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "actors_user_id_key" ON "actors"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "actors_did_key" ON "actors"("did");

-- CreateIndex
CREATE UNIQUE INDEX "did_documents_did_key" ON "did_documents"("did");

-- CreateIndex
CREATE UNIQUE INDEX "batches_batch_id_key" ON "batches"("batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "assets_asset_id_key" ON "assets"("asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "assets_serial_number_key" ON "assets"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "evidence_evidence_id_key" ON "evidence"("evidence_id");

-- CreateIndex
CREATE UNIQUE INDEX "evidence_versions_evidence_id_version_key" ON "evidence_versions"("evidence_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "lifecycle_events_idempotency_key_key" ON "lifecycle_events"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "expected_transitions_from_state_to_state_allowed_role_key" ON "expected_transitions"("from_state", "to_state", "allowed_role");

-- CreateIndex
CREATE UNIQUE INDEX "certifications_cert_id_key" ON "certifications"("cert_id");

-- CreateIndex
CREATE UNIQUE INDEX "certifications_mint_request_id_key" ON "certifications"("mint_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_transactions_tx_hash_key" ON "blockchain_transactions"("tx_hash");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_transactions_idempotency_key_key" ON "blockchain_transactions"("idempotency_key");

-- CreateIndex
CREATE INDEX "audit_events_event_type_idx" ON "audit_events"("event_type");

-- CreateIndex
CREATE INDEX "audit_events_actor_did_idx" ON "audit_events"("actor_did");

-- CreateIndex
CREATE INDEX "audit_events_resource_id_idx" ON "audit_events"("resource_id");

-- CreateIndex
CREATE INDEX "audit_events_created_at_idx" ON "audit_events"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "outbox_events_idempotency_key_key" ON "outbox_events"("idempotency_key");

-- CreateIndex
CREATE INDEX "outbox_events_status_next_attempt_at_idx" ON "outbox_events"("status", "next_attempt_at");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_bindings_user_id_address_key" ON "wallet_bindings"("user_id", "address");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_challenges_nonce_key" ON "wallet_challenges"("nonce");

-- CreateIndex
CREATE UNIQUE INDEX "approvals_approval_id_key" ON "approvals"("approval_id");

-- CreateIndex
CREATE INDEX "approvals_status_stage_idx" ON "approvals"("status", "stage");

-- CreateIndex
CREATE INDEX "approvals_asset_id_idx" ON "approvals"("asset_id");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_is_read_idx" ON "notifications"("recipient_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_recipient_role_is_read_idx" ON "notifications"("recipient_role", "is_read");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actors" ADD CONSTRAINT "actors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "did_documents" ADD CONSTRAINT "did_documents_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "actors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "actors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_batch_ref_id_fkey" FOREIGN KEY ("batch_ref_id") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "physical_bindings" ADD CONSTRAINT "physical_bindings_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_records" ADD CONSTRAINT "technical_records_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_versions" ADD CONSTRAINT "evidence_versions_evidence_id_fkey" FOREIGN KEY ("evidence_id") REFERENCES "evidence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lifecycle_events" ADD CONSTRAINT "lifecycle_events_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_batch_ref_id_fkey" FOREIGN KEY ("batch_ref_id") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockchain_transactions" ADD CONSTRAINT "blockchain_transactions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_bindings" ADD CONSTRAINT "wallet_bindings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_challenges" ADD CONSTRAINT "wallet_challenges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

