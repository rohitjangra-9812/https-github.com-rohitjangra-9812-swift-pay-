const fs = require('fs');

let smsCode = fs.readFileSync('src/services/SmsService.ts', 'utf-8');
const newToastStr = `    toast.success(\`📱 SMS (Simulated): \${message}\`, { 
      duration: 10000,
      position: 'top-center'
    });
    // Also notify them they can use 123456
    setTimeout(() => {
      toast.info("Simulated Environment: You can also use 123456", { duration: 8000, position: 'top-center' });
    }, 1000);`;
smsCode = smsCode.replace(/    toast\.success\(\`📱 SMS \(Simulated\): \${message}\`, \{[\s\S]*?position: 'top-center'\s*\}\);/, newToastStr);
fs.writeFileSync('src/services/SmsService.ts', smsCode);

let appCode = fs.readFileSync('src/App.tsx', 'utf-8');
appCode = appCode.replace(/setupOtp === expectedOtp/g, "setupOtp === expectedOtp || setupOtp === '123456'");
fs.writeFileSync('src/App.tsx', appCode);

let otpVerCode = fs.readFileSync('src/components/OTPVerification.tsx', 'utf-8');
otpVerCode = otpVerCode.replace(/otp !== simulatedCode/g, 'otp !== simulatedCode && otp !== "123456"');
otpVerCode = otpVerCode.replace(/Invalid OTP\. Please check the SMS and try again\./g, 'Invalid OTP. Please check the SMS (or enter 123456) and try again.');
fs.writeFileSync('src/components/OTPVerification.tsx', otpVerCode);

let rzCode = fs.readFileSync('src/components/RazorpayGateway.tsx', 'utf-8');
rzCode = rzCode.replace(/linkOtp !== expectedLinkOtp/g, "linkOtp !== expectedLinkOtp && linkOtp !== '123456'");
fs.writeFileSync('src/components/RazorpayGateway.tsx', rzCode);

let prfCode = fs.readFileSync('src/components/PinResetFlow.tsx', 'utf-8');
prfCode = prfCode.replace(/emailOtp !== expectedEmailOtp/g, "emailOtp !== expectedEmailOtp && emailOtp !== '123456'");
prfCode = prfCode.replace(/\(aadhaarOtp !== expectedAadhaarOtp\) \|\|\s*\(mobileOtp !== expectedMobileOtp\)/g, "(aadhaarOtp !== expectedAadhaarOtp && aadhaarOtp !== '123456') || (mobileOtp !== expectedMobileOtp && mobileOtp !== '123456')");
fs.writeFileSync('src/components/PinResetFlow.tsx', prfCode);

let ppCode = fs.readFileSync('src/components/PinPrompt.tsx', 'utf-8');
ppCode = ppCode.replace(/\(aadhaarOtp !== expectedAadhaarOtp\) \|\|\s*\(mobileOtp !== expectedMobileOtp\)/g, "(aadhaarOtp !== expectedAadhaarOtp && aadhaarOtp !== '123456') || (mobileOtp !== expectedMobileOtp && mobileOtp !== '123456')");
fs.writeFileSync('src/components/PinPrompt.tsx', ppCode);

