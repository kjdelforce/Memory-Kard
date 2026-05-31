import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Library, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { api, absoluteAvatarUrl } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { STATUSES, STATUS_COLORS } from '@/constants/ps';
import { EmptyState, ErrorState } from '@/components/States';

const PALETTE = ['#0070D1', '#1A6FFF', '#9B59B6', '#00B050', '#F39C12', '#E74C3C', '#003087'];

export default function Profile() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('collection');

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get(`/users/${username}`);
      setData(data);
    } catch (e) { setError(e?.response?.data?.detail || 'Profile not found'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [username]);

  const genres = useMemo(() => {
    if (!data?.collection) return [];
    // Genre stats are approximated client-side via cover/none— unavailable here.
    return [];
  }, [data]);

  if (loading) return (
    <div className="space-y-4">
      <div className="h-40 skeleton rounded-2xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}
      </div>
    </div>
  );
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const { profile, stats, collection, wishlist, is_self, privacy } = data;
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : '—';

  const completed = collection.filter((c) => c.status === 'completed').length;
  const playing = collection.filter((c) => c.status === 'playing').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass p-5 sm:p-7" data-testid="public-profile-header">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-ps-dark grid place-items-center text-3xl font-display font-bold border-[3px] border-ps-blue-light shadow-glow">
              {absoluteAvatarUrl(profile.avatar_url) ?
                <img src={absoluteAvatarUrl(profile.avatar_url)} alt="" className="w-full h-full object-cover" /> :
                (profile.display_name || profile.username || '?').slice(0, 1).toUpperCase()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="heading-display text-3xl sm:text-4xl font-bold">{profile.display_name}</h1>
            <div className="text-ps-white/55 text-sm">@{profile.username}</div>
            {profile.bio && <p className="text-sm text-ps-white/80 mt-3 max-w-2xl whitespace-pre-wrap">{profile.bio}</p>}
            <div className="flex items-center gap-2 mt-3">
              <span className="num-display text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded border border-ps-blue-light/40 bg-ps-blue-light/10 text-ps-blue-glow">Fav: {profile.favourite_platform || 'PS5'}</span>
              {is_self && <Link to="/settings" className="ps-pill text-[11px]" data-testid="profile-edit-link">Edit profile</Link>}
            </div>
          </div>
          {!is_self && me && (
            <Link to="/explore" className="ps-button-ghost text-sm h-10 min-h-0 px-3">Back to Explore</Link>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <Tile label="Total Games" value={profile.total_games || 0} icon={<Library size={16} />} />
          <Tile label="Completed" value={completed} icon={<Trophy size={16} />} color="#00B050" />
          <Tile label="Playing" value={playing} icon={<BarChart3 size={16} />} color="#0070D1" />
          <Tile label="Member Since" valueText={memberSince} />
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2" data-testid="profile-tabs">
        <button onClick={() => setTab('collection')} className={`ps-pill text-sm ${tab === 'collection' ? 'border-ps-blue-glow text-ps-white shadow-glow' : ''}`} data-testid="profile-tab-collection">Collection</button>
        <button onClick={() => setTab('stats')} className={`ps-pill text-sm ${tab === 'stats' ? 'border-ps-blue-glow text-ps-white shadow-glow' : ''}`} data-testid="profile-tab-stats">Stats</button>
      </div>

      {tab === 'collection' && (
        collection.length === 0 ? (
          <EmptyState
            title={is_self ? 'Your shelf is empty' : 'This shelf is empty'}
            description={is_self ? 'Add some games to fill your shelf.' : 'This collector has not added any games yet.'}
            ctaText={is_self ? 'Find Games' : undefined}
            ctaTo={is_self ? '/search' : undefined}
            testid="profile-collection-empty"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4" data-testid="profile-collection-grid">
            {collection.map((entry) => (
              <Link key={entry.id} to={`/game/${entry.igdb_game_id}`} className="glass overflow-hidden hover:shadow-glow">
                <div className="aspect-[3/4] bg-ps-dark">
                  {entry.game_cover_url && <img src={entry.game_cover_url} loading="lazy" className="w-full h-full object-cover" alt="" />}
                </div>
                <div className="p-2">
                  <div className="text-xs font-medium truncate">{entry.game_name}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="num-display text-[9px] uppercase px-1.5 py-0.5 rounded"
                      style={{ background: `${STATUS_COLORS[entry.status]}22`, border: `1px solid ${STATUS_COLORS[entry.status]}66`, color: STATUS_COLORS[entry.status] }}>
                      {entry.status}
                    </span>
                    <span className="num-display text-[10px] text-ps-white/55">{entry.platform}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {tab === 'stats' && (
        !stats || (stats.platforms?.length === 0 && stats.monthly?.length === 0) ? (
          <EmptyState
            title="No stats yet"
            description={is_self ? 'Add games to your shelf to see stats appear here.' : 'Not enough data to show stats for this collector.'}
            ctaText={is_self ? 'Find Games' : undefined}
            ctaTo={is_self ? '/search' : undefined}
          />
        ) : (
          <div className="grid lg:grid-cols-2 gap-5">
            <ChartCard title="By Platform" testid="profile-chart-platform">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={stats.platforms.map((p) => ({ name: p.name, value: p.count }))} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3} strokeWidth={0}>
                    {stats.platforms.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <Legend items={stats.platforms.map((p, i) => ({ name: p.name, value: p.count, color: PALETTE[i % PALETTE.length] }))} />
            </ChartCard>

            <ChartCard title="By Status" testid="profile-chart-status">
              {(() => {
                const STATUS_LABELS = { playing: 'Playing', completed: 'Completed', owned: 'Owned', wishlist: 'Wishlist', dropped: 'Dropped' };
                const pieData = (stats.status || [])
                  .filter((s) => (s.count || 0) > 0)
                  .map((s) => ({ name: STATUS_LABELS[s.name] || s.name, key: s.name, value: s.count, color: STATUS_COLORS[s.name] }));
                if (pieData.length === 0) {
                  return <div className="h-[260px] grid place-items-center text-sm text-ps-white/55">No status data yet.</div>;
                }
                return (
                  <>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3} strokeWidth={0}>
                          {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Pie>
                        <Tooltip contentStyle={tipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                    <Legend items={pieData.map((d) => ({ name: d.name, value: d.value, color: d.color }))} />
                  </>
                );
              })()}
            </ChartCard>

            <ChartCard title="Monthly Additions" className="lg:col-span-2" testid="profile-chart-monthly">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={stats.monthly} margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
                  <CartesianGrid stroke="rgba(240,244,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(240,244,255,0.6)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'rgba(240,244,255,0.55)', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={tipStyle} />
                  <Line type="monotone" dataKey="count" stroke="#1A6FFF" strokeWidth={2.5} dot={{ fill: '#1A6FFF', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )
      )}
    </div>
  );
}

const tipStyle = { background: 'rgba(0,13,26,0.95)', border: '1px solid rgba(0,112,209,0.35)', borderRadius: 12, color: '#F0F4FF' };

function Tile({ label, value, valueText, color, icon }) {
  return (
    <div className="glass p-3.5">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ps-white/55">{icon}{label}</div>
      <div className="num-display text-2xl mt-1" style={{ color: color || '#F0F4FF' }}>{valueText ?? value}</div>
    </div>
  );
}

function ChartCard({ title, children, className = '', testid }) {
  return (
    <div className={`glass p-5 ${className}`} data-testid={testid}>
      <div className="heading-display text-base font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}

function Legend({ items }) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {items.map((d) => (
        <div key={d.name} className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
          <span className="text-ps-white/75 truncate">{d.name}</span>
          <span className="ml-auto num-display text-ps-white">{d.value}</span>
        </div>
      ))}
    </div>
  );
}
