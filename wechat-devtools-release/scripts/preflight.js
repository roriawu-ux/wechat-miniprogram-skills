#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");

function arg(name, fallback = "") {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}
const projectRoot = path.resolve(arg("--project", process.cwd()));
const limitMb = Number(arg("--package-limit-mb", "2"));
const expectedAppId = arg("--expected-appid");
const errors = [];
const warnings = [];

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) { errors.push(`Invalid JSON: ${file} (${error.message})`); return null; }
}
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (["node_modules", ".git"].includes(entry.name)) return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
function size(files) { return files.reduce((sum, file) => sum + fs.statSync(file).size, 0); }

const project = readJson(path.join(projectRoot, "project.config.json"));
if (!project) process.exit(1);
if (expectedAppId && project.appid !== expectedAppId) {
  errors.push(`AppID mismatch: expected ${expectedAppId}, found ${project.appid || "<empty>"}`);
}
const miniRoot = path.resolve(projectRoot, project.miniprogramRoot || "miniprogram");
const app = readJson(path.join(miniRoot, "app.json"));
const pageBases = [];
if (app) {
  for (const page of app.pages || []) pageBases.push(path.join(miniRoot, page));
  for (const pkg of app.subPackages || app.subpackages || []) {
    for (const page of pkg.pages || []) pageBases.push(path.join(miniRoot, pkg.root, page));
  }
}
for (const base of pageBases) {
  for (const ext of [".js", ".json", ".wxml", ".wxss"]) {
    if (!fs.existsSync(base + ext)) errors.push(`Missing page file: ${base + ext}`);
  }
}

const sourceFiles = walk(miniRoot);
const cloudRoot = path.resolve(projectRoot, project.cloudfunctionRoot || "cloudfunctions");
for (const file of [...sourceFiles, ...walk(cloudRoot)]) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".json") readJson(file);
  if (ext === ".js") {
    const result = cp.spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
    if (result.status !== 0) errors.push(`JavaScript syntax error: ${file}\n${result.stderr.trim()}`);
  }
}

const assetPattern = /["'`](\/(?:assets|packages)\/[^"'`?]+\.(?:webp|png|jpe?g|gif|svg))["'`]/gi;
for (const file of sourceFiles.filter(file => [".js", ".json", ".wxml", ".wxss"].includes(path.extname(file)))) {
  const text = fs.readFileSync(file, "utf8");
  let match;
  while ((match = assetPattern.exec(text))) {
    if (match[1].includes("${")) continue;
    const target = path.join(miniRoot, ...decodeURI(match[1]).split("/").filter(Boolean));
    if (!fs.existsSync(target)) errors.push(`Missing asset: ${file} -> ${match[1]}`);
  }
}

const packageRoots = (app && (app.subPackages || app.subpackages) || []).map(pkg => path.join(miniRoot, pkg.root));
const mainFiles = sourceFiles.filter(file => !packageRoots.some(root => file.startsWith(root + path.sep)));
const limit = limitMb * 1024 * 1024;
const sizes = [{ name: "main", bytes: size(mainFiles) }, ...packageRoots.map(root => ({ name: path.relative(miniRoot, root), bytes: size(walk(root)) }))];
for (const item of sizes) {
  if (item.bytes > limit) errors.push(`${item.name} package exceeds ${limitMb} MB: ${(item.bytes / 1024 / 1024).toFixed(2)} MB`);
}
if (!project.appid) warnings.push("project.config.json has no AppID.");

for (const item of sizes) console.log(`${item.name}: ${(item.bytes / 1024 / 1024).toFixed(2)} MB`);
for (const warning of warnings) console.warn(`WARN ${warning}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Preflight passed: ${pageBases.length} pages, ${sourceFiles.length} Mini Program files.`);
