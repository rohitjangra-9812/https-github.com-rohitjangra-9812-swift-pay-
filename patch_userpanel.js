const fs = require('fs');
let code = fs.readFileSync('src/components/UserPanel.tsx', 'utf-8');

// Replace the erroneous useEffects for userBalance
const startStr = '  useEffect(() => {\n    setUserBalance(getBalance());\n    \n    if (!bankDetails?.account) return;\n\n    const balanceRef = doc(db, \'user_backups\', bankDetails.account);';
const endStr = '    return () => window.removeEventListener(\'balance_updated\', handleUpdate);\n  }, [bankDetails?.account]);';

const targetBlock = code.substring(code.indexOf('  useEffect(() => {\n    setUserBalance(getBalance());\n    \n    if (!bankDetails?.account) return;\n\n    const balanceRef = doc(db, \'user_backups\', bankDetails.account);'), code.indexOf(endStr) + endStr.length);

console.log("Target block found:", targetBlock.length > 0);

const replacement = `  useEffect(() => {
    setUserBalance(getBalance());
    
    const verifiedMobile = localStorage.getItem('swiftpay_verified_mobile');
    if (!verifiedMobile) return;

    const balanceRef = doc(db, 'user_backups', verifiedMobile);
    
    const unsubscribe = onSnapshot(balanceRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (typeof data.balance === 'number') {
          setUserBalance(data.balance);
          localStorage.setItem('swiftpay_user_balance', data.balance.toString());
        }
      } else {
        const currentBal = getBalance();
        setDoc(balanceRef, { balance: currentBal, updatedAt: serverTimestamp() }, { merge: true }).catch(console.error);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      const newBal = e.detail;
      setUserBalance(newBal);
      const verifiedMobile = localStorage.getItem('swiftpay_verified_mobile');
      if (verifiedMobile) {
        const balanceRef = doc(db, 'user_backups', verifiedMobile);
        setDoc(balanceRef, { balance: newBal, updatedAt: serverTimestamp() }, { merge: true }).catch(console.error);
      }
    };
    window.addEventListener('balance_updated', handleUpdate);
    return () => window.removeEventListener('balance_updated', handleUpdate);
  }, []);`;

code = code.replace(targetBlock, replacement);
fs.writeFileSync('src/components/UserPanel.tsx', code);
console.log('patched');
