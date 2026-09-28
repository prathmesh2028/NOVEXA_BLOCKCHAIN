import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { AuditService } from '../asset-management/audit/audit.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SupplyChainService {
  private readonly logger = new Logger(SupplyChainService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private formatSupplier(s: any) {
    const info = s.contactInfo && typeof s.contactInfo === 'object' ? s.contactInfo : {};
    return {
      ...s,
      supplier_id: s.supplierId,
      type: info.type || s.type || 'Tier-1 OEM',
      address: info.address || s.address || null,
      contact_person: info.contactPerson || info.contact_person || null,
      contact_email: info.contactEmail || info.contact_email || null,
      contact_phone: info.contactPhone || info.contact_phone || null,
      certifications: info.certifications || s.certifications || 'ISO 9001 / AS9100',
      created_at: s.createdAt,
      updated_at: s.updatedAt,
    };
  }

  // SUPPLIERS
  async getSuppliers() {
    try {
      const list = await this.prisma.supplier.findMany({
        include: { facilities: true },
        orderBy: { createdAt: 'desc' },
      });
      return list.map((s) => this.formatSupplier(s));
    } catch (err: any) {
      this.logger.warn(`DB offline — returning empty suppliers list: ${err.message}`);
      return [];
    }
  }

  async getSupplier(id: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { OR: [{ id }, { supplierId: id }] },
      include: { facilities: true, lots: true },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return this.formatSupplier(supplier);
  }

  async createSupplier(data: any, userId: string) {
    if (!data.name || !data.name.trim()) {
      throw new BadRequestException('Supplier name is required');
    }

    const supplierId = data.supplierId || data.supplier_id || `SUP-${uuidv4().slice(0, 8).toUpperCase()}`;
    const contactInfo = typeof data.contactInfo === 'object' && data.contactInfo !== null
      ? data.contactInfo
      : {
          type: data.type || 'Tier-1 OEM',
          contactPerson: data.contactPerson || data.contact_person || '',
          contactEmail: data.contactEmail || data.contact_email || '',
          contactPhone: data.contactPhone || data.contact_phone || '',
          address: data.address || '',
          certifications: data.certifications || 'ISO 9001 / AS9100',
        };

    const supplier = await this.prisma.supplier.create({
      data: {
        supplierId,
        name: data.name.trim(),
        contactInfo,
      },
      include: { facilities: true },
    });

    const actorId = userId && userId !== 'system' ? userId : undefined;
    try {
      await this.audit.recordEvent({
        eventType: 'SUPPLIER_CREATED',
        action: 'Registered new supplier',
        resourceType: 'Supplier',
        resourceId: supplier.id,
        actorId,
        details: `Registered supplier ${supplier.name} (${supplier.supplierId})`,
      });
    } catch (auditErr: any) {
      this.logger.warn(`Failed to record audit event for supplier ${supplier.id}: ${auditErr?.message || auditErr}`);
    }
    return this.formatSupplier(supplier);
  }

  // FACILITIES
  async getFacilities() {
    try {
      return await this.prisma.facility.findMany({ include: { supplier: true } });
    } catch (err: any) {
      this.logger.warn(`DB offline — returning empty facilities list: ${err.message}`);
      return [];
    }
  }

  async createFacility(data: any, userId: string) {
    const supplierIdentifier = data.supplierId || data.supplier_id;
    if (!supplierIdentifier) {
      throw new BadRequestException('supplierId is required to associate the facility with a supplier');
    }
    if (!data.name || !String(data.name).trim()) {
      throw new BadRequestException('Facility name is required');
    }

    // Look up supplier by either ID or supplierId
    const supplier = await this.prisma.supplier.findFirst({
      where: { OR: [{ id: supplierIdentifier }, { supplierId: supplierIdentifier }] },
    });

    if (!supplier) {
      throw new BadRequestException(`Supplier ${supplierIdentifier} not found`);
    }

    const facilityId = data.facilityId || data.facility_id || `FAC-${uuidv4().slice(0, 8).toUpperCase()}`;
    const facility = await this.prisma.facility.create({
      data: {
        facilityId,
        supplierId: supplier.id, // Use the actual database ID
        name: String(data.name).trim(),
        type: data.type || 'Manufacturing',
        location: data.location || null,
      },
      include: { supplier: true },
    });

    const actorId = userId && userId !== 'system' ? userId : undefined;
    try {
      await this.audit.recordEvent({
        eventType: 'FACILITY_CREATED',
        action: 'Registered new facility',
        resourceType: 'Facility',
        resourceId: facility.id,
        actorId,
        details: `Registered facility ${facility.name} (${facility.facilityId})`,
      });
    } catch (auditErr: any) {
      this.logger.warn(`Failed to record audit event for facility ${facility.id}: ${auditErr?.message}`);
    }
    return facility;
  }

  // LOTS
  async getLots() {
    try {
      return await this.prisma.lot.findMany({ include: { supplier: true } });
    } catch (err: any) {
      this.logger.warn(`DB offline — returning empty lots list: ${err.message}`);
      return [];
    }
  }

  async createLot(data: any, userId: string) {
    // Accept supplierId from multiple field name variants
    const supplierIdentifier = data.supplierId || data.supplier_id;
    if (!supplierIdentifier) {
      throw new BadRequestException('supplierId is required');
    }
    const materialType = data.materialType || data.material_type || data.description || data.type;
    if (!materialType) {
      throw new BadRequestException('materialType is required');
    }
    const qty = Number(data.quantity || 1);
    if (!qty || qty < 1) {
      throw new BadRequestException('quantity must be a positive integer');
    }

    // Look up supplier by either ID or supplierId
    const supplier = await this.prisma.supplier.findFirst({
      where: { OR: [{ id: supplierIdentifier }, { supplierId: supplierIdentifier }] },
    });

    if (!supplier) {
      throw new BadRequestException(`Supplier ${supplierIdentifier} not found`);
    }

    // Optionally create or link to a batch
    let batchId = data.batchId || data.batch_id;
    if (batchId) {
      // Check if batch exists, if not create it
      const existingBatch = await this.prisma.batch.findFirst({
        where: { OR: [{ id: batchId }, { batchId: batchId }] },
      });
      if (!existingBatch) {
        const newBatch = await this.prisma.batch.create({
          data: {
            batchId: batchId,
            description: materialType,
            supplier: supplier.name,
          },
        });
        batchId = newBatch.id;
      } else {
        batchId = existingBatch.id;
      }
    }

    const lotId = data.lotId || data.lot_id || `LOT-${uuidv4().slice(0, 8).toUpperCase()}`;
    const lot = await this.prisma.lot.create({
      data: {
        lotId,
        supplierId: supplier.id, // Use the actual database ID
        materialType,
        quantity: qty,
        manufacturedAt: data.manufacturedDate || data.manufactured_date ? new Date(data.manufacturedDate || data.manufactured_date) : new Date(),
      },
      include: { supplier: true },
    });

    const actorId = userId && userId !== 'system' ? userId : undefined;
    try {
      await this.audit.recordEvent({
        eventType: 'LOT_CREATED',
        action: 'Created new material lot',
        resourceType: 'Lot',
        resourceId: lot.id,
        actorId,
        details: `Created lot ${lot.lotId} — ${lot.materialType} (qty: ${lot.quantity})`,
      });
    } catch (auditErr: any) {
      this.logger.warn(`Failed to record audit event for lot ${lot.id}: ${auditErr?.message}`);
    }
    return lot;
  }

  // SHIPMENTS
  async getShipments() {
    try {
      return await this.prisma.shipment.findMany({ include: { dispatchFacility: true, receiveFacility: true } });
    } catch (err: any) {
      this.logger.warn(`DB offline — returning empty shipments list: ${err.message}`);
      return [];
    }
  }

  async createShipment(data: any, userId: string) {
    // Accept both frontend naming conventions
    const dispatchIdentifier = data.dispatchFacilityId || data.dispatch_facility_id || data.originFacilityId || data.origin_facility_id;
    const receiveIdentifier = data.receiveFacilityId || data.receive_facility_id || data.destinationFacilityId || data.destination_facility_id;
    if (!dispatchIdentifier || !receiveIdentifier) {
      throw new BadRequestException('Both dispatchFacilityId and receiveFacilityId are required');
    }
    if (dispatchIdentifier === receiveIdentifier) {
      throw new BadRequestException('Origin and destination facilities must be different');
    }

    // Look up facilities by either ID or facilityId
    const dispatchFacility = await this.prisma.facility.findFirst({
      where: { OR: [{ id: dispatchIdentifier }, { facilityId: dispatchIdentifier }] },
    });
    const receiveFacility = await this.prisma.facility.findFirst({
      where: { OR: [{ id: receiveIdentifier }, { facilityId: receiveIdentifier }] },
    });

    if (!dispatchFacility) {
      throw new BadRequestException(`Dispatch facility ${dispatchIdentifier} not found`);
    }
    if (!receiveFacility) {
      throw new BadRequestException(`Receive facility ${receiveIdentifier} not found`);
    }

    const shipmentId = data.shipmentId || data.shipment_id || `SHP-${uuidv4().slice(0, 8).toUpperCase()}`;
    const shipment = await this.prisma.shipment.create({
      data: {
        shipmentId,
        dispatchFacilityId: dispatchFacility.id, // Use actual database ID
        receiveFacilityId: receiveFacility.id, // Use actual database ID
        trackingNumber: data.trackingNumber || data.tracking_number || null,
      },
      include: { dispatchFacility: true, receiveFacility: true },
    });

    const actorId = userId && userId !== 'system' ? userId : undefined;
    try {
      await this.audit.recordEvent({
        eventType: 'SHIPMENT_CREATED',
        action: 'Dispatched new shipment',
        resourceType: 'Shipment',
        resourceId: shipment.id,
        actorId,
        details: `Shipment ${shipment.shipmentId} from ${dispatchFacility.facilityId} → ${receiveFacility.facilityId}`,
      });
    } catch (auditErr: any) {
      this.logger.warn(`Failed to record audit event for shipment ${shipment.id}: ${auditErr?.message}`);
    }
    return shipment;
  }

  async dispatchShipment(id: string, userId: string) {
    const shipment = await this.prisma.shipment.update({
      where: { id },
      data: { status: 'DISPATCHED', dispatchedAt: new Date() },
    });

    const actorId = userId && userId !== 'system' ? userId : undefined;
    try {
      await this.audit.recordEvent({
        eventType: 'SHIPMENT_DISPATCHED',
        action: 'Dispatched shipment',
        resourceType: 'Shipment',
        resourceId: shipment.id,
        actorId,
        details: `Dispatched shipment ${shipment.shipmentId}`,
      });
    } catch (auditErr: any) {
      this.logger.warn(`Failed to record audit for dispatch ${shipment.id}: ${auditErr?.message}`);
    }
    return shipment;
  }

  async receiveShipment(id: string, userId: string) {
    const shipment = await this.prisma.shipment.update({
      where: { id },
      data: { status: 'RECEIVED', receivedAt: new Date() },
    });

    const actorId = userId && userId !== 'system' ? userId : undefined;
    try {
      await this.audit.recordEvent({
        eventType: 'SHIPMENT_RECEIVED',
        action: 'Received shipment',
        resourceType: 'Shipment',
        resourceId: shipment.id,
        actorId,
        details: `Received shipment ${shipment.shipmentId}`,
      });
    } catch (auditErr: any) {
      this.logger.warn(`Failed to record audit for receive ${shipment.id}: ${auditErr?.message}`);
    }
    return shipment;
  }

  // CUSTODY TRANSFERS
  async getCustodyTransfers() {
    try {
      return await this.prisma.custodyTransfer.findMany({
        include: { shipment: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err: any) {
      this.logger.warn(`DB offline — returning empty custody transfers list: ${err.message}`);
      return [];
    }
  }

  async createCustodyTransfer(data: any, userId: string) {
    const shipmentId = data.shipmentId || data.shipment_id;
    if (!shipmentId) {
      throw new BadRequestException('shipmentId is required');
    }
    const fromActorId = data.fromCustodian || data.from_custodian || userId;
    const toActorId = data.toCustodian || data.to_custodian;
    if (!toActorId) {
      throw new BadRequestException('toCustodian is required');
    }

    const custody = await this.prisma.custodyTransfer.create({
      data: {
        shipmentId,
        fromActorId,
        toActorId,
        status: 'PENDING',
      },
      include: { shipment: true },
    });

    const actorId = userId && userId !== 'system' ? userId : undefined;
    try {
      await this.audit.recordEvent({
        eventType: 'CUSTODY_TRANSFER_CREATED',
        action: 'Initiated custody transfer',
        resourceType: 'CustodyTransfer',
        resourceId: custody.id,
        actorId,
        details: `Custody transfer initiated for shipment ${shipmentId}`,
      });
    } catch (auditErr: any) {
      this.logger.warn(`Failed to record audit for custody transfer ${custody.id}: ${auditErr?.message}`);
    }
    return custody;
  }

  async acceptCustodyTransfer(id: string, userId: string) {
    const custody = await this.prisma.custodyTransfer.update({
      where: { id },
      data: { status: 'ACCEPTED', transferredAt: new Date() },
    });

    const actorId = userId && userId !== 'system' ? userId : undefined;
    try {
      await this.audit.recordEvent({
        eventType: 'CUSTODY_TRANSFER_ACCEPTED',
        action: 'Accepted custody transfer',
        resourceType: 'CustodyTransfer',
        resourceId: custody.id,
        actorId,
        details: `Custody transfer ${id} accepted`,
      });
    } catch (auditErr: any) {
      this.logger.warn(`Failed to record audit for custody accept ${custody.id}: ${auditErr?.message}`);
    }
    return custody;
  }

  async rejectCustodyTransfer(id: string, reason: string, userId: string) {
    const custody = await this.prisma.custodyTransfer.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    const actorId = userId && userId !== 'system' ? userId : undefined;
    try {
      await this.audit.recordEvent({
        eventType: 'CUSTODY_TRANSFER_REJECTED',
        action: 'Rejected custody transfer',
        resourceType: 'CustodyTransfer',
        resourceId: custody.id,
        actorId,
        details: `Custody transfer ${id} rejected: ${reason}`,
      });
    } catch (auditErr: any) {
      this.logger.warn(`Failed to record audit for custody reject ${custody.id}: ${auditErr?.message}`);
    }
    return custody;
  }

  // SUPPLY CHAIN EVENTS
  async getSupplyChainEvents(params: { entityType?: string; entityId?: string } = {}) {
    try {
      const where: any = {};
      if (params.entityType) where.entityType = params.entityType;
      if (params.entityId) where.entityId = params.entityId;

      return await this.prisma.supplyChainEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    } catch (err: any) {
      this.logger.warn(`DB offline — returning empty events list: ${err.message}`);
      return [];
    }
  }

  async createSupplyChainEvent(data: any, userId: string) {
    const event = await this.prisma.supplyChainEvent.create({
      data: {
        entityType: data.entityType || data.entity_type,
        entityId: data.entityId || data.entity_id,
        eventType: data.eventType || data.event_type,
        payload: data.payload || {},
        actorId: userId && userId !== 'system' ? userId : undefined,
      },
    });

    const actorId = userId && userId !== 'system' ? userId : undefined;
    try {
      await this.audit.recordEvent({
        eventType: 'SUPPLY_CHAIN_EVENT_CREATED',
        action: 'Recorded supply chain event',
        resourceType: 'SupplyChainEvent',
        resourceId: event.id,
        actorId,
        details: `Event ${event.eventType} for ${event.entityType}:${event.entityId}`,
      });
    } catch (auditErr: any) {
      this.logger.warn(`Failed to record audit for supply chain event ${event.id}: ${auditErr?.message}`);
    }
    return event;
  }
}
