import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import GameCard from '@/components/GameCard';
import AddToCollectionModal from '@/components/AddToCollectionModal';
import { SkeletonGameCard, ErrorState, EmptyState } from '@/components/States';
import { PS_PLATFORMS } from '@/constants/ps';

const SORTS = [
  { key: 'relevance', label: 'Relevance' },
  { key: 'rating', label: 'Rating' },
  { key: 'release', label: 'Release Date' },
];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [platform, setPlatform] = useState(params.get('platform') || 'all');
  const [sort, setSort] = useState(params.get('sort') || 'relevance');
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [modalGame, setModalGame] = useState(null);
  const [modalMode, setModalMode] = useState('collection');
  const debounceRef = useRef();

  const fetchPage = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const next = reset ? 1 : page;
      const { data } = await api.get('/igdb/search', {
        params: { q, platform: platform !== 'all' ? platform : undefined, sort, page: next, page_size: 24 },
      });
      const newResults = data.results || [];
      setResults((prev) => reset ? newResults : [...prev, ...newResults]);
      setHasMore(newResults.length === 24);
      setPage(next + 1);
    } catch (e) {
      setError(e?.response?.data?.detail || 'Search failed');
    } finally { setLoading(false); }
  }, [q, platform, sort, page]);

  // Reset + fetch on filter change
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      fetchPage(true);
      const newParams = {};
      if (q) newParams.q = q;
      if (platform !== 'all') newParams.platform = platform;
      if (sort !== 'relevance') newParams.sort = sort;
      setParams(newParams, { replace: true });
    }, 350);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, platform, sort]);

  return (
    <div className="space-y-5">
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 glass-strong">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ps-white/55" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search PlayStation games…"
              className="ps-input pl-10"
              data-testid="search-input"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <FilterPill label="All" active={platform === 'all'} onClick={() => setPlatform('all')} testid="platform-filter-all" />
          {PS_PLATFORMS.map((p) => (
            <FilterPill key={p} label={p} active={platform === p} onClick={() => setPlatform(p)} testid={`platform-filter-${p.replace(/\s/g, '')}`} />
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-ps-white/55 hidden sm:inline">Sort by</span>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="ps-pill text-xs pr-8 appearance-none cursor-pointer"
                data-testid="search-sort"
              >
                {SORTS.map((s) => <option key={s.key} value={s.key} className="bg-ps-dark">{s.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-ps-white/60" />
            </div>
          </div>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={() => fetchPage(true)} />}

      {!error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4" data-testid="search-results-grid">
          {results.map((g, i) => (
            <GameCard
              key={`${g.id}-${i}`}
              game={g}
              index={i % 12}
              onAdd={(g) => { setModalGame(g); setModalMode('collection'); }}
              onWishlist={(g) => { setModalGame(g); setModalMode('wishlist'); }}
            />
          ))}
          {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonGameCard key={`sk-${i}`} />)}
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <EmptyState
          title="No games found"
          description="Try a different search term, change the platform filter, or remove sort constraints."
          testid="search-empty"
        />
      )}

      {!loading && hasMore && results.length > 0 && (
        <div className="flex justify-center">
          <button onClick={() => fetchPage(false)} className="ps-button-ghost" data-testid="search-load-more">Load more</button>
        </div>
      )}

      <AddToCollectionModal
        open={!!modalGame}
        game={modalGame}
        mode={modalMode}
        onClose={() => setModalGame(null)}
      />
    </div>
  );
}

function FilterPill({ label, active, onClick, testid }) {
  return (
    <button
      onClick={onClick}
      data-testid={testid}
      className={`ps-pill text-xs num-display uppercase ${active ? 'border-ps-blue-glow shadow-glow text-ps-white' : 'text-ps-white/75'}`}
    >
      {label}
    </button>
  );
}
