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

  // SUPPLIERS
  async getSuppliers() {
    return this.prisma.supplier.findMany({ include: { facilities: true } });
  }

  async getSupplier(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: { facilities: true, lots: true },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async createSupplier(data: { name: string; contactInfo?: any }, userId: string) {
    const supplierId = `SUP-${uuidv4().slice(0, 8).toUpperCase()}`;
    const supplier = await this.prisma.supplier.create({
      data: { supplierId, name: data.name, contactInfo: data.contactInfo },
    });

    await this.audit.recordEvent({
      eventType: 'SUPPLIER_CREATED',
      action: 'Registered new supplier',
      resourceType: 'Supplier',
      resourceId: supplier.id,
      actorId: userId,
      details: `Registered supplier ${supplier.name}`,
    });
    return supplier;
  }

  // FACILITIES
  async getFacilities() {
    return this.prisma.facility.findMany({ include: { supplier: true } });
  }

  async createFacility(data: { supplierId: string; name: string; type: string; location?: string }, userId: string) {
    const facilityId = `FAC-${uuidv4().slice(0, 8).toUpperCase()}`;
    const facility = await this.prisma.facility.create({
      data: { facilityId, supplierId: data.supplierId, name: data.name, type: data.type, location: data.location },
    });

    await this.audit.recordEvent({
      eventType: 'FACILITY_CREATED',
      action: 'Registered new facility',
      resourceType: 'Facility',
      resourceId: facility.id,
      actorId: userId,
      details: `Registered facility ${facility.name}`,
    });
    return facility;
  }

  // LOTS
  async getLots() {
    return this.prisma.lot.findMany({ include: { supplier: true } });
  }

  async createLot(data: { supplierId: string; materialType: string; quantity: number }, userId: string) {
    const lotId = `LOT-${uuidv4().slice(0, 8).toUpperCase()}`;
    const lot = await this.prisma.lot.create({
      data: { lotId, supplierId: data.supplierId, materialType: data.materialType, quantity: data.quantity, manufacturedAt: new Date() },
    });

    await this.audit.recordEvent({
      eventType: 'LOT_CREATED',
      action: 'Registered new lot',
      resourceType: 'Lot',
      resourceId: lot.id,
      actorId: userId,
      details: `Registered lot ${lot.lotId}`,
    });
    return lot;
  }

  // SHIPMENTS
  async getShipments() {
    return this.prisma.shipment.findMany({ include: { dispatchFacility: true, receiveFacility: true } });
  }

  async createShipment(data: { dispatchFacilityId: string; receiveFacilityId: string; trackingNumber?: string }, userId: string) {
    const shipmentId = `SHP-${uuidv4().slice(0, 8).toUpperCase()}`;
    const shipment = await this.prisma.shipment.create({
      data: { shipmentId, dispatchFacilityId: data.dispatchFacilityId, receiveFacilityId: data.receiveFacilityId, trackingNumber: data.trackingNumber },
    });

    await this.audit.recordEvent({
      eventType: 'SHIPMENT_CREATED',
      action: 'Created new shipment',
      resourceType: 'Shipment',
      resourceId: shipment.id,
      actorId: userId,
      details: `Created shipment ${shipment.shipmentId}`,
    });
    return shipment;
  }

  async dispatchShipment(id: string, userId: string) {
    const shipment = await this.prisma.shipment.update({
      where: { id },
      data: { status: 'DISPATCHED', dispatchedAt: new Date() },
    });
    
    await this.audit.recordEvent({
      eventType: 'SHIPMENT_DISPATCHED',
      action: 'Dispatched shipment',
      resourceType: 'Shipment',
      resourceId: shipment.id,
      actorId: userId,
      details: `Dispatched shipment ${shipment.shipmentId}`,
    });
    return shipment;
  }

  async receiveShipment(id: string, userId: string) {
    const shipment = await this.prisma.shipment.update({
      where: { id },
      data: { status: 'RECEIVED', receivedAt: new Date() },
    });
    
    await this.audit.recordEvent({
      eventType: 'SHIPMENT_RECEIVED',
      action: 'Received shipment',
      resourceType: 'Shipment',
      resourceId: shipment.id,
      actorId: userId,
      details: `Received shipment ${shipment.shipmentId}`,
    });
    return shipment;
  }
}
