import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';

export function EmptyState({ title = 'Nothing here yet', description, ctaText, ctaTo, icon, testid = 'empty-state' }) {
  return (
    <div className="glass p-8 text-center" data-testid={testid}>
      <div className="mx-auto w-20 h-20 rounded-2xl bg-ps-blue-light/10 border border-ps-blue-light/30 grid place-items-center text-ps-blue-glow mb-4">
        {icon || <Gamepad2 size={32} />}
      </div>
      <div className="heading-display text-xl font-semibold text-ps-white">{title}</div>
      {description && <p className="text-sm text-ps-white/60 mt-2 max-w-md mx-auto">{description}</p>}
      {ctaText && ctaTo && (
        <Link to={ctaTo} className="ps-button mt-5 inline-flex" data-testid={`${testid}-cta`}>{ctaText}</Link>
      )}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="glass p-6 border border-status-dropped/55 text-center" data-testid="error-state">
      <div className="heading-display text-lg font-semibold text-ps-white">{message}</div>
      {onRetry && <button onClick={onRetry} className="ps-button mt-4 inline-flex" data-testid="error-retry-button">Try Again</button>}
    </div>
  );
}

export function SkeletonGameCard() {
  return (
    <div className="glass overflow-hidden" data-testid="skeleton-game-card">
      <div className="aspect-[3/4] skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-3/4 skeleton rounded" />
        <div className="h-2 w-1/3 skeleton rounded" />
      </div>
    </div>
  );
}
