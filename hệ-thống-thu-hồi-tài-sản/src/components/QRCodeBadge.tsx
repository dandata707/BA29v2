import React from 'react';

// Generates a deterministic SVG QR Code matrix for any code
export const QRCodeSVG: React.FC<{ value: string; size?: number; className?: string }> = ({
  value,
  size = 120,
  className = '',
}) => {
  // Generate deterministic pseudo-random 21x21 QR code matrix based on value string
  const gridSize = 21;
  const hash = (str: string, seed: number) => {
    let h = seed;
    for (let i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  };

  const isFinderPattern = (r: number, c: number) => {
    // Top-left finder
    if (r <= 6 && c <= 6) {
      if (r === 0 || r === 6 || c === 0 || c === 6) return true;
      if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    // Top-right finder
    if (r <= 6 && c >= gridSize - 7) {
      const oc = c - (gridSize - 7);
      if (r === 0 || r === 6 || oc === 0 || oc === 6) return true;
      if (r >= 2 && r <= 4 && oc >= 2 && oc <= 4) return true;
      return false;
    }
    // Bottom-left finder
    if (r >= gridSize - 7 && c <= 6) {
      const or = r - (gridSize - 7);
      if (or === 0 || or === 6 || c === 0 || c === 6) return true;
      if (or >= 2 && or <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    return false;
  };

  const isTimingOrQuiet = (r: number, c: number) => {
    if (r === 6 && c > 6 && c < gridSize - 7) return c % 2 === 0;
    if (c === 6 && r > 6 && r < gridSize - 7) return r % 2 === 0;
    return null;
  };

  const cells: boolean[][] = [];
  for (let r = 0; r < gridSize; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < gridSize; c++) {
      if (isFinderPattern(r, c)) {
        row.push(true);
      } else if (
        (r < 7 && (c === 7 || c === gridSize - 8)) ||
        (r === 7 && (c < 8 || c >= gridSize - 8)) ||
        (r === gridSize - 8 && c < 8) ||
        (c === 7 && r >= gridSize - 8)
      ) {
        row.push(false);
      } else {
        const timing = isTimingOrQuiet(r, c);
        if (timing !== null) {
          row.push(timing);
        } else {
          const valHash = hash(value, r * 37 + c * 17);
          row.push(valHash % 2 === 1);
        }
      }
    }
    cells.push(row);
  }

  const cellSize = size / gridSize;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`bg-white p-2 rounded shadow-xs border border-slate-200 ${className}`}
      aria-label={`QR Code for ${value}`}
    >
      <rect width={size} height={size} fill="white" />
      {cells.map((row, r) =>
        row.map((active, c) =>
          active ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.1}
              height={cellSize + 0.1}
              fill="#0F172A"
            />
          ) : null
        )
      )}
    </svg>
  );
};
