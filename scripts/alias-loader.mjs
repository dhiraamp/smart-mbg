// Loader ESM untuk resolusi alias "@/" -> ./src saat menjalankan skrip test Node.
// Node ESM tidak menebak ekstensi, jadi coba .js / .jsx / .mjs bila path tanpa ekstensi.
// Jalankan: node --experimental-loader ./scripts/alias-loader.mjs scripts/test-flow.mjs
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const base = path.resolve(ROOT, "src", specifier.slice(2));
    let target = base;
    if (!path.extname(base)) {
      for (const ext of [".js", ".jsx", ".mjs", ".cjs"]) {
        if (fs.existsSync(base + ext)) {
          target = base + ext;
          break;
        }
      }
    }
    return { url: pathToFileURL(target).href, shortCircuit: true };
  }
  return next(specifier, context);
}
