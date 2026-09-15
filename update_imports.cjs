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

  if (content.includes('CasbinGuard') && !content.includes('import { CasbinGuard')) {
    // We need to add the import. Find the JwtAuthGuard import and add it there or below it.
    if (content.includes('jwt-auth.guard')) {
      content = content.replace(
        /import \{ JwtAuthGuard \} from '([^']+jwt-auth\.guard)';/,
        "import { JwtAuthGuard } from '$1';\nimport { CasbinGuard, CasbinPolicy } from '../auth/guards/casbin.guard';"
      );
      changed = true;
    } else {
      // Just add it at the top
      content = "import { CasbinGuard, CasbinPolicy } from '../auth/guards/casbin.guard';\n" + content;
      changed = true;
    }
  }

  // Fix path depth if needed
  if (content.includes("import { CasbinGuard, CasbinPolicy } from '../auth/guards/casbin.guard';") && 
      (filePath.includes('\\auth\\') || filePath.includes('/auth/'))) {
    content = content.replace(
      "import { CasbinGuard, CasbinPolicy } from '../auth/guards/casbin.guard';",
      "import { CasbinGuard, CasbinPolicy } from './guards/casbin.guard';"
    );
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed import in ${filePath}`);
  }
}

processDir(path.join(__dirname, 'backend', 'src'));
