import { existsSync } from "fs";
import { resolve } from "path";

const config = {
  outDir: "./public",
  jsEntries: ["./src/index.ts"],
  cssEntries: ["./src/index.css"],
  copyFiles: ["./src/index.html"],
};
const configPath = resolve(process.cwd(), "packle.config.json");
const userConfig = existsSync(configPath) ? require(configPath) : undefined;
if (userConfig) {
  for (const key of Object.keys(config)) {
    if (userConfig[key]) {
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

console.log(config);
