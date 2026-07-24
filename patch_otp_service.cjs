const fs = require('fs');
let code = fs.readFileSync('src/components/OTPVerification.tsx', 'utf-8');

if (!code.includes('import { SmsService }')) {
  code = code.replace(
    'import { toast } from "sonner";',
    'import { toast } from "sonner";\nimport { SmsService } from "../services/SmsService";'
  );
}

const oldEffectStr = `  useEffect(() => {
    // Simulate sending an SMS
    const timer = setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedCode(code);
      toast.info(\`Simulated OTP: \${code}\`, { duration: 6000 });
      setShowNotification(true);
      
      // Auto-hide notification after 6 seconds
      setTimeout(() => setShowNotification(false), 6000);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);`;

const newEffectStr = `  useEffect(() => {
    let isMounted = true;
    const sendOtp = async () => {
      const code = SmsService.generateOtp();
      if (isMounted) setSimulatedCode(code);
      
      await SmsService.sendSms({
        to: \`+91 \${mobile}\`,
        message: \`\${code} is your SwiftPay verification code. Do not share this with anyone.\`
      });

      if (isMounted) {
        setShowNotification(true);
        setTimeout(() => { if (isMounted) setShowNotification(false); }, 6000);
      }
    };
    sendOtp();

    return () => { isMounted = false; };
  }, [mobile]);`;

code = code.replace(oldEffectStr, newEffectStr);
fs.writeFileSync('src/components/OTPVerification.tsx', code);
