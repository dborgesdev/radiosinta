import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dailyVerses } from "../src/data/dailyVerses.ts";
import { saoPauloDay, verseForDay } from "../src/lib/dailyVerse.ts";
import { parseBibleBook, selection } from "../scripts/prepare-verses.mjs";

const bookOf = (entry: { reference: string }) => entry.reference.replace(/ \d+:\d+$/, "");

test("365 unique references and texts cover all 18 planned books and both Testaments", () => {
  assert.equal(dailyVerses.length, 365);
  assert.equal(new Set(dailyVerses.map((v) => v.reference)).size, 365);
  assert.equal(new Set(dailyVerses.map((v) => v.text)).size, 365);
  assert.equal(new Set(dailyVerses.map(bookOf)).size, 18);
  let oldTestament = 0,
    newTestament = 0;
  for (const book of selection.books) {
    const entries = dailyVerses.filter((v) => bookOf(v) === book.name);
    const references = book.references.split(" ");
    assert.equal(entries.length, references.length, book.name);
    assert.deepEqual(
      new Set(entries.map((v) => v.reference)),
      new Set(references.map((ref: string) => `${book.name} ${ref}`)),
    );
    if (book.testament === "AT") oldTestament += entries.length;
    else newTestament += entries.length;
  }
  assert.equal(oldTestament, 145);
  assert.equal(newTestament, 220);
  assert.ok(dailyVerses.every((v) => v.text.length >= 25 && !/[\\{}\uFFFD]/.test(v.text)));
});

test("books stay distributed over the whole repeating calendar, including the last/first boundary", () => {
  for (let i = 0; i < 365; i++) {
    assert.notEqual(bookOf(dailyVerses[i]), bookOf(dailyVerses[(i + 1) % 365]));
    const window = Array.from({ length: 30 }, (_, j) => bookOf(dailyVerses[(i + j) % 365]));
    assert.ok(new Set(window).size >= 16, `Window starting at ${i}`);
  }
  for (const year of [2026, 2027, 2028]) {
    for (let month = 0; month < 12; month++) {
      const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      const books = Array.from({ length: days }, (_, d) =>
        bookOf(verseForDay(new Date(Date.UTC(year, month, d + 1)).toISOString().slice(0, 10))),
      );
      assert.ok(new Set(books).size >= 15, `${year}-${month + 1}`);
    }
  }
});

test("collection matches the digest recorded after full comparison with pinned Bíblia Livre sources", () => {
  const verification = JSON.parse(
    readFileSync(new URL("../docs/daily-verses-verification.json", import.meta.url), "utf8"),
  );
  assert.equal(verification.commit, "a315a15e9f4d01883b62206fe441d57762f126b3");
  assert.equal(
    createHash("sha256").update(JSON.stringify(dailyVerses)).digest("hex"),
    verification.collectionSha256,
  );
  for (const book of selection.books) {
    const verified = verification.books.find((b: { name: string }) => b.name === book.name);
    assert.equal(verified.sourceSha256, book.sha256);
    assert.equal(verified.count, book.references.split(" ").length);
  }
  assert.equal(
    dailyVerses.find((v) => v.reference === "João 3:16")?.text,
    "Porque Deus amou o mundo de tal maneira, que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
  );
  assert.equal(
    dailyVerses.find((v) => v.reference === "Hebreus 11:1")?.text,
    "Ora, a fé é a certeza das coisas que se esperam, e a prova das coisas que não se veem.",
  );
});

test("source extraction retains literal words and punctuation, excludes apparatus and refuses unresolved variants", () => {
  const source = String.raw`\v Ef.2.8
Porque pela graça sois salvos, por meio da fé; e isto não
\added
vem
\*added
de vós; \fn Nota editorial.\*fn
\v Ef.2.9
Não por obras, para que ninguém se orgulhe.\ref Referência editorial.\*ref
\v Ef.2.10
Texto com {tr}variante {n4}alternativa {trnc}.
\v Ef.2.11
Texto com \unknown marcação.
`;
  const verses = parseBibleBook(source, "Ef");
  assert.equal(
    verses.get("2:8"),
    "Porque pela graça sois salvos, por meio da fé; e isto não vem de vós;",
  );
  assert.equal(verses.get("2:9"), "Não por obras, para que ninguém se orgulhe.");
  assert.equal(verses.has("2:10"), false);
  assert.equal(verses.has("2:11"), false);
  assert.throws(() => parseBibleBook(source, "Sl"));
});

test("daily selection still changes at São Paulo midnight without network or changes to the selection formula", (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => {
    throw new Error("No verse API allowed");
  });
  const before = saoPauloDay(new Date("2026-11-17T02:59:59Z"));
  const after = saoPauloDay(new Date("2026-11-17T03:00:00Z"));
  assert.equal(before, "2026-11-16");
  assert.equal(after, "2026-11-17");
  assert.deepEqual(verseForDay(before), verseForDay(before));
  assert.notEqual(bookOf(verseForDay(before)), bookOf(verseForDay(after)));
  const index = ((Math.floor(Date.parse(`${before}T00:00:00Z`) / 86_400_000) % 365) + 365) % 365;
  assert.deepEqual(verseForDay(before), dailyVerses[index]);
  assert.equal(fetch.mock.callCount(), 0);
});
