import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface ScratchCardOverlayProps {
  width: number;
  height: number;
  onScratchComplete: () => void;
  children: React.ReactNode;
}

export const ScratchCardOverlay: React.FC<ScratchCardOverlayProps> = ({ width, height, onScratchComplete, children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratched, setIsScratched] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Fill with a nice gradient and text
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#6366f1'); // Indigo 500
    gradient.addColorStop(1, '#8b5cf6'); // Violet 500
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add some pattern/text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCRATCH ME', width / 2, height / 2);

    let isDrawing = false;
    
    const getCoordinates = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      let clientX, clientY;

      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const handleScratchStart = (e: MouseEvent | TouchEvent) => {
      isDrawing = true;
      scratch(e);
    };

    const handleScratchMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      scratch(e);
    };

    const handleScratchEnd = () => {
      isDrawing = false;
      checkScratched();
    };

    const scratch = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const { x, y } = getCoordinates(e);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      ctx.fill();
    };

    const checkScratched = () => {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      let transparentPixels = 0;
      
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] === 0) {
          transparentPixels++;
        }
      }
      
      const totalPixels = width * height;
      const scratchedPercentage = (transparentPixels / totalPixels) * 100;
      
      if (scratchedPercentage > 50 && !isScratched) {
        setIsScratched(true);
        canvas.style.transition = 'opacity 0.5s ease-out';
        canvas.style.opacity = '0';
        setTimeout(() => {
          onScratchComplete();
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }, 500);
      }
    };

    canvas.addEventListener('mousedown', handleScratchStart);
    canvas.addEventListener('mousemove', handleScratchMove);
    canvas.addEventListener('mouseup', handleScratchEnd);
    canvas.addEventListener('mouseleave', handleScratchEnd);
    
    canvas.addEventListener('touchstart', handleScratchStart, { passive: false });
    canvas.addEventListener('touchmove', handleScratchMove, { passive: false });
    canvas.addEventListener('touchend', handleScratchEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleScratchStart);
      canvas.removeEventListener('mousemove', handleScratchMove);
      canvas.removeEventListener('mouseup', handleScratchEnd);
      canvas.removeEventListener('mouseleave', handleScratchEnd);
      
      canvas.removeEventListener('touchstart', handleScratchStart);
      canvas.removeEventListener('touchmove', handleScratchMove);
      canvas.removeEventListener('touchend', handleScratchEnd);
    };
  }, [width, height, isScratched, onScratchComplete]);

  return (
    <div style={{ position: 'relative', width, height }} className="rounded-2xl overflow-hidden cursor-crosshair">
      <div style={{ position: 'absolute', top: 0, left: 0, width, height }} className="pointer-events-none">
        {children}
      </div>
      {!isScratched && (
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}
        />
      )}
    </div>
  );
};
