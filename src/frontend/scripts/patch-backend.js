/**
 * Patches the auto-generated backend.ts to fix the reserved keyword 'class'
 * used as a parameter name in the setUserProfile interface declaration.
 * TypeScript and esbuild both reject 'class' as a parameter name.
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendPath = resolve(__dirname, "../src/backend.ts");

try {
  let content = readFileSync(backendPath, "utf8");
  // Fix 'class' reserved keyword used as parameter name in interface
  const patched = content.replace(
    /\bsetUserProfile\(([^)]*?)\bclass\b:/g,
    "setUserProfile($1class_:"
  );
  if (patched !== content) {
    writeFileSync(backendPath, patched, "utf8");
    console.log("[patch-backend] Fixed reserved keyword 'class' in backend.ts");
  }
} catch (e) {
  console.warn("[patch-backend] Could not patch backend.ts:", e.message);
}
