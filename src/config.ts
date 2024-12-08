import { existsSync } from "fs";
import { resolve } from "path";

export const getConfig = () => {
  const configPath = resolve(process.cwd(), "packle.config.json");
  const config = existsSync(configPath) ? require(configPath) : {};

  if (config.outDir === undefined) {
    config.outDir = "./public";
  }

  if (config.jsEntries === undefined) {
    config.jsEntries = [
      "./src/index.ts",
      "./src/index.tsx",
      "./src/index.js",
      "./src/index.jsx",
    ];
  }

  if (config.cssEntries === undefined) {
    config.cssEntries = ["./src/index.scss", "./src/index.css"];
  }

  if (config.copyFiles === undefined) {
    config.copyFiles = ["./src/index.html"];
  }

  config.outDir = resolve(process.cwd(), config.outDir);
  for (const key of ["jsEntries", "cssEntries", "copyFiles"]) {
    config[key] = config[key]
      .map((entry: string) => resolve(process.cwd(), entry))
      .filter((p: string) => existsSync(p));
  }

  return config;
};
