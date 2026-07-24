const fs = require('fs');
let code = fs.readFileSync('src/components/ReceiveMoney.tsx', 'utf-8');
if (!code.includes("import { syncBankAccountState } from '../utils/backupSync';")) {
  code = code.replace("import { addBalance } from '../utils/balanceManager';", "import { addBalance } from '../utils/balanceManager';\nimport { syncBankAccountState } from '../utils/backupSync';");
}
code = code.replace("import('../utils/backupSync').then(({ syncBankAccountState }) => syncBankAccountState());", "syncBankAccountState();");
fs.writeFileSync('src/components/ReceiveMoney.tsx', code);
console.log('ReceiveMoney patched');
