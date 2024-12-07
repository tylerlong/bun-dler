#!/usr/bin/env bun
import { existsSync, mkdirSync, copyFileSync, writeFileSync } from "fs";
import { resolve, join } from "path";
import { compile as sassCompile } from "sass";

// normalize config
const config = {
  target: "browser",
  outDir: "./public",
  jsEntries: ["./src/index.ts"],
  cssEntries: ["./src/index.css"],
  copyFiles: ["./src/index.html"],
};
const configPath = resolve(process.cwd(), "packle.config.json");
const userConfig = existsSync(configPath) ? require(configPath) : undefined;
if (userConfig) {
  for (const key of Object.keys(userConfig)) {
    if (config[key]) {
      config[key] = userConfig[key];
    }
  }
}
// Update path to absolute
for (const key of Object.keys(config)) {
  if (key === "target") {
    continue;
  }
  if (Array.isArray(config[key])) {
    config[key] = config[key].map((p: string) => resolve(process.cwd(), p));
  } else {
    config[key] = resolve(process.cwd(), config[key]);
  }
}

// create outDir
if (!existsSync(config.outDir)) {
  mkdirSync(config.outDir, { recursive: true });
}

// copy files
for (const file of config.copyFiles) {
  if (!existsSync(file)) {
    continue;
  }
  const target = join(config.outDir, file.split("/src/")[1]);
  copyFileSync(file, target);
}

// bundle js
Bun.build({
  entrypoints: config.jsEntries.filter((p) => existsSync(p)),
  outdir: config.outDir,
  target: config.target as "browser" | "node" | "bun",
  naming: {
    asset: "[dir]/[name].[ext]",
  },
});

// bundle css
for (const cssFile of config.cssEntries) {
  if (!existsSync(cssFile)) {
    continue;
  }
  const result = sassCompile(cssFile);
  const target = join(config.outDir, cssFile.split("/src/")[1]);
  writeFileSync(target, result.css);
}
