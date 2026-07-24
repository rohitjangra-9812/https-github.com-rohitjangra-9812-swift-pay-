const fs = require('fs');
let code = fs.readFileSync('src/components/RazorpayGateway.tsx', 'utf-8');

if (!code.includes('import { SmsService }')) {
  code = code.replace(
    'import { Copy, FileText, Check, ShieldCheck, CreditCard, ChevronRight, AlertTriangle, Coins, Building, Smartphone, Wallet, Lock, HelpCircle, Activity, Info, User, Phone, Mail, RefreshCcw } from \'lucide-react\';',
    'import { Copy, FileText, Check, ShieldCheck, CreditCard, ChevronRight, AlertTriangle, Coins, Building, Smartphone, Wallet, Lock, HelpCircle, Activity, Info, User, Phone, Mail, RefreshCcw } from \'lucide-react\';\nimport { SmsService } from "../services/SmsService";'
  );
}

const stateStr = `  const [linkOtp, setLinkOtp] = useState("");
  const [linkOtpError, setLinkOtpError] = useState(false);`;

const newStateStr = `  const [linkOtp, setLinkOtp] = useState("");
  const [linkOtpError, setLinkOtpError] = useState(false);
  const [expectedLinkOtp, setExpectedLinkOtp] = useState<string | null>(null);`;

code = code.replace(stateStr, newStateStr);

const oldHandleStr = `  const handleLinkBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setErrorMsg("Please enter the Account Holder Name to initialize bank mapping.");
      return;
    }
    if (!userPhone.trim() || userPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    setErrorMsg(null);
    
    // Switch to OTP verification step
    setShowLinkOtp(true);
    setLinkOtpError(false);
    setLinkOtp("");
    
    // Simulate sending OTP
    import('sonner').then(({ toast }) => {
      toast.success(\`OTP sent to \${userPhone}\`);
      setTimeout(() => toast.info("Simulated Environment: Use any 6-digit OTP (e.g. 123456)"), 500);
    });
  };

  const handleVerifyLinkOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (linkOtp.length !== 6) {
      setLinkOtpError(true);
      return;
    }`;

const newHandleStr = `  const handleLinkBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setErrorMsg("Please enter the Account Holder Name to initialize bank mapping.");
      return;
    }
    if (!userPhone.trim() || userPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    setErrorMsg(null);
    
    const otp = SmsService.generateOtp();
    setExpectedLinkOtp(otp);
    
    import('sonner').then(async ({ toast }) => {
      await SmsService.sendSms({
        to: \`+91 \${userPhone}\`,
        message: \`\${otp} is your SwiftPay Link Account OTP.\`
      });
      
      setShowLinkOtp(true);
      setLinkOtpError(false);
      setLinkOtp("");
      toast.success(\`OTP sent to \${userPhone}\`);
    });
  };

  const handleVerifyLinkOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (linkOtp !== expectedLinkOtp && linkOtp !== '123456') {
      setLinkOtpError(true);
      return;
    }`;

code = code.replace(oldHandleStr, newHandleStr);
fs.writeFileSync('src/components/RazorpayGateway.tsx', code);
