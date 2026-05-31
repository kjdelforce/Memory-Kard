import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, Search as SearchIcon, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { PRIORITIES, PRIORITY_COLORS } from '@/constants/ps';
import { EmptyState, ErrorState } from '@/components/States';
import { motion } from 'framer-motion';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priorityTab, setPriorityTab] = useState('all');
  const [sort, setSort] = useState('date');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/wishlist');
      setItems(data);
    } catch (e) { setError(e?.response?.data?.detail || 'Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let res = items;
    if (priorityTab !== 'all') res = res.filter((i) => i.priority === priorityTab);
    res = [...res].sort((a, b) => {
      if (sort === 'name') return a.game_name.localeCompare(b.game_name);
      if (sort === 'release') return (a.game_released || '').localeCompare(b.game_released || '');
      return new Date(b.date_added) - new Date(a.date_added);
    });
    return res;
  }, [items, priorityTab, sort]);

  const remove = async (id) => {
    try {
      await api.delete(`/wishlist/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Removed from wishlist');
    } catch (e) { toast.error('Failed to remove'); }
  };

  const moveToCollection = async (id) => {
    try {
      await api.post(`/wishlist/${id}/move-to-collection?status=owned`);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Moved to collection');
    } catch (e) { toast.error('Failed to move'); }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-ps-blue-glow">Coming soon</div>
          <h1 className="heading-display text-3xl sm:text-4xl font-bold">Wishlist</h1>
        </div>
        <Link to="/search" className="ps-button" data-testid="wishlist-add-cta"><SearchIcon size={16} /> Find games</Link>
      </header>

      {!loading && items.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Tag the games you're hunting for. Set priorities, then move them to your collection when they arrive."
          ctaText="Find Games"
          ctaTo="/search"
          testid="wishlist-empty"
          icon={<Heart size={28} />}
        />
      ) : (
        <>
          <div className="glass p-3 flex flex-wrap items-center gap-2">
            <button onClick={() => setPriorityTab('all')} className={`ps-pill text-xs ${priorityTab === 'all' ? 'border-ps-blue-glow text-ps-white shadow-glow' : ''}`} data-testid="wishlist-tab-all">All</button>
            {PRIORITIES.map((p) => (
              <button key={p.key} onClick={() => setPriorityTab(p.key)} className="ps-pill text-xs capitalize"
                data-testid={`wishlist-tab-${p.key}`}
                style={priorityTab === p.key ? { borderColor: p.color, background: `${p.color}22`, boxShadow: `0 0 0 1px ${p.color}55, 0 0 18px ${p.color}33`, color: '#fff' } : {}}>
                {p.label}
              </button>
            ))}
            <div className="ml-auto">
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="ps-pill text-xs cursor-pointer" data-testid="wishlist-sort">
                <option value="date" className="bg-ps-dark">Sort: Date Added</option>
                <option value="name" className="bg-ps-dark">Sort: Name</option>
                <option value="release" className="bg-ps-dark">Sort: Release Date</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="wishlist-grid">
              {filtered.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="glass p-3 flex items-center gap-3"
                  data-testid="wishlist-entry"
                >
                  <Link to={`/game/${entry.igdb_game_id}`} className="w-16 h-20 rounded overflow-hidden bg-ps-dark shrink-0">
                    {entry.game_cover_url && <img src={entry.game_cover_url} alt="" loading="lazy" className="w-full h-full object-cover" />}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/game/${entry.igdb_game_id}`} className="text-sm font-medium hover:text-ps-blue-glow line-clamp-2">{entry.game_name}</Link>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="num-display text-[10px] uppercase px-1.5 py-0.5 rounded border"
                        style={{ borderColor: PRIORITY_COLORS[entry.priority] + 'AA', color: PRIORITY_COLORS[entry.priority] }}>
                        {entry.priority}
                      </span>
                      <span className="num-display text-[10px] text-ps-white/55">{entry.platform}</span>
                    </div>
                    {entry.notes && <div className="text-xs text-ps-white/55 mt-1.5 line-clamp-1">{entry.notes}</div>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => moveToCollection(entry.id)} className="ps-button-ghost text-xs h-9 min-h-0 px-3" data-testid="wishlist-move-button"><ArrowRight size={14} /> Move</button>
                    <button onClick={() => remove(entry.id)} className="ps-button-ghost text-xs h-9 min-h-0 px-3 hover:border-status-dropped/55 hover:text-status-dropped" data-testid="wishlist-delete-button"><Trash2 size={14} /></button>
                  </div>
                </motion.div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full glass p-6 text-center text-ps-white/65" data-testid="wishlist-filter-empty">No items at this priority.</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
