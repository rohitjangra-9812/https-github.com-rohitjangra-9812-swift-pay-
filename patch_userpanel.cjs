const fs = require('fs');
let code = fs.readFileSync('src/components/UserPanel.tsx', 'utf-8');
if (!code.includes("import { syncBankAccountState } from '../utils/backupSync';")) {
  code = code.replace("import { getBalance, deductBalance } from '../utils/balanceManager';", "import { getBalance, deductBalance } from '../utils/balanceManager';\nimport { syncBankAccountState } from '../utils/backupSync';");
}
code = code.replace("import('../utils/backupSync').then(({ syncBankAccountState }) => syncBankAccountState());", "syncBankAccountState();");
fs.writeFileSync('src/components/UserPanel.tsx', code);
console.log('UserPanel patched');
