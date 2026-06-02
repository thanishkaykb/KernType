import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const root = process.cwd();
const target = resolve(root, "output");
const candidates = [
  resolve(root, ".vercel/output/static"),
  resolve(root, ".output/public"),
  resolve(root, "dist"),
];

const source = candidates.find((dir) => existsSync(join(dir, "index.html")));

if (!source) {
  console.error(
    "Could not prepare Vercel output: no built index.html found in .vercel/output/static, .output/public, or dist.",
  );
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true, force: true });

const indexFile = join(target, "index.html");
const notFoundFile = join(target, "404.html");

if (!existsSync(notFoundFile)) {
  copyFileSync(indexFile, notFoundFile);
}

console.log(`Prepared Vercel static output from ${source} -> ${target}`);