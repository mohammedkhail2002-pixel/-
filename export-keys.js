import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const KEYS_FILE = join(__dirname, "data", "keys.json");
const OUTPUT_FILE = join(__dirname, "keys.txt");

if (!existsSync(KEYS_FILE)) {
  console.error("ERROR: data/keys.json not found. Start the server at least once to generate keys.");
  process.exit(1);
}

const raw = readFileSync(KEYS_FILE, "utf-8");
const data = JSON.parse(raw);
const allKeys = data.keys || [];

const unused = allKeys.filter(
  (k) => !k.activated && k.key !== "TEST-1234" && !k.isReusable
);

writeFileSync(OUTPUT_FILE, unused.map((k) => k.key).join("\n"), "utf-8");

const used = allKeys.filter((k) => k.activated && !k.isReusable).length;

console.log(`Exported ${unused.length} unused keys → keys.txt`);
console.log(`Total: ${allKeys.length}  |  Used: ${used}  |  Unused: ${unused.length}`);
