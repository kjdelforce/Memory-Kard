import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Grid3x3, List, Trash2, Search as SearchIcon, Heart, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { STATUSES, STATUS_COLORS } from '@/constants/ps';
import { EmptyState, ErrorState } from '@/components/States';
import { motion } from 'framer-motion';

const SORT_OPTIONS = [
  { key: 'date', label: 'Date Added' },
  { key: 'name', label: 'Name' },
  { key: 'rating', label: 'Rating' },
  { key: 'platform', label: 'Platform' },
];

export default function Collection() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusTab, setStatusTab] = useState(params.get('status') || 'all');
  const [view, setView] = useState('grid');
  const [sort, setSort] = useState('date');
  const [query, setQuery] = useState('');
  const [stats, setStats] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, st] = await Promise.all([
        api.get('/collection'),
        api.get('/collection/stats'),
      ]);
      setItems(list.data);
      setStats(st.data);
    } catch (e) { setError(e?.response?.data?.detail || 'Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (statusTab === 'all') params.delete('status'); else params.set('status', statusTab);
    setParams(params, { replace: true });
    // eslint-disable-next-line
  }, [statusTab]);

  const filtered = useMemo(() => {
    let res = items;
    if (statusTab !== 'all') res = res.filter((i) => i.status === statusTab);
    if (query) res = res.filter((i) => i.game_name.toLowerCase().includes(query.toLowerCase()));
    res = [...res].sort((a, b) => {
      if (sort === 'name') return a.game_name.localeCompare(b.game_name);
      if (sort === 'rating') return (b.personal_rating || 0) - (a.personal_rating || 0);
      if (sort === 'platform') return a.platform.localeCompare(b.platform);
      return new Date(b.date_added) - new Date(a.date_added);
    });
    return res;
  }, [items, statusTab, query, sort]);

  const remove = async (id) => {
    if (!window.confirm('Remove this game from your collection?')) return;
    try {
      await api.delete(`/collection/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Removed');
    } catch (e) { toast.error('Failed to delete'); }
  };

  const changeStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/collection/${id}`, { status });
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...data } : i));
      toast.success(`Marked as ${status}`);
    } catch (e) { toast.error('Update failed'); }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-ps-blue-glow">Your library</div>
          <h1 className="heading-display text-3xl sm:text-4xl font-bold">My Collection</h1>
        </div>
        <Link to="/search" className="ps-button" data-testid="collection-add-cta"><SearchIcon size={16} /> Find games</Link>
      </header>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="collection-stats-bar">
          <StatTile label="Total" value={stats.total} color="#1A6FFF" />
          <StatTile label="Completed" value={stats.completed} color="#00B050" />
          <StatTile label="Playing" value={stats.playing} color="#0070D1" />
          <StatTile label="Hours Played" value={stats.total_hours} color="#9B59B6" />
        </div>
      )}

      {!loading && items.length === 0 ? (
        <EmptyState
          title="Your shelf is empty"
          description="Add your first PlayStation game and start tracking. Your collection lives here."
          ctaText="Find Games"
          ctaTo="/search"
          testid="collection-empty"
          icon={<PsControllerIcon />}
        />
      ) : (
        <>
          {/* Filters */}
          <div className="glass p-3 flex flex-wrap items-center gap-2">
            <button onClick={() => setStatusTab('all')} className={`ps-pill text-xs ${statusTab === 'all' ? 'border-ps-blue-glow text-ps-white shadow-glow' : ''}`} data-testid="collection-tab-all">All</button>
            {STATUSES.map((s) => (
              <button key={s.key} onClick={() => setStatusTab(s.key)}
                className="ps-pill text-xs"
                data-testid={`collection-tab-${s.key}`}
                style={statusTab === s.key ? { borderColor: s.color, background: `${s.color}22`, boxShadow: `0 0 0 1px ${s.color}55, 0 0 18px ${s.color}33`, color: '#fff' } : {}}
              >
                {s.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <div className="relative">
                <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ps-white/50" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter your shelf…" className="ps-input pl-9 h-10 min-h-0 py-1.5 text-sm w-44 sm:w-56" data-testid="collection-search" />
              </div>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="ps-pill text-xs cursor-pointer" data-testid="collection-sort">
                {SORT_OPTIONS.map((s) => <option key={s.key} value={s.key}>{`Sort: ${s.label}`}</option>)}
              </select>
              <div className="flex rounded-lg overflow-hidden border border-ps-blue-light/30">
                <button onClick={() => setView('grid')} className={`p-2 ${view === 'grid' ? 'bg-ps-blue-light/20 text-ps-white' : 'text-ps-white/55'}`} data-testid="collection-view-grid"><Grid3x3 size={16} /></button>
                <button onClick={() => setView('list')} className={`p-2 ${view === 'list' ? 'bg-ps-blue-light/20 text-ps-white' : 'text-ps-white/55'}`} data-testid="collection-view-list"><List size={16} /></button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] skeleton rounded-2xl" />)}
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4" data-testid="collection-grid">
              {filtered.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="glass group relative overflow-hidden"
                  data-testid="collection-entry-card"
                >
                  <Link to={`/game/${entry.igdb_game_id}`} className="block aspect-[3/4] bg-ps-dark">
                    {entry.game_cover_url && <img src={entry.game_cover_url} loading="lazy" alt="" className="w-full h-full object-cover" />}
                  </Link>
                  <span className="absolute top-2 left-2 num-display text-[9px] uppercase px-1.5 py-0.5 rounded"
                    style={{ background: `${STATUS_COLORS[entry.status]}33`, border: `1px solid ${STATUS_COLORS[entry.status]}`, color: '#fff' }}>
                    {entry.status}
                  </span>
                  <button onClick={() => remove(entry.id)} className="absolute top-2 right-2 p-1.5 rounded bg-ps-dark/70 text-ps-white/70 hover:text-status-dropped opacity-0 group-hover:opacity-100" data-testid="collection-delete-button"><Trash2 size={14} /></button>
                  <div className="p-2.5">
                    <div className="text-sm font-medium truncate">{entry.game_name}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="num-display text-[10px] uppercase text-ps-white/60">{entry.platform}</span>
                      {entry.personal_rating && <span className="num-display text-[10px] text-ps-blue-glow">{entry.personal_rating}/10</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass divide-y divide-ps-blue-light/10" data-testid="collection-list">
              {filtered.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 p-3 hover:bg-ps-blue-light/5">
                  <Link to={`/game/${entry.igdb_game_id}`} className="w-12 h-16 rounded overflow-hidden bg-ps-dark shrink-0">
                    {entry.game_cover_url && <img src={entry.game_cover_url} alt="" loading="lazy" className="w-full h-full object-cover" />}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/game/${entry.igdb_game_id}`} className="text-sm font-medium truncate hover:text-ps-blue-glow block">{entry.game_name}</Link>
                    <div className="flex items-center gap-3 text-xs text-ps-white/55 mt-0.5">
                      <span className="num-display uppercase">{entry.platform}</span>
                      <span>·</span>
                      <span>{new Date(entry.date_added).toLocaleDateString()}</span>
                      {entry.personal_rating && <><span>·</span><span className="text-ps-blue-glow num-display">{entry.personal_rating}/10</span></>}
                      {entry.play_time_hours > 0 && <><span>·</span><span>{entry.play_time_hours}h</span></>}
                    </div>
                  </div>
                  <select value={entry.status} onChange={(e) => changeStatus(entry.id, e.target.value)} className="ps-pill text-xs cursor-pointer" style={{ borderColor: STATUS_COLORS[entry.status] + '88', color: STATUS_COLORS[entry.status] }}>
                    {STATUSES.map((s) => <option key={s.key} value={s.key} className="bg-ps-dark text-ps-white">{s.label}</option>)}
                  </select>
                  <button onClick={() => remove(entry.id)} className="p-2 text-ps-white/55 hover:text-status-dropped" data-testid="collection-list-delete"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          )}

          {filtered.length === 0 && items.length > 0 && (
            <div className="glass p-6 text-center text-ps-white/65" data-testid="collection-filter-empty">No games match this filter.</div>
          )}
        </>
      )}
    </div>
  );
}

function StatTile({ label, value, color }) {
  return (
    <div className="glass p-3.5 flex items-center justify-between relative overflow-hidden">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-ps-white/55">{label}</div>
        <div className="num-display text-2xl mt-0.5">{value}</div>
      </div>
      <div className="w-1 self-stretch rounded-full" style={{ background: color, boxShadow: `0 0 14px ${color}66` }} />
    </div>
  );
}

function PsControllerIcon() {
  return (
    <svg viewBox="0 0 64 64" width="36" height="36" fill="none">
      <path d="M14 38c0-8 4-14 12-14h12c8 0 12 6 12 14v6c0 4-3 6-6 6h-2l-4-6H26l-4 6h-2c-3 0-6-2-6-6v-6Z" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="22" cy="38" r="2.5" fill="currentColor" />
      <circle cx="42" cy="38" r="2.5" fill="currentColor" />
      <circle cx="32" cy="34" r="1.5" fill="currentColor" />
      <circle cx="32" cy="42" r="1.5" fill="currentColor" />
    </svg>
  );
}
