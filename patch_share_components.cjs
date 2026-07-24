const fs = require('fs');
let code = fs.readFileSync('src/components/UserPanel.tsx', 'utf-8');

const targetFunc = `              let shareUrl = window.location.href;
              if (shareUrl.includes('ais-dev-')) shareUrl = shareUrl.replace('ais-dev-', 'ais-pre-');
              
              if (navigator.share) {
                navigator.share({ title: "SwiftPay", text: "Use my referral code FRIEND50 to get a welcome bonus on SwiftPay!", url: shareUrl });
              } else {
                navigator.clipboard.writeText(\`FRIEND50 - \${shareUrl}\`);
                toast.success('Referral code copied to clipboard!');
              }`;

const newFunc = `              if (window.location.href.includes('ais-dev-')) {
                toast.error('Cannot share from Development Preview. Please click Share -> Publish in AI Studio first.', { duration: 6000 });
              } else {
                if (navigator.share) {
                  navigator.share({ title: "SwiftPay", text: "Use my referral code FRIEND50 to get a welcome bonus on SwiftPay!", url: window.location.href });
                } else {
                  navigator.clipboard.writeText(\`FRIEND50 - \${window.location.href}\`);
                  toast.success('Referral code copied to clipboard!');
                }
              }`;

if (code.includes(targetFunc)) {
  code = code.replace(targetFunc, newFunc);
  fs.writeFileSync('src/components/UserPanel.tsx', code);
  console.log('UserPanel.tsx patched');
} else {
  console.log('Could not find target function in UserPanel.tsx');
}

// Check ReceiveMoney.tsx
let rmCode = fs.readFileSync('src/components/ReceiveMoney.tsx', 'utf-8');
const rmTarget = `  const handleShare = async () => {
    try {
      const vCard = \`BEGIN:VCARD\\nVERSION:3.0\\nFN:\${bankDetails.accountHolder}\\nTEL:\${bankDetails.phoneNumber}\\nNOTE:UPI ID: \${bankDetails.phoneNumber}@swiftpay\\nEND:VCARD\`;
      const blob = new Blob([vCard], { type: 'text/vcard' });
      const file = new File([blob], 'contact.vcf', { type: 'text/vcard' });

      const shareData = {
        title: \`Pay \${bankDetails.accountHolder}\`,
        text: \`Here is my payment info for SwiftPay.\\nUPI: \${bankDetails.phoneNumber}@swiftpay\`,
        url: window.location.href
      };`;

const rmNew = `  const handleShare = async () => {
    if (window.location.href.includes('ais-dev-')) {
      toast.error('Cannot share from Development Preview. Please click Share -> Publish in AI Studio first.', { duration: 6000 });
      return;
    }
    try {
      const vCard = \`BEGIN:VCARD\\nVERSION:3.0\\nFN:\${bankDetails.accountHolder}\\nTEL:\${bankDetails.phoneNumber}\\nNOTE:UPI ID: \${bankDetails.phoneNumber}@swiftpay\\nEND:VCARD\`;
      const blob = new Blob([vCard], { type: 'text/vcard' });
      const file = new File([blob], 'contact.vcf', { type: 'text/vcard' });

      const shareData = {
        title: \`Pay \${bankDetails.accountHolder}\`,
        text: \`Here is my payment info for SwiftPay.\\nUPI: \${bankDetails.phoneNumber}@swiftpay\`,
        url: window.location.href
      };`;

if (rmCode.includes(rmTarget)) {
  rmCode = rmCode.replace(rmTarget, rmNew);
  fs.writeFileSync('src/components/ReceiveMoney.tsx', rmCode);
  console.log('ReceiveMoney.tsx patched');
} else {
  console.log('Could not find target function in ReceiveMoney.tsx');
}
