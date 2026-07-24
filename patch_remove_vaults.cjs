const fs = require('fs');
let code = fs.readFileSync('src/components/UserPanel.tsx', 'utf-8');

const targetImport = `import { SharedVaults } from "./SharedVaults";\n`;
code = code.replace(targetImport, '');

const targetBlock = `          {
            id: 'vaults',
            title: 'Group Vaults',
            component: <SharedVaults />
          },
`;
code = code.replace(targetBlock, '');

fs.writeFileSync('src/components/UserPanel.tsx', code);
console.log('Removed Group Vaults');
