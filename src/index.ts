#!/usr/bin/env bun
import { existsSync, mkdirSync, copyFileSync, writeFileSync, watch } from "fs";
import { resolve, join, parse, format } from "path";
import { compile as sassCompile } from "sass";
import readline from "readline";
import { Blue, Green } from "color-loggers";
import { getConfig } from "./config.ts";

const info = new Blue();
const success = new Green();

const bundle = () => {
  info.log("Bundling...");

  const config = getConfig();

  // create outDir
  if (!existsSync(config.outDir)) {
    mkdirSync(config.outDir, { recursive: true });
  }

  // copy files
  for (const file of config.copyFiles) {
    if (!existsSync(file)) {
      continue;
    }
    const target = join(config.outDir, file.split("/src/").at(-1) as string);
    copyFileSync(file, target);
  }

  // bundle js
  Bun.build({
    entrypoints: config.jsEntries,
    outdir: config.outDir,
    target: "browser",
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
    let target = join(config.outDir, cssFile.split("/src/").at(-1) as string);
    target = format({ ...parse(target), base: undefined, ext: ".css" }); // change extension to css
    writeFileSync(target, result.css);
  }

  success.log("Bundled!");
};

bundle();

// watch mode
const debounce = (func) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<typeof func>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, 100);
  };
};
const debouncedBundle = debounce(bundle);
const inputs = new Set(process.argv);
if (inputs.has("--watch") || inputs.has("-w")) {
  const configFile = resolve(process.cwd(), "packle.config.json");
  if (existsSync(configFile)) {
    watch(resolve(process.cwd(), "packle.config.json"), () =>
      debouncedBundle()
    );
  }
  watch(resolve(process.cwd(), "package.json"), () => debouncedBundle());
  watch(resolve(process.cwd(), "src"), () => debouncedBundle());

  // keyboard events
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on("keypress", (str, key) => {
    if (key.sequence === "p") {
      debouncedBundle();
    }
    if (key.sequence === "\u0003" || key.sequence === "q") {
      process.exit();
    }
  });
}
