import React, { useEffect, useState } from 'react';
import { Camera, Save, AlertTriangle, Lock, Eye, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { api, absoluteAvatarUrl } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { PS_PLATFORMS } from '@/constants/ps';
import { useNavigate } from 'react-router-dom';

const TABS = [
  { key: 'profile', label: 'Profile', icon: UserIcon },
  { key: 'account', label: 'Account', icon: Lock },
  { key: 'privacy', label: 'Privacy', icon: Eye },
  { key: 'danger', label: 'Danger Zone', icon: AlertTriangle },
];

export default function Settings() {
  const { user, refresh, logout } = useAuth();
  const [tab, setTab] = useState('profile');
  const navigate = useNavigate();

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <div className="text-xs uppercase tracking-[0.22em] text-ps-blue-glow">Account</div>
        <h1 className="heading-display text-3xl sm:text-4xl font-bold">Settings</h1>
      </div>
      <div className="flex flex-wrap gap-2" data-testid="settings-tabs">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`ps-pill text-sm ${tab === t.key ? 'border-ps-blue-glow text-ps-white shadow-glow' : ''}`} data-testid={`settings-tab-${t.key}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && user && <ProfileTab user={user} refresh={refresh} />}
      {tab === 'account' && <AccountTab />}
      {tab === 'privacy' && user && <PrivacyTab user={user} refresh={refresh} />}
      {tab === 'danger' && user && <DangerTab user={user} refresh={refresh} logout={logout} navigate={navigate} />}
    </div>
  );
}

function ProfileTab({ user, refresh }) {
  const [displayName, setDisplayName] = useState(user.display_name || '');
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');
  const [favPlatform, setFavPlatform] = useState(user.favourite_platform || 'PS5');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.patch('/profile', { display_name: displayName, username: username.toLowerCase(), bio, favourite_platform: favPlatform });
      await refresh();
      toast.success('Profile updated');
    } catch (e) { toast.error(e?.response?.data?.detail || 'Update failed'); }
    finally { setBusy(false); }
  };

  const onAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await api.post('/profile/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refresh();
      toast.success('Avatar updated');
    } catch (err) { toast.error(err?.response?.data?.detail || 'Upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <form onSubmit={submit} className="glass p-5 sm:p-6 space-y-5" data-testid="settings-profile-form">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-ps-dark grid place-items-center text-2xl font-display border border-ps-blue-light/40">
          {absoluteAvatarUrl(user.avatar_url) ? <img src={absoluteAvatarUrl(user.avatar_url)} alt="" className="w-full h-full object-cover" /> : (user.display_name || '?').slice(0, 1).toUpperCase()}
        </div>
        <label className="ps-button-ghost cursor-pointer" data-testid="settings-avatar-upload">
          <Camera size={16} /> {uploading ? 'Uploading…' : 'Change avatar'}
          <input type="file" accept="image/*" className="hidden" onChange={onAvatar} disabled={uploading} />
        </label>
      </div>

      <Field label="Display Name">
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="ps-input" data-testid="settings-displayname" />
      </Field>
      <Field label="Username">
        <input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} className="ps-input" data-testid="settings-username" />
      </Field>
      <Field label="Bio">
        <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="ps-input resize-none" maxLength={500} data-testid="settings-bio" />
      </Field>
      <Field label="Favourite Platform">
        <div className="flex flex-wrap gap-2">
          {PS_PLATFORMS.map((p) => (
            <button type="button" key={p} onClick={() => setFavPlatform(p)} className={`ps-pill text-xs num-display uppercase ${favPlatform === p ? 'border-ps-blue-glow shadow-glow text-ps-white' : ''}`} data-testid={`settings-fav-${p.replace(/\s/g, '')}`}>{p}</button>
          ))}
        </div>
      </Field>
      <button disabled={busy} className="ps-button" data-testid="settings-profile-save"><Save size={16} /> {busy ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}

function AccountTab() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/profile/password', { current_password: current, new_password: next });
      toast.success('Password changed');
      setCurrent(''); setNext('');
    } catch (e) { toast.error(e?.response?.data?.detail || 'Update failed'); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="glass p-5 sm:p-6 space-y-4" data-testid="settings-account-form">
      <h2 className="heading-display text-lg font-semibold">Change Password</h2>
      <Field label="Current Password">
        <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required className="ps-input" data-testid="settings-current-password" />
      </Field>
      <Field label="New Password">
        <input type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={6} className="ps-input" data-testid="settings-new-password" />
      </Field>
      <button disabled={busy} className="ps-button" data-testid="settings-password-save"><Save size={16} /> {busy ? 'Saving…' : 'Update password'}</button>
    </form>
  );
}

function PrivacyTab({ user, refresh }) {
  const [privacy, setPrivacy] = useState(user.privacy || { public_collection: true, public_wishlist: true, show_stats: true });
  const update = async (key, value) => {
    setPrivacy((p) => ({ ...p, [key]: value }));
    try {
      await api.patch('/profile/privacy', { [key]: value });
      await refresh();
      toast.success('Updated');
    } catch (e) { toast.error('Failed'); }
  };
  return (
    <div className="glass p-5 sm:p-6 space-y-4" data-testid="settings-privacy">
      <h2 className="heading-display text-lg font-semibold">Privacy</h2>
      <Toggle label="Public Collection" desc="Show your collection on your profile." checked={privacy.public_collection} onChange={(v) => update('public_collection', v)} testid="privacy-public-collection" />
      <Toggle label="Public Wishlist" desc="Let others see games you're hunting." checked={privacy.public_wishlist} onChange={(v) => update('public_wishlist', v)} testid="privacy-public-wishlist" />
      <Toggle label="Show Stats" desc="Display charts on your public profile." checked={privacy.show_stats} onChange={(v) => update('show_stats', v)} testid="privacy-show-stats" />
    </div>
  );
}

function DangerTab({ user, refresh, logout, navigate }) {
  const [confirmData, setConfirmData] = useState('');
  const [confirmAcc, setConfirmAcc] = useState('');
  const [busy, setBusy] = useState(false);

  const deleteData = async () => {
    if (confirmData !== 'DELETE') return toast.error('Type DELETE to confirm');
    setBusy(true);
    try { await api.delete('/profile/data'); await refresh(); toast.success('All your data has been deleted'); setConfirmData(''); } catch (e) { toast.error('Failed'); } finally { setBusy(false); }
  };
  const deleteAccount = async () => {
    if (confirmAcc !== user.username) return toast.error(`Type your username (${user.username}) to confirm`);
    setBusy(true);
    try {
      await api.delete('/profile');
      logout(); navigate('/'); toast.success('Account deleted');
    } catch (e) { toast.error('Failed'); } finally { setBusy(false); }
  };
  return (
    <div className="glass p-5 sm:p-6 border border-status-dropped/55 space-y-5" data-testid="settings-danger">
      <div className="flex items-center gap-2 text-status-dropped"><AlertTriangle size={18} /><h2 className="heading-display text-lg font-semibold">Danger Zone</h2></div>

      <div className="space-y-2">
        <div className="font-medium">Delete All Data</div>
        <p className="text-sm text-ps-white/65">Removes your collection and wishlist. Account stays.</p>
        <div className="flex gap-2">
          <input value={confirmData} onChange={(e) => setConfirmData(e.target.value)} placeholder="Type DELETE" className="ps-input flex-1" data-testid="danger-delete-data-input" />
          <button disabled={busy} onClick={deleteData} className="ps-button-ghost hover:border-status-dropped hover:text-status-dropped" data-testid="danger-delete-data-button">Delete data</button>
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t border-ps-blue-light/15">
        <div className="font-medium">Delete Account</div>
        <p className="text-sm text-ps-white/65">This is permanent. Your profile, collection, and wishlist will be removed.</p>
        <div className="flex gap-2">
          <input value={confirmAcc} onChange={(e) => setConfirmAcc(e.target.value)} placeholder={`Type ${user.username}`} className="ps-input flex-1" data-testid="danger-delete-account-input" />
          <button disabled={busy} onClick={deleteAccount} className="ps-button-ghost hover:border-status-dropped hover:text-status-dropped" data-testid="danger-delete-account-button">Delete account</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-xs uppercase tracking-[0.16em] text-ps-white/60 mb-1.5">{label}</div>
      {children}
    </label>
  );
}

function Toggle({ label, desc, checked, onChange, testid }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-ps-white/55">{desc}</div>
      </div>
      <button onClick={() => onChange(!checked)} className={`relative w-12 h-7 rounded-full transition-colors ${checked ? 'bg-ps-blue-light' : 'bg-ps-dark border border-ps-blue-light/30'}`} data-testid={testid}>
        <span className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform" style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }} />
      </button>
    </div>
  );
}
