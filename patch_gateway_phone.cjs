const fs = require('fs');
let code = fs.readFileSync('src/components/RazorpayGateway.tsx', 'utf-8');

const targetBlock = `  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");`;

const replaceBlock = `  const [userName, setUserName] = useState(() => new URLSearchParams(window.location.search).get('name') || "");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState(() => {
    const phone = new URLSearchParams(window.location.search).get('phone');
    if (phone) {
      localStorage.setItem('swiftpay_verified_mobile', phone);
      import('../utils/backupSync').then(({ syncBankAccountState }) => syncBankAccountState());
    }
    return phone || "";
  });`;

if (code.includes(targetBlock)) {
  code = code.replace(targetBlock, replaceBlock);
  fs.writeFileSync('src/components/RazorpayGateway.tsx', code);
  console.log('RazorpayGateway patched for URL params');
} else {
  console.log('targetBlock not found for URL params');
}
