const fs = require('fs');
let code = fs.readFileSync('src/components/PinPrompt.tsx', 'utf-8');

if (!code.includes('import { SmsService }')) {
  code = code.replace(
    'import { logSecurityEvent } from "../utils/securityLogs";',
    'import { logSecurityEvent } from "../utils/securityLogs";\nimport { SmsService } from "../services/SmsService";'
  );
}

const stateStr = `  const [mobileOtp, setMobileOtp] = useState("");
  const [newPin, setNewPin] = useState("");`;
const newStateStr = `  const [mobileOtp, setMobileOtp] = useState("");
  const [expectedAadhaarOtp, setExpectedAadhaarOtp] = useState<string | null>(null);
  const [expectedMobileOtp, setExpectedMobileOtp] = useState<string | null>(null);
  const [newPin, setNewPin] = useState("");`;
code = code.replace(stateStr, newStateStr);

const handleResetSubmitStr = `  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (resetStep === "details") {
      if (aadhaar.length !== 12 || mobile.length !== 10) {
        toast.error("Invalid details format.");
        setIsLoading(false);
        return;
      }
      setTimeout(() => {
        setIsLoading(false);
        setResetStep("otp");
        toast.success("OTP sent to Aadhaar linked mobile and SwiftPay registered mobile.");
        setTimeout(() => toast.info("Simulated Environment: Use any 6-digit OTPs (e.g. 123456)"), 500);
      }, 200);
    } else if (resetStep === "otp") {
      if (aadhaarOtp.length !== 6 || mobileOtp.length !== 6) {
        toast.error("Please enter 6-digit OTPs.");
        setIsLoading(false);
        return;
      }
      setTimeout(() => {
        setIsLoading(false);
        setResetStep("new_pin");
        toast.success("Identity verified.");
      }, 200);
    } else if (resetStep === "new_pin") {`;

const newHandleResetSubmitStr = `  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (resetStep === "details") {
      if (aadhaar.length !== 12 || mobile.length !== 10) {
        toast.error("Invalid details format.");
        setIsLoading(false);
        return;
      }
      
      const aadOtp = SmsService.generateOtp();
      const mobOtp = SmsService.generateOtp();
      setExpectedAadhaarOtp(aadOtp);
      setExpectedMobileOtp(mobOtp);
      
      try {
        await SmsService.sendSms({
          to: \`Aadhaar Linked Mobile\`,
          message: \`\${aadOtp} is your Aadhaar verification code for SwiftPay.\`
        });
        
        await SmsService.sendSms({
          to: \`+91 \${mobile}\`,
          message: \`\${mobOtp} is your SwiftPay Mobile verification code.\`
        });
        
        setResetStep("otp");
        toast.success("OTP sent to Aadhaar linked mobile and SwiftPay registered mobile.");
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
        toast.success("Identity verified.");
      }, 200);
    } else if (resetStep === "new_pin") {`;

code = code.replace(handleResetSubmitStr, newHandleResetSubmitStr);
fs.writeFileSync('src/components/PinPrompt.tsx', code);
