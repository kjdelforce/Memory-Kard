import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, Star, ArrowLeft, X } from 'lucide-react';
import { api } from '@/lib/api';
import AddToCollectionModal from '@/components/AddToCollectionModal';
import { ErrorState } from '@/components/States';

export default function GameDetail() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [modalGame, setModalGame] = useState(null);
  const [modalMode, setModalMode] = useState('collection');
  const [lightbox, setLightbox] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/igdb/games/${id}`);
      setGame(data);
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to load game');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  if (loading) return (
    <div className="space-y-4">
      <div className="h-64 skeleton rounded-2xl" />
      <div className="h-10 w-1/2 skeleton rounded" />
      <div className="h-4 w-3/4 skeleton rounded" />
    </div>
  );
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!game) return null;

  const summary = game.summary || 'No description available.';
  const summaryTruncated = !expanded && summary.length > 320 ? summary.slice(0, 320) + '…' : summary;
  const heroBg = game.cover_url_large || game.cover_url;

  return (
    <div className="relative">
      <Link to="/search" className="inline-flex items-center gap-1.5 text-sm text-ps-white/70 hover:text-ps-white mb-3" data-testid="game-detail-back">
        <ArrowLeft size={14} /> Back
      </Link>

      {/* Hero */}
      <div className="glass overflow-hidden relative">
        {heroBg && (
          <div className="absolute inset-0">
            <img src={heroBg} alt="" className="w-full h-full object-cover" style={{ filter: 'blur(28px) brightness(0.5)', transform: 'scale(1.1)' }} loading="lazy" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,6,15,0.55) 0%, rgba(0,6,15,0.92) 100%)' }} />
          </div>
        )}
        <div className="relative p-5 sm:p-8 grid sm:grid-cols-[200px_1fr] gap-6">
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-ps-dark max-w-[200px] mx-auto sm:mx-0 shadow-lift">
            {game.cover_url && <img src={game.cover_url} alt={game.name} className="w-full h-full object-cover" loading="lazy" />}
          </div>
          <div>
            <div className="flex flex-wrap gap-1.5">
              {(game.platforms || []).map((p) => (
                <span key={p.id} className="num-display text-[10px] uppercase px-2 py-0.5 rounded border border-ps-blue-light/40 text-ps-blue-glow">{p.name}</span>
              ))}
            </div>
            <h1 className="heading-display text-3xl sm:text-5xl font-bold mt-3">{game.name}</h1>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-sm text-ps-white/70">
              {game.release_date && <span><span className="text-ps-white/45">Released</span> {game.release_date}</span>}
              {game.developers?.length > 0 && <span><span className="text-ps-white/45">By</span> {game.developers.join(', ')}</span>}
              {game.publishers?.length > 0 && <span><span className="text-ps-white/45">Publisher</span> {game.publishers.join(', ')}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              {game.rating && (
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-ps-blue-glow" />
                  <span className="num-display text-2xl">{Math.round(game.rating)}</span>
                  <span className="text-xs text-ps-white/55">IGDB</span>
                </div>
              )}
              {game.genres?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {game.genres.slice(0, 4).map((g) => <span key={g} className="ps-pill text-[10px] uppercase tracking-[0.16em]">{g}</span>)}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-5">
              <button onClick={() => { setModalGame(game); setModalMode('collection'); }} className="ps-button" data-testid="game-detail-add-button">
                <Plus size={16} /> Add to Collection
              </button>
              <button onClick={() => { setModalGame(game); setModalMode('wishlist'); }} className="ps-button-ghost" data-testid="game-detail-wishlist-button">
                <Heart size={16} /> Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="glass p-5 sm:p-6 mt-5">
        <div className="text-xs uppercase tracking-[0.18em] text-ps-blue-glow">About</div>
        <h2 className="heading-display text-xl font-semibold mt-1">Story & Gameplay</h2>
        <p className="text-sm sm:text-base text-ps-white/80 mt-3 leading-relaxed whitespace-pre-wrap">{summaryTruncated}</p>
        {summary.length > 320 && (
          <button onClick={() => setExpanded((v) => !v)} className="text-ps-blue-glow text-sm mt-2 hover:text-ps-white" data-testid="game-detail-toggle-description">
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </section>

      {/* Screenshots */}
      {game.screenshots?.length > 0 && (
        <section className="mt-5">
          <h2 className="heading-display text-lg font-semibold mb-3">Screenshots</h2>
          <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1">
            {game.screenshots.map((url, i) => (
              <button key={i} onClick={() => setLightbox(url)} className="shrink-0 w-72 sm:w-96 aspect-video rounded-xl overflow-hidden glass" data-testid={`screenshot-${i}`}>
                <img src={url} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Similar games */}
      {game.similar_games?.length > 0 && (
        <section className="mt-5">
          <h2 className="heading-display text-lg font-semibold mb-3">Similar Games</h2>
          <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1">
            {game.similar_games.map((g) => (
              <Link key={g.id} to={`/game/${g.id}`} className="shrink-0 w-32" data-testid={`similar-game-${g.id}`}>
                <div className="aspect-[3/4] rounded-xl overflow-hidden glass">
                  {g.cover_url && <img src={g.cover_url} alt="" loading="lazy" className="w-full h-full object-cover" />}
                </div>
                <div className="text-xs mt-1.5 truncate">{g.name}</div>
                <div className="text-[10px] text-ps-white/55 num-display">{g.release_year || ''}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <AddToCollectionModal
        open={!!modalGame}
        game={modalGame}
        mode={modalMode}
        onClose={() => setModalGame(null)}
      />

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[120] bg-black/85 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            data-testid="screenshot-lightbox"
          >
            <button className="absolute top-4 right-4 ps-pill p-2 text-ps-white" onClick={() => setLightbox(null)}><X size={18} /></button>
            <motion.img
              src={lightbox}
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-full max-h-full rounded-xl shadow-lift"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
