// Database model types

export interface Song {
  id: number;
  title: string;
  file_path: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Lyric {
  id: number;
  title: string;
  lyrics: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Photo {
  id: number;
  url: string;
  caption?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Video {
  id: number;
  title: string;
  url: string;
  is_embed: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Request body types
export interface CreateSongRequest {
  title: string;
  file_path: string;
}

export interface UpdateSongRequest {
  title: string;
  file_path: string;
}

export interface CreateLyricRequest {
  title: string;
  lyrics: string;
}

export interface UpdateLyricRequest {
  title: string;
  lyrics: string;
}

export interface CreatePhotoRequest {
  url: string;
  caption?: string;
}

export interface UpdatePhotoRequest {
  url: string;
  caption?: string;
}

export interface CreateVideoRequest {
  title: string;
  url: string;
  isEmbed: boolean;
}

export interface UpdateVideoRequest {
  title: string;
  url: string;
  isEmbed: boolean;
}
