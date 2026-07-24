const fs = require('fs');
let code = fs.readFileSync('src/services/SmsService.ts', 'utf-8');

const oldToast = `    // Simulate OTP delivery as a toast notification in our simulated environment
    toast.info(\`📱 Message from SwiftPay: \${message}\`, { 
      duration: 8000,
    });`;

const newToast = `    // Simulate OTP delivery as a toast notification in our simulated environment
    toast.success(\`📱 SMS (Simulated): \${message}\`, { 
      duration: 10000,
      position: 'top-center'
    });
    // Also notify them they can use 123456
    setTimeout(() => {
      toast.info("Simulated Environment: You can also use 123456", { duration: 8000, position: 'top-center' });
    }, 1000);`;

code = code.replace(oldToast, newToast);
fs.writeFileSync('src/services/SmsService.ts', code);
