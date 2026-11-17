import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, Sparkles, Heart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { itemsApi } from '../services/api';
import type { PublicDreamItem, Category } from '../types';
import { Badge } from '../components/ui/Badge';
import { TelegramButton } from '../components/ui/TelegramButton';
import { Button } from '../components/ui/Button';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
} from '../utils/categoryColors';

export function DiscoverDreams() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');

  const { data, isLoading } = useQuery<{ total: number; items: PublicDreamItem[] }>({
    queryKey: ['publicDreams', search, selectedCategory],
    queryFn: () =>
      itemsApi
        .getPublicDreams({
          category: selectedCategory || undefined,
          search: search || undefined,
          limit: 50,
        })
        .then((r) => r.data),
  });

  const dreams = data?.items || [];
  const totalCount = data?.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <Compass size={28} className="text-amber-500" />
            <h1 className="font-display text-3xl text-stone-800">Discover Dreams</h1>
          </div>
          <p className="text-stone-500 mt-1 text-sm max-w-xl">
            Explore dreams shared by people around the world. Connect with dreamers, get inspired, and help turn someone&apos;s dream into reality.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 shadow-xs">
              <Sparkles size={13} className="text-amber-600" />
              {totalCount} {totalCount === 1 ? 'public dream' : 'public dreams'}
            </span>
            <span className="text-xs text-stone-400">Discoverable community</span>
          </div>
        </div>

        <Link to="/wishlists">
          <Button variant="secondary" size="sm">
            <Sparkles size={14} />
            Share a wish
          </Button>
        </Link>
      </motion.div>

      {/* Search & Category Filter */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            placeholder="Search dreams by keyword, idea, or ambition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all shadow-2xs"
            aria-label="Search public dreams"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedCategory === ''
                ? 'bg-stone-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Feed list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-amber-400" />
        </div>
      ) : dreams.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 py-20 text-center bg-white/60 rounded-3xl border border-dashed border-stone-200 p-8"
        >
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
            <Compass size={32} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-display text-xl text-stone-700">No public dreams found</h2>
            <p className="text-stone-400 text-sm mt-1 max-w-sm">
              {search || selectedCategory
                ? 'Try broadening your search or choosing another category.'
                : 'Be the first to share a dream with the community! Set any dream collection to Public to inspire others.'}
            </p>
          </div>
          <Link to="/wishlists">
            <Button size="sm">
              <Sparkles size={14} />
              Make a dream public
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {dreams.map((dream, index) => {
              const owner = dream.wishlist?.user;
              const hasTelegram = Boolean(owner?.telegramUsername);

              return (
                <motion.div
                  key={dream.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Image if available */}
                    {dream.imageUrl && (
                      <div className="h-40 overflow-hidden bg-stone-100">
                        <img
                          src={dream.imageUrl}
                          alt={dream.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="p-5 flex flex-col gap-3">
                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={CATEGORY_COLORS[dream.category]}>
                          {CATEGORY_LABELS[dream.category]}
                        </Badge>
                        <Badge className={STATUS_COLORS[dream.status]}>
                          {STATUS_LABELS[dream.status]}
                        </Badge>
                      </div>

                      {/* Title & Why */}
                      <div>
                        <h3 className="font-display text-lg text-stone-800 font-semibold leading-snug">
                          {dream.title}
                        </h3>
                        {dream.whyIWantThis && (
                          <div className="mt-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-100/60">
                            <p className="text-xs text-amber-900 italic line-clamp-3">
                              &ldquo;{dream.whyIWantThis}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Owner info & Telegram Action Footer */}
                  <div className="px-5 py-3.5 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {owner?.avatarUrl ? (
                        <img
                          src={owner.avatarUrl}
                          alt={owner.name || 'Dreamer'}
                          className="w-7 h-7 rounded-full object-cover border border-amber-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-amber-200/80 flex items-center justify-center text-xs font-semibold text-amber-800 flex-shrink-0">
                          {(owner?.name || 'D')[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-stone-700 truncate">
                          {owner?.name || 'Dreamer'}
                        </p>
                        {dream.wishlist?.title && (
                          <p className="text-[10px] text-stone-400 truncate">
                            {dream.wishlist.title}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Telegram contact button */}
                    {hasTelegram ? (
                      <TelegramButton
                        username={owner?.telegramUsername}
                        label="Help with dream"
                        size="sm"
                      />
                    ) : (
                      <span className="text-[11px] text-stone-400 flex items-center gap-1">
                        <Heart size={12} className="text-amber-400" />
                        Community dream
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
