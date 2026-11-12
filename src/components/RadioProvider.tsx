import { useRef, useState, type ReactNode } from "react";
import ReactGA from "react-ga4";
import { useNowPlaying } from "@/hooks/useNowPlaying";
import { toggleAudio, type PlaybackState } from "@/lib/radio/playback";
import { RadioContext as Context } from "@/hooks/useRadio";
export function RadioProvider({ children }: { children: ReactNode }) {
  const audio = useRef<HTMLAudioElement>(null);
  const busy = useRef(false);
  const [state, setState] = useState<PlaybackState>("paused");
  const [volume, updateVolume] = useState(1);
  const metadata = useNowPlaying();
  async function toggle() {
    if (!audio.current || busy.current) return;
    busy.current = true;
    const action = audio.current.paused ? "play" : "pause";
    try {
      await toggleAudio(audio.current);
      ReactGA.event("player_interaction", {
        player_type: "premium_native",
        action_state: action,
        media_type: "Audio Nativo M3U",
      });
    } catch {
      setState("error");
    } finally {
      busy.current = false;
    }
  }
  function setVolume(value: number) {
    const next = Math.max(0, Math.min(1, value));
    if (audio.current) audio.current.volume = next;
    updateVolume(next);
  }
  return (
    <Context.Provider
      value={{
        state,
        volume,
        toggle,
        setVolume,
        nowPlaying: metadata.data?.data ?? null,
        metadataStale: metadata.isError || Boolean(metadata.data?.stale),
        metadataLoading: metadata.isPending,
      }}
    >
      <audio
        ref={audio}
        preload="none"
        onPlaying={() => setState("playing")}
        onPause={() => setState("paused")}
        onWaiting={() => setState("loading")}
        onLoadStart={() => setState("loading")}
        onEmptied={() => setState("paused")}
        onEnded={() => setState("paused")}
        onError={() => {
          if (audio.current?.getAttribute("src")) {
            audio.current.removeAttribute("src");
            setState("error");
          }
        }}
      />
      {children}
    </Context.Provider>
  );
}
