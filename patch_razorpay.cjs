const fs = require('fs');
let code = fs.readFileSync('src/components/RazorpayGateway.tsx', 'utf-8');

// Add OTP state
const otpStateStr = `  const [sandboxOtp, setSandboxOtp] = useState("");
  const [sandboxOtpError, setSandboxOtpError] = useState(false);

  // New states for Link Bank Account OTP flow
  const [showLinkOtp, setShowLinkOtp] = useState(false);
  const [linkOtp, setLinkOtp] = useState("");
  const [linkOtpError, setLinkOtpError] = useState(false);`;
code = code.replace(/  const \[sandboxOtp, setSandboxOtp\] = useState\(\"\"\);\n  const \[sandboxOtpError, setSandboxOtpError\] = useState\(false\);/, otpStateStr);

// Modify handleLinkBankAccount to show OTP prompt
const handleLinkBankStr = `  const handleLinkBankAccount = async (e: React.FormEvent) => {
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
    }
    setLinkOtpError(false);
    setShowLinkOtp(false);
    setIsLinking(true);

    try {
      const response = await fetch("/api/create-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          email: userEmail || "customer@swiftpay.io",
          contact: userPhone || "9999999999"
        })
      });

      if (!response.ok) {
        throw new Error("HTTP connection to bank gateway failed.");
      }

      const data = await response.json();
      
      const simulatedLast4 = userPhone.slice(-4) || "4321";
      setLinkedAccount({
        customerId: data.customerId,
        accountHolder: userName.toUpperCase(),
        maskedNo: \`•••• •••• •••• \${simulatedLast4}\`,
        balance: getBalance(), // linked balance
        isSandbox: !!data.isSandbox
      });

      if (userPhone) {
        localStorage.setItem('swiftpay_verified_mobile', userPhone);
        syncBankAccountState();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Connection Error: Unable to complete banking SIM registry handshake.");
    } finally {
      setIsLinking(false);
    }
  };`;

// replace old handleLinkBankAccount
code = code.replace(/  const handleLinkBankAccount = async \(e: React.FormEvent\) => \{[\s\S]*?setIsLinking\(false\);\n    \}\n  \};/, handleLinkBankStr);

// Now update the form UI to show the OTP step
const oldFormStr = `            {!linkedAccount ? (
              <button
                type="submit"
                disabled={isLinking || !userName}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-indigo-500/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLinking ? (
                  <>
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Link Bank Account & Verify
                  </>
                )}
              </button>
            ) : (`;

const newFormStr = `            {!linkedAccount ? (
              showLinkOtp ? (
                <div className="mt-4 p-4 border border-indigo-100 dark:border-indigo-900/30 rounded-xl bg-indigo-50/30 dark:bg-indigo-900/10">
                  <label className="block text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-400 mb-1.5 tracking-wider">
                    Mobile Verification OTP *
                  </label>
                  <input
                    type="tel"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={linkOtp}
                    onChange={(e) => {
                      setLinkOtp(e.target.value.replace(/\\D/g, ""));
                      setLinkOtpError(false);
                    }}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-center font-mono font-black text-lg tracking-[0.5em] outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                  {linkOtpError && (
                    <p className="text-[10px] text-rose-500 font-extrabold mt-1">
                      ❌ Invalid OTP. Please enter a 6-digit code.
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => setShowLinkOtp(false)}
                      className="w-1/3 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex justify-center items-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyLinkOtp}
                      disabled={linkOtp.length !== 6}
                      className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex justify-center items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" /> Verify & Link
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isLinking || !userName || !userPhone}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-indigo-500/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLinking ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Link Bank Account
                    </>
                  )}
                </button>
              )
            ) : (`;

code = code.replace(oldFormStr, newFormStr);
fs.writeFileSync('src/components/RazorpayGateway.tsx', code);
