import React, { useRef, useState } from "react";
import { Loader2, ImageIcon, XCircle, CheckCircle2 } from "lucide-react";
import jsQR from "jsqr";

interface UploadQRProps {
  onBack: () => void;
  onScanSuccess: (data: { upiId: string; merchant: string }) => void;
}

export const UploadQR = ({ onBack, onScanSuccess }: UploadQRProps) => {
  const [scanStatus, setScanStatus] = useState<"idle" | "validating" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseUpiUri = (uri: string) => {
    try {
      if (!uri.toLowerCase().startsWith("upi://pay")) return null;
      const url = new URL(uri);
      const pa = url.searchParams.get("pa"); // Payee VPA
      const pn = url.searchParams.get("pn"); // Payee Name
      if (pa) {
        return { upiId: pa, merchant: pn || "Unknown Merchant" };
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanStatus("validating");
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            const data = code.data;
            const upiData = parseUpiUri(data);
            
            if (upiData) {
              setScanStatus("success");
              setTimeout(() => {
                onScanSuccess(upiData);
              }, 200);
            } else {
              setScanStatus("error");
              setErrorMessage("Invalid QR: Not a UPI format");
              setTimeout(() => {
                setScanStatus("idle");
              }, 500);
            }
          } else {
             setScanStatus("error");
             setErrorMessage("No QR code found in image");
             setTimeout(() => {
               setScanStatus("idle");
             }, 500);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full h-full relative z-[60] bg-slate-950 animate-in fade-in duration-300 p-6">
      <div className="w-full max-w-sm">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors mb-6 border border-slate-700/50"
        >
          <XCircle className="w-6 h-6 text-slate-400" />
        </button>

        <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl flex flex-col items-center text-center">
          {scanStatus === "idle" && (
            <>
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                <ImageIcon className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Upload QR Code</h3>
              <p className="text-slate-400 text-sm mb-8">Select an image from your gallery to scan a UPI QR code.</p>
              
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold transition-colors"
              >
                Choose Image
              </button>
            </>
          )}

          {scanStatus === "validating" && (
            <div className="py-8 flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
              <p className="text-lg font-bold text-white">Scanning Image...</p>
            </div>
          )}

          {scanStatus === "error" && (
            <div className="py-8 flex flex-col items-center">
              <XCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-lg font-bold text-white mb-2">Error</p>
              <p className="text-sm text-red-400">{errorMessage}</p>
            </div>
          )}

          {scanStatus === "success" && (
            <div className="py-8 flex flex-col items-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
              <p className="text-lg font-bold text-white">Verified!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
