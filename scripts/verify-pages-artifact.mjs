import assert from "node:assert/strict";
import { lstat, readFile, readdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";

const root = resolve(import.meta.dirname, "..");
const expected = [
  "index.html",
  "shared-ui.css",
  "shared-ui.js",
  "page.css",
  "shared-display-title.css",
  "page.js",
  "shared-footer.css",
  "shared-footer.js",
  "asset-network.css",
  "asset-network.js",
  "shared-form.css",
  "shared-form.js",
  "trial-page.css",
  "trial-form.js",
  "research-chapters.css",
  "research-chapters.js",
  "research-story-data.js",
  "research-chapters-data.js",
  "demo-data.js",
  "vendor/libphonenumber-max.js",
  "vendor/LICENSE",
  "vendor/LICENSE.Apache",
  "assets/boseek-wordmark.svg",
  "assets/fonts/dm-serif-display.ttf",
  "assets/fonts/dmserifdisplay-OFL.txt",
  "assets/hero-research.webp",
  "assets/hero-research-mobile.webp",
  "assets/research-detail.webp",
  "assets/human-conversation.webp",
  "assets/footer-coast.webp",
  "assets/research-chapters/research-chapter-evidence-20261008.webp",
  "assets/research-chapters/research-chapter-gaps-20261008.webp",
  "assets/research-chapters/research-chapter-decision-20261008.webp",
].sort();
async function entries(directory, prefix = "") {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    assert(
      !(await lstat(path)).isSymbolicLink(),
      `No public symlinks: ${path}`,
    );
    if (entry.isDirectory())
      files.push(...(await entries(path, `${prefix}${entry.name}/`)));
    else files.push(`${prefix}${entry.name}`);
  }
  return files.sort();
}
const source = resolve(root, "public/landing");
const built = resolve(root, "dist/landing");
assert.deepEqual(await entries(source), expected);
assert.deepEqual(await entries(built), expected);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
for (const file of expected)
  assert.equal(
    hash(await readFile(join(built, file))),
    hash(await readFile(join(source, file))),
    file,
  );
const html = await readFile(join(built, "index.html"), "utf8");
assert(
  html.includes('<meta name="trial-api" content="disabled" />'),
  "Static Pages must not submit to an unconfigured API",
);
const original = await readFile(resolve(root, "dist/index.html"), "utf8");
assert(
  original.includes('id="root"'),
  "Original application entry must remain present",
);
assert(
  !original.includes('id="homepage"'),
  "Do not replace the original homepage with the new landing",
);
const assets = expected.filter(
  (file) => file.startsWith("assets/") && !file.startsWith("assets/fonts/"),
);
const alternatives = {
  "landing-origin": [
    "index.html",
    "origin.css",
    "origin.js",
    "shared-origin.css",
    "shared-origin-network.css",
    "shared-origin-network.js",
    ...assets,
    "assets/fonts/dm-serif-display.ttf",
    "assets/fonts/dmserifdisplay-OFL.txt",
    "assets/fonts/noto-serif-sc.ttf",
    "assets/fonts/notoserifsc-OFL.txt",
  ],
  "landing-signal": [
    "index.html",
    "signal.js",
    "shared-signal.css",
    "shared-signal.js",
    ...assets,
    "assets/ai-talent-evidence-cn.webp",
    "assets/ai-company-mapping-cn.webp",
    "assets/ai-research-talent-cn.webp",
  ],
  homepages: [
    "index.html",
    "shared-homepage-catalog.css",
    "shared-homepage-catalog.js",
    "assets/original.png",
    "assets/signal.png",
    "assets/finesse.png",
    "assets/origin.png",
  ],
};
for (const [directory, files] of Object.entries(alternatives)) {
  const allowlist = files.toSorted();
  const publicPath = resolve(root, "public", directory);
  const buildPath = resolve(root, "dist", directory);
  assert.deepEqual(
    await entries(publicPath),
    allowlist,
    `${directory} source allowlist`,
  );
  assert.deepEqual(
    await entries(buildPath),
    allowlist,
    `${directory} output allowlist`,
  );
  for (const file of allowlist)
    assert.equal(
      hash(await readFile(join(publicPath, file))),
      hash(await readFile(join(buildPath, file))),
      `${directory}/${file}`,
    );
  if (directory !== "homepages")
    assert(
      (await readFile(join(buildPath, "index.html"), "utf8")).includes(
        '<meta name="trial-api" content="disabled" />',
      ),
      `${directory} must not submit to an unconfigured API`,
    );
}
console.log(
  `PASS original application retained; ${expected.length + Object.values(alternatives).reduce((count, files) => count + files.length, 0)} allowlisted homepage files match build output; no backend or private files published`,
);
