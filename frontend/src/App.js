import './App.css';
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import Landing from '@/pages/Landing';
import SignUp from '@/pages/SignUp';
import SignIn from '@/pages/SignIn';
import Dashboard from '@/pages/Dashboard';
import Search from '@/pages/Search';
import GameDetail from '@/pages/GameDetail';
import Collection from '@/pages/Collection';
import Wishlist from '@/pages/Wishlist';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Explore from '@/pages/Explore';
import Platforms from '@/pages/Platforms';

function Protected({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-ps-white/70">Loading…</div>;
  if (!user) return <Navigate to="/auth/login" replace state={{ from: loc.pathname }} />;
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrap><Landing /></PageWrap>} />
        <Route path="/auth/signup" element={<PageWrap><SignUp /></PageWrap>} />
        <Route path="/auth/login" element={<PageWrap><SignIn /></PageWrap>} />
        <Route element={<Protected><AppShell /></Protected>}>
          <Route path="/dashboard" element={<PageWrap><Dashboard /></PageWrap>} />
          <Route path="/search" element={<PageWrap><Search /></PageWrap>} />
          <Route path="/game/:id" element={<PageWrap><GameDetail /></PageWrap>} />
          <Route path="/collection" element={<PageWrap><Collection /></PageWrap>} />
          <Route path="/wishlist" element={<PageWrap><Wishlist /></PageWrap>} />
          <Route path="/profile/:username" element={<PageWrap><Profile /></PageWrap>} />
          <Route path="/settings" element={<PageWrap><Settings /></PageWrap>} />
          <Route path="/explore" element={<PageWrap><Explore /></PageWrap>} />
          <Route path="/platforms" element={<PageWrap><Platforms /></PageWrap>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrap({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={null}>
          <AnimatedRoutes />
        </Suspense>
        <Toaster theme="dark" position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}
