import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Navigate } from 'react-router-dom';
import {
  BookOpen,
  MessageCircleQuestion,
  PartyPopper,
  ShieldCheck,
  LayoutGrid,
  Wand2,
} from 'lucide-react';
import { WishlyIcon } from '../components/ui/WishlyLogo';
import { DandelionField } from '../components/3d/DandelionField';

const features = [
  {
    Icon: BookOpen,
    color: 'bg-amber-100 text-amber-600',
    title: 'Capture Every Dream',
    desc: 'From life goals to bucket list adventures — write them all down before they fade.',
  },
  {
    Icon: MessageCircleQuestion,
    color: 'bg-rose-100 text-rose-500',
    title: 'Know Your Why',
    desc: 'Add a "why do I want this?" to each wish. Meaning fuels motivation.',
  },
  {
    Icon: PartyPopper,
    color: 'bg-yellow-100 text-yellow-600',
    title: 'Celebrate the Lived',
    desc: 'Mark a wish as Lived It, capture the memory, and relive the joy forever.',
  },
  {
    Icon: ShieldCheck,
    color: 'bg-emerald-100 text-emerald-600',
    title: 'Your Private Sanctuary',
    desc: 'Everything is private by default. Share only when you choose to.',
  },
  {
    Icon: LayoutGrid,
    color: 'bg-sky-100 text-sky-600',
    title: 'Beautifully Organized',
    desc: 'Sort by category, priority, and status. Find any wish in seconds.',
  },
  {
    Icon: Wand2,
    color: 'bg-violet-100 text-violet-600',
    title: 'Gentle AI Assist',
    desc: 'AI auto-suggests categories and tags as you type. Never start from a blank slate.',
  },
];

export function Landing() {
  const { isAuthenticated, isLoading, signInWithGoogle } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen bg-[#FFFBF0] overflow-x-hidden selection:bg-amber-100 selection:text-amber-900">
      {/* 3D Interactive Dandelion Field */}
      <DandelionField />

      {/* Nav */}
      <header className="relative z-10 max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <WishlyIcon size={34} />
          <span className="font-display text-2xl text-stone-800">Wishly</span>
        </div>
        <Button onClick={signInWithGoogle} variant="google" size="sm">
          <GoogleIcon />
          Sign in
        </Button>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pt-16 pb-20 text-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-auto"
        >
          {/* Large icon */}
          <div className="flex justify-center mb-8">
            <WishlyIcon size={88} />
          </div>

          <h1 className="font-display text-5xl sm:text-6xl text-stone-800 leading-tight mb-5">
            Every person has a wish<br />
            <span className="text-amber-500 italic">waiting to be lived.</span>
          </h1>
          <p className="text-lg text-stone-600 max-w-xl mx-auto mb-10 leading-relaxed font-medium drop-shadow-sm">
            Wishly is your warm, private sanctuary to capture life dreams, reflect on your why,
            and celebrate every dream you turn into a memory.
          </p>
          <Button onClick={signInWithGoogle} variant="google" size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
            <GoogleIcon />
            Continue with Google — it&apos;s free
          </Button>
          <p className="text-xs text-stone-500 mt-3 font-medium">No passwords. No spam. Your data stays yours.</p>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ Icon, color, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl border border-stone-200/80 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon size={22} strokeWidth={1.75} />
              </div>
              <h3 className="font-display font-semibold text-stone-800 mb-1.5">{title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-stone-200/60 py-6 text-center text-xs text-stone-400 bg-[#FFFBF0]/80 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2">
          <WishlyIcon size={18} />
          <span>Wishly — Made with Love by Firaol</span>
        </div>
      </footer>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
