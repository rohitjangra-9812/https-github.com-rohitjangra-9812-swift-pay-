const fs = require('fs');
let code = fs.readFileSync('src/utils/backupSync.ts', 'utf-8');

const targetStr = `    const payload = {
       bankDetails: bankDetailsStr ? JSON.parse(bankDetailsStr) : null,
       bankAccounts: bankAccountsStr ? JSON.parse(bankAccountsStr) : null,
       isBankLinked: isBankLinked === "true",
       verifiedMobile: verifiedMobile,
       updatedAt: new Date().toISOString()
    };`;

const replaceStr = `    const historyStr = localStorage.getItem('swiftpay_history');
    const pointsStr = localStorage.getItem('swiftpay_points');

    const payload = {
       bankDetails: bankDetailsStr ? JSON.parse(bankDetailsStr) : null,
       bankAccounts: bankAccountsStr ? JSON.parse(bankAccountsStr) : null,
       isBankLinked: isBankLinked === "true",
       history: historyStr ? JSON.parse(historyStr) : null,
       points: pointsStr ? parseInt(pointsStr) : null,
       verifiedMobile: verifiedMobile,
       updatedAt: new Date().toISOString()
    };`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('src/utils/backupSync.ts', code);
  console.log('backupSync patched');
} else {
  console.log('target not found in backupSync');
}
