// API Response Types

export interface Song {
  id: number;
  title: string;
  file_path: string;
  created_at?: string;
  updated_at?: string;
}

export interface Lyric {
  id: number;
  title: string;
  lyrics: string;
  created_at?: string;
  updated_at?: string;
}

export interface Photo {
  id: number;
  url: string;
  caption?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Video {
  id: number;
  title: string;
  url: string;
  is_embed?: boolean;
  isEmbed?: boolean; // Legacy support
  created_at?: string;
  updated_at?: string;
}

// Component Props Types

export interface SongListProps {}

export interface MusicMatrixBackgroundProps {}

export interface HeaderProps {}

export interface FooterProps {}

export interface Product {
  id: number;
  name: string;
  price: number | string;
  description?: string;
  image?: string;
}
