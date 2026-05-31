import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { STATUSES, PS_PLATFORMS } from '@/constants/ps';

export default function AddToCollectionModal({ open, onClose, game, mode = 'collection', defaultPlatform, onSaved }) {
  const initialPlatform = defaultPlatform || (game?.platforms?.[0]?.name) || 'PS5';
  const [platform, setPlatform] = useState(initialPlatform);
  const [status, setStatus] = useState('owned');
  const [rating, setRating] = useState(7);
  const [notes, setNotes] = useState('');
  const [hours, setHours] = useState(0);
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setPlatform(defaultPlatform || (game?.platforms?.[0]?.name) || 'PS5');
      setStatus(mode === 'wishlist' ? 'wishlist' : 'owned');
      setRating(7);
      setNotes('');
      setHours(0);
      setPriority('medium');
    }
  }, [open, game, mode, defaultPlatform]);

  const availablePlatforms = game?.platforms?.length
    ? game.platforms.map((p) => p.name)
    : PS_PLATFORMS;

  const submit = async () => {
    setSubmitting(true);
    try {
      if (mode === 'wishlist') {
        await api.post('/wishlist', {
          igdb_game_id: game.id,
          game_name: game.name,
          game_cover_url: game.cover_url,
          game_released: game.release_date,
          platform,
          priority,
          notes,
        });
        toast.success('Added to wishlist');
      } else {
        await api.post('/collection', {
          igdb_game_id: game.id,
          game_name: game.name,
          game_cover_url: game.cover_url,
          game_released: game.release_date,
          game_rating: game.rating || null,
          platform,
          status,
          personal_rating: rating,
          notes,
          play_time_hours: Number(hours) || 0,
        });
        toast.success(`Added to your shelf (${status})`);
      }
      onSaved?.();
      onClose?.();
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && game && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-end sm:place-items-center bg-black/55 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          data-testid="add-modal-backdrop"
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="glass-strong w-full sm:max-w-[640px] sm:rounded-[20px] rounded-t-[20px] rounded-b-none sm:rounded-b-[20px] max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            data-testid={mode === 'wishlist' ? 'add-to-wishlist-modal' : 'add-to-collection-modal'}
          >
            <div className="flex items-start gap-3 p-4 border-b border-ps-blue-light/15">
              <div className="w-16 h-20 rounded-md overflow-hidden bg-ps-dark flex-shrink-0">
                {game.cover_url && <img src={game.cover_url} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] uppercase tracking-[0.18em] text-ps-white/55">{mode === 'wishlist' ? 'Add to Wishlist' : 'Add to Collection'}</div>
                <div className="heading-display text-xl font-bold leading-tight truncate">{game.name}</div>
                <div className="text-xs text-ps-white/55 mt-0.5">{game.release_year || ''}</div>
              </div>
              <button onClick={onClose} className="p-2 -mt-1 rounded-lg text-ps-white/70 hover:bg-ps-blue-light/10" data-testid="add-modal-close"><X size={18} /></button>
            </div>

            <div className="p-4 space-y-5">
              <div>
                <label className="text-xs uppercase tracking-[0.16em] text-ps-white/60">Platform</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {availablePlatforms.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      data-testid={`add-platform-${p.replace(/\s/g, '')}`}
                      className={`ps-pill text-xs num-display ${platform === p ? 'border-ps-blue-glow shadow-glow text-ps-white' : 'text-ps-white/75'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {mode === 'collection' ? (
                <>
                  <div>
                    <label className="text-xs uppercase tracking-[0.16em] text-ps-white/60">Status</label>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {STATUSES.map((s) => (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => setStatus(s.key)}
                          data-testid={`add-status-${s.key}`}
                          className={`ps-pill justify-center text-xs font-medium`}
                          style={status === s.key ? { borderColor: s.color, background: `${s.color}22`, color: '#fff', boxShadow: `0 0 0 1px ${s.color}55, 0 0 18px ${s.color}33` } : {}}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-[0.16em] text-ps-white/60 flex items-center justify-between">
                      <span>Personal Rating</span>
                      <span className="num-display text-ps-blue-glow">{rating}/10</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      data-testid="add-rating-slider"
                      className="w-full mt-2 accent-ps-blue-light"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-[0.16em] text-ps-white/60">Hours played</label>
                    <input
                      type="number"
                      min={0}
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      data-testid="add-hours-input"
                      className="ps-input mt-2"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs uppercase tracking-[0.16em] text-ps-white/60">Priority</label>
                  <div className="mt-2 flex gap-2">
                    {['low', 'medium', 'high'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        data-testid={`wishlist-priority-${p}`}
                        className={`ps-pill text-xs capitalize ${priority === p ? 'border-ps-blue-glow shadow-glow text-ps-white' : ''}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs uppercase tracking-[0.16em] text-ps-white/60">Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  data-testid="add-notes-input"
                  className="ps-input mt-2 resize-none"
                  placeholder="Any thoughts, milestones, where you bought it…"
                />
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button onClick={onClose} className="ps-button-ghost" data-testid="add-cancel-button">Cancel</button>
                <button onClick={submit} disabled={submitting} className="ps-button" data-testid="add-save-button">
                  <Save size={16} /> {submitting ? 'Saving…' : 'Add to Shelf'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
