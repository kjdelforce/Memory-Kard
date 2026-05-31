import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Gamepad2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Avatar } from '@/components/AppShell';
import CountUp from '@/components/CountUp';
import { STATUSES, STATUS_COLORS } from '@/constants/ps';
import { EmptyState } from '@/components/States';

const GENRE_PILLS = ['Action', 'RPG', 'Sports', 'Racing', 'Shooter', 'Adventure'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, c] = await Promise.all([
          api.get('/collection/stats'),
          api.get('/collection'),
        ]);
        setStats(s.data);
        setCollection(c.data);
      } catch (e) { /* noop */ } finally { setLoading(false); }
    })();
  }, []);

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const currentlyPlaying = collection.filter((c) => c.status === 'playing').slice(0, 6);
  const recent = collection.slice(0, 8);

  const chartData = stats ? STATUSES
    .map((s) => ({ name: s.label, value: stats[s.key], color: s.color }))
    .filter((d) => d.value > 0) : [];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="glass p-5 sm:p-6 flex items-center gap-4" data-testid="dashboard-welcome">
        <Avatar user={user} size={56} />
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-[0.18em] text-ps-blue-glow">{today}</div>
          <h1 className="heading-display text-2xl sm:text-3xl font-bold truncate">Welcome back, {user?.display_name}.</h1>
          <div className="text-sm text-ps-white/55">@{user?.username}</div>
        </div>
        <Link to="/search" className="ps-button hidden sm:inline-flex" data-testid="dashboard-add-cta"><Plus size={16} /> Add a game</Link>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill label="Total" value={stats?.total ?? 0} color="#1A6FFF" testid="stat-total" />
        <StatPill label="Playing" value={stats?.playing ?? 0} color="#0070D1" testid="stat-playing" />
        <StatPill label="Completed" value={stats?.completed ?? 0} color="#00B050" testid="stat-completed" />
        <StatPill label="Wishlist" value={stats?.wishlist ?? 0} color="#F39C12" testid="stat-wishlist" />
      </div>

      <div className="grid xl:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          {/* Currently playing */}
          <Section title="Currently Playing" right={<Link to="/collection?status=playing" className="text-xs text-ps-blue-glow hover:text-ps-white">View all</Link>}>
            {loading ? (
              <div className="flex gap-3 overflow-x-auto py-1">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="w-32 aspect-[3/4] skeleton rounded-xl" />)}
              </div>
            ) : currentlyPlaying.length === 0 ? (
              <Link to="/search" className="glass p-6 flex items-center gap-4 hover:shadow-glow" data-testid="dashboard-currently-playing-empty">
                <div className="w-14 h-14 rounded-xl border border-ps-blue-light/40 bg-ps-blue-light/10 grid place-items-center text-ps-blue-glow"><Plus size={24} /></div>
                <div>
                  <div className="heading-display font-semibold">No games in progress</div>
                  <div className="text-sm text-ps-white/55">Start playing something — mark it &quot;Playing&quot; from any game page.</div>
                </div>
              </Link>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {currentlyPlaying.map((g) => (
                  <Link key={g.id} to={`/game/${g.igdb_game_id}`} className="w-32 shrink-0" data-testid="currently-playing-card">
                    <div className="aspect-[3/4] rounded-xl overflow-hidden glass">
                      {g.game_cover_url && <img src={g.game_cover_url} alt="" loading="lazy" className="w-full h-full object-cover" />}
                    </div>
                    <div className="text-xs mt-1.5 truncate">{g.game_name}</div>
                    <div className="text-[10px] text-ps-white/55 num-display">{g.platform}</div>
                  </Link>
                ))}
              </div>
            )}
          </Section>

          {/* Recent additions */}
          <Section title="Recent Additions" right={<Link to="/collection" className="text-xs text-ps-blue-glow hover:text-ps-white">View collection</Link>}>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/4] skeleton rounded-xl" />)}
              </div>
            ) : recent.length === 0 ? (
              <EmptyState
                title="No games added yet"
                description="Your library begins empty. Search IGDB and add your first PlayStation game to start your shelf."
                ctaText="Find Games"
                ctaTo="/search"
                testid="dashboard-recent-empty"
                icon={<Sparkles size={28} />}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {recent.map((g, i) => (
                  <Link key={g.id} to={`/game/${g.igdb_game_id}`} className="glass overflow-hidden hover:shadow-glow" data-testid="recent-addition-card">
                    <div className="aspect-[3/4]">
                      {g.game_cover_url && <img src={g.game_cover_url} alt="" loading="lazy" className="w-full h-full object-cover" />}
                    </div>
                    <div className="p-2">
                      <div className="text-xs truncate font-medium">{g.game_name}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="num-display text-[9px] uppercase px-1.5 py-0.5 rounded border" style={{ borderColor: STATUS_COLORS[g.status] + '66', color: STATUS_COLORS[g.status] }}>{g.status}</span>
                        <span className="num-display text-[9px] text-ps-white/55">{g.platform}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Section>

          {/* Genres */}
          <Section title="Browse by Genre">
            <div className="flex flex-wrap gap-2">
              {GENRE_PILLS.map((g) => (
                <Link key={g} to={`/search?q=${encodeURIComponent(g)}`} className="ps-pill text-sm hover:border-ps-blue-glow" data-testid={`genre-pill-${g}`}>{g}</Link>
              ))}
            </div>
          </Section>
        </div>

        {/* Right column: chart */}
        <div className="space-y-6">
          {stats && stats.total > 0 ? (
            <div className="glass p-5" data-testid="dashboard-chart">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-ps-blue-glow">Your Library</div>
                  <div className="heading-display text-lg font-semibold">By Status</div>
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3} strokeWidth={0}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'rgba(0,13,26,0.95)', border: '1px solid rgba(0,112,209,0.3)', borderRadius: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {chartData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                    <span className="text-ps-white/75">{d.name}</span>
                    <span className="ml-auto num-display text-ps-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-ps-blue-glow">Stats Locked</div>
              <div className="heading-display text-lg font-semibold mt-1">Add games to unlock your stats</div>
              <p className="text-sm text-ps-white/55 mt-2">Once you start adding games, you'll see your collection breakdown here.</p>
            </div>
          )}

          <div className="glass p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-ps-blue-glow">Quick links</div>
            <div className="mt-3 space-y-2">
              <Link to="/platforms" className="ps-button-ghost w-full justify-start"><Gamepad2 size={16} /> Browse Platforms</Link>
              <Link to="/explore" className="ps-button-ghost w-full justify-start"><Sparkles size={16} /> Discover Collectors</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, right, children }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="heading-display text-lg font-semibold">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function StatPill({ label, value, color, testid }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass p-3.5 flex items-center justify-between relative overflow-hidden"
      data-testid={testid}
    >
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-ps-white/55">{label}</div>
        <div className="num-display text-2xl mt-0.5 text-ps-white"><CountUp to={value} /></div>
      </div>
      <div className="w-1 self-stretch rounded-full" style={{ background: color, boxShadow: `0 0 14px ${color}66` }} />
    </motion.div>
  );
}
