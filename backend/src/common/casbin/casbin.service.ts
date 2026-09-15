import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as casbin from 'casbin';
import * as path from 'path';
import * as fs from 'fs';

const DEFAULT_MODEL = `[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && keyMatch(r.obj, p.obj) && regexMatch(r.act, p.act)
`;

const DEFAULT_POLICY = `p, ADMIN, /*, (GET)|(POST)|(PUT)|(DELETE)|(PATCH)
p, NFT_CREATOR, /api/v1/certifications*, (GET)|(POST)
p, NFT_CREATOR, /api/v1/assets*, GET
p, NFT_CREATOR, /api/v1/evidence*, GET
p, TECHNICIAN, /api/v1/assets*, (GET)|(POST)|(PUT)
p, TECHNICIAN, /api/v1/batches*, GET
p, TECHNICIAN, /api/v1/evidence*, (GET)|(POST)
p, TECHNICIAN, /api/v1/inspections*, (GET)|(POST)
p, TECHNICIAN, /api/v1/lifecycle*, (GET)|(POST)
p, AUDITOR, /*, GET

g, ADMIN, ROLE_ADMIN
g, NFT_CREATOR, ROLE_NFT_CREATOR
g, TECHNICIAN, ROLE_TECHNICIAN
g, AUDITOR, ROLE_AUDITOR
`;

@Injectable()
export class CasbinService implements OnModuleInit {
  private enforcer!: casbin.Enforcer;
  private readonly logger = new Logger(CasbinService.name);

  async onModuleInit() {
    try {
      const candidateModelPaths = [
        path.resolve(__dirname, 'model.conf'),
        path.resolve(process.cwd(), 'src/common/casbin/model.conf'),
        path.resolve(process.cwd(), 'backend/src/common/casbin/model.conf')
      ];
      const candidatePolicyPaths = [
        path.resolve(__dirname, 'policy.csv'),
        path.resolve(process.cwd(), 'src/common/casbin/policy.csv'),
        path.resolve(process.cwd(), 'backend/src/common/casbin/policy.csv')
      ];

      const modelFile = candidateModelPaths.find(p => fs.existsSync(p));
      const policyFile = candidatePolicyPaths.find(p => fs.existsSync(p));

      const modelText = modelFile ? fs.readFileSync(modelFile, 'utf-8') : DEFAULT_MODEL;
      const policyText = policyFile ? fs.readFileSync(policyFile, 'utf-8') : DEFAULT_POLICY;

      const model = casbin.newModelFromString(modelText);
      const adapter = new casbin.StringAdapter(policyText);
      this.enforcer = await casbin.newEnforcer(model, adapter);
      this.logger.log('Casbin enforcer initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Casbin enforcer, falling back to default inline model', error);
      const model = casbin.newModelFromString(DEFAULT_MODEL);
      const adapter = new casbin.StringAdapter(DEFAULT_POLICY);
      this.enforcer = await casbin.newEnforcer(model, adapter);
    }
  }

  /**
   * Check if the user with the given roles is allowed to access the resource with the action
   */
  async checkPermission(roles: string[], obj: string, act: string): Promise<boolean> {
    if (!this.enforcer) return true;
    for (const role of roles) {
      const allowed = await this.enforcer.enforce(role, obj, act);
      if (allowed) {
        return true;
      }
    }
    return false;
  }
}
