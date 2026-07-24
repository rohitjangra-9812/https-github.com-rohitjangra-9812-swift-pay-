const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf-8');

const importStr = `import './index.css';`;
const listenerStr = `import './index.css';

// Capture beforeinstallprompt globally as early as possible
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).deferredPrompt = e;
});
`;

if (!code.includes('beforeinstallprompt')) {
  code = code.replace(importStr, listenerStr);
  fs.writeFileSync('src/main.tsx', code);
}
