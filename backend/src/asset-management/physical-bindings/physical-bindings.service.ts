import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class PhysicalBindingsService {
  private readonly logger = new Logger(PhysicalBindingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  private mapBinding(b: any) {
    return {
      id: b.id,
      asset_id: b.assetId,
      binding_type: b.bindingType,
      identifier: b.identifier,
      metadata: b.metadata,
      created_at: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
      asset: b.asset ? {
        id: b.asset.id,
        asset_id: b.asset.assetId,
        type: b.asset.type,
        model: b.asset.model,
      } : undefined,
    };
  }

  async createBinding(data: {
    assetId: string;
    bindingType: string;
    identifier: string;
    metadata?: any;
    actorId?: string;
    actorName?: string;
  }) {
    if (!data.assetId || !data.bindingType || !data.identifier) {
      throw new BadRequestException('asset_id, binding_type, and identifier are required');
    }

    // Resolve asset by primary key or business assetId
    let asset = await this.prisma.asset.findUnique({ where: { id: data.assetId } });
    if (!asset) {
      asset = await this.prisma.asset.findUnique({ where: { assetId: data.assetId } });
    }
    if (!asset) {
      throw new NotFoundException(`Asset ${data.assetId} not found`);
    }

    // Check for duplicate binding
    const existing = await this.prisma.physicalBinding.findFirst({
      where: {
        assetId: asset.id,
        bindingType: data.bindingType,
        identifier: data.identifier,
      },
    });
    if (existing) {
      throw new ConflictException(`Physical binding already exists for this asset with identifier: ${data.identifier}`);
    }

    const binding = await this.prisma.$transaction(async (tx) => {
      const created = await tx.physicalBinding.create({
        data: {
          assetId: asset.id,
          bindingType: data.bindingType,
          identifier: data.identifier,
          metadata: data.metadata || null,
        },
        include: { asset: true },
      });

      await this.auditService.recordEvent(
        {
          eventType: 'PHYSICAL_BINDING_CREATED',
          actorId: data.actorId,
          actorName: data.actorName,
          action: `Physical binding attached — ${data.bindingType}:${data.identifier}`,
          resourceType: 'PhysicalBinding',
          resourceId: created.id,
          result: 'SUCCESS',
          details: `Type: ${data.bindingType} | Identifier: ${data.identifier} | Asset: ${asset.assetId}`,
        },
        tx,
      );

      return created;
    });

    return this.mapBinding(binding);
  }

  async listBindings(assetId?: string) {
    const where: any = {};
    if (assetId) {
      // Find asset by id or business assetId
      const asset = await this.prisma.asset.findFirst({
        where: { OR: [{ id: assetId }, { assetId }] },
      });
      if (asset) {
        where.assetId = asset.id;
      } else {
        where.assetId = assetId;
      }
    }

    const items = await this.prisma.physicalBinding.findMany({
      where,
      include: { asset: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      items: items.map((b) => this.mapBinding(b)),
      total: items.length,
    };
  }

  async getBinding(id: string) {
    const binding = await this.prisma.physicalBinding.findUnique({
      where: { id },
      include: { asset: true },
    });
    if (!binding) {
      throw new NotFoundException(`Physical binding ${id} not found`);
    }
    return this.mapBinding(binding);
  }

  async deleteBinding(id: string, actorId?: string, actorName?: string) {
    const binding = await this.prisma.physicalBinding.findUnique({
      where: { id },
      include: { asset: true },
    });
    if (!binding) {
      throw new NotFoundException(`Physical binding ${id} not found`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.physicalBinding.delete({ where: { id } });

      await this.auditService.recordEvent(
        {
          eventType: 'PHYSICAL_BINDING_DELETED',
          actorId,
          actorName,
          action: `Physical binding detached — ${binding.bindingType}:${binding.identifier}`,
          resourceType: 'PhysicalBinding',
          resourceId: id,
          result: 'SUCCESS',
          details: `Deleted binding ${binding.bindingType}:${binding.identifier} from asset ${binding.asset?.assetId || binding.assetId}`,
        },
        tx,
      );
    });

    return { success: true, id };
  }
}
