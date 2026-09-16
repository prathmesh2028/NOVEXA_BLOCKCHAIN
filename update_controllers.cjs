const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.controller.ts')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Change controller prefix
  if (content.match(/@Controller\('([^a][^p][^i].*)'\)/)) {
    content = content.replace(/@Controller\('([^']+)'\)/g, (match, p1) => {
      if (p1.startsWith('api/v1/')) return match;
      return `@Controller('api/v1/${p1}')`;
    });
    changed = true;
  }

  // Update imports
  if (content.includes('roles.guard')) {
    content = content.replace(
      /import \{ RolesGuard, RequireRoles \} from '[^']+roles\.guard';\n/,
      "import { CasbinGuard, CasbinPolicy } from '../auth/guards/casbin.guard';\n"
    );
    changed = true;
  }
  
  if (content.includes('RolesGuard') && !content.includes('casbin.guard')) {
    content = content.replace(
      /import \{ RolesGuard, RequireRoles \} from '[^']+roles\.guard';\n/,
      "import { CasbinGuard, CasbinPolicy } from '../../auth/guards/casbin.guard';\n" // Just in case of different nest depth
    );
    changed = true;
  }

  // Ensure JwtAuthGuard, CasbinGuard in Controller-level UseGuards
  if (content.includes('@UseGuards(') && !content.includes('@UseGuards(JwtAuthGuard, CasbinGuard)')) {
    content = content.replace(/@UseGuards\(JwtAuthGuard\)/g, '@UseGuards(JwtAuthGuard, CasbinGuard)');
    changed = true;
  }

  // Replace @UseGuards(RolesGuard) and @RequireRoles(...) with @CasbinPolicy(url, method)
  // This is tricky because we don't necessarily know the URL or method if it's dynamic.
  // BUT we don't strictly need @CasbinPolicy if we let the CasbinGuard default to req.route.path and req.method.
  // Let's just remove @UseGuards(RolesGuard) and @RequireRoles(...) entirely.
  if (content.includes('@UseGuards(RolesGuard)')) {
    content = content.replace(/\s*@UseGuards\(RolesGuard\)\n/g, '\n');
    content = content.replace(/\s*@RequireRoles\([^)]+\)\n/g, '\n');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

processDir(path.join(__dirname, 'backend', 'src'));
