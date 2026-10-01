export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  popularRank: number;
  isHighlighted?: boolean;
  isPopularOverride?: boolean;
  viewCount?: number;
  sortDate?: number;
  uploadDate?: string;
  content: string[][];
}
