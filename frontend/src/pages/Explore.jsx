import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, TrendingUp, Trophy } from 'lucide-react';
import { api, absoluteAvatarUrl } from '@/lib/api';
import { EmptyState, ErrorState } from '@/components/States';
import { motion } from 'framer-motion';

export default function Explore() {
  const [q, setQ] = useState('');
  const [data, setData] = useState({ collectors: [], trending: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/explore', { params: q ? { q } : {} });
      setData(data);
    } catch (e) { setError(e?.response?.data?.detail || 'Failed'); }
    finally { setLoading(false); }
  };
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); /* eslint-disable-next-line */ }, [q]);

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      <header>
        <div className="text-xs uppercase tracking-[0.22em] text-ps-blue-glow">Community</div>
        <h1 className="heading-display text-3xl sm:text-4xl font-bold">Discover Collectors</h1>
      </header>

      <div className="grid xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-4">
          <div className="glass p-3">
            <div className="relative">
              <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ps-white/55" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by username or name…" className="ps-input pl-9" data-testid="explore-search-input" />
            </div>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}
            </div>
          ) : data.collectors.length === 0 ? (
            <EmptyState title="No collectors yet" description="Try a different search or come back later — the community is growing!" testid="explore-empty" />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="collectors-grid">
              {data.collectors.map((c, i) => (
                <motion.div key={c.username} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                  <Link to={`/profile/${c.username}`} className="glass p-4 flex items-center gap-3 hover:shadow-glow block" data-testid="collector-card">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-ps-dark border-2 border-ps-blue-light/40 grid place-items-center text-lg font-display">
                      {absoluteAvatarUrl(c.avatar_url) ? <img src={absoluteAvatarUrl(c.avatar_url)} alt="" className="w-full h-full object-cover" /> : (c.display_name || '?').slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{c.display_name}</div>
                      <div className="text-xs text-ps-white/55">@{c.username}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="num-display text-[10px] uppercase px-1.5 py-0.5 rounded border border-ps-blue-light/30 text-ps-blue-glow">{c.favourite_platform}</span>
                        <span className="num-display text-[10px] text-ps-white/55">{c.total_games} games</span>
                        <span className="num-display text-[10px] text-status-completed">{c.completion_rate}%</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Trending sidebar */}
        <aside className="glass p-5 self-start">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ps-blue-glow"><TrendingUp size={14} /> Trending This Week</div>
          {data.trending.length === 0 ? (
            <div className="text-sm text-ps-white/55 mt-3">No trending data yet — add games to see what others are picking up.</div>
          ) : (
            <div className="space-y-3 mt-4">
              {data.trending.map((t, i) => (
                <Link key={`${t.igdb_game_id}-${i}`} to={`/game/${t.igdb_game_id}`} className="flex items-center gap-3 hover:bg-ps-blue-light/5 rounded-lg p-1.5" data-testid="trending-game">
                  <div className="num-display text-ps-blue-glow w-5">{i + 1}</div>
                  <div className="w-9 h-12 rounded overflow-hidden bg-ps-dark shrink-0">
                    {t.cover_url && <img src={t.cover_url} alt="" loading="lazy" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{t.name}</div>
                    <div className="text-[10px] text-ps-white/55 num-display">{t.adds} adds</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
