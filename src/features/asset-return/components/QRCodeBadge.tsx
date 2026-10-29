import React, { useMemo } from 'react';
import QRCode from 'qrcode';

export const QRCodeSVG: React.FC<{ value: string; size?: number; className?: string }> = ({ value, size = 120, className = '' }) => {
  const matrix = useMemo(() => QRCode.create(value, { errorCorrectionLevel: 'M' }).modules, [value]);
  const quietZone = 4;
  const width = matrix.size + quietZone * 2;
  return <svg width={size} height={size} viewBox={'0 0 ' + width + ' ' + width} className={'bg-white p-2 rounded shadow-xs border border-slate-200 ' + className} aria-label={'QR Code for ' + value} shapeRendering="crispEdges">
    <rect width={width} height={width} fill="white" />
    {Array.from(matrix.data).map((active, index) => active ? <rect key={index} x={index % matrix.size + quietZone} y={Math.floor(index / matrix.size) + quietZone} width="1" height="1" fill="#0f172a" /> : null)}
  </svg>;
};
