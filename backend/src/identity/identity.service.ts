import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import * as crypto from 'crypto';

/**
 * Identity Service — DID management (did:web) and W3C VC 2.0 credential operations.
 * 
 * LIMITATION: did:web resolution is prototype-only in this version.
 * Full resolution requires a publicly accessible web server to host DID documents.
 */
@Injectable()
export class IdentityService {
  private readonly logger = new Logger(IdentityService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a DID for an actor.
   * Method: did:web
   */
  async createDid(actorId: string, domain: string = 'kavachtrust.bel.in'): Promise<string> {
    const actor = await this.prisma.actor.findUnique({ where: { id: actorId } });
    if (!actor) throw new Error(`Actor ${actorId} not found`);

    const did = `did:web:${domain}:actor:${actorId.slice(0, 8)}`;
    const keys = this.generateEd25519KeyPair();
    const keyId = `${did}#key-1`;

    await this.prisma.dIDDocument.create({
      data: {
        actorId,
        did,
        document: {
          '@context': [
            'https://www.w3.org/ns/did/v1',
            'https://w3id.org/security/suites/ed25519-2020/v1'
          ],
          id: did,
          verificationMethod: [
            {
              id: keyId,
              type: 'Ed25519VerificationKey2020',
              controller: did,
              publicKeyMultibase: keys.publicKey // Simplification, multibase encoding would be proper here
            }
          ],
          authentication: [keyId],
          assertionMethod: [keyId],
        },
      },
    });

    await this.prisma.actor.update({
      where: { id: actorId },
      data: { 
        did,
        publicKey: keys.publicKey
      },
    });

    return did;
  }

  /**
   * Generate an Ed25519 KeyPair for a DID.
   * Returns base64 encoded public and private keys.
   */
  generateEd25519KeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
    
    return {
      publicKey: publicKey.export({ type: 'spki', format: 'der' }).toString('base64'),
      privateKey: privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64'),
    };
  }

  /**
   * Issue a W3C VC 2.0-shaped credential.
   * 
   * NOTE: This produces VC 2.0-shaped JSON but does NOT claim full W3C standards compliance.
   * Ed25519 proof generation would require proper key management in production.
   */
  async issueCredential(params: {
    actorId: string;
    type: string;
    issuerDid: string;
    subjectDid: string;
    claims: Record<string, any>;
    validUntil?: Date;
  }) {
    const credential = await this.prisma.credential.create({
      data: {
        actorId: params.actorId,
        type: params.type,
        issuer: params.issuerDid,
        subject: params.subjectDid,
        validFrom: new Date(),
        validUntil: params.validUntil,
        credentialSubject: {
          id: params.subjectDid,
          ...params.claims,
        },
        credentialStatus: 'VERIFIED',
        proof: {
          type: 'Ed25519Signature2020',
          created: new Date().toISOString(),
          proofPurpose: 'assertionMethod',
          verificationMethod: `${params.issuerDid}#key-1`,
          // NOTE: Actual Ed25519 signature would be generated here in production
          proofValue: 'SIMULATED_PROOF_VALUE',
        },
      },
    });

    return credential;
  }
}
