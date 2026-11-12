import { dailyVerses } from "../data/dailyVerses.ts";

export function saoPauloDay(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function verseForDay(day: string) {
  const ordinal = Math.floor(Date.parse(`${day}T00:00:00Z`) / 86_400_000);
  const index = ((ordinal % dailyVerses.length) + dailyVerses.length) % dailyVerses.length;
  return dailyVerses[index];
}
