const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src', 'pages');

const commonModules = [
  'dashboard',
  'delegations',
  'documents',
  'minutes',
  'partners',
  'schedule',
  'tasks'
];

const roles = ['staff', 'manager', 'director', 'admin'];

// 1. Create target directories
roles.forEach(role => {
  const roleDir = path.join(srcDir, role);
  if (!fs.existsSync(roleDir)) {
    fs.mkdirSync(roleDir, { recursive: true });
  }

  // Handle common modules
  commonModules.forEach(mod => {
    const sourceModDir = path.join(srcDir, mod);
    if (!fs.existsSync(sourceModDir)) return;

    const destModDir = path.join(roleDir, mod);
    if (!fs.existsSync(destModDir)) {
      copyDirectory(sourceModDir, destModDir);
    }
  });

  // Handle notifications specific to staff
  if (role === 'staff') {
    const notifyDir = path.join(srcDir, 'notifications');
    if (fs.existsSync(notifyDir)) {
        copyDirectory(notifyDir, path.join(roleDir, 'notifications'));
    }
  }
});

// Helper to deep copy folders
function copyDirectory(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 2. Remove old folders
commonModules.forEach(mod => {
  const dir = path.join(srcDir, mod);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
});

if (fs.existsSync(path.join(srcDir, 'notifications'))) {
    fs.rmSync(path.join(srcDir, 'notifications'), { recursive: true, force: true });
}

console.log("Files copied and old modules removed successfully.");
