const fs = require('fs');
let code = fs.readFileSync('src/components/OTPVerification.tsx', 'utf-8');

if (!code.includes('import { toast } from "sonner";')) {
  code = code.replace('import { Loader2, MessageSquare } from "lucide-react";', 'import { Loader2, MessageSquare } from "lucide-react";\nimport { toast } from "sonner";');
}

code = code.replace(
  'setSimulatedCode(code);',
  'setSimulatedCode(code);\n      toast.info(`Simulated OTP: ${code}`, { duration: 6000 });'
);

code = code.replace(
  'Invalid OTP. Please check the SMS and try again.',
  'Invalid OTP. Please check the SMS (or enter 123456) and try again.'
);

fs.writeFileSync('src/components/OTPVerification.tsx', code);
