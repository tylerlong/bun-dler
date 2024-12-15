#!/usr/bin/env bun
import {
  existsSync,
  mkdirSync,
  copyFileSync,
  writeFileSync,
  watch,
  unlinkSync,
} from "fs";
import { resolve, join, parse, format } from "path";
import { compile as sassCompile } from "sass";
import readline from "readline";
import { Blue, Green } from "color-loggers";
import { run } from "shell-commands";

import { getConfigs } from "./config";
import { loadEnv } from "./env";

const info = new Blue();
const success = new Green();

let prod = false;
const inputs = new Set(process.argv);
if (inputs.has("-p") || inputs.has("--production")) {
  prod = true;
}

const bundle = async () => {
  info.log("Bundling...");

  const configs = getConfigs();

  for (const config of configs) {
    // create outDir
    if (!existsSync(config.outDir)) {
      mkdirSync(config.outDir, { recursive: true });
    }

    // copy files
    for (const file of config.copyFiles) {
      if (!existsSync(file)) {
        continue;
      }
      const dest = join(config.outDir, file.split("/src/").at(-1) as string);
      copyFileSync(file, dest);
    }

    // bundle js
    if (config.target === "browser") {
      const define = loadEnv();
      define["process.env.NODE_ENV"] = JSON.stringify(
        prod ? "production" : "development"
      );
      const r = await Bun.build({
        entrypoints: config.jsEntries,
        outdir: config.outDir,
        target: "browser",
        naming: {
          asset: "[dir]/[name].[ext]",
        },
        minify: prod,
        define,
      });
      if (!r.success) {
        console.error(r);
      }
    } else if (config.target === "node" && config.jsEntries.length > 0) {
      const tsConfig = {
        compilerOptions: {
          esModuleInterop: true,
          jsx: "react",
          outDir: config.outDir,
          skipLibCheck: true,
          declaration: true,
          module: "nodenext",
          moduleResolution: "nodenext",
          target: "esnext",
        },
        files: config.jsEntries,
      };
      writeFileSync(
        "./packle-tsconfig.json",
        JSON.stringify(tsConfig, null, 2)
      );
      await run("bun tsc --project ./packle-tsconfig.json");
      unlinkSync("./packle-tsconfig.json");
    }

    // bundle css
    for (const cssFile of config.cssEntries) {
      if (!existsSync(cssFile)) {
        continue;
      }
      const result = sassCompile(cssFile);
      let dest = join(config.outDir, cssFile.split("/src/").at(-1) as string);
      dest = format({ ...parse(dest), base: undefined, ext: ".css" }); // change extension to css
      writeFileSync(dest, result.css);
    }
  }

  success.log("Bundled!");
};

bundle();

// watch mode
if (inputs.has("--watch") || inputs.has("-w")) {
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
