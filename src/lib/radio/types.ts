export type RadioHistoryItem = {
  title: string;
  artist: string;
  cover: string | null;
  coverXl: string | null;
  played_at: string;
};
export type RadioNowPlaying = Omit<RadioHistoryItem, "played_at"> & {
  raw: string;
  bitrate: number | null;
  history: RadioHistoryItem[];
};
export type ServiceResult<T> = {
  data: T | null;
  updatedAt: number | null;
  stale: boolean;
};
