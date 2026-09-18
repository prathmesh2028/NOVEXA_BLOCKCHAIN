import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as casbin from 'casbin';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class CasbinService implements OnModuleInit {
  private enforcer!: casbin.Enforcer;
  private readonly logger = new Logger(CasbinService.name);

  async onModuleInit() {
    try {
      const candidateModelPaths = [
        path.resolve(__dirname, 'model.conf'),
        path.resolve(process.cwd(), 'src/core/casbin/model.conf'),
        path.resolve(process.cwd(), 'backend/src/core/casbin/model.conf'),
        path.resolve(__dirname, '../../src/core/casbin/model.conf'),
        path.resolve(__dirname, '../../../src/core/casbin/model.conf'),
      ];
      const candidatePolicyPaths = [
        path.resolve(__dirname, 'policy.csv'),
        path.resolve(process.cwd(), 'src/core/casbin/policy.csv'),
        path.resolve(process.cwd(), 'backend/src/core/casbin/policy.csv'),
        path.resolve(__dirname, '../../src/core/casbin/policy.csv'),
        path.resolve(__dirname, '../../../src/core/casbin/policy.csv'),
      ];

      const modelFile = candidateModelPaths.find(p => fs.existsSync(p));
      const policyFile = candidatePolicyPaths.find(p => fs.existsSync(p));

      if (!modelFile || !policyFile) {
        throw new Error(`Casbin policy or model file not found in paths: ${candidateModelPaths.join(', ')}`);
      }

      this.enforcer = await casbin.newEnforcer(modelFile, policyFile);
      this.logger.log('Casbin enforcer initialized successfully');
    } catch (error: any) {
      this.logger.error('Failed to initialize Casbin enforcer', error.message);
      if (process.env.APP_ENV === 'demo') {
        this.logger.warn('Running without Casbin in demo mode due to missing files.');
      } else {
        throw error;
      }
    }
  }

  /**
   * Check if the user with the given roles is allowed to access the resource with the action
   */
  async checkPermission(roles: string[], obj: string, act: string): Promise<boolean> {
    // CRITICAL: Fail closed, not open. No enforcer = deny by default.
    if (!this.enforcer) {
      this.logger.error('Casbin enforcer not initialized — denying access (fail closed)');
      return false;
    }
    for (const role of roles) {
      const allowed = await this.enforcer.enforce(role, obj, act);
      if (allowed) {
        return true;
      }
    }
    return false;
  }
}
