const fs = require('fs');
let code = fs.readFileSync('src/components/UserPanel.tsx', 'utf-8');

const t = `              let shareUrl = window.location.href;
              if (shareUrl.includes('ais-dev-')) shareUrl = shareUrl.replace('ais-dev-', 'ais-pre-');
              
              if (navigator.share) {
                navigator.share({ title: "SwiftPay", text: "Use my referral code FRIEND50 to get a welcome bonus on SwiftPay!", url: shareUrl });
              } else {
                navigator.clipboard.writeText(\`FRIEND50 - \${shareUrl}\`);
                toast.success('Referral code copied to clipboard!');
              }`;

const n = `              if (window.location.href.includes('ais-dev-')) {
                toast.error('Cannot share from Development Preview. Please click Share -> Publish in AI Studio first.', { duration: 6000 });
              } else {
                if (navigator.share) {
                  navigator.share({ title: "SwiftPay", text: "Use my referral code FRIEND50 to get a welcome bonus on SwiftPay!", url: window.location.href });
                } else {
                  navigator.clipboard.writeText(\`FRIEND50 - \${window.location.href}\`);
                  toast.success('Referral code copied to clipboard!');
                }
              }`;

if (code.includes(t)) {
  code = code.replace(t, n);
  fs.writeFileSync('src/components/UserPanel.tsx', code);
  console.log('UP patched');
} else {
  // try replacing line by line
  code = code.replace(/let shareUrl = window\.location\.href;\n\s+if \(shareUrl\.includes\('ais-dev-'\)\) shareUrl = shareUrl\.replace\('ais-dev-', 'ais-pre-'\);\n\s+if \(navigator\.share\) \{\n\s+navigator\.share\(\{ title: "SwiftPay", text: "Use my referral code FRIEND50 to get a welcome bonus on SwiftPay!", url: shareUrl \}\);\n\s+\} else \{\n\s+navigator\.clipboard\.writeText\(\`FRIEND50 - \$\{shareUrl\}\`\);\n\s+toast\.success\('Referral code copied to clipboard!'\);\n\s+\}/, n);
  fs.writeFileSync('src/components/UserPanel.tsx', code);
  console.log('UP regex patched');
}
