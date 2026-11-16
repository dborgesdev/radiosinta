import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

export const selection = JSON.parse(
  readFileSync(new URL("./daily-verses.selection.json", import.meta.url), "utf8"),
);
const root = new URL("../", import.meta.url);
const digest = (value) => createHash("sha256").update(value).digest("hex");

/** Decode publisher formatting only. Unresolved textual variants are never selected. */
export function parseBibleBook(source, abbreviation) {
  const verses = new Map();
  for (const match of source.matchAll(/\\v (\S+)\s+([\s\S]*?)(?=\\v |$)/g)) {
    const [book, chapter, verse] = match[1].split(".");
    if (book !== abbreviation || !/^\d+$/.test(chapter) || !/^\d+$/.test(verse))
      throw new Error(`Unexpected source reference: ${match[1]}`);
    const text = match[2]
      .replace(/\\fn[\s\S]*?\\\*fn/g, "")
      .replace(/\\ref[\s\S]*?\\\*ref/g, "")
      .replace(/\\psalm-title[\s\S]*?\\\*psalm-title/g, "")
      .replace(/\\\*?added\b/g, "")
      .replace(/\s+/g, " ")
      .replace(/\s+([,;:.!?])/g, "$1")
      .trim();
    if (!text || /[\\{}]/.test(text)) continue;
    const reference = `${chapter}:${verse}`;
    if (verses.has(reference)) throw new Error(`Duplicate source verse: ${reference}`);
    verses.set(reference, text);
  }
  return verses;
}

export function prepareCollection() {
  const groups = selection.books.map((book) => {
    const bytes = readFileSync(new URL(`.scratch/blivre/${book.file}.txt`, root));
    if (digest(bytes) !== book.sha256) throw new Error(`Source hash mismatch: ${book.file}`);
    const source = parseBibleBook(bytes.toString("utf8"), book.abbreviation);
    return book.references.split(" ").map((reference) => {
      const text = source.get(reference);
      if (!text) throw new Error(`Unverified/ambiguous passage: ${book.name} ${reference}`);
      return { reference: `${book.name} ${reference}`, text };
    });
  });
  // Spread every book across the complete cycle, rather than exhausting shorter books early.
  const selected = groups
    .flatMap((group, book) =>
      group.map((verse, i) => ({ verse, book, slot: (i + 0.5) / group.length })),
    )
    .sort((a, b) => a.slot - b.slot || a.book - b.book)
    .map((entry) => entry.verse);
  if (selected.length !== 365 || new Set(selected.map((v) => v.reference)).size !== 365)
    throw new Error("Expected exactly 365 unique references");
  const bookOf = (v) => v.reference.replace(/ \d+:\d+$/, "");
  if (selected.some((verse, i) => bookOf(verse) === bookOf(selected[(i + 1) % 365])))
    throw new Error("Adjacent books repeat, including the cycle boundary");
  return selected;
}

async function main() {
  // Optional maintainer command; never imported by the application/build.
  if (process.argv.includes("--download")) {
    mkdirSync(new URL(".scratch/blivre/", root), { recursive: true });
    for (const book of selection.books) {
      const url = `https://raw.githubusercontent.com/blivre/BibliaLivre/${selection.commit}/textos/f4/geral/${book.file}.txt`;
      const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(20_000) });
      if (!response.ok) throw new Error(`Download failed: ${book.file} (${response.status})`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (digest(bytes) !== book.sha256) throw new Error(`Download hash mismatch: ${book.file}`);
      writeFileSync(new URL(`.scratch/blivre/${book.file}.txt`, root), bytes);
    }
  }
  const selected = prepareCollection();
  const generated =
    "// Bíblia Livre · CC BY 3.0 BR · Diego Santos, Mario Sérgio e Marco Teles.\n" +
    `// Source commit ${selection.commit} · textos/f4/geral/*.txt\n` +
    "// Selection/source hashes: scripts/daily-verses.selection.json. Publisher formatting/notes omitted; wording unchanged.\n" +
    "export const dailyVerses = " +
    JSON.stringify(selected, null, 2) +
    " as const;\n";
  const target = new URL("src/data/dailyVerses.ts", root);
  const auditTarget = new URL("docs/daily-verses-verification.json", root);
  const verification = {
    commit: selection.commit,
    collectionSha256: digest(JSON.stringify(selected)),
    books: selection.books.map((book) => ({
      name: book.name,
      testament: book.testament,
      count: book.references.split(" ").length,
      source: `textos/f4/geral/${book.file}.txt`,
      sourceSha256: book.sha256,
    })),
  };
  if (process.argv.includes("--verify")) {
    const existing = readFileSync(target, "utf8").match(
      /export const dailyVerses = ([\s\S]*) as const;/,
    )?.[1];
    const parsed = JSON.parse(
      existing?.replace(/(^|\n)(\s*)(reference|text):/g, '$1$2"$3":').replace(/,\s*([}\]])/g, "$1"),
    );
    if (JSON.stringify(parsed) !== JSON.stringify(selected))
      throw new Error("Collection differs from source-verified selection");
    const stored = JSON.parse(readFileSync(auditTarget, "utf8"));
    if (JSON.stringify(stored) !== JSON.stringify(verification))
      throw new Error("Verification report differs");
    console.log(
      "PASS: all 365 references and complete texts match the pinned, hash-verified sources",
    );
  } else {
    writeFileSync(target, generated);
    writeFileSync(auditTarget, JSON.stringify(verification, null, 2) + "\n");
    console.log(
      "Generated 365 source-verified verses",
      verification.books.map((b) => `${b.name}: ${b.count}`).join("; "),
    );
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
