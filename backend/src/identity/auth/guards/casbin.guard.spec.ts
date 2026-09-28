import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CasbinGuard } from './casbin.guard';
import { ForbiddenException } from '@nestjs/common';

describe('CasbinGuard (Fine-Grained RBAC)', () => {
  let guard: CasbinGuard;
  let mockReflector: any;
  let mockCasbinService: any;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: vi.fn(),
    };
    mockCasbinService = {
      checkPermission: vi.fn(),
    };
    guard = new CasbinGuard(mockReflector, mockCasbinService);
  });

  function createMockContext(user: any, method = 'GET', path = '/api/v1/assets') {
    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          method,
          route: { path },
        }),
      }),
    } as any;
  }

  it('should throw ForbiddenException if user is not present or has no roles', async () => {
    const context = createMockContext(null);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new ForbiddenException('User has no roles assigned for this action'),
    );
  });

  it('should allow access when Casbin enforcer approves the role and resource action', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(null);
    mockCasbinService.checkPermission.mockResolvedValue(true);

    const context = createMockContext({
      sub: 'user-1',
      roles: ['ADMIN'],
    }, 'GET', '/api/v1/assets');

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(mockCasbinService.checkPermission).toHaveBeenCalledWith(
      ['ADMIN', 'ROLE_ADMIN'],
      '/api/v1/assets',
      'GET',
    );
  });

  it('should reject access and throw ForbiddenException when Casbin denies permission', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(null);
    mockCasbinService.checkPermission.mockResolvedValue(false);

    const context = createMockContext({
      sub: 'user-2',
      roles: ['AUDITOR'],
    }, 'POST', '/api/v1/approvals');

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    expect(mockCasbinService.checkPermission).toHaveBeenCalledWith(
      ['AUDITOR', 'ROLE_AUDITOR'],
      '/api/v1/approvals',
      'POST',
    );
  });
});
