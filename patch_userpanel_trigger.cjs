const fs = require('fs');
let code = fs.readFileSync('src/components/UserPanel.tsx', 'utf-8');

const targetBlock = `      localStorage.setItem('swiftpay_history', JSON.stringify(history));
      window.dispatchEvent(new Event('swiftpay_history_updated'));`;

const replaceBlock = `      localStorage.setItem('swiftpay_history', JSON.stringify(history));
      window.dispatchEvent(new Event('swiftpay_history_updated'));
      import('../utils/backupSync').then(({ syncBankAccountState }) => syncBankAccountState());`;

if (code.includes(targetBlock)) {
  code = code.replace(targetBlock, replaceBlock);
  fs.writeFileSync('src/components/UserPanel.tsx', code);
  console.log('UserPanel patched for history sync trigger');
} else {
  console.log('targetBlock not found for history sync trigger');
}
