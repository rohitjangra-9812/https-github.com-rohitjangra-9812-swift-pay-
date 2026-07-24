const fs = require('fs');
let code = fs.readFileSync('src/components/MockAdminDashboard.tsx', 'utf-8');

code = code.replace(
  'console.error("Failed to load server diagnostic status:", err);',
  '// console.error("Failed to load server diagnostic status:", err);'
);

fs.writeFileSync('src/components/MockAdminDashboard.tsx', code);
