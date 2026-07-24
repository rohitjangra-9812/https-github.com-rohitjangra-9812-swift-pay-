const fs = require('fs');

let smsCode = fs.readFileSync('src/services/SmsService.ts', 'utf-8');
smsCode = smsCode.replace(/\s*\/\/ Also notify them they can use 123456\s*setTimeout\(\(\) => \{\s*toast\.info\("Simulated Environment: You can also use 123456", \{ duration: 8000, position: 'top-center' \}\);\s*\}, 1000\);/g, '');
fs.writeFileSync('src/services/SmsService.ts', smsCode);

let appCode = fs.readFileSync('src/App.tsx', 'utf-8');
appCode = appCode.replace(/setupOtp === expectedOtp \|\| setupOtp === '123456'/g, "setupOtp === expectedOtp");
fs.writeFileSync('src/App.tsx', appCode);

let otpVerCode = fs.readFileSync('src/components/OTPVerification.tsx', 'utf-8');
otpVerCode = otpVerCode.replace(/otp !== simulatedCode && otp !== "123456"/g, 'otp !== simulatedCode');
otpVerCode = otpVerCode.replace(/Invalid OTP\. Please check the SMS \(or enter 123456\) and try again\./g, 'Invalid OTP. Please check the SMS and try again.');
fs.writeFileSync('src/components/OTPVerification.tsx', otpVerCode);

