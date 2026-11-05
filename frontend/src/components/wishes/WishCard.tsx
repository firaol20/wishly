import { motion } from 'framer-motion';
import {
  Calendar, MoreVertical, Pencil, Trash2,
  PlayCircle, CheckCircle2, RotateCcw, Heart,
} from 'lucide-react';
import { useState } from 'react';
import type { WishItem } from '../../types';
import { Badge } from '../ui/Badge';
import {
  CATEGORY_LABELS, CATEGORY_COLORS,
  STATUS_LABELS, STATUS_COLORS,
  getNextStatus,
} from '../../utils/categoryColors';
import { cn } from '../../utils/cn';
import { Link } from 'react-router-dom';

interface WishCardProps {
  wish: WishItem;
  index: number;
  onEdit: (wish: WishItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

const STATUS_NEXT_ICON = {
  DREAM:       { Icon: PlayCircle,   label: 'Start',     cls: 'text-amber-600' },
  IN_PROGRESS: { Icon: CheckCircle2, label: 'Lived it!', cls: 'text-green-600' },
  LIVED_IT:    { Icon: RotateCcw,    label: 'Reset',     cls: 'text-stone-500' },
};

export function WishCard({ wish, index, onEdit, onDelete, onStatusChange }: WishCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const nextStatus = getNextStatus(wish.status);
  const nextAction = STATUS_NEXT_ICON[wish.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        'bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200',
        wish.status === 'LIVED_IT' && 'ring-1 ring-green-200'
      )}
    >
      {/* Cover image */}
      {wish.imageUrl && (
        <Link to={`/wishes/${wish.id}`}>
          <div className="h-32 overflow-hidden">
            <img
              src={wish.imageUrl}
              alt={wish.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        </Link>
      )}

      <div className="p-4 flex flex-col gap-3">
        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge className={CATEGORY_COLORS[wish.category]}>{CATEGORY_LABELS[wish.category]}</Badge>
          <Badge className={STATUS_COLORS[wish.status]}>{STATUS_LABELS[wish.status]}</Badge>
        </div>

        {/* Title + menu */}
        <div className="flex items-start justify-between gap-2">
          <Link to={`/wishes/${wish.id}`} className="flex-1 min-w-0">
            <h3 className={cn(
              'font-display font-semibold text-stone-800 hover:text-amber-700 transition-colors leading-tight',
              wish.status === 'LIVED_IT' && 'line-through decoration-stone-300'
            )}>
              {wish.title}
            </h3>
          </Link>

          <div className="relative flex-shrink-0">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="p-1.5 rounded-lg text-stone-300 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              aria-label="Wish options"
            >
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-stone-100 py-1 min-w-[130px]">
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(wish); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-600 hover:bg-amber-50 hover:text-amber-700"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(wish.id); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Why snippet */}
        {wish.whyIWantThis && (
          <p className="text-xs text-stone-400 italic line-clamp-2">&quot;{wish.whyIWantThis}&quot;</p>
        )}

        {/* Target date */}
        {wish.targetDate && (
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <Calendar size={12} />
            {new Date(wish.targetDate).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </div>
        )}

        {/* Memory note preview */}
        {wish.status === 'LIVED_IT' && wish.memoryNote && (
          <div className="bg-green-50 rounded-xl p-2.5 text-xs text-green-700 italic line-clamp-2 flex gap-1.5 items-start">
            <Heart size={11} className="mt-0.5 flex-shrink-0 text-green-400 fill-green-300" />
            <span>&quot;{wish.memoryNote}&quot;</span>
          </div>
        )}

        {/* Status action button */}
        <button
          onClick={() => onStatusChange(wish.id, nextStatus)}
          className="mt-1 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-medium bg-stone-50 hover:bg-amber-50 transition-colors"
        >
          <nextAction.Icon size={13} className={nextAction.cls} />
          <span className={nextAction.cls}>{nextAction.label}</span>
        </button>
      </div>
    </motion.div>
  );
}
