-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PREPARING', 'DISPATCHED', 'IN_TRANSIT', 'RECEIVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CustodyStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_info" JSONB,
    "status" "SupplierStatus" NOT NULL DEFAULT 'ACTIVE',
    "registration_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lots" (
    "id" TEXT NOT NULL,
    "lot_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "material_type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "manufactured_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL,
    "shipment_id" TEXT NOT NULL,
    "dispatch_facility_id" TEXT,
    "receive_facility_id" TEXT,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'PREPARING',
    "dispatched_at" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "tracking_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custody_transfers" (
    "id" TEXT NOT NULL,
    "shipment_id" TEXT NOT NULL,
    "from_actor_id" TEXT,
    "to_actor_id" TEXT,
    "status" "CustodyStatus" NOT NULL DEFAULT 'PENDING',
    "transferred_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custody_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply_chain_events" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB,
    "actor_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supply_chain_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_supplier_id_key" ON "suppliers"("supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "facilities_facility_id_key" ON "facilities"("facility_id");

-- CreateIndex
CREATE UNIQUE INDEX "lots_lot_id_key" ON "lots"("lot_id");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_shipment_id_key" ON "shipments"("shipment_id");

-- CreateIndex
CREATE INDEX "supply_chain_events_entity_type_entity_id_idx" ON "supply_chain_events"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_dispatch_facility_id_fkey" FOREIGN KEY ("dispatch_facility_id") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_receive_facility_id_fkey" FOREIGN KEY ("receive_facility_id") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custody_transfers" ADD CONSTRAINT "custody_transfers_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

