const fs = require('fs');

function replaceInFile(filePath, replacements) {
  let code = fs.readFileSync(filePath, 'utf-8');
  for (const { from, to } of replacements) {
    code = code.replace(from, to);
  }
  fs.writeFileSync(filePath, code);
}

replaceInFile('src/services/SmsService.ts', [
  {
    from: /\s*\/\/ Also notify them they can use 123456\s*setTimeout\(\(\) => \{\s*toast\.info\("Simulated Environment: You can also use 123456", \{ duration: 8000, position: 'top-center' \}\);\s*\}, 1000\);/g,
    to: ''
  }
]);

replaceInFile('src/App.tsx', [
  {
    from: /setupOtp === expectedOtp \|\| setupOtp === '123456'/g,
    to: "setupOtp === expectedOtp"
  }
]);

replaceInFile('src/components/OTPVerification.tsx', [
  {
    from: /otp !== simulatedCode && otp !== "123456"/g,
    to: 'otp !== simulatedCode'
  },
  {
    from: /Invalid OTP\. Please check the SMS \(or enter 123456\) and try again\./g,
    to: 'Invalid OTP. Please check the SMS and try again.'
  }
]);

replaceInFile('src/components/RazorpayGateway.tsx', [
  {
    from: /linkOtp !== expectedLinkOtp && linkOtp !== '123456'/g,
    to: "linkOtp !== expectedLinkOtp"
  },
  {
    from: /if \(sandboxOtp !== "123456" && sandboxOtp !== "000000" && sandboxOtp\.length !== 6\)/g,
    to: 'if (sandboxOtp !== "000000" && sandboxOtp.length !== 6)'
  },
  {
    from: /💡 Hint: Enter <strong>123456<\/strong> or <strong>000000<\/strong>/g,
    to: '💡 Hint: Enter <strong>000000</strong>'
  },
  {
    from: /onClick=\{\(\) => setSandboxOtp\("123456"\)\}/g,
    to: 'onClick={() => setSandboxOtp("000000")}'
  }
]);

replaceInFile('src/components/PinResetFlow.tsx', [
  {
    from: /emailOtp !== expectedEmailOtp && emailOtp !== '123456'/g,
    to: "emailOtp !== expectedEmailOtp"
  },
  {
    from: /\(aadhaarOtp !== expectedAadhaarOtp && aadhaarOtp !== '123456'\) \|\|\s*\(mobileOtp !== expectedMobileOtp && mobileOtp !== '123456'\)/g,
    to: "(aadhaarOtp !== expectedAadhaarOtp) || (mobileOtp !== expectedMobileOtp)"
  }
]);

replaceInFile('src/components/PinPrompt.tsx', [
  {
    from: /\(aadhaarOtp !== expectedAadhaarOtp && aadhaarOtp !== '123456'\) \|\|\s*\(mobileOtp !== expectedMobileOtp && mobileOtp !== '123456'\)/g,
    to: "(aadhaarOtp !== expectedAadhaarOtp) || (mobileOtp !== expectedMobileOtp)"
  }
]);

