export const PS_PLATFORMS = ['PS1', 'PS2', 'PS3', 'PS4', 'PS5', 'PSP', 'PS Vita'];

export const STATUSES = [
  { key: 'playing', label: 'Playing', color: '#0070D1' },
  { key: 'completed', label: 'Completed', color: '#00B050' },
  { key: 'owned', label: 'Owned', color: '#9B59B6' },
  { key: 'wishlist', label: 'Wishlist', color: '#F39C12' },
  { key: 'dropped', label: 'Dropped', color: '#E74C3C' },
];

export const STATUS_COLORS = STATUSES.reduce((acc, s) => ({ ...acc, [s.key]: s.color }), {});

export const PRIORITIES = [
  { key: 'high', label: 'High', color: '#E74C3C' },
  { key: 'medium', label: 'Medium', color: '#F39C12' },
  { key: 'low', label: 'Low', color: '#0070D1' },
];

export const PRIORITY_COLORS = PRIORITIES.reduce((acc, p) => ({ ...acc, [p.key]: p.color }), {});
