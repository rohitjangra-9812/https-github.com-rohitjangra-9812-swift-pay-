const fs = require('fs');
let code = fs.readFileSync('src/components/UserPanel.tsx', 'utf-8');

const targetBlock = `        if (typeof data.balance === 'number') {
          setUserBalance(data.balance);
          localStorage.setItem('swiftpay_user_balance', data.balance.toString());
        }`;

const replaceBlock = `        if (typeof data.balance === 'number') {
          setUserBalance(data.balance);
          localStorage.setItem('swiftpay_user_balance', data.balance.toString());
        }
        if (data.history) {
          localStorage.setItem('swiftpay_history', JSON.stringify(data.history));
          window.dispatchEvent(new Event('swiftpay_history_updated'));
        }
        if (typeof data.points === 'number') {
          localStorage.setItem('swiftpay_points', data.points.toString());
          // Update points state via a custom event
          window.dispatchEvent(new CustomEvent('swiftpay_points_updated', { detail: data.points }));
        }`;

if (code.includes(targetBlock)) {
  code = code.replace(targetBlock, replaceBlock);
  fs.writeFileSync('src/components/UserPanel.tsx', code);
  console.log('UserPanel patched for incoming sync');
} else {
  console.log('targetBlock not found');
}
