#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const [leftArg, rightArg] = process.argv.slice(2);
if (!leftArg || !rightArg) {
  console.error("Usage: node compare_cloud_functions.js <left-dir> <right-dir>");
  process.exit(2);
}

const ignored = new Set(["node_modules", ".git", "cloud-upload", "cloud-release"]);
function files(root, dir = root) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.isDirectory() && ignored.has(entry.name)) return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? files(root, full) : [path.relative(root, full).replace(/\\/g, "/")];
  }).sort();
}
function digest(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

const left = path.resolve(leftArg);
const right = path.resolve(rightArg);
for (const dir of [left, right]) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error(`Not a directory: ${dir}`);
    process.exit(2);
  }
}

const names = new Set([...files(left), ...files(right)]);
const differences = [];
for (const name of [...names].sort()) {
  const a = path.join(left, name);
  const b = path.join(right, name);
  if (!fs.existsSync(a)) differences.push(`only right: ${name}`);
  else if (!fs.existsSync(b)) differences.push(`only left: ${name}`);
  else if (digest(a) !== digest(b)) differences.push(`content differs: ${name}`);
}

if (differences.length) {
  console.error(differences.join("\n"));
  process.exit(1);
}
console.log(`Cloud functions match across ${names.size} files.`);
