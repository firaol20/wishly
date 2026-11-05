import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, List, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';
import { WishlyIcon } from '../ui/WishlyLogo';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/wishlists', label: 'My Wishlists', icon: List },
  { to: '/profile', label: 'Profile', icon: User },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FFFBF0]/90 backdrop-blur-md border-b border-stone-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <WishlyIcon size={32} />
          <span className="font-display text-xl text-stone-800">Wishly</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                location.pathname.startsWith(to)
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        {/* User + Sign out */}
        <div className="hidden md:flex items-center gap-3">
          {user?.avatarUrl && (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full border-2 border-amber-200 object-cover"
            />
          )}
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-stone-500 hover:text-red-500 hover:bg-red-50 transition-colors"
            aria-label="Sign out"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden p-2 rounded-xl text-stone-500 hover:bg-stone-100"
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden bg-[#FFFBF0] border-t border-stone-100 px-4 pb-4 pt-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    location.pathname.startsWith(to)
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-stone-600 hover:bg-stone-100'
                  )}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
              <button
                onClick={() => { setMenuOpen(false); signOut(); }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 text-left"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
