# nodewatcher

> A zero-dependency CLI tool that watches your files for changes and automatically runs any command you give it — with beautiful colorful output and debounce support.

[![npm version](https://img.shields.io/npm/v/@krishphogat/nodewatcher.svg)](https://www.npmjs.com/package/@krishphogat/nodewatcher)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-brightgreen.svg)](https://nodejs.org/)

---

## What It Does

`nodewatcher` watches files and directories on your system. The moment a file changes, it:

1. 🔍 **Detects the change** (added, modified, or renamed)
2. 🎨 **Logs it** with the file path, event type, and timestamp in colorful output
3. ⚡ **Runs your command** automatically (e.g. restart a server, rebuild, run tests)
4. 🔄 **Kills the old process** before starting a new one — no zombie processes
5. 🛡️ **Debounces** rapid changes so your command only runs once per batch of edits

Think of it as a lightweight alternative to `nodemon` — but for any command, not just Node.js.

---

## Installation

```bash
npm install -g @krishphogat/nodewatcher
```

---

## How to Run It

### Basic — just watch for changes

```bash
nodewatcher ./src
```

### Watch and run a command on every change

```bash
nodewatcher ./src --run "node build.js"
```

### Restart a server when files change

```bash
nodewatcher server.js --run "node server.js"
```

### Watch multiple paths

```bash
nodewatcher ./src ./lib --run "npm test"
```

### Custom debounce delay (default is 300ms)

```bash
nodewatcher ./src --run "node build.js" --debounce 500
```

### Disable recursive watching

```bash
nodewatcher ./src --run "node index.js" --no-recursive
```

---

## CLI Options

| Flag | Alias | Description | Default |
|---|---|---|---|
| `--run <cmd>` | `-r` | Command to run on each file change | — |
| `--debounce <ms>` | `-d` | Debounce delay in milliseconds | `300` |
| `--no-recursive` | | Disable recursive directory watching | `false` |
| `--help` | `-h` | Show help message | — |
| `--version` | `-v` | Print version number | — |

---

## Programmatic API

You can also use `nodewatcher` as a module inside your Node.js code.

### ESM

```js
import { watch } from '@krishphogat/nodewatcher';

const watcher = watch({
  paths: ['./src'],
  debounce: 300,
  recursive: true,
  onChange: (eventType, filePath) => {
    console.log(`${eventType}: ${filePath}`);
  },
});

// Stop watching later
watcher.stop();
```

### CommonJS

```js
const { watch } = require('@krishphogat/nodewatcher');

watch({
  paths: ['./src'],
  onChange: (eventType, filePath) => {
    console.log(`${eventType}: ${filePath}`);
  },
}).then((watcher) => {
  // watcher.stop() to stop watching
});
```

---

## How It Works

- Uses Node.js built-in **`fs.watch`** — zero external dependencies
- Spawns your command via **`child_process.spawn`** with `sh -c` so pipes and compound commands work
- On each change, **kills** the previous process (SIGTERM → SIGKILL fallback) before restarting
- Colorful output uses raw **ANSI escape codes** — no dependencies

---

## Requirements

- Node.js **v16** or higher

---

## License

[MIT](./LICENSE) © 2024 Krish Phogat
