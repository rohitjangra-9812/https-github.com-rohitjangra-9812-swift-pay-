import React, { useState, useRef, useEffect } from 'react';
import { Fingerprint } from 'lucide-react';
import { toast } from 'sonner';

interface BiometricModalProps {
  onVerify: () => void;
  onCancel: () => void;
}

export const BiometricModal: React.FC<BiometricModalProps> = ({ onVerify, onCancel }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const progressTimer = useRef<NodeJS.Timeout | null>(null);

  const startScan = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsScanning(true);
    setProgress(0);
    
    // Provide initial haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Start progress animation
    let currentProgress = 0;
    progressTimer.current = setInterval(() => {
      currentProgress += 25; // Faster progress
      if (currentProgress <= 100) {
        setProgress(currentProgress);
      }
    }, 50);

    holdTimer.current = setTimeout(() => {
      // Success haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      cleanup();
      toast.success("Identity verified successfully!");
      onVerify();
    }, 200);
  };

  const cleanup = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (progressTimer.current) clearInterval(progressTimer.current);
  };

  const stopScan = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsScanning(false);
    setProgress(0);
    cleanup();
  };

  useEffect(() => {
    return cleanup;
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="text-center w-full max-w-sm px-6 relative">
        <button 
          onClick={onCancel}
          className="absolute -top-16 right-6 text-slate-400 hover:text-white"
        >
          Cancel
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-2">Biometric Verification</h2>
        <p className="text-slate-400 mb-12">Use your Fingerprint, Face ID, or Screen Lock to verify</p>
        
        <div 
          className="relative w-32 h-32 mx-auto cursor-pointer touch-none select-none"
          onPointerDown={startScan}
          onPointerUp={stopScan}
          onPointerLeave={stopScan}
          onPointerCancel={stopScan}
        >
          {/* Background ping effect */}
          <div className="absolute inset-0 bg-indigo-500/10 rounded-full"></div>
          
          {/* Circular progress */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle 
              cx="64" cy="64" r="62" 
              fill="none" 
              stroke="rgba(99, 102, 241, 0.2)" 
              strokeWidth="4" 
            />
            <circle 
              cx="64" cy="64" r="62" 
              fill="none" 
              stroke="#6366f1" 
              strokeWidth="4" 
              strokeDasharray={389.55}
              strokeDashoffset={389.55 - (progress / 100) * 389.55}
              className="transition-all duration-75 ease-linear"
            />
          </svg>

          {/* Icon */}
          <div className={`absolute inset-0 flex items-center justify-center transition-colors duration-200 ${isScanning ? 'text-indigo-400 scale-95' : 'text-indigo-600'}`}>
            <Fingerprint className="w-16 h-16" />
          </div>
          
          {/* Scan line effect when holding */}
          {isScanning && (
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-400/80 shadow-[0_0_10px_#818cf8] animate-[scan_1s_ease-in-out_infinite_alternate] pointer-events-none"></div>
          )}
        </div>
        
        <p className={`mt-12 font-medium transition-colors ${isScanning ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`}>
          {isScanning ? 'Scanning...' : 'Ready'}
        </p>
      </div>
    </div>
  );
};
