#!/usr/bin/env node
// bin/cli.js — CLI entry point for nodewatcher
// Parses process.argv manually — zero external dependencies.

import { watch } from '../src/watcher.js';
import { run, cleanup } from '../src/runner.js';
import { logger } from '../src/logger.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// ─── Read version from package.json ───────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const pkg = JSON.parse(readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

// ─── Help Text ─────────────────────────────────────────────────────────────────
const HELP = `
\x1b[1m\x1b[36mnodewatcher\x1b[0m \x1b[2mv${pkg.version}\x1b[0m — Zero-dependency file watcher CLI

\x1b[1mUSAGE\x1b[0m
  nodewatcher <path> [paths...] [options]

\x1b[1mOPTIONS\x1b[0m
  --run, -r <cmd>         Command to run on each file change
  --debounce, -d <ms>     Debounce delay in milliseconds (default: 300)
  --no-recursive          Disable recursive directory watching
  --help, -h              Show this help message
  --version, -v           Print the version number

\x1b[1mEXAMPLES\x1b[0m
  nodewatcher ./src
  nodewatcher ./src --run "node build.js"
  nodewatcher ./src ./lib --run "npm test" --debounce 500
  nodewatcher server.js --run "node server.js"
`;

// ─── Arg Parser ────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = argv.slice(2); // strip 'node' and script path
  const result = {
    paths: [],
    run: null,
    debounce: 300,
    recursive: true,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      console.log(HELP);
      process.exit(0);
    }

    if (arg === '--version' || arg === '-v') {
      console.log(`nodewatcher v${pkg.version}`);
      process.exit(0);
    }

    if ((arg === '--run' || arg === '-r') && args[i + 1]) {
      result.run = args[++i];
      continue;
    }

    if ((arg === '--debounce' || arg === '-d') && args[i + 1]) {
      const ms = parseInt(args[++i], 10);
      if (isNaN(ms) || ms < 0) {
        logger.error(`Invalid debounce value: "${args[i]}". Must be a positive integer.`);
        process.exit(1);
      }
      result.debounce = ms;
      continue;
    }

    if (arg === '--no-recursive') {
      result.recursive = false;
      continue;
    }

    if (arg.startsWith('-')) {
      logger.error(`Unknown option: ${arg}. Run with --help for usage.`);
      process.exit(1);
    }

    // Positional argument = path to watch
    result.paths.push(arg);
  }

  return result;
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const opts = parseArgs(process.argv);

  if (opts.paths.length === 0) {
    console.log(HELP);
    process.exit(0);
  }

  // Run the command immediately on start if provided
  if (opts.run) {
    await run(opts.run);
  }

  logger.ready(opts.paths);

  try {
    watch({
      paths: opts.paths,
      debounce: opts.debounce,
      recursive: opts.recursive,
      onChange: async (eventType, filePath) => {
        logger.change(eventType, filePath);
        if (opts.run) {
          await run(opts.run);
        }
      },
    });
  } catch (err) {
    logger.error(err.message);
    process.exit(1);
  }

  // ─── Graceful shutdown ──────────────────────────────────────────────────────
  async function shutdown(signal) {
    console.log(''); // newline after ^C
    logger.info(`Received ${signal}. Stopping...`);
    await cleanup();
    process.exit(0);
  }

  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.error(err.message);
  process.exit(1);
});
