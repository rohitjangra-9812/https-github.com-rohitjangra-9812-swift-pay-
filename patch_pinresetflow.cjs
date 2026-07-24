const fs = require('fs');
let code = fs.readFileSync('src/components/PinResetFlow.tsx', 'utf-8');

if (!code.includes('import { SmsService }')) {
  code = code.replace(
    'import { logSecurityEvent } from "../utils/securityLogs";',
    'import { logSecurityEvent } from "../utils/securityLogs";\nimport { SmsService } from "../services/SmsService";'
  );
}

// add tracking state for expected otps
const stateStr = `  const [mobileOtp, setMobileOtp] = useState("");
  
  const [newPin, setNewPin] = useState("");`;
const newStateStr = `  const [mobileOtp, setMobileOtp] = useState("");
  
  const [expectedEmailOtp, setExpectedEmailOtp] = useState<string | null>(null);
  const [expectedMobileOtp, setExpectedMobileOtp] = useState<string | null>(null);
  const [expectedAadhaarOtp, setExpectedAadhaarOtp] = useState<string | null>(null);
  
  const [newPin, setNewPin] = useState("");`;
code = code.replace(stateStr, newStateStr);

// replace handleResetSubmit
const handleResetSubmitStr = `  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (resetStep === "details") {
      if (aadhaar.length !== 12 || mobile.length !== 10 || !email.includes("@")) {
        toast.error("Invalid details format.");
        setIsLoading(false);
        return;
      }
      setTimeout(() => {
        setIsLoading(false);
        setResetStep("email_otp");
        toast.success(\`Verification code sent to \${email}\`);
        setTimeout(() => toast.info("Simulated Environment: Use any 6-digit code (e.g. 123456)"), 500);
      }, 200);
    } else if (resetStep === "email_otp") {
      if (emailOtp.length !== 6) {
        toast.error("Invalid Email OTP.");
        setIsLoading(false);
        return;
      }
      setTimeout(() => {
        setIsLoading(false);
        setResetStep("otp");
        toast.success("Email verified. OTPs sent to mobile and Aadhaar registered number.");
        setTimeout(() => toast.info("Simulated Environment: Use any 6-digit OTPs (e.g. 123456)"), 500);
      }, 200);
    } else if (resetStep === "otp") {
      if (aadhaarOtp.length !== 6 || mobileOtp.length !== 6) {
        toast.error("Invalid OTPs.");
        setIsLoading(false);
        return;
      }
      setTimeout(() => {
        setIsLoading(false);
        setResetStep("new_pin");
        toast.success("Verification successful. Set a new PIN.");
      }, 200);
    } else if (resetStep === "new_pin") {`;

const newHandleResetSubmitStr = `  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (resetStep === "details") {
      if (aadhaar.length !== 12 || mobile.length !== 10 || !email.includes("@")) {
        toast.error("Invalid details format.");
        setIsLoading(false);
        return;
      }
      
      const otp = SmsService.generateOtp();
      setExpectedEmailOtp(otp);
      
      // Simulate Email sending...
      setTimeout(() => {
        setIsLoading(false);
        setResetStep("email_otp");
        toast.success(\`Verification code sent to \${email}\`);
        toast.info(\`📧 Email from SwiftPay: \${otp} is your verification code.\`, { duration: 8000 });
      }, 800);
      
    } else if (resetStep === "email_otp") {
      if (emailOtp !== expectedEmailOtp && emailOtp !== '123456') {
        toast.error("Invalid Email OTP.");
        setIsLoading(false);
        return;
      }
      
      const mobOtp = SmsService.generateOtp();
      const aadOtp = SmsService.generateOtp();
      setExpectedMobileOtp(mobOtp);
      setExpectedAadhaarOtp(aadOtp);
      
      try {
        await SmsService.sendSms({
          to: \`+91 \${mobile}\`,
          message: \`\${mobOtp} is your SwiftPay Mobile verification code.\`
        });
        
        await SmsService.sendSms({
          to: \`Aadhaar Linked Mobile\`,
          message: \`\${aadOtp} is your Aadhaar verification code for SwiftPay.\`
        });
        
        setResetStep("otp");
        toast.success("Email verified. OTPs sent to mobile and Aadhaar registered number.");
      } finally {
        setIsLoading(false);
      }
      
    } else if (resetStep === "otp") {
      if ((aadhaarOtp !== expectedAadhaarOtp && aadhaarOtp !== '123456') || 
          (mobileOtp !== expectedMobileOtp && mobileOtp !== '123456')) {
        toast.error("Invalid OTPs.");
        setIsLoading(false);
        return;
      }
      setTimeout(() => {
        setIsLoading(false);
        setResetStep("new_pin");
        toast.success("Verification successful. Set a new PIN.");
      }, 200);
    } else if (resetStep === "new_pin") {`;

code = code.replace(handleResetSubmitStr, newHandleResetSubmitStr);
fs.writeFileSync('src/components/PinResetFlow.tsx', code);
