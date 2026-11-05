import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookHeart, Lock, Link2, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Wishlist } from '../../types';
import { cn } from '../../utils/cn';

interface WishlistCardProps {
  wishlist: Wishlist;
  onEdit: (wishlist: Wishlist) => void;
  onDelete: (id: string) => void;
  index: number;
}

export function WishlistCard({ wishlist, onEdit, onDelete, index }: WishlistCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="group relative bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
    >
      {/* Cover image */}
      <Link to={`/wishlists/${wishlist.id}`} aria-label={`Open ${wishlist.title}`}>
        <div className="h-36 bg-gradient-to-br from-amber-50 to-amber-100 relative overflow-hidden">
          {wishlist.coverImageUrl ? (
            <img
              src={wishlist.coverImageUrl}
              alt={wishlist.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookHeart size={40} className="text-amber-200" />
            </div>
          )}

          {/* Visibility badge */}
          <div className={cn(
            'absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm',
            wishlist.visibility === 'LINK'
              ? 'bg-blue-100/90 text-blue-700'
              : 'bg-white/80 text-stone-500'
          )}>
            {wishlist.visibility === 'LINK' ? <Link2 size={10} /> : <Lock size={10} />}
            {wishlist.visibility === 'LINK' ? 'Shared' : 'Private'}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link to={`/wishlists/${wishlist.id}`}>
              <h3 className="font-display text-stone-800 font-semibold truncate hover:text-amber-700 transition-colors">
                {wishlist.title}
              </h3>
            </Link>
            {wishlist.description && (
              <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{wishlist.description}</p>
            )}
            <p className="text-xs text-stone-400 mt-1.5">
              {wishlist._count?.items ?? 0} {wishlist._count?.items === 1 ? 'wish' : 'wishes'}
            </p>
          </div>

          {/* Actions menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="p-1.5 rounded-lg text-stone-300 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              aria-label="Wishlist options"
              aria-expanded={menuOpen}
            >
              <MoreVertical size={15} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-stone-100 py-1 min-w-[140px]">
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(wishlist); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-600 hover:bg-amber-50 hover:text-amber-700"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(wishlist.id); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
