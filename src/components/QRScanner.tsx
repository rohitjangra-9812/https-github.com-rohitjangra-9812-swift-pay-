import React, { useEffect, useRef, useState } from "react";
import { Loader2, QrCode, XCircle, CheckCircle2 } from "lucide-react";
import jsQR from "jsqr";

interface QRScannerProps {
  onBack: () => void;
  onScanSuccess: (data: { upiId: string; merchant: string }) => void;
}

export const QRScanner = ({ onBack, onScanSuccess }: QRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanStatus, setScanStatus] = useState<"scanning" | "validating" | "success" | "error">("scanning");
  const [errorMessage, setErrorMessage] = useState("");
  
  const scanStatusRef = React.useRef(scanStatus);
  React.useEffect(() => {
    scanStatusRef.current = scanStatus;
  }, [scanStatus]);

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

  useEffect(() => {
    let stream: MediaStream | null = null;
    let requestAnimationFrameId: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true"); // required to tell iOS safari we don't want fullscreen
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch((e) => console.log("Play interrupted", e));
          }
          requestAnimationFrame(tick);
        }
        setHasPermission(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasPermission(false);
      }
    };

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        if (canvasRef.current) {
          canvasRef.current.height = videoRef.current.videoHeight;
          canvasRef.current.width = videoRef.current.videoWidth;
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });

            if (code) {
              const data = code.data;
              const upiData = parseUpiUri(data);
              
              if (upiData) {
                setScanStatus("validating");
                setTimeout(() => {
                  setScanStatus("success");
                  setTimeout(() => {
                    onScanSuccess(upiData);
                  }, 200);
                }, 200);
                return; // Stop scanning
              } else { 
                 setScanStatus("error");
                 setErrorMessage("Invalid QR: Not a UPI format");
                 setTimeout(() => {
                   setScanStatus("scanning");
                 }, 500);
              }
            }
          }
        }
      }

      if (scanStatusRef.current === "scanning") {
         requestAnimationFrameId = requestAnimationFrame(tick);
      } else if (scanStatusRef.current === "error") {
         // keep ticking to resume scanning later
         requestAnimationFrameId = requestAnimationFrame(tick);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      cancelAnimationFrame(requestAnimationFrameId);
    };
  }, [onScanSuccess]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full h-full relative z-[60] bg-slate-950 animate-in fade-in duration-300">
      {hasPermission === false ? (
        <div className="text-center p-6 flex flex-col items-center">
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Camera Access Denied</h3>
          <p className="text-slate-400 mb-6 text-sm">Please enable camera access to scan QR codes.</p>
          <button
            onClick={onBack}
            className="bg-slate-800 text-white px-6 py-2 rounded-xl font-semibold hover:bg-slate-700"
          >
            Go Back
          </button>
        </div>
      ) : (
        <>
          {/* Scanner Frame */}
          <div className="relative w-full max-w-sm aspect-[3/4] overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                scanStatus === "success" ? "opacity-30 grayscale" : "opacity-100"
              }`}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scan Overlay UI */}
            <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white tracking-wider">UPI QR SCAN</span>
                </div>
                <button
                  onClick={onBack}
                  className="w-10 h-10 bg-slate-900/80 backdrop-blur-md rounded-full flex items-center justify-center border border-slate-700/50 hover:bg-slate-800 transition-colors"
                >
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center">
                {/* Scanner Reticle */}
                {scanStatus === "scanning" && (
                  <div className="w-48 h-48 border-2 border-indigo-500/50 rounded-2xl relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-indigo-500 rounded-br-xl"></div>

                    {/* Scanning Animation Line */}
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                  </div>
                )}

                {scanStatus === "validating" && (
                  <div className="flex flex-col items-center bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 animate-in zoom-in-95">
                    <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-3" />
                    <p className="text-sm font-bold text-white">Validating QR Code...</p>
                    <p className="text-xs text-slate-400 mt-1">Securing connection</p>
                  </div>
                )}

                {scanStatus === "error" && (
                  <div className="flex flex-col items-center bg-red-900/90 backdrop-blur-md p-6 rounded-2xl border border-red-700/50 animate-in zoom-in-95">
                    <XCircle className="w-10 h-10 text-red-400 mb-3" />
                    <p className="text-sm font-bold text-white">Error</p>
                    <p className="text-xs text-red-300 mt-1">{errorMessage}</p>
                  </div>
                )}

                {scanStatus === "success" && (
                  <div className="flex flex-col items-center bg-green-500/10 backdrop-blur-md p-6 rounded-2xl border border-green-500/30 animate-in zoom-in-95">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
                    <p className="text-lg font-bold text-white">Verified!</p>
                  </div>
                )}
              </div>

              <div className="text-center pb-4">
                <p className="text-sm font-medium text-white drop-shadow-md">
                  {scanStatus === "scanning" ? "Align QR code within the frame" : ""}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(192px); }
          100% { transform: translateY(0); }
        }
      ` }} />
    </div>
  );
};
