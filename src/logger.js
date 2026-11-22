// src/logger.js — Colorful terminal output using ANSI escape codes (no deps)

const RESET = '\x1b[0m';
const BOLD  = '\x1b[1m';
const DIM   = '\x1b[2m';

const COLORS = {
  cyan:    '\x1b[36m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  red:     '\x1b[31m',
  magenta: '\x1b[35m',
  blue:    '\x1b[34m',
  white:   '\x1b[37m',
};

function timestamp() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return `${DIM}[${h}:${m}:${s}]${RESET}`;
}

function prefix() {
  return `${COLORS.cyan}${BOLD}nodewatcher${RESET}`;
}

export const logger = {
  info(msg) {
    console.log(`${timestamp()} ${prefix()} ${COLORS.white}${msg}${RESET}`);
  },

  change(eventType, filePath) {
    const eventColor = {
      rename: COLORS.yellow,
      change: COLORS.green,
      delete: COLORS.red,
    }[eventType] ?? COLORS.magenta;

    const eventLabel = {
      rename: 'RENAMED ',
      change: 'CHANGED ',
      delete: 'DELETED ',
    }[eventType] ?? 'EVENT   ';

    console.log(
      `${timestamp()} ${prefix()} ${eventColor}${BOLD}${eventLabel}${RESET} ${COLORS.blue}${filePath}${RESET}`
    );
  },

  run(cmd) {
    console.log(
      `${timestamp()} ${prefix()} ${COLORS.magenta}${BOLD}▶ running${RESET} ${DIM}${cmd}${RESET}`
    );
  },

  ready(paths) {
    const pathList = paths.join(', ');
    console.log(
      `\n${timestamp()} ${prefix()} ${COLORS.green}${BOLD}watching${RESET} ${COLORS.blue}${pathList}${RESET}\n`
    );
  },

  separator() {
    console.log(`${DIM}${'─'.repeat(60)}${RESET}`);
  },

  error(msg) {
    console.error(`${timestamp()} ${prefix()} ${COLORS.red}${BOLD}ERROR${RESET} ${msg}`);
  },

  warn(msg) {
    console.warn(`${timestamp()} ${prefix()} ${COLORS.yellow}${BOLD}WARN${RESET} ${msg}`);
  },
};
