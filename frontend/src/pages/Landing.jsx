import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Database, BarChart3, Globe, ArrowRight } from 'lucide-react';
import FloatingPSSymbols from '@/components/FloatingPSSymbols';
import CountUp from '@/components/CountUp';
import { PS_PLATFORMS } from '@/constants/ps';

const PS_SYMBOLS = [
  { char: '✕', color: '#0070D1' },
  { char: '◯', color: '#E8003D' },
  { char: '△', color: '#00B050' },
  { char: '▢', color: '#FF69B4' },
];

function HeroSymbols() {
  const items = useMemo(() => {
    const rng = (seed) => {
      // deterministic PRNG so positions don't reshuffle on re-render
      let x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    return Array.from({ length: 16 }).map((_, i) => {
      const sym = PS_SYMBOLS[i % 4];
      const top = rng(i + 1) * 90;            // 0–90%
      const left = rng(i + 100) * 92;          // 0–92%
      const size = 24 + rng(i + 200) * 76;     // 24–100px
      const opacity = 0.03 + rng(i + 300) * 0.03; // 0.03–0.06
      const duration = 20 + rng(i + 400) * 30; // 20–50s
      const dx = (rng(i + 500) - 0.5) * 120;   // ±60px
      const dy = (rng(i + 600) - 0.5) * 120;
      const rot = (rng(i + 700) - 0.5) * 20;   // ±10deg
      const delay = rng(i + 800) * 6;          // 0–6s
      return { sym, top, left, size, opacity, duration, dx, dy, rot, delay, i };
    });
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {items.map(({ sym, top, left, size, opacity, duration, dx, dy, rot, delay, i }) => (
        <motion.span
          key={i}
          className="absolute select-none"
          style={{
            top: `${top}%`,
            left: `${left}%`,
            fontFamily: "'Rajdhani', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: `${size}px`,
            color: sym.color,
            opacity,
            lineHeight: 1,
            willChange: 'transform',
          }}
          animate={{ x: [0, dx, 0], y: [0, dy, 0], rotate: [0, rot, 0] }}
          transition={{ duration, delay, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        >
          {sym.char}
        </motion.span>
      ))}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen relative">
      {/* Hero */}
      <section
        className="relative min-h-[100svh] flex flex-col overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #00060F 0%, #000D1A 100%)' }}
      >
        <HeroSymbols />
        <header className="relative z-10 flex items-center justify-between px-5 sm:px-10 py-5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-ps-blue-light/15 border border-ps-blue-light/40 grid place-items-center text-ps-blue-light font-display font-bold">PS</div>
            <div className="heading-display text-xl font-bold text-ps-white">PS Shelf</div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth/login" className="ps-button-ghost text-sm h-10 min-h-0 px-4" data-testid="landing-signin-link">Sign In</Link>
            <Link to="/auth/signup" className="ps-button text-sm h-10 min-h-0 px-4" data-testid="landing-signup-link">Start Your Shelf</Link>
          </div>
        </header>
        <div className="relative z-10 flex-1 flex items-center px-5 sm:px-10">
          <div className="max-w-screen-2xl mx-auto w-full grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center py-12">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 ps-pill text-xs uppercase tracking-[0.18em] text-ps-white/75"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-ps-blue-glow animate-pulse" />
                PS1 → PS5 · PSP · PS Vita
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
                className="heading-display mt-5 leading-[1.02]"
                style={{
                  fontFamily: "'Rajdhani', system-ui, sans-serif",
                  fontWeight: 700,
                  color: '#FFFFFF',
                  fontSize: 'clamp(40px, 6vw, 64px)',
                }}
              >
                Your PlayStation Collection.
                <br />
                <span className="text-ps-blue-glow">Elevated.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-6 max-w-xl"
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 400,
                  fontSize: '20px',
                  lineHeight: 1.55,
                  color: 'rgba(240,244,255,0.7)',
                }}
              >
                Track every disc, every download, every platinum. Built for PlayStation collectors who want a beautiful, shareable shelf.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
                className="flex flex-wrap gap-3 mt-8"
              >
                <Link to="/auth/signup" className="ps-button text-base" data-testid="landing-hero-cta">
                  Start Your Shelf <ArrowRight size={18} />
                </Link>
                <a href="#features" className="ps-button-ghost text-base" data-testid="landing-howitworks-link">See How It Works</a>
              </motion.div>

              <div className="mt-10 grid grid-cols-3 gap-3 max-w-lg">
                <Stat label="Games Indexed" value={50000} suffix="+" />
                <Stat label="PS Eras" value={7} />
                <Stat label="Always" valueText="Free" />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <ShelfMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-5 sm:px-10 py-20">
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.22em] text-ps-blue-glow">Built for collectors</div>
            <h2 className="heading-display text-4xl sm:text-5xl font-bold mt-3">Everything your shelf deserves.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Feature icon={<Database size={22} />} title="Complete Game Database" body="Real data from IGDB — covers, screenshots, ratings, release dates, and platforms across the entire PlayStation lineage." />
            <Feature icon={<BarChart3 size={22} />} title="Track Your Status" body="Playing, completed, owned, wishlisted, dropped — with hours played, personal ratings, and notes for every entry." />
            <Feature icon={<Globe size={22} />} title="Your Public Profile" body="A shareable shelf at /profile/your-username with stats, top genres, platform breakdown, and monthly additions." />
          </div>

          <div className="mt-16 glass p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-ps-blue-glow">All PlayStation eras</div>
              <div className="heading-display text-2xl sm:text-3xl font-bold mt-1">From the original to the DualSense.</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {PS_PLATFORMS.map((p) => (
                <span key={p} className="ps-pill text-xs num-display uppercase">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-5 sm:px-10 py-10 border-t border-ps-blue-light/15">
        <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-ps-blue-light/15 border border-ps-blue-light/40 grid place-items-center text-ps-blue-light font-display font-bold">PS</div>
              <div className="heading-display text-lg font-bold">PS Shelf</div>
            </div>
            <div className="text-xs text-ps-white/55 mt-2 max-w-md">A love letter to PlayStation collectors. Not affiliated with Sony Interactive Entertainment.</div>
          </div>
          <div className="flex gap-5 text-sm text-ps-white/65">
            <a href="#" className="hover:text-ps-white">Privacy</a>
            <a href="#" className="hover:text-ps-white">Terms</a>
            <Link to="/auth/signup" className="hover:text-ps-white">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value, valueText, suffix = '' }) {
  return (
    <div className="glass px-4 py-3">
      <div className="num-display text-2xl text-ps-white">
        {valueText ?? <><CountUp to={value} />{suffix}</>}
      </div>
      <div className="text-[11px] uppercase tracking-[0.16em] text-ps-white/55 mt-1">{label}</div>
    </div>
  );
}

function Feature({ icon, title, body }) {
  return (
    <div className="glass p-6 hover:shadow-glow" style={{ transition: 'box-shadow 0.2s ease' }}>
      <div className="w-11 h-11 rounded-xl bg-ps-blue-light/15 border border-ps-blue-light/40 grid place-items-center text-ps-blue-glow">{icon}</div>
      <div className="heading-display text-lg font-semibold mt-4">{title}</div>
      <p className="text-sm text-ps-white/65 mt-2 leading-relaxed">{body}</p>
    </div>
  );
}

function ShelfMockup() {
  return (
    <div className="glass p-4 rounded-[20px] relative">
      <div className="grid grid-cols-3 gap-3">
        {['#0070D1', '#9B59B6', '#00B050', '#E74C3C', '#F39C12', '#1A6FFF'].map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }}
            className="aspect-[3/4] rounded-xl border border-ps-blue-light/25 overflow-hidden relative"
            style={{ background: `linear-gradient(160deg, ${c}33, rgba(0,13,26,0.95))` }}
          >
            <div className="absolute bottom-2 left-2 right-2">
              <div className="h-2 rounded bg-ps-white/30 w-3/4" />
              <div className="h-2 rounded bg-ps-white/15 w-1/2 mt-1" />
            </div>
            <div className="absolute top-2 right-2 num-display text-[10px] px-1.5 py-0.5 rounded bg-ps-dark/80 border border-ps-blue-light/30">PS5</div>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="glass p-2.5"><div className="text-[10px] text-ps-white/55 uppercase tracking-wider">Playing</div><div className="num-display text-lg mt-0.5">3</div></div>
        <div className="glass p-2.5"><div className="text-[10px] text-ps-white/55 uppercase tracking-wider">Completed</div><div className="num-display text-lg mt-0.5">42</div></div>
        <div className="glass p-2.5"><div className="text-[10px] text-ps-white/55 uppercase tracking-wider">Wishlist</div><div className="num-display text-lg mt-0.5">17</div></div>
      </div>
    </div>
  );
}
