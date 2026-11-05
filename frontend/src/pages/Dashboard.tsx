import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Sparkles,
  Calendar,
  CloudSun,
  Star,
  Flame,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { statsApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { CATEGORY_LABELS } from '../utils/categoryColors';
import type { Stats } from '../types';

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name.split(' ')[0]}`;
  if (hour < 17) return `Good afternoon, ${name.split(' ')[0]}`;
  return `Good evening, ${name.split(' ')[0]}`;
}

function ProgressRing({ percent }: { percent: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#FDE68A" strokeWidth="8" />
      <motion.circle
        cx="50" cy="50" r={r} fill="none"
        stroke="#F59E0B" strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      <text
        x="50" y="50"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontFamily: 'Lato',
          fontSize: '18px',
          fontWeight: 'bold',
          fill: '#44403C',
          transform: 'rotate(90deg)',
          transformOrigin: '50px 50px',
        }}
      >
        {percent}%
      </text>
    </svg>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: () => statsApi.getMyStats().then(r => r.data),
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-amber-400" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Dreams', value: data.totalWishes,    Icon: Star,         bg: 'bg-blue-50',   icon: 'text-blue-500'   },
    { label: 'In Progress',  value: data.inProgressCount, Icon: Flame,        bg: 'bg-amber-50',  icon: 'text-amber-500'  },
    { label: 'Lived It',     value: data.livedItCount,    Icon: CheckCircle2, bg: 'bg-green-50',  icon: 'text-green-500'  },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2">
          <CloudSun size={22} className="text-amber-400" />
          <h1 className="font-display text-3xl text-stone-800">
            {user ? getGreeting(user.name) : 'Welcome back'}
          </h1>
        </div>
        <p className="text-stone-500 mt-1">Here&apos;s your dream journey so far.</p>
      </motion.div>

      {/* Hero stat + ring */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 flex items-center gap-6"
      >
        <ProgressRing percent={data.completionPercent} />
        <div>
          <p className="text-4xl font-display font-bold text-stone-800">{data.livedItThisYear}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Sparkles size={15} className="text-amber-400" />
            <p className="text-stone-500">
              dream{data.livedItThisYear !== 1 ? 's' : ''} lived this year
            </p>
          </div>
          {data.livedItThisYear === 0 && (
            <p className="text-xs text-stone-400 mt-1">
              Mark wishes as &quot;Lived It&quot; to track your journey
            </p>
          )}
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map(({ label, value, Icon, bg, icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.07 }}
            className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 text-center"
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
              <Icon size={20} className={icon} strokeWidth={1.75} />
            </div>
            <p className="text-2xl font-display font-bold text-stone-800">{value}</p>
            <p className="text-xs text-stone-400 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-amber-500" />
            <h2 className="font-semibold text-stone-700 text-sm">Coming up soon</h2>
          </div>
          {data.upcomingTargetDates.length === 0 ? (
            <p className="text-sm text-stone-400 italic">
              No upcoming target dates. Set a date on a wish to see it here.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.upcomingTargetDates.map(w => (
                <Link
                  key={w.id}
                  to={`/wishes/${w.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 transition-colors"
                >
                  <span className="text-base">{CATEGORY_LABELS[w.category].split(' ')[0]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700 font-medium truncate">{w.title}</p>
                    <p className="text-xs text-stone-400">
                      {new Date(w.targetDate!).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recently lived */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-green-500" />
            <h2 className="font-semibold text-stone-700 text-sm">Recently lived</h2>
          </div>
          {data.recentlyLived.length === 0 ? (
            <p className="text-sm text-stone-400 italic">
              No completed wishes yet. Mark a wish as &quot;Lived It&quot; to see it here!
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.recentlyLived.map(w => (
                <Link
                  key={w.id}
                  to={`/wishes/${w.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-green-50 transition-colors"
                >
                  {w.memoryImageUrl ? (
                    <img src={w.memoryImageUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={16} className="text-green-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700 font-medium truncate">{w.title}</p>
                    <p className="text-xs text-stone-400">
                      {w.completedAt && new Date(w.completedAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <Sparkles size={12} className="text-green-400 flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <Link
          to="/wishlists"
          className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium hover:underline"
        >
          View all my wishlists →
        </Link>
      </motion.div>
    </div>
  );
}
