import { createContext, useContext } from "react";
import type { PlaybackState } from "@/lib/radio/playback";
import type { RadioNowPlaying } from "@/lib/radio/types";

export type RadioState = {
  state: PlaybackState;
  volume: number;
  toggle: () => void;
  setVolume: (value: number) => void;
  nowPlaying: RadioNowPlaying | null;
  metadataStale: boolean;
  metadataLoading: boolean;
};
export const RadioContext = createContext<RadioState | null>(null);
export function useRadio() {
  const value = useContext(RadioContext);
  if (!value) throw new Error("RadioProvider ausente");
  return value;
}
