const fs = require('fs');

let rzCode = fs.readFileSync('src/components/RazorpayGateway.tsx', 'utf-8');
rzCode = rzCode.replace(/linkOtp !== expectedLinkOtp && linkOtp !== '123456'/g, "linkOtp !== expectedLinkOtp");
// For sandboxOtp, the hint has 123456. Let's look at RazorpayGateway to see if it makes sense to keep sandboxOtp as 123456 or change it to something else or just remove it.
fs.writeFileSync('src/components/RazorpayGateway.tsx', rzCode);

let prfCode = fs.readFileSync('src/components/PinResetFlow.tsx', 'utf-8');
prfCode = prfCode.replace(/emailOtp !== expectedEmailOtp && emailOtp !== '123456'/g, "emailOtp !== expectedEmailOtp");
prfCode = prfCode.replace(/\(aadhaarOtp !== expectedAadhaarOtp && aadhaarOtp !== '123456'\) \|\|\s*\(mobileOtp !== expectedMobileOtp && mobileOtp !== '123456'\)/g, "(aadhaarOtp !== expectedAadhaarOtp) || (mobileOtp !== expectedMobileOtp)");
fs.writeFileSync('src/components/PinResetFlow.tsx', prfCode);

let ppCode = fs.readFileSync('src/components/PinPrompt.tsx', 'utf-8');
ppCode = ppCode.replace(/\(aadhaarOtp !== expectedAadhaarOtp && aadhaarOtp !== '123456'\) \|\|\s*\(mobileOtp !== expectedMobileOtp && mobileOtp !== '123456'\)/g, "(aadhaarOtp !== expectedAadhaarOtp) || (mobileOtp !== expectedMobileOtp)");
fs.writeFileSync('src/components/PinPrompt.tsx', ppCode);

