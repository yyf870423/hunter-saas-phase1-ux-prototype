import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import postcss from "postcss";

const directory = path.resolve("styles/landing-superhuman");
const reference = path.join(directory, "reference");
const manifest = JSON.parse(
  await fs.readFile(path.join(reference, "manifest.json")),
);
for (const [file, origin] of Object.entries(manifest.exports)) {
  const content = await fs.readFile(path.join(reference, file));
  assert.equal(
    createHash("sha256").update(content).digest("hex"),
    origin.sha256,
    file,
  );
}
const read = async (file) => fs.readFile(path.join(reference, file), "utf8");
const tokens = JSON.parse(await read("tokens.json"));
const adapter = JSON.parse(
  await fs.readFile(path.join(directory, "brand-adapter.json")),
);
const variables = new Map();
postcss.parse(await read("variables.css")).walkDecls((declaration) => {
  assert(!variables.has(declaration.prop), "Duplicate CSS reference variable");
  variables.set(declaration.prop, declaration.value);
});
postcss.parse(await read("tailwind.css")).walkDecls((declaration) => {
  assert.equal(
    variables.get(declaration.prop),
    declaration.value,
    declaration.prop,
  );
});
for (const group of ["color", "spacing", "radius", "surface", "shadow"]) {
  for (const [key, token] of Object.entries(tokens[group])) {
    assert.equal(
      variables.get(`--${group}-${key}`),
      token.$value,
      `${group}.${key}`,
    );
  }
}
const adapted = structuredClone(tokens);
const changed = new Map();
const sourceColors = new Map();
for (const [key, value] of Object.entries(adapter.colors)) {
  assert(adapted.color[key], `Unknown reference color role: ${key}`);
  sourceColors.set(tokens.color[key].$value.toLowerCase(), value);
  adapted.color[key].$value = value;
  changed.set(`--color-${key}`, value);
}
for (const [key, token] of Object.entries(adapted.surface)) {
  token.$value = sourceColors.get(token.$value.toLowerCase());
  assert(token.$value, `Unmapped reference surface: ${key}`);
  changed.set(`--surface-${key}`, token.$value);
}
adapted.font["super-sans-vf"].$value = "Inter Variable";
changed.set("--font-super-sans-vf", adapter.fonts.latin);
changed.set("--font-chinese", adapter.fonts.chinese);
for (const token of Object.values(adapted.typography)) {
  token.$value.fontFamily = "Inter Variable";
  token.$value.letterSpacing = "0";
}
for (const [key, token] of Object.entries(tokens.typography)) {
  changed.set(`--text-ref-${key}`, token.$value.fontSize);
}
adapted.shadow.subtle.$value = `${adapter.colors["royal-violet"]} 0px 0px 0px 1px inset`;
changed.set("--shadow-subtle", adapted.shadow.subtle.$value);
for (const [key, value] of Object.entries(adapter.variables)) {
  assert(variables.has(key), `Unknown CSS reference variable: ${key}`);
  changed.set(key, value);
}
for (const [role, value] of Object.entries(adapter.chinese)) {
  adapted.typography[`zh-${role}`] = {
    $type: "typography",
    $value: {
      ...value,
      fontFamily: "Noto Sans SC Variable",
      letterSpacing: "0",
    },
  };
  changed.set(`--text-zh-${role}`, value.fontSize);
}
adapted.$extensions["com.boseek.adaptation"] = {
  source: manifest.source,
  referenceManifest: "styles/landing-superhuman/reference/manifest.json",
  explanation: adapter.reason,
  cssRoleOverrides: adapter.variables,
};
const themeOverrides = [...changed].filter(([key]) =>
  /^(--color-|--font-|--text-|--leading-|--tracking-|--shadow-)/.test(key),
);
const block = (selector, entries) =>
  `${selector} {\n${entries.map(([key, value]) => `  ${key}: ${value};`).join("\n")}\n}\n`;
await fs.writeFile(
  path.join(directory, "brand.generated.css"),
  "/* Generated from the original Refero exports and brand-adapter.json. */\n" +
    block("@theme", themeOverrides) +
    block(":root", [...changed]),
);
await fs.writeFile(
  "public/landing-superhuman/design-tokens.json",
  JSON.stringify(adapted, null, 2) + "\n",
);
const { stderr } = await promisify(execFile)(process.execPath, [
  "node_modules/@tailwindcss/cli/dist/index.mjs",
  "-i",
  path.join(directory, "homepage.css"),
  "-o",
  "public/landing-superhuman/reference-system.css",
  "--minify",
]);
process.stdout.write(stderr);
console.log(
  `Compiled Tailwind v4 using ${variables.size} original CSS variables, original JSON primitives and explicit brand overrides.`,
);
