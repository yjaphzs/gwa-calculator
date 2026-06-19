#!/usr/bin/env node
/**
 * Generates inlined email templates by running mailwind on each .hbs source.
 *
 * Usage:  npm run generate:emails
 * Output: src/lib/email/generated-templates.ts
 *
 * Each template is exported as a pre-inlined HTML string constant. Handlebars
 * variables (e.g. {{actionUrl}}, {{appName}}) survive the mailwind/juice CSS
 * inlining pass and are resolved at runtime by templates.ts.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const TEMPLATES_DIR = path.join(__dirname, "../src/lib/email/templates");
const OUTPUT_FILE = path.join(
  __dirname,
  "../src/lib/email/generated-templates.ts",
);

function inlineTemplate(name) {
  const inputPath = path.join(TEMPLATES_DIR, `${name}.hbs`);
  const tempFile = path.join(os.tmpdir(), `mailwind-${name}-${Date.now()}.html`);

  console.log(`  Processing ${name}.hbs…`);
  try {
    execSync(
      `npx mailwind --input-html "${inputPath}" --output-html "${tempFile}"`,
      { cwd: path.join(__dirname, ".."), stdio: "inherit" },
    );
    return fs.readFileSync(tempFile, "utf8");
  } finally {
    if (fs.existsSync(tempFile)) fs.rmSync(tempFile);
  }
}

const templates = {
  VERIFY_EMAIL: inlineTemplate("verify-email"),
  PASSWORD_RESET: inlineTemplate("password-reset"),
};

const output = [
  "// AUTO-GENERATED — do not edit manually.",
  "// Run `npm run generate:emails` to regenerate after changing templates.",
  "",
  ...Object.entries(templates).map(
    ([key, html]) => `export const ${key}_TEMPLATE = ${JSON.stringify(html)};`,
  ),
  "",
].join("\n");

fs.writeFileSync(OUTPUT_FILE, output, "utf8");
console.log(`\n✓ Generated: ${OUTPUT_FILE}`);
