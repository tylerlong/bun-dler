import { existsSync, mkdirSync, copyFileSync } from "fs";
import { resolve, join } from "path";

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
    console.error(`file ${file} does not exist`);
    continue;
  }
  const target = join(config.outDir, file.split("/src/")[1]);
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
