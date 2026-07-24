const fs = require('fs');
let code = fs.readFileSync('src/components/RazorpayGateway.tsx', 'utf-8');
if (!code.includes("import { syncBankAccountState } from '../utils/backupSync';")) {
  code = "import { syncBankAccountState } from '../utils/backupSync';\n" + code;
}
code = code.replace(/import\('\.\.\/utils\/backupSync'\)\.then\(\(\{ syncBankAccountState \}\) => syncBankAccountState\(\)\);/g, "syncBankAccountState();");
fs.writeFileSync('src/components/RazorpayGateway.tsx', code);
console.log('RazorpayGateway imports patched');
