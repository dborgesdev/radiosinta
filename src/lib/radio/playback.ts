export type PlaybackState = "paused" | "loading" | "playing" | "error";
export const STREAM_URL = "https://stmplay.com/listen/radiosinta300014/radio.mp3";
export interface AudioPort {
  src: string;
  paused: boolean;
  volume: number;
  play(): Promise<void>;
  pause(): void;
  load(): void;
  removeAttribute(name: string): void;
}
/** Only explicit actions touch the stream; metadata is deliberately absent. */
export async function toggleAudio(audio: AudioPort): Promise<void> {
  if (!audio.paused) {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  } else {
    if (!audio.src) {
      audio.src = STREAM_URL;
      audio.load();
    }
    await audio.play();
  }
}
