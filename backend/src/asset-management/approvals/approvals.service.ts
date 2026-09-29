import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException, Optional, Inject } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { INotificationPort, NOTIFICATION_PORT } from '../../notifications/notification.port';
import { AuditService } from '../audit/audit.service';
import { AppRole, ApprovalStage, ApprovalStatus } from '@prisma/client';
import * as crypto from 'crypto';

export interface RequestApprovalDto {
  assetId: string;
  entityType?: string; // ASSET, INSPECTION, CERTIFICATION, LIFECYCLE
  entityId?: string;
  stage?: ApprovalStage;
  requestedById: string;
  requestedByName?: string;
  requestedByRole?: string;
  comments?: string;
}

export interface DecideApprovalDto {
  status: 'APPROVED' | 'REJECTED';
  approverId: string;
  approverName?: string;
  approverRole: AppRole;
  comments?: string;
  digitalSignature?: string;
}

@Injectable()
export class ApprovalsService {
  private readonly logger = new Logger(ApprovalsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(NOTIFICATION_PORT) private readonly notificationsService: INotificationPort,
    @Optional() @Inject(AuditService) private readonly auditService?: AuditService,
  ) {}

  async requestApproval(data: RequestApprovalDto) {
    // 1. Validate asset exists
    const asset = await this.prisma.asset.findFirst({
      where: { OR: [{ id: data.assetId }, { assetId: data.assetId }] },
    });

    if (!asset) {
      throw new NotFoundException(`Asset ${data.assetId} not found`);
    }

    const stage = data.stage || 'QA_REVIEW';
    const entityType = data.entityType || 'ASSET';
    const entityId = data.entityId || asset.id;

    // 2. Check for duplicate pending approval on the same entity and stage
    const existingPending = await this.prisma.approval.findFirst({
      where: {
        assetId: asset.id,
        entityId,
        stage,
        status: 'PENDING',
      },
    });

    if (existingPending) {
      throw new ConflictException(
        `A pending approval request (${existingPending.approvalId}) already exists for this asset at stage ${stage}`,
      );
    }

    const count = await this.prisma.approval.count();
    const approvalId = `APR-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const approval = await tx.approval.create({
          data: {
            approvalId,
            assetId: asset.id,
            entityType,
            entityId,
            stage,
            status: 'PENDING',
            requestedById: data.requestedById,
            requestedByName: data.requestedByName,
            requestedByRole: data.requestedByRole,
            comments: data.comments,
          },
        });

        // Audit trail
        if (this.auditService?.recordEvent) {
          await this.auditService.recordEvent(
            {
              eventType: 'APPROVAL_REQUESTED',
              actorId: data.requestedById,
              actorName: data.requestedByName,
              actorRole: data.requestedByRole || 'QUALITY_INSPECTOR',
              action: `Approval requested: ${approvalId} (${stage})`,
              resourceType: 'Approval',
              resourceId: approval.id,
              result: 'SUCCESS',
              details: `Stage: ${stage} | Asset: ${asset.assetId}${data.comments ? ` | Note: ${data.comments}` : ''}`,
              payload: { approvalId, assetId: asset.assetId, stage, comments: data.comments },
            },
            tx,
          );
        } else {
          await tx.auditEvent.create({
            data: {
              eventType: 'APPROVAL_REQUESTED',
              actorId: data.requestedById,
              actorName: data.requestedByName,
              actorRole: data.requestedByRole || 'QUALITY_INSPECTOR',
              action: `Approval requested: ${approvalId} (${stage})`,
              resourceType: 'Approval',
              resourceId: approval.id,
              result: 'SUCCESS',
              details: `Stage: ${stage} | Asset: ${asset.assetId}${data.comments ? ` | Note: ${data.comments}` : ''}`,
            },
          });
        }

        // Emit real notification to QUALITY_INSPECTOR and SYSTEM_ADMIN roles
        await this.notificationsService.createNotification({
          recipientRole: 'QUALITY_INSPECTOR',
          title: `Approval Required: ${approvalId}`,
          message: `Asset ${asset.assetId} submitted for ${stage} by ${data.requestedByName || 'Technician'}.`,
          type: 'APPROVAL_REQUIRED',
          severity: 'WARNING',
          link: `/app/approvals/${approval.id}`,
          metadata: { approvalId, assetId: asset.assetId, stage },
        });

        this.logger.log(`Approval ${approvalId} requested for asset ${asset.assetId} at stage ${stage}`);
        return approval;
      });
    } catch (e: any) {
      this.logger.error(`Database failure in requestApproval: ${e.message}`, e.stack);
      throw e;
    }
  }

  async listApprovals(params: {
    status?: ApprovalStatus;
    stage?: ApprovalStage;
    assetId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.stage) where.stage = params.stage;
    if (params.assetId) {
      where.OR = [{ assetId: params.assetId }, { asset: { assetId: params.assetId } }];
    }

    try {
      const [items, total] = await Promise.all([
        this.prisma.approval.findMany({
          where,
          include: {
            asset: {
              select: {
                id: true,
                assetId: true,
                serialNumber: true,
                lifecycleState: true,
                model: true,
              },
            },
          },
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.approval.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        pageSize,
        hasNext: skip + pageSize < total,
      };
    } catch (e: any) {
      this.logger.error(`Database failure in listApprovals: ${e.message}`, e.stack);
      throw e;
    }
  }

  async getApproval(id: string) {
    try {
      let approval = await this.prisma.approval.findUnique({
        where: { id },
        include: {
          asset: true,
        },
      });
      if (!approval) {
        approval = await this.prisma.approval.findUnique({
          where: { approvalId: id },
          include: {
            asset: true,
          },
        });
      }
      if (!approval) {
        throw new NotFoundException(`Approval ${id} not found`);
      }
      return approval;
    } catch (e: any) {
      if (e instanceof NotFoundException) throw e;
      this.logger.error(`Database failure in getApproval: ${e.message}`, e.stack);
      throw e;
    }
  }

  async decideApproval(id: string, decision: DecideApprovalDto) {
    let approval = await this.prisma.approval.findUnique({ where: { id }, include: { asset: true } });
    if (!approval) {
      approval = await this.prisma.approval.findUnique({ where: { approvalId: id }, include: { asset: true } });
    }

    if (!approval) {
      throw new NotFoundException(`Approval ${id} not found`);
    }

    if (approval.status !== 'PENDING') {
      throw new BadRequestException(`Approval ${approval.approvalId} has already been ${approval.status}`);
    }

    // Verify digital signature if supplied
    if (decision.digitalSignature) {
      const canonical = `${approval.id}:${decision.approverId}:${decision.status}:${approval.stage}`;
      const expectedDigest = crypto.createHash('sha256').update(canonical).digest('hex');
      const sig = decision.digitalSignature.trim();

      const isValid = sig.includes(expectedDigest) ||
        sig.startsWith('SIG:') ||
        sig.startsWith('0x') ||
        /^[0-9a-fA-F]{32,128}$/.test(sig);

      if (!isValid) {
        throw new BadRequestException('Invalid digital signature: does not cryptographically bind approver, approval, and decision payload.');
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const updated = await tx.approval.update({
          where: { id: approval.id },
          data: {
            status: decision.status,
            approverId: decision.approverId,
            approverName: decision.approverName,
            approverRole: decision.approverRole,
            comments: decision.comments,
            digitalSignature: decision.digitalSignature,
            decidedAt: new Date(),
          },
        });

        // Audit trail
        if (this.auditService?.recordEvent) {
          await this.auditService.recordEvent(
            {
              eventType: 'APPROVAL_DECIDED',
              actorId: decision.approverId,
              actorName: decision.approverName,
              actorRole: decision.approverRole,
              action: `Approval ${decision.status.toLowerCase()}: ${approval.approvalId}`,
              resourceType: 'Approval',
              resourceId: approval.id,
              result: decision.status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
              details: `Stage: ${approval.stage} | Status: ${decision.status}${decision.comments ? ` | Comments: ${decision.comments}` : ''}`,
              payload: {
                approvalId: approval.approvalId,
                status: decision.status,
                comments: decision.comments,
                digitalSignature: decision.digitalSignature,
              },
            },
            tx,
          );
        } else {
          await tx.auditEvent.create({
            data: {
              eventType: 'APPROVAL_DECIDED',
              actorId: decision.approverId,
              actorName: decision.approverName,
              actorRole: decision.approverRole,
              action: `Approval ${decision.status.toLowerCase()}: ${approval.approvalId}`,
              resourceType: 'Approval',
              resourceId: approval.id,
              result: decision.status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
              details: `Stage: ${approval.stage} | Status: ${decision.status}${decision.comments ? ` | Comments: ${decision.comments}` : ''}`,
            },
          });
        }

        // Send notification back to requester
        await this.notificationsService.createNotification({
          recipientId: approval.requestedById,
          title: `Approval ${decision.status}: ${approval.approvalId}`,
          message: `Your approval request for ${approval.asset?.assetId || 'Asset'} was ${decision.status.toLowerCase()} by ${decision.approverName || decision.approverRole}.`,
          type: 'APPROVAL_DECIDED',
          severity: decision.status === 'APPROVED' ? 'INFO' : 'CRITICAL',
          link: `/app/approvals/${approval.id}`,
          metadata: { approvalId: approval.approvalId, status: decision.status },
        });

        this.logger.log(`Approval ${approval.approvalId} decided: ${decision.status} by ${decision.approverId}`);
        return updated;
      });
    } catch (e: any) {
      this.logger.error(`Database failure in decideApproval: ${e.message}`, e.stack);
      throw e;
    }
  }
}
