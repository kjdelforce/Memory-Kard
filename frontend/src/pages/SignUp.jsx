import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import FloatingPSSymbols from '@/components/FloatingPSSymbols';

export default function SignUp() {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const strength = computeStrength(password);

  const onUsernameBlur = async () => {
    if (!username || username.length < 3) { setUsernameStatus(null); return; }
    try {
      const { data } = await api.get('/auth/check-username', { params: { u: username } });
      setUsernameStatus(data.available ? 'available' : 'taken');
    } catch (e) { setUsernameStatus(null); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signup({ email, password, username: username.toLowerCase(), display_name: displayName });
      toast.success('Welcome to PS Shelf!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Sign up failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2 relative">
      <div className="hidden lg:flex relative flex-col justify-between p-12 border-r border-ps-blue-light/15">
        <FloatingPSSymbols />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2" data-testid="signup-brand-home">
            <div className="w-10 h-10 rounded-xl bg-ps-blue-light/15 border border-ps-blue-light/40 grid place-items-center text-ps-blue-light font-display font-bold">PS</div>
            <div className="heading-display text-xl font-bold">PS Shelf</div>
          </Link>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <div className="text-xs uppercase tracking-[0.22em] text-ps-blue-glow">Begin your collection</div>
          <h1 className="heading-display text-5xl font-bold leading-tight mt-3">Every disc.<br />Every download.<br /><span className="text-ps-blue-glow">One shelf.</span></h1>
          <p className="text-ps-white/65 mt-5 max-w-md">Create your collector profile in seconds. Your library starts empty — add games as you go.</p>
        </motion.div>
        <div className="relative z-10 text-xs text-ps-white/45">Powered by IGDB · Built for PlayStation collectors.</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10 min-h-screen">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-md glass p-6 sm:p-8 space-y-5"
          data-testid="signup-form"
        >
          <div className="lg:hidden mb-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-ps-blue-light/15 border border-ps-blue-light/40 grid place-items-center text-ps-blue-light font-display font-bold">PS</div>
              <div className="heading-display text-lg font-bold">PS Shelf</div>
            </Link>
          </div>
          <div>
            <h2 className="heading-display text-3xl font-bold">Create your shelf</h2>
            <p className="text-sm text-ps-white/60 mt-1">It only takes a minute.</p>
          </div>

          <Field label="Display Name">
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={60}
              className="ps-input" placeholder="Trophy Hunter" data-testid="signup-displayname-input" />
          </Field>

          <Field label="Username" hint={usernameStatus === 'taken' ? <span className="text-status-dropped">Username taken</span> : usernameStatus === 'available' ? <span className="text-status-completed">Available</span> : 'a–z, 0–9, underscores'}>
            <input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              onBlur={onUsernameBlur}
              required minLength={3} maxLength={30}
              className="ps-input" placeholder="trophy_hunter" data-testid="signup-username-input" />
          </Field>

          <Field label="Email">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="ps-input" placeholder="you@example.com" data-testid="signup-email-input" />
          </Field>

          <Field label="Password" hint={password ? <StrengthBar strength={strength} /> : 'Minimum 6 characters'}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="ps-input" placeholder="••••••••" data-testid="signup-password-input" />
          </Field>

          <button disabled={busy || usernameStatus === 'taken'} className="ps-button w-full" data-testid="signup-submit-button">
            {busy ? 'Creating…' : 'Create My Shelf'}
          </button>

          <div className="text-sm text-center text-ps-white/60">
            Already have a shelf? <Link to="/auth/login" className="text-ps-blue-glow hover:text-ps-white" data-testid="signup-to-signin-link">Sign in</Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <div className="text-xs uppercase tracking-[0.16em] text-ps-white/60 mb-1.5">{label}</div>
      {children}
      {hint && <div className="text-[11px] text-ps-white/55 mt-1.5">{hint}</div>}
    </label>
  );
}

function computeStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(4, s);
}

function StrengthBar({ strength }) {
  const labels = ['Too weak', 'Weak', 'Okay', 'Strong', 'Excellent'];
  const colors = ['#E74C3C', '#F39C12', '#F39C12', '#0070D1', '#00B050'];
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 flex-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-1 flex-1 rounded" style={{ background: i < strength ? colors[strength] : 'rgba(255,255,255,0.08)' }} />
        ))}
      </div>
      <span className="text-[11px]" style={{ color: colors[strength] }}>{labels[strength]}</span>
    </div>
  );
}
