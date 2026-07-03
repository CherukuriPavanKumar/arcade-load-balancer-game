import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QrPaymentOverlayProps {
  sessionId: string;
}

export default function QrPaymentOverlay({ sessionId }: QrPaymentOverlayProps) {
  const qrData = `wow2026:experience:${sessionId}`;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="flex flex-col items-center bg-[#1e1e1e] border border-white/10 rounded-3xl p-12 shadow-2xl">
        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest text-center">
          Unlock Arcade
        </h2>
        <p className="text-gray-400 mb-8 text-center max-w-sm leading-relaxed">
          Scan this QR Code with your WOW Mobile App to play Load Balancing Blitz!
        </p>

        <div className="bg-white p-6 rounded-2xl mb-8 shadow-[0_0_40px_rgba(66,133,244,0.3)]">
          <QRCodeSVG 
            value={qrData} 
            size={256} 
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"H"}
            includeMargin={false}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-4 border-[#4285F4] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#4285F4] font-semibold uppercase tracking-widest">
            Waiting for payment...
          </span>
        </div>
      </div>
    </div>
  );
}
