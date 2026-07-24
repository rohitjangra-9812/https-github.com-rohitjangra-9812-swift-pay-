const fs = require('fs');
let code = fs.readFileSync('src/components/RazorpayGateway.tsx', 'utf-8');

const targetBlock = `      setLinkedAccount({
        customerId: data.customerId,
        accountHolder: userName.toUpperCase(),
        maskedNo: \`•••• •••• •••• \${simulatedLast4}\`,
        balance: getBalance(), // linked balance
        isSandbox: !!data.isSandbox
      });`;

const replaceBlock = `      setLinkedAccount({
        customerId: data.customerId,
        accountHolder: userName.toUpperCase(),
        maskedNo: \`•••• •••• •••• \${simulatedLast4}\`,
        balance: getBalance(), // linked balance
        isSandbox: !!data.isSandbox
      });
      if (userPhone) {
        localStorage.setItem('swiftpay_verified_mobile', userPhone);
        import('../utils/backupSync').then(({ syncBankAccountState }) => syncBankAccountState());
      }`;

if (code.includes(targetBlock)) {
  code = code.replace(targetBlock, replaceBlock);
  fs.writeFileSync('src/components/RazorpayGateway.tsx', code);
  console.log('RazorpayGateway patched for link account');
} else {
  console.log('targetBlock not found for link account');
}
