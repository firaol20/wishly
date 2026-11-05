export type Category = 'TRAVEL' | 'HEALTH' | 'CAREER' | 'FAMILY' | 'EDUCATION' | 'FUN' | 'OTHER';
export type Status = 'DREAM' | 'IN_PROGRESS' | 'LIVED_IT';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Visibility = 'PRIVATE' | 'LINK';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  visibility: Visibility;
  shareToken?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: { items: number };
}

export interface WishItem {
  id: string;
  wishlistId: string;
  title: string;
  whyIWantThis?: string;
  imageUrl?: string;
  category: Category;
  tags: string[];
  status: Status;
  priority: Priority;
  targetDate?: string;
  memoryNote?: string;
  memoryImageUrl?: string;
  sortOrder: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  totalWishes: number;
  dreamCount: number;
  inProgressCount: number;
  livedItCount: number;
  livedItThisYear: number;
  completionPercent: number;
  upcomingTargetDates: Pick<WishItem, 'id' | 'title' | 'targetDate' | 'status' | 'category'>[];
  recentlyLived: Pick<WishItem, 'id' | 'title' | 'completedAt' | 'memoryImageUrl' | 'category'>[];
}

export interface AiSuggestion {
  category: Category;
  tags: string[];
}
