import React from 'react';
import { motion } from 'framer-motion';

const symbols = [
  { type: 'cross', color: '#0070D1', x: '8%', y: '18%', size: 88, duration: 16 },
  { type: 'circle', color: '#E74C3C', x: '78%', y: '12%', size: 110, duration: 22 },
  { type: 'square', color: '#9B59B6', x: '15%', y: '72%', size: 95, duration: 19 },
  { type: 'triangle', color: '#00B050', x: '85%', y: '78%', size: 100, duration: 17 },
  { type: 'cross', color: '#0070D1', x: '60%', y: '85%', size: 60, duration: 21 },
  { type: 'square', color: '#9B59B6', x: '50%', y: '32%', size: 70, duration: 24 },
];

function SymbolSvg({ type, color, size }) {
  const stroke = Math.max(3, size / 18);
  if (type === 'cross') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <line x1="20" y1="20" x2="80" y2="80" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
        <line x1="80" y1="20" x2="20" y2="80" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'circle') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="32" stroke={color} strokeWidth={stroke} />
      </svg>
    );
  }
  if (type === 'square') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <rect x="22" y="22" width="56" height="56" stroke={color} strokeWidth={stroke} rx="4" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <polygon points="50,18 82,78 18,78" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
    </svg>
  );
}

export default function FloatingPSSymbols() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" data-testid="floating-ps-symbols">
      {symbols.map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: s.x, top: s.y, opacity: 0.05 }}
          animate={{ y: [0, -22, 0], rotate: [0, 10, 0] }}
          transition={{ duration: s.duration, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
        >
          <SymbolSvg type={s.type} color={s.color} size={s.size} />
        </motion.div>
      ))}
    </div>
  );
}
