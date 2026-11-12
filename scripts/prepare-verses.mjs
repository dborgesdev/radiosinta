import { readFileSync, writeFileSync } from "node:fs";
const source = readFileSync(".scratch/salmos.txt", "utf8").replace(/\\fn[\s\S]*?\\\*fn/g, "");
const chapters = new Set([
  1, 8, 19, 23, 27, 34, 37, 46, 63, 84, 91, 95, 96, 98, 100, 103, 104, 112, 116, 117, 118, 121, 125,
  126, 127, 128, 130, 131, 133, 136, 138, 139, 145, 146, 147, 148, 149, 150,
]);
const entries = [...source.matchAll(/\\v Sl\.(\d+)\.(\d+)\s+([\s\S]*?)(?=\\v |$)/g)]
  .filter((m) => chapters.has(Number(m[1])))
  .map((m) => ({ reference: `Salmos ${m[1]}:${m[2]}`, text: m[3].replace(/\s+/g, " ").trim() }))
  .filter((v) => !v.text.includes("\\") && v.text.length >= 25 && v.text.length <= 300);
// Round-robin by chapter keeps adjacent messages varied. Preserve source wording.
const groups = [...chapters].map((ch) =>
  entries.filter((v) => v.reference.startsWith(`Salmos ${ch}:`)),
);
const selected = [];
while (groups.some((g) => g.length) && selected.length < 365)
  for (const group of groups)
    if (group.length && selected.length < 365) selected.push(group.shift());
if (selected.length !== 365) throw new Error(`Only ${selected.length} validated verses`);
writeFileSync(
  "src/data/dailyVerses.ts",
  "// Bíblia Livre · CC BY 3.0 BR · Diego Santos, Mario Sérgio e Marco Teles.\n// Source commit a315a15e9f4d01883b62206fe441d57762f126b3 · textos/f4/geral/sal.txt\n// Whitespace normalized; editorial footnotes omitted; wording unchanged.\nexport const dailyVerses = " +
    JSON.stringify(selected, null, 2) +
    " as const;\n",
);
console.log(`Generated ${selected.length} unique source-verified verses`);
