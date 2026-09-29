import { Module } from '@nestjs/common';
import { IdentityService } from './identity.service';

/**
 * IdentityModule — DID management (did:web) and W3C VC 2.0 credential issuance.
 *
 * @deprecated UNUSED SCAFFOLD — as of the Part A review (2026-09-19), IdentityService
 * has no controller and is not called by any other service. IdentityModule is imported
 * by AppModule but none of its exports are consumed. This module is preserved because
 * the underlying schema models (Actor, DIDDocument, Credential) are valid and the
 * implementation is functional, but it is NOT currently wired into any request path.
 *
 * Before making any changes to this module:
 *   (a) If integrating DID issuance into the user provisioning flow → add a controller
 *       and route it through Part A, then remove this deprecation notice.
 *   (b) If DID/VC is out of scope → delete this module and the corresponding
 *       IdentityService, and remove the import from AppModule.
 *
 * Do not silently wire up or silently delete without an explicit team decision.
 */
@Module({ providers: [IdentityService], exports: [IdentityService] })
export class IdentityModule {}
