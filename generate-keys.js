import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEYS_FILE = join(__dirname, "data", "keys.json");
const TARGET = 1000;

// ── Load existing keys ────────────────────────────────────────────────────────
if (!existsSync(join(__dirname, "data"))) mkdirSync(join(__dirname, "data"));

let data = { keys: [] };
if (existsSync(KEYS_FILE)) {
  data = JSON.parse(readFileSync(KEYS_FILE, "utf-8"));
}
const existing = data.keys || [];
const existingSet = new Set(existing.map((k) => k.key));

// ── Key generator (same format as the activation system: XXXX-0000) ──────────
// 4 uppercase letters (no I/O to avoid confusion) + dash + 4 digits = 9 chars
// This matches the length check in the activation page (key.length !== 9).
const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS  = "0123456789";

function pick(chars, n) {
  return Array.from(
    { length: n },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

function makeKey() {
  return pick(LETTERS, 4) + "-" + pick(DIGITS, 4);
}

// ── Generate only the missing amount ─────────────────────────────────────────
const needed = Math.max(0, TARGET - existing.length);

if (needed === 0) {
  const used   = existing.filter((k) => k.activated && !k.isReusable).length;
  const unused = existing.filter((k) => !k.activated).length;
  console.log(`Already at target (${existing.length} keys). Nothing to generate.`);
  console.log(`Total: ${existing.length}  |  Used: ${used}  |  Unused: ${unused}`);
  process.exit(0);
}

console.log(`Current keys: ${existing.length}  |  Target: ${TARGET}  |  Generating: ${needed}`);

const newKeys = [];
while (newKeys.length < needed) {
  const k = makeKey();
  if (!existingSet.has(k)) {
    existingSet.add(k);
    newKeys.push({ key: k, activated: false, isReusable: false, restaurantId: null });
  }
}

// ── Append and save ───────────────────────────────────────────────────────────
data.keys = [...existing, ...newKeys];
writeFileSync(KEYS_FILE, JSON.stringify(data, null, 2), "utf-8");

// ── Final summary ─────────────────────────────────────────────────────────────
const all    = data.keys;
const used   = all.filter((k) => k.activated && !k.isReusable).length;
const unused = all.filter((k) => !k.activated).length;

console.log(`Added ${newKeys.length} new keys → data/keys.json`);
console.log(`Total: ${all.length}  |  Used: ${used}  |  Unused: ${unused}`);
console.log(`Run 'node export-keys.js' to export all unused keys to keys.txt`);
