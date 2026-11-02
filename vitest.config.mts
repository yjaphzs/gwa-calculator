import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests cover pure logic only (GWA math, state merging, import validation,
// report HTML builders) — no DOM, no Firebase. Test files sit next to the
// module they cover as `*.test.ts`. The functions package's pure helpers are
// tested here too; functions/tsconfig.json leaves the tests out of its build.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "functions/src/**/*.test.ts"],
  },
});
