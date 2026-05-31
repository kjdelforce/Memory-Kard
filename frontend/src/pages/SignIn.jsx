import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import FloatingPSSymbols from '@/components/FloatingPSSymbols';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Sign in failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2 relative">
      <div className="hidden lg:flex relative flex-col justify-between p-12 border-r border-ps-blue-light/15">
        <FloatingPSSymbols />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-ps-blue-light/15 border border-ps-blue-light/40 grid place-items-center text-ps-blue-light font-display font-bold">PS</div>
            <div className="heading-display text-xl font-bold">PS Shelf</div>
          </Link>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <div className="text-xs uppercase tracking-[0.22em] text-ps-blue-glow">Welcome back, collector</div>
          <h1 className="heading-display text-5xl font-bold leading-tight mt-3">Pick up where<br />you left off.</h1>
          <p className="text-ps-white/65 mt-5 max-w-md">Your shelf, your progress, your platinums — right where you left them.</p>
        </motion.div>
        <div className="relative z-10 text-xs text-ps-white/45">Powered by IGDB</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10 min-h-screen">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-md glass p-6 sm:p-8 space-y-5"
          data-testid="signin-form"
        >
          <div className="lg:hidden mb-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-ps-blue-light/15 border border-ps-blue-light/40 grid place-items-center text-ps-blue-light font-display font-bold">PS</div>
              <div className="heading-display text-lg font-bold">PS Shelf</div>
            </Link>
          </div>
          <div>
            <h2 className="heading-display text-3xl font-bold">Sign in</h2>
            <p className="text-sm text-ps-white/60 mt-1">Resume your collection journey.</p>
          </div>

          <label className="block">
            <div className="text-xs uppercase tracking-[0.16em] text-ps-white/60 mb-1.5">Email</div>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="ps-input" placeholder="you@example.com" data-testid="signin-email-input" />
          </label>

          <label className="block">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-xs uppercase tracking-[0.16em] text-ps-white/60">Password</div>
              <a href="#" className="text-[11px] text-ps-blue-glow hover:text-ps-white">Forgot password?</a>
            </div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="ps-input" placeholder="••••••••" data-testid="signin-password-input" />
          </label>

          <button disabled={busy} className="ps-button w-full" data-testid="signin-submit-button">
            {busy ? 'Signing in…' : 'Sign In'}
          </button>

          <div className="text-sm text-center text-ps-white/60">
            New here? <Link to="/auth/signup" className="text-ps-blue-glow hover:text-ps-white" data-testid="signin-to-signup-link">Create a shelf</Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
