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
    const list = await this.prisma.supplier.findMany({
      include: { facilities: true },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((s) => this.formatSupplier(s));
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
    return this.prisma.facility.findMany({ include: { supplier: true } });
  }

  async createFacility(data: any, userId: string) {
    const supplierId = data.supplierId || data.supplier_id;
    if (!supplierId) {
      throw new BadRequestException('supplierId is required to associate the facility with a supplier');
    }
    if (!data.name || !String(data.name).trim()) {
      throw new BadRequestException('Facility name is required');
    }
    const facilityId = data.facilityId || data.facility_id || `FAC-${uuidv4().slice(0, 8).toUpperCase()}`;
    const facility = await this.prisma.facility.create({
      data: {
        facilityId,
        supplierId,
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
    return this.prisma.lot.findMany({ include: { supplier: true } });
  }

  async createLot(data: any, userId: string) {
    // Accept supplierId from multiple field name variants
    const supplierId = data.supplierId || data.supplier_id || data.facilityId || data.facility_id;
    if (!supplierId) {
      throw new BadRequestException('supplierId (or facilityId) is required');
    }
    const materialType = data.materialType || data.material_type || data.description || data.type;
    if (!materialType) {
      throw new BadRequestException('materialType is required');
    }
    const qty = Number(data.quantity || 1);
    if (!qty || qty < 1) {
      throw new BadRequestException('quantity must be a positive integer');
    }
    const lotId = data.lotId || data.lot_id || `LOT-${uuidv4().slice(0, 8).toUpperCase()}`;
    const lot = await this.prisma.lot.create({
      data: {
        lotId,
        supplierId,
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
    return this.prisma.shipment.findMany({ include: { dispatchFacility: true, receiveFacility: true } });
  }

  async createShipment(data: any, userId: string) {
    // Accept both frontend naming conventions
    const dispatchFacilityId = data.dispatchFacilityId || data.dispatch_facility_id || data.originFacilityId || data.origin_facility_id;
    const receiveFacilityId = data.receiveFacilityId || data.receive_facility_id || data.destinationFacilityId || data.destination_facility_id;
    if (!dispatchFacilityId || !receiveFacilityId) {
      throw new BadRequestException('Both originFacilityId and destinationFacilityId are required');
    }
    if (dispatchFacilityId === receiveFacilityId) {
      throw new BadRequestException('Origin and destination facilities must be different');
    }
    const shipmentId = data.shipmentId || data.shipment_id || `SHP-${uuidv4().slice(0, 8).toUpperCase()}`;
    const shipment = await this.prisma.shipment.create({
      data: {
        shipmentId,
        dispatchFacilityId,
        receiveFacilityId,
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
        details: `Shipment ${shipment.shipmentId} from ${dispatchFacilityId} → ${receiveFacilityId}`,
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
}
