import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import dotenv from "dotenv";

export const loadEnv = () => {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) {
    return {};
  }
  const obj = dotenv.parse(readFileSync(envPath, { encoding: "utf-8" }));
  const define = Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      `process.env.${key}`,
      JSON.stringify(value),
    ])
  );
  return define;
};
