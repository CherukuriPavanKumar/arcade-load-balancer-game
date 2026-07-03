import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QrPaymentOverlayProps {
  sessionId: string | null;
  error?: string | null;
  onSkip: () => void;
}

export default function QrPaymentOverlay({ sessionId, error, onSkip }: QrPaymentOverlayProps) {
  const qrData = sessionId ? `wow2026:experience:${sessionId}` : '';

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="flex flex-col items-center bg-[#1e1e1e] border border-white/10 rounded-3xl p-12 shadow-2xl relative">
        <button 
          onClick={onSkip}
          className="absolute top-4 right-4 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full transition-colors"
        >
          Dev Skip
        </button>

        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest text-center">
          Unlock Arcade
        </h2>
        <p className="text-gray-400 mb-8 text-center max-w-sm leading-relaxed">
          Scan this QR Code with your WOW Mobile App to play Load Balancing Blitz!
        </p>

        <div className="bg-white p-6 rounded-2xl mb-8 shadow-[0_0_40px_rgba(66,133,244,0.3)]">
          {error ? (
             <div className="flex items-center justify-center w-64 h-64 text-red-500 font-bold text-center p-4">
               {error}
             </div>
          ) : qrData ? (
            <QRCodeSVG 
              value={qrData} 
              size={256} 
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"H"}
              includeMargin={false}
            />
          ) : (
             <div className="flex items-center justify-center w-64 h-64">
               <div className="w-10 h-10 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
             </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!error && (
            <div className="w-5 h-5 border-4 border-[#4285F4] border-t-transparent rounded-full animate-spin"></div>
          )}
          <span className={`${error ? 'text-red-400' : 'text-[#4285F4]'} font-semibold uppercase tracking-widest`}>
            {error ? 'Failed to connect' : 'Waiting for payment...'}
          </span>
        </div>
      </div>
    </div>
  );
}
