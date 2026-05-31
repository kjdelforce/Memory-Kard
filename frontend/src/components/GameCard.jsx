import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Plus, Heart } from 'lucide-react';

function PlatformBadge({ name }) {
  return (
    <span className="num-display text-[9px] uppercase px-1.5 py-0.5 rounded-md border border-ps-blue-light/35 bg-ps-dark/60 text-ps-white/80">
      {name}
    </span>
  );
}

export default function GameCard({ game, onAdd, onWishlist, index = 0 }) {
  const cover = game.cover_url;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.4), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      data-testid="game-card"
      className="glass group relative overflow-hidden hover:shadow-glow"
      style={{ transition: 'box-shadow 0.2s ease' }}
    >
      <Link to={`/game/${game.id}`} data-testid="game-card-open-link" className="block">
        <div className="aspect-[3/4] bg-ps-dark relative overflow-hidden rounded-t-[16px]">
          {cover ? (
            <img
              src={cover}
              alt={game.name}
              loading="lazy"
              width={264}
              height={352}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-ps-white/40 text-xs">No cover</div>
          )}
          {game.rating ? (
            <div className="absolute top-2 right-2 num-display text-[10px] px-1.5 py-0.5 rounded-md bg-ps-dark/85 border border-ps-blue-light/30 text-ps-white flex items-center gap-1">
              <Star size={10} className="text-ps-blue-glow" />
              {Math.round(game.rating)}
            </div>
          ) : null}
        </div>
        <div className="p-3">
          <div className="heading-display text-[15px] font-semibold leading-tight line-clamp-2 text-ps-white">{game.name}</div>
          <div className="text-[11px] text-ps-white/55 mt-1">{game.release_year || '—'}</div>
          {game.platforms?.length ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {game.platforms.slice(0, 4).map((p) => <PlatformBadge key={p.id} name={p.name} />)}
            </div>
          ) : null}
        </div>
      </Link>
      <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 pointer-events-none group-hover:pointer-events-auto">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onAdd?.(game); }}
          data-testid="game-card-add-button"
          className="ps-button flex-1 text-xs h-9 min-h-0 px-3"
        >
          <Plus size={14} /> Add
        </button>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onWishlist?.(game); }}
          data-testid="game-card-wishlist-button"
          className="ps-button-ghost text-xs h-9 min-h-0 px-3"
        >
          <Heart size={14} />
        </button>
      </div>
    </motion.div>
  );
}
