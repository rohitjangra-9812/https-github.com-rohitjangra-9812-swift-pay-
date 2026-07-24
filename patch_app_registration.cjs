const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldStateStr = `  const [setupPin, setSetupPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [setupStep, setSetupStep] = useState(1);

  const handleSetupPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (setupStep === 1) {
      if (setupPin.length === 4) setSetupStep(2);
    } else {
      if (setupPin === confirmPin) {
        localStorage.setItem('swiftpay_user_pin', setupPin);
        localStorage.setItem('swiftpay_pin', setupPin); // set transaction PIN to same as App PIN
        setIsSettingPin(false);
        setIsAppUnlocked(true);
        toast.success('App PIN set successfully!');
      } else {
        toast.error('PINs do not match. Try again.');
        setSetupPin('');
        setConfirmPin('');
        setSetupStep(1);
      }
    }
  };`;

const newStateStr = `  const [setupMobile, setSetupMobile] = useState('');
  const [setupOtp, setSetupOtp] = useState('');
  const [setupPin, setSetupPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [setupStep, setSetupStep] = useState<'mobile' | 'otp' | 'pin1' | 'pin2'>('mobile');

  const handleSetupPin = (e: React.FormEvent) => {
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
    } else if (setupStep === 'pin1') {
      if (setupPin.length === 4) setSetupStep('pin2');
    } else {
      if (setupPin === confirmPin) {
        localStorage.setItem('swiftpay_user_pin', setupPin);
        localStorage.setItem('swiftpay_pin', setupPin); // set transaction PIN to same as App PIN
        localStorage.setItem('swiftpay_verified_mobile', setupMobile);
        setIsSettingPin(false);
        setIsAppUnlocked(true);
        toast.success('Registration complete & App PIN set successfully!');
      } else {
        toast.error('PINs do not match. Try again.');
        setSetupPin('');
        setConfirmPin('');
        setSetupStep('pin1');
      }
    }
  };`;

code = code.replace(oldStateStr, newStateStr);

const oldRenderStr = `        {isSettingPin ? (
          <form onSubmit={handleSetupPin} className="relative z-10 w-full max-w-xs mx-auto mb-8">
            <h3 className="text-xl font-bold text-white mb-2">Set Up App PIN</h3>
            <p className="text-slate-400 mb-8 text-sm">
              {setupStep === 1 ? 'Enter a 4-digit PIN to secure your app.' : 'Confirm your 4-digit PIN.'}
            </p>
            
            <div className="flex gap-4 justify-center mb-8 relative">
              {[0, 1, 2, 3].map((index) => {
                const val = setupStep === 1 ? setupPin : confirmPin;
                return (
                  <div 
                    key={index} 
                    className={\`w-4 h-4 rounded-full transition-all duration-200 \${
                      val.length > index 
                        ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] scale-110' 
                        : 'bg-slate-800'
                    }\`} 
                  />
                );
              })}
              <input
                type="number"
                pattern="[0-9]*"
                inputMode="numeric"
                value={setupStep === 1 ? setupPin : confirmPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\\D/g, '').slice(0,4);
                  if (setupStep === 1) setSetupPin(val);
                  else setConfirmPin(val);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
                maxLength={4}
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={(setupStep === 1 ? setupPin.length : confirmPin.length) !== 4}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 mb-4"
            >
              {setupStep === 1 ? 'Next' : 'Confirm PIN'}
            </button>
          </form>
        ) : loginLockoutTime ? (`;

const newRenderStr = `        {isSettingPin ? (
          <form onSubmit={handleSetupPin} className="relative z-10 w-full max-w-xs mx-auto mb-8">
            <h3 className="text-xl font-bold text-white mb-2">
              {setupStep === 'mobile' || setupStep === 'otp' ? 'User Registration' : 'Set Up App PIN'}
            </h3>
            <p className="text-slate-400 mb-8 text-sm">
              {setupStep === 'mobile' ? 'Enter your mobile number to register.' 
                : setupStep === 'otp' ? 'Enter the OTP sent to your mobile.' 
                : setupStep === 'pin1' ? 'Enter a 4-digit PIN to secure your app.' 
                : 'Confirm your 4-digit PIN.'}
            </p>
            
            {setupStep === 'mobile' && (
              <div className="mb-8">
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit Mobile Number"
                  value={setupMobile}
                  onChange={(e) => setSetupMobile(e.target.value.replace(/\\D/g, ''))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-center focus:outline-none focus:border-indigo-500 transition-colors"
                  autoFocus
                  required
                />
              </div>
            )}

            {setupStep === 'otp' && (
              <div className="mb-8">
                <input
                  type="tel"
                  maxLength={6}
                  placeholder="6-digit OTP"
                  value={setupOtp}
                  onChange={(e) => setSetupOtp(e.target.value.replace(/\\D/g, ''))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-center font-mono tracking-[0.5em] focus:outline-none focus:border-indigo-500 transition-colors"
                  autoFocus
                  required
                />
              </div>
            )}

            {(setupStep === 'pin1' || setupStep === 'pin2') && (
              <div className="flex gap-4 justify-center mb-8 relative">
                {[0, 1, 2, 3].map((index) => {
                  const val = setupStep === 'pin1' ? setupPin : confirmPin;
                  return (
                    <div 
                      key={index} 
                      className={\`w-4 h-4 rounded-full transition-all duration-200 \${
                        val.length > index 
                          ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] scale-110' 
                          : 'bg-slate-800'
                      }\`} 
                    />
                  );
                })}
                <input
                  type="number"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={setupStep === 'pin1' ? setupPin : confirmPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\\D/g, '').slice(0,4);
                    if (setupStep === 'pin1') setSetupPin(val);
                    else setConfirmPin(val);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
                  maxLength={4}
                  autoFocus
                />
              </div>
            )}
            
            <button
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
            </button>
          </form>
        ) : loginLockoutTime ? (`;

code = code.replace(oldRenderStr, newRenderStr);

fs.writeFileSync('src/App.tsx', code);
