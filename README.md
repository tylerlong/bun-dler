# packle

A bundler similar to Webpack or Parcel.

It is designed to be straightforward and reliable.

The codebase is minimal, with no hidden complexity or unnecessary magic.

## Prerequisites

This library requires [bun](https://bun.sh/docs/installation). Please install Bun before proceeding.

Note: This dependency is only needed during development and does not affect your production environment.

## Install

```
bun add --dev packle
```

## Usage

```
bun packle
```

## Default behavior

By default it will bundle code for "browser". You may make it `target` "node" by updating the configuration file.

By default it will bundle and generate output in `./public` folder.

If there is a `src/index.html` file, it will be copied to the output folder without change.

If there is a `src/index.ts` file, it will be used as the entry point of TypeScript code.
Otherwise it will try to find a `src/index.tsx`/`src/index.js`/`src/index.jsx` file and use it as the entry point.

If there is a `src/index.scss` file, it will be used as the entry point of Sass code.
Otherwise it will try to find a `src/index.css` file and use it as the entry point.

You may import `*.json` and `*.tomal` files directly and they will be inlined into the bundle as JavaScript objects.

You may import `*.txt` files directly and they will be inlined into the bundle as JavaScript strings.

All assets files, such as images/audios/vidoes/fonts, can be imported directly.
Those files will be copied to the output folder without change.
And the import is resolved as a relative path pointing to the copied file.

## Configurations

You may create a `packle.config.json` file to specify configurations to override the default behavior

```json
{
  "target": "browser",
  "outDir": "./public",
  "jsEntries": ["./src/index.ts"],
  "cssEntries": ["./src/index.css"],
  "copyFiles": ["./src/index.html"]
}
```

You don't need to specify everything if you are OK with the default values.
For example, `"target": "browser"` can be omitted since it is the default value.

## Multiple configurations

You may specify multiple configurations:

```json
[
  {
    "target": "browser",
    "outDir": "./public",
    "jsEntries": ["./src/demo.ts"],
    "cssEntries": ["./src/index.scss"],
    "copyFiles": ["./src/index.html"]
  },
  {
    "target": "node",
    "outDir": "./lib",
    "jsEntries": ["./src/index.ts"]
  }
]
```

## Watch mode

You may pass `-w` or `--watch` to enable watch mode.
In watch mode, it will monitor `src` folder `package.json` and `packle.config.json`. Whenever there are changes, it will re-run the bundle process.

Please note that, if your source code is not in `src` folder, the watch feature may not work as expected. It is an known issue.

In watch mode, you may also manually trigger re-bundle by pressing `p`.
You may quit by pressing `q` or `ctrl + c`.

## Production mode

You may pass `-p` or `--production` to enable watch mode.
In production mode, environment variable `NODE_ENV` will be set to "production" and code will be minified.

## Host local files

This library installs [serve](https://www.npmjs.com/package/serve). So that you can:

```
bun serve public
```

`public` is the `outDir`. You may need to adjust its value.

## Environment variables

You may create a `.env` file.
During bundling time, `process.env.XXX` will be replaced with the string value if `XXX` exists in `.env` file.

## Demo app

Please check this [packle React Demo](https://github.com/tylerlong/packle-react-demo).
It uses packle to bundle a React app.

## "target": "node"

When target "node", this tool simply generate a `packle-tsconfig.json` and run `tsc`, finally delete `packle-tsconfig.json`.

If there is any local typing files that your project depends on, you will need to declare it in `"jsEntries"`. For example:

```
{
  "target": "node",
  "outDir": "lib",
  "jsEntries": ["./src/index.ts", "./src/@types/index.d.ts"]
}
```
