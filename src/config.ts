import { existsSync } from "fs";
import { resolve } from "path";

type Config = {
  target: "browser" | "node";
  outDir: string;
  jsEntries: string[];
  cssEntries: string[];
  copyFiles: string[];
};

export const getConfigs: () => Config[] = () => {
  const configPath = resolve(process.cwd(), "packle.config.json");
  let configs = existsSync(configPath) ? require(configPath) : [{}];
  if (!Array.isArray(configs)) {
    configs = [configs];
  }

  for (const config of configs) {
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

    if (config.target === undefined) {
      config.target = "browser";
    }

    if (config.cssEntries === undefined) {
      config.cssEntries =
        config.target === "browser"
          ? ["./src/index.scss", "./src/index.css"]
          : [];
    }

    if (config.copyFiles === undefined) {
      config.copyFiles =
        config.target === "browser" ? ["./src/index.html"] : [];
    }

    config.outDir = resolve(process.cwd(), config.outDir);
    for (const key of ["jsEntries", "cssEntries", "copyFiles"]) {
      config[key] = config[key]
        .map((entry: string) => resolve(process.cwd(), entry))
        .filter((p: string) => existsSync(p));
    }
  }

  return configs;
};
