import type { Category, Status } from '../types';

// Text-only labels (no emoji — use icons at render sites)
export const CATEGORY_LABELS: Record<Category, string> = {
  TRAVEL:    'Travel',
  HEALTH:    'Health',
  CAREER:    'Career',
  FAMILY:    'Family',
  EDUCATION: 'Education',
  FUN:       'Fun',
  OTHER:     'Other',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  TRAVEL:    'cat-TRAVEL',
  HEALTH:    'cat-HEALTH',
  CAREER:    'cat-CAREER',
  FAMILY:    'cat-FAMILY',
  EDUCATION: 'cat-EDUCATION',
  FUN:       'cat-FUN',
  OTHER:     'cat-OTHER',
};

export const STATUS_LABELS: Record<Status, string> = {
  DREAM:       'Dream',
  IN_PROGRESS: 'In Progress',
  LIVED_IT:    'Lived It',
};

export const STATUS_COLORS: Record<Status, string> = {
  DREAM:       'status-dream',
  IN_PROGRESS: 'status-in-progress',
  LIVED_IT:    'status-lived-it',
};

export const CATEGORIES: Category[] = ['TRAVEL', 'HEALTH', 'CAREER', 'FAMILY', 'EDUCATION', 'FUN', 'OTHER'];
export const STATUSES: Status[] = ['DREAM', 'IN_PROGRESS', 'LIVED_IT'];

export function getNextStatus(current: Status): Status {
  const map: Record<Status, Status> = {
    DREAM:       'IN_PROGRESS',
    IN_PROGRESS: 'LIVED_IT',
    LIVED_IT:    'DREAM',
  };
  return map[current];
}
