import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // l'interfaccia del gioco è JavaScript scritto a mano: si controllano gli errori, non lo stile
    files: ["src/game/**/*.js"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "no-unused-vars": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "dist/**", "playtest/**", "test-results/**", "playwright-report/**", "next-env.d.ts"]),
]);
