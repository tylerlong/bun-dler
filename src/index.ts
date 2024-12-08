#!/usr/bin/env bun
import { existsSync, mkdirSync, copyFileSync, writeFileSync, watch } from "fs";
import { resolve, join } from "path";
import { compile as sassCompile } from "sass";
import readline from "readline";
import { Blue, Green } from "color-loggers";

const info = new Blue();
const success = new Green();

const bundle = () => {
  info.log("Bundling...");

  // normalize config
  const config = {
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
    const target = join(config.outDir, cssFile.split("/src/")[1]);
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
