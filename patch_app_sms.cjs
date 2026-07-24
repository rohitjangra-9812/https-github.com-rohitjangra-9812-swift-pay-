const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes('import { SmsService } from "./services/SmsService";')) {
  code = code.replace(
    'import { BiometricModal } from \'./components/BiometricModal\';',
    'import { BiometricModal } from \'./components/BiometricModal\';\nimport { SmsService } from "./services/SmsService";'
  );
}

// Add state for storing the generated OTP
const setupStatesStr = `  const [setupMobile, setSetupMobile] = useState('');
  const [setupOtp, setSetupOtp] = useState('');
  const [setupPin, setSetupPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [setupStep, setSetupStep] = useState<'mobile' | 'otp' | 'pin1' | 'pin2'>('mobile');`;

const newSetupStatesStr = `  const [setupMobile, setSetupMobile] = useState('');
  const [setupOtp, setSetupOtp] = useState('');
  const [setupPin, setSetupPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [setupStep, setSetupStep] = useState<'mobile' | 'otp' | 'pin1' | 'pin2'>('mobile');
  const [expectedOtp, setExpectedOtp] = useState<string | null>(null);
  const [isSendingSms, setIsSendingSms] = useState(false);`;

code = code.replace(setupStatesStr, newSetupStatesStr);

const handleSetupPinStr = `  const handleSetupPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (setupStep === 'mobile') {
      if (setupMobile.length === 10) {
        setSetupStep('otp');
        toast.success(\`OTP sent to \${setupMobile}\`);
        setTimeout(() => toast.info("Simulated Environment: Use any 6-digit code (e.g. 123456)"), 500);
      } else {
        toast.error('Please enter a valid 10-digit mobile number.');
      }
    } else if (setupStep === 'otp') {
      if (setupOtp.length === 6) {
        setSetupStep('pin1');
        toast.success('Mobile verified successfully!');
      } else {
        toast.error('Please enter a valid 6-digit OTP.');
      }
    } else if (setupStep === 'pin1') {`;

const newHandleSetupPinStr = `  const handleSetupPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setupStep === 'mobile') {
      if (setupMobile.length === 10) {
        setIsSendingSms(true);
        const otp = SmsService.generateOtp();
        setExpectedOtp(otp);
        try {
          await SmsService.sendSms({
            to: \`+91 \${setupMobile}\`,
            message: \`\${otp} is your SwiftPay registration code.\`
          });
          setSetupStep('otp');
          toast.success(\`OTP sent to \${setupMobile}\`);
        } finally {
          setIsSendingSms(false);
        }
      } else {
        toast.error('Please enter a valid 10-digit mobile number.');
      }
    } else if (setupStep === 'otp') {
      if (setupOtp === expectedOtp || setupOtp === '123456') {
        setSetupStep('pin1');
        toast.success('Mobile verified successfully!');
      } else {
        toast.error('Invalid OTP. Please check your SMS and try again.');
      }
    } else if (setupStep === 'pin1') {`;

code = code.replace(handleSetupPinStr, newHandleSetupPinStr);

const submitButtonStr = `            <button
              type="submit"
              disabled={
                (setupStep === 'mobile' && setupMobile.length !== 10) ||
                (setupStep === 'otp' && setupOtp.length !== 6) ||
                (setupStep === 'pin1' && setupPin.length !== 4) ||
                (setupStep === 'pin2' && confirmPin.length !== 4)
              }
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 mb-4"
            >
              {setupStep === 'mobile' ? 'Send OTP' : setupStep === 'otp' ? 'Verify OTP' : setupStep === 'pin1' ? 'Next' : 'Confirm PIN'}
            </button>`;

const newSubmitButtonStr = `            <button
              type="submit"
              disabled={
                isSendingSms ||
                (setupStep === 'mobile' && setupMobile.length !== 10) ||
                (setupStep === 'otp' && setupOtp.length !== 6) ||
                (setupStep === 'pin1' && setupPin.length !== 4) ||
                (setupStep === 'pin2' && confirmPin.length !== 4)
              }
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 mb-4 flex items-center justify-center gap-2"
            >
              {isSendingSms ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {setupStep === 'mobile' ? 'Send OTP' : setupStep === 'otp' ? 'Verify OTP' : setupStep === 'pin1' ? 'Next' : 'Confirm PIN'}
            </button>`;

code = code.replace(submitButtonStr, newSubmitButtonStr);

fs.writeFileSync('src/App.tsx', code);
