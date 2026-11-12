export async function shareOrCopy(data: {
  title: string;
  text: string;
  url?: string;
}): Promise<"shared" | "copied" | "cancelled" | "failed"> {
  try {
    if (navigator.share) {
      await navigator.share(data);
      return "shared";
    }
    await navigator.clipboard.writeText([data.text, data.url].filter(Boolean).join("\n"));
    return "copied";
  } catch (error) {
    return error instanceof Error && error.name === "AbortError" ? "cancelled" : "failed";
  }
}
