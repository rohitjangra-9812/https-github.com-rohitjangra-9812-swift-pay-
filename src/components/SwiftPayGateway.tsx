import React, { useState } from 'react';
import { CheckCircle2, Loader2, ScanFace, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SwiftPayGateway = ({ onBack }: { onBack?: () => void }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [paymentState, setPaymentState] = useState<'idle' | 'biometric' | 'processing' | 'success'>('idle');

  const [name, setName] = useState('John Doe');
  const [mobile, setMobile] = useState('9876543210');
  const [email, setEmail] = useState('john@example.com');
  const [errors, setErrors] = useState({ name: '', mobile: '' });

  const validateName = (val: string) => {
    if (!val.trim()) return "Name is required";
    return "";
  };

  const validateMobile = (val: string) => {
    if (!val.trim()) return "Mobile is required";
    if (!/^\d{10}$/.test(val)) return "Must be exactly 10 digits";
    return "";
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setErrors(prev => ({ ...prev, name: validateName(val) }));
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMobile(val);
    setErrors(prev => ({ ...prev, mobile: validateMobile(val) }));
  };

  const handlePay = () => {
    const nameErr = validateName(name);
    const mobileErr = validateMobile(mobile);
    if (nameErr || mobileErr) {
      setErrors({ name: nameErr, mobile: mobileErr });
      setShowDetails(true);
      return;
    }
    setPaymentState('processing');
    setTimeout(() => {
      setPaymentState('biometric');
    }, 200); // reduced from 1500
  };

  const handleBiometricAuth = () => {
    setPaymentState('processing');
    setTimeout(() => {
      setPaymentState('success');
    }, 200); // reduced from 2000
  };

  if (paymentState === 'success') {
    return (
      <div className="max-w-md mx-auto min-h-[80vh] flex flex-col items-center justify-center p-6 bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
          >
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </motion.div>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-center mb-2"
        >
          Payment Successful
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-slate-400 text-center"
        >
          Your transaction has been securely processed.
        </motion.p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-slate-950 text-white rounded-3xl shadow-2xl border border-slate-900 relative min-h-screen pb-28">
      <div className="p-6">
        {onBack && (
          <button 
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
        {/* Header Section */}
        <div className="bg-indigo-900/30 p-6 rounded-3xl border border-indigo-500/30 mb-8">
          <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">⚡ Razorpay Secure Gateway</h2>
          <h1 className="text-xl font-bold mt-1">PCI-DSS Vaulted Pipeline</h1>
          <p className="text-xs text-slate-400 mt-2">Verify identity and process transfers with 256-bit bank-grade encryption layers.</p>
          
          <div className="mt-4 flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700 w-fit">
            <span className="text-green-400 text-xs font-mono">● SECURE STATE</span>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-300 uppercase tracking-wide">Handshake Controller</h3>
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
            >
              {showDetails ? 'Hide Details' : 'Edit Details'}
            </button>
          </div>

          <AnimatePresence>
            {!showDetails && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 uppercase font-bold">Account Holder</span>
                  <span className="font-medium text-lg">{name || 'Not provided'}</span>
                  <span className="text-sm text-slate-400 mt-1">{mobile ? `+91 ${mobile}` : 'Not provided'}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {showDetails && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">ACCOUNT HOLDER NAME *</label>
                    {errors.name && <span className="text-[10px] font-bold text-red-400">{errors.name}</span>}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter full legal name"
                    value={name}
                    onChange={handleNameChange}
                    className={`w-full bg-slate-900 border ${errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-indigo-500'} rounded-2xl p-4 text-sm outline-none transition-all`}
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">CONTACT MOBILE *</label>
                    {errors.mobile && <span className="text-[10px] font-bold text-red-400">{errors.mobile}</span>}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter 10-digit number"
                    value={mobile}
                    onChange={handleMobileChange}
                    className={`w-full bg-slate-900 border ${errors.mobile ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-indigo-500'} rounded-2xl p-4 text-sm outline-none transition-all`}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">PREFILL EMAIL ADDRESS (OPTIONAL)</label>
                  <input 
                    type="text" 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pt-12 z-10 flex justify-center pointer-events-none">
        <div className="max-w-md w-full pointer-events-auto">
          <button 
            onClick={handlePay}
            disabled={paymentState === 'processing'}
            className="w-full bg-indigo-600 hover:bg-indigo-500 py-5 rounded-3xl font-bold text-lg transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-80 disabled:active:scale-100"
          >
            {paymentState === 'processing' ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Processing...
              </>
            ) : (
              'PROCEED TO PAY'
            )}
          </button>
        </div>
      </div>

      {/* Biometric Overlay */}
      <AnimatePresence>
        {paymentState === 'biometric' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 pointer-events-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full text-center"
            >
              <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mb-6">
                <ScanFace className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Verify Identity</h3>
              <p className="text-slate-400 text-sm mb-8">Please authenticate to securely link your bank account.</p>
              
              <button 
                onClick={handleBiometricAuth}
                className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-bold transition-all"
              >
                Simulate FaceID
              </button>
              
              <button 
                onClick={() => setPaymentState('idle')}
                className="w-full text-slate-400 hover:text-white py-4 mt-2 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SwiftPayGateway;
