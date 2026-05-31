import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Library, Heart, Compass, Cpu, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { absoluteAvatarUrl } from '@/lib/api';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/collection', icon: Library, label: 'Collection' },
  { to: '/wishlist', icon: Heart, label: 'Wishlist' },
  { to: '/platforms', icon: Cpu, label: 'Platforms' },
  { to: '/explore', icon: Compass, label: 'Explore' },
];

const mobileTabs = [
  { to: '/dashboard', icon: Home, label: 'Home', testid: 'tab-home' },
  { to: '/search', icon: Search, label: 'Search', testid: 'tab-search' },
  { to: '/collection', icon: Library, label: 'Library', testid: 'tab-collection' },
  { to: '/wishlist', icon: Heart, label: 'Wishlist', testid: 'tab-wishlist' },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const onLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[240px] z-40"
        style={{ background: 'rgba(0,13,26,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRight: '1px solid rgba(0,112,209,0.18)' }}
        data-testid="sidebar-nav"
      >
        <div className="h-16 px-5 flex items-center gap-2 border-b border-[rgba(0,112,209,0.18)]">
          <div className="w-9 h-9 rounded-xl bg-ps-blue-light/15 border border-ps-blue-light/40 grid place-items-center text-ps-blue-light font-display font-bold">PS</div>
          <div>
            <div className="heading-display font-bold leading-none" style={{ fontSize: '22px', color: '#FFFFFF' }}>PS Shelf</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-ps-white/50">Collectors Hub</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              data-testid={`sidebar-nav-${label.toLowerCase()}`}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                  isActive ? 'sidebar-link-active' : 'sidebar-link-idle'
                }`
              }
              style={({ isActive }) => ({
                fontFamily: "'Inter', system-ui, sans-serif",
                fontWeight: 500,
                fontSize: '14px',
                color: isActive ? '#0070D1' : '#F0F4FF',
                background: isActive ? 'rgba(0,112,209,0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid #0070D1' : '3px solid transparent',
                paddingLeft: isActive ? '9px' : '12px',
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains('sidebar-link-active')) {
                  e.currentTarget.style.background = 'rgba(0,112,209,0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains('sidebar-link-active')) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon size={20} color="currentColor" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-[rgba(0,112,209,0.18)] space-y-1">
          <NavLink
            to={`/profile/${user?.username}`}
            data-testid="sidebar-profile"
            className="relative flex items-center gap-3 rounded-lg px-3 py-2 transition-colors"
            style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500, fontSize: '14px', color: '#F0F4FF' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,112,209,0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Avatar user={user} size={32} />
            <div className="min-w-0">
              <div className="text-sm truncate font-medium">{user?.display_name}</div>
              <div className="text-[11px] text-ps-white/55 truncate">@{user?.username}</div>
            </div>
          </NavLink>
          <NavLink
            to="/settings"
            data-testid="sidebar-settings"
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${isActive ? 'sidebar-link-active' : 'sidebar-link-idle'}`
            }
            style={({ isActive }) => ({
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 500,
              fontSize: '14px',
              color: isActive ? '#0070D1' : '#F0F4FF',
              background: isActive ? 'rgba(0,112,209,0.1)' : 'transparent',
              borderLeft: isActive ? '3px solid #0070D1' : '3px solid transparent',
              paddingLeft: isActive ? '9px' : '12px',
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('sidebar-link-active')) {
                e.currentTarget.style.background = 'rgba(0,112,209,0.06)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('sidebar-link-active')) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <SettingsIcon size={20} color="currentColor" /> <span>Settings</span>
          </NavLink>
          <button
            onClick={onLogout}
            data-testid="sidebar-logout"
            className="w-full relative flex items-center gap-3 rounded-lg px-3 py-2 transition-colors"
            style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500, fontSize: '14px', color: '#F0F4FF', borderLeft: '3px solid transparent', paddingLeft: '9px' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,112,209,0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={20} color="currentColor" /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-[240px] pb-24 lg:pb-8">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        data-testid="bottom-tab-bar"
      >
        <div className="max-w-screen-sm mx-auto px-2 grid grid-cols-5 gap-1">
          {mobileTabs.map(({ to, icon: Icon, label, testid }) => (
            <NavLink
              key={to}
              to={to}
              data-testid={testid}
              className={({ isActive }) => `flex flex-col items-center justify-center gap-1 min-h-[56px] text-[11px] ${isActive ? 'text-ps-blue-glow' : 'text-ps-white/60'}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
          <NavLink
            to={`/profile/${user?.username}`}
            data-testid="tab-profile"
            className={({ isActive }) => `flex flex-col items-center justify-center gap-1 min-h-[56px] text-[11px] ${isActive ? 'text-ps-blue-glow' : 'text-ps-white/60'}`}
          >
            <Avatar user={user} size={22} />
            <span>Profile</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

export function Avatar({ user, size = 28 }) {
  const url = absoluteAvatarUrl(user?.avatar_url);
  const initial = (user?.display_name || user?.username || 'P').slice(0, 1).toUpperCase();
  return (
    <div
      className="rounded-full overflow-hidden bg-ps-dark border border-ps-blue-light/40 grid place-items-center text-ps-white font-display font-semibold"
      style={{ width: size, height: size, fontSize: Math.max(10, size / 2.4) }}
    >
      {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : initial}
    </div>
  );
}
