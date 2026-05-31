import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import GameCard from '@/components/GameCard';
import AddToCollectionModal from '@/components/AddToCollectionModal';
import { SkeletonGameCard, ErrorState } from '@/components/States';
import { PS_PLATFORMS } from '@/constants/ps';

const PLATFORM_GLOWS = {
  PS1: '#9B59B6',
  PS2: '#0070D1',
  PS3: '#1A6FFF',
  PS4: '#0070D1',
  PS5: '#1A6FFF',
  PSP: '#00B050',
  'PS Vita': '#F39C12',
};

export default function Platforms() {
  const [active, setActive] = useState('PS5');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalGame, setModalGame] = useState(null);
  const [modalMode, setModalMode] = useState('collection');

  const load = async (p) => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get(`/igdb/platform/${encodeURIComponent(p)}`, { params: { sort: 'rating', page_size: 24 } });
      setGames(data.results);
    } catch (e) { setError(e?.response?.data?.detail || 'Failed'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(active); /* eslint-disable-next-line */ }, [active]);

  return (
    <div className="space-y-5">
      <header>
        <div className="text-xs uppercase tracking-[0.22em] text-ps-blue-glow">Browse</div>
        <h1 className="heading-display text-3xl sm:text-4xl font-bold">By Platform</h1>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3" data-testid="platform-selector">
        {PS_PLATFORMS.map((p) => {
          const glow = PLATFORM_GLOWS[p] || '#1A6FFF';
          const selected = active === p;
          return (
            <motion.button
              key={p}
              onClick={() => setActive(p)}
              whileHover={{ y: -2 }}
              data-testid={`platform-card-${p.replace(/\s/g, '')}`}
              className={`glass p-4 text-center transition-shadow`}
              style={selected ? { boxShadow: `0 0 0 1px ${glow}AA, 0 0 28px ${glow}55` } : {}}
            >
              <div className="num-display text-xl text-ps-white" style={{ color: selected ? glow : '#F0F4FF' }}>{p}</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-ps-white/55 mt-1">PlayStation</div>
            </motion.button>
          );
        })}
      </div>

      {error && <ErrorState message={error} onRetry={() => load(active)} />}

      <div data-testid="platform-top-games">
        <h2 className="heading-display text-lg font-semibold mb-3">Top on {active}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <SkeletonGameCard key={i} />)
            : games.map((g, i) => (
              <GameCard
                key={g.id}
                game={g}
                index={i}
                onAdd={(g) => { setModalGame(g); setModalMode('collection'); }}
                onWishlist={(g) => { setModalGame(g); setModalMode('wishlist'); }}
              />
            ))}
        </div>
      </div>

      <AddToCollectionModal open={!!modalGame} game={modalGame} mode={modalMode} defaultPlatform={active} onClose={() => setModalGame(null)} />
    </div>
  );
}
