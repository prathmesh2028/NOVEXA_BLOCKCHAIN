import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApprovalsService } from './approvals.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('ApprovalsService', () => {
  let service: ApprovalsService;
  let mockPrisma: any;
  let mockTx: any;
  let mockNotificationsService: any;

  beforeEach(() => {
    mockTx = {
      approval: {
        create: vi.fn(),
        update: vi.fn(),
      },
      auditEvent: {
        create: vi.fn(),
      },
    };

    mockPrisma = {
      asset: {
        findFirst: vi.fn(),
      },
      approval: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(mockTx)),
    };

    mockNotificationsService = {
      createNotification: vi.fn().mockResolvedValue({ id: 'notif-1' }),
    };

    service = new ApprovalsService(mockPrisma, mockNotificationsService);
  });

  describe('requestApproval', () => {
    it('should throw NotFoundException if asset does not exist', async () => {
      mockPrisma.asset.findFirst.mockResolvedValue(null);

      await expect(
        service.requestApproval({
          assetId: 'nonexistent',
          requestedById: 'user-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if duplicate pending approval exists for same stage', async () => {
      mockPrisma.asset.findFirst.mockResolvedValue({
        id: 'ast-uuid-1',
        assetId: 'BEL-RADAR-001',
      });
      mockPrisma.approval.findFirst.mockResolvedValue({
        id: 'apr-existing',
        approvalId: 'APR-2026-00001',
        status: 'PENDING',
      });

      await expect(
        service.requestApproval({
          assetId: 'ast-uuid-1',
          stage: 'QA_REVIEW',
          requestedById: 'user-1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should successfully create approval, record audit event, and send notification', async () => {
      mockPrisma.asset.findFirst.mockResolvedValue({
        id: 'ast-uuid-1',
        assetId: 'BEL-RADAR-001',
      });
      mockPrisma.approval.findFirst.mockResolvedValue(null);
      mockPrisma.approval.count.mockResolvedValue(4);

      const createdApproval = {
        id: 'apr-1',
        approvalId: 'APR-2026-00005',
        assetId: 'ast-uuid-1',
        stage: 'QA_REVIEW',
        status: 'PENDING',
      };
      mockTx.approval.create.mockResolvedValue(createdApproval);

      const result = await service.requestApproval({
        assetId: 'ast-uuid-1',
        stage: 'QA_REVIEW',
        requestedById: 'user-1',
        requestedByName: 'Alice QC',
        requestedByRole: 'TECHNICIAN',
        comments: 'Ready for final inspection sign-off',
      });

      expect(result).toEqual(createdApproval);
      expect(mockTx.approval.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            approvalId: 'APR-2026-00005',
            assetId: 'ast-uuid-1',
            stage: 'QA_REVIEW',
            status: 'PENDING',
            requestedById: 'user-1',
          }),
        }),
      );
      expect(mockTx.auditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: 'APPROVAL_REQUESTED',
            actorId: 'user-1',
            resourceType: 'Approval',
          }),
        }),
      );
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientRole: 'NFT_CREATOR',
          type: 'APPROVAL_REQUIRED',
        }),
      );
    });
  });

  describe('listApprovals', () => {
    it('should paginate and return items with total count', async () => {
      const mockList = [{ id: 'apr-1', approvalId: 'APR-2026-00001' }];
      mockPrisma.approval.findMany.mockResolvedValue(mockList);
      mockPrisma.approval.count.mockResolvedValue(1);

      const result = await service.listApprovals({
        status: 'PENDING',
        page: 1,
        pageSize: 10,
      });

      expect(result.items).toEqual(mockList);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.hasNext).toBe(false);
    });
  });

  describe('decideApproval', () => {
    it('should throw NotFoundException if approval does not exist', async () => {
      mockPrisma.approval.findUnique.mockResolvedValue(null);

      await expect(
        service.decideApproval('apr-nonexistent', {
          status: 'APPROVED',
          approverId: 'approver-1',
          approverRole: 'NFT_CREATOR',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if approval is not PENDING', async () => {
      mockPrisma.approval.findUnique.mockResolvedValue({
        id: 'apr-1',
        approvalId: 'APR-2026-00001',
        status: 'APPROVED',
      });

      await expect(
        service.decideApproval('apr-1', {
          status: 'APPROVED',
          approverId: 'approver-1',
          approverRole: 'NFT_CREATOR',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should approve successfully and notify the requester', async () => {
      mockPrisma.approval.findUnique.mockResolvedValue({
        id: 'apr-1',
        approvalId: 'APR-2026-00001',
        status: 'PENDING',
        requestedById: 'requester-1',
        stage: 'QA_REVIEW',
        asset: { assetId: 'BEL-RADAR-001' },
      });

      const updatedApproval = {
        id: 'apr-1',
        approvalId: 'APR-2026-00001',
        status: 'APPROVED',
        approverId: 'approver-1',
        approverRole: 'NFT_CREATOR',
        decidedAt: new Date(),
      };
      mockTx.approval.update.mockResolvedValue(updatedApproval);

      const result = await service.decideApproval('apr-1', {
        status: 'APPROVED',
        approverId: 'approver-1',
        approverName: 'Bob Lead',
        approverRole: 'NFT_CREATOR',
        comments: 'Signed off with digital signature',
        digitalSignature: '0xabc123...',
      });

      expect(result.status).toBe('APPROVED');
      expect(mockTx.approval.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'apr-1' },
          data: expect.objectContaining({
            status: 'APPROVED',
            approverId: 'approver-1',
            digitalSignature: '0xabc123...',
          }),
        }),
      );
      expect(mockTx.auditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: 'APPROVAL_DECIDED',
            actorId: 'approver-1',
            result: 'SUCCESS',
          }),
        }),
      );
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: 'requester-1',
          type: 'APPROVAL_DECIDED',
          severity: 'INFO',
        }),
      );
    });

    it('should reject with CRITICAL notification on rejection', async () => {
      mockPrisma.approval.findUnique.mockResolvedValue({
        id: 'apr-2',
        approvalId: 'APR-2026-00002',
        status: 'PENDING',
        requestedById: 'requester-2',
        stage: 'QC_SIGN_OFF',
        asset: { assetId: 'BEL-OPTIC-002' },
      });

      mockTx.approval.update.mockResolvedValue({
        id: 'apr-2',
        status: 'REJECTED',
      });

      await service.decideApproval('apr-2', {
        status: 'REJECTED',
        approverId: 'approver-1',
        approverRole: 'NFT_CREATOR',
        comments: 'Tolerance test failed',
      });

      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: 'requester-2',
          type: 'APPROVAL_DECIDED',
          severity: 'CRITICAL',
        }),
      );
    });
  });
});
