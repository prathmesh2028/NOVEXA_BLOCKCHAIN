import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IdentityService } from './identity.service';

describe('IdentityService', () => {
  let identityService: IdentityService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      actor: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      dIDDocument: {
        create: vi.fn(),
      },
      credential: {
        create: vi.fn(),
      },
    };
    identityService = new IdentityService(mockPrisma);
  });

  describe('createDid', () => {
    it('should create a did:web identifier and store document', async () => {
      mockPrisma.actor.findUnique.mockResolvedValue({ id: '12345678-abcd-ef00-1122-334455667788', name: 'Inspector' });
      mockPrisma.dIDDocument.create.mockResolvedValue({});
      mockPrisma.actor.update.mockResolvedValue({});

      const did = await identityService.createDid('12345678-abcd-ef00-1122-334455667788', 'kavachtrust.bel.in');

      expect(did).toBe('did:web:kavachtrust.bel.in:actor:12345678');
      expect(mockPrisma.dIDDocument.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actorId: '12345678-abcd-ef00-1122-334455667788',
          did: 'did:web:kavachtrust.bel.in:actor:12345678',
          document: expect.objectContaining({
            id: 'did:web:kavachtrust.bel.in:actor:12345678',
          }),
        }),
      });
      expect(mockPrisma.actor.update).toHaveBeenCalledWith({
        where: { id: '12345678-abcd-ef00-1122-334455667788' },
        data: { did: 'did:web:kavachtrust.bel.in:actor:12345678' },
      });
    });

    it('should throw error if actor is not found', async () => {
      mockPrisma.actor.findUnique.mockResolvedValue(null);

      await expect(identityService.createDid('nonexistent')).rejects.toThrow('Actor nonexistent not found');
    });
  });

  describe('issueCredential', () => {
    it('should produce W3C VC 2.0-shaped credential document', async () => {
      const mockCreated = { id: 'cred-1', type: 'QualityInspectorCredential' };
      mockPrisma.credential.create.mockResolvedValue(mockCreated);

      const result = await identityService.issueCredential({
        actorId: 'act-1',
        type: 'QualityInspectorCredential',
        issuerDid: 'did:web:kavachtrust.bel.in:actor:admin',
        subjectDid: 'did:web:kavachtrust.bel.in:actor:inspector',
        claims: { certificationLevel: 'Level-3', clearance: 'RESTRICTED' },
      });

      expect(result).toEqual(mockCreated);
      expect(mockPrisma.credential.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actorId: 'act-1',
          type: 'QualityInspectorCredential',
          issuer: 'did:web:kavachtrust.bel.in:actor:admin',
          subject: 'did:web:kavachtrust.bel.in:actor:inspector',
          credentialStatus: 'VERIFIED',
          credentialSubject: expect.objectContaining({
            id: 'did:web:kavachtrust.bel.in:actor:inspector',
            certificationLevel: 'Level-3',
          }),
          proof: expect.objectContaining({
            type: 'Ed25519Signature2020',
          }),
        }),
      });
    });
  });
});
