import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // The calculator's form handlers and several smart components were built
      // with loose `any` form values; keep that style rather than retyping the
      // whole UI as part of the framework migration.
      "@typescript-eslint/no-explicit-any": "off",
      // forwardRef components in src/components/smart/* don't set displayName.
      "react/display-name": "off",
      // Intentional external-state synchronization in the vendored
      // use-local-storage hook and the cloud-sync hook.
      "react-hooks/set-state-in-effect": "off",
      // The Ko-fi button embeds a remote brand image that can't be optimized.
      "@next/next/no-img-element": "off",
      // Stylistic; apostrophes in copy are fine.
      "react/no-unescaped-entities": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Cloud Functions is a separate npm package with its own lint config.
    "functions/**",
  ]),
]);

export default eslintConfig;
