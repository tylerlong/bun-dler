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

or

```
yarn add --dev packle
```

or

```
npm install --save-dev packle
```

## Usage

```
bun packle
```

or

```
yarn packle
```

or

```
npx packle
```

or

```
./node_modules/.bin/packle
```

## Default behavior

By default it will bundle and generate output in `./public` folder.

If there is a `src/index.html` file, it will be copied to the output folder without change.

If there is a `src/index.ts` file, it will be used as the entry point of TypeScript code.
Otherwise it will try to find a `src/index.tsx`/`src/index.js`/`src/index.jsx` file and use it as the entry point.

If there is a `src/index.scss` file, it will be used as the entry point of Sass code.
Otherwise it will try to find a `src/index.css` file and use it as the entry point.

You may import `*.json` and `*.tomal` files directly and they will be inlined into the bundle as JavaScript objects.

You may import `*.txt` files directly and they will be inlined into the bundle as JavaScript strings.

All assets files, such as images/audios/vidoes/fonts, can be imported directly. Those files will be copied to the output folder without change. And the import is resolved as a relative path pointing to the copied file.

## Watch mode

You may pass `-w` to enable watch mode.
In watch mode, it will monitor `src` folder and `package.json` file. Whenever there are changes, it will re-run the bundle process.

In watch mode, you may also manually trigger re-bundle by pressing `Cmd + B` or `Ctrl + B`.

## Configurations

You may create a `packle.config.json` file to specify configurations to override the default behavior

```json
{
  "outDir": "./public",
  "jsEntries": ["./src/index.ts"],
  "cssEntries": ["./src/index.css"],
  "copyFiles": ["./src/index.html"]
}
```
