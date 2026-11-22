// src/runner.js — Runs a shell command as a child process on each file change.
// Kills any currently running process before spawning a new one.

import { spawn } from 'child_process';
import { logger } from './logger.js';

let currentProcess = null;

/**
 * Kills the currently running child process, if any.
 * @returns {Promise<void>} Resolves when the process has exited.
 */
function killCurrent() {
  return new Promise((resolve) => {
    if (!currentProcess) return resolve();

    const proc = currentProcess;
    currentProcess = null;

    if (proc.exitCode !== null || proc.killed) {
      return resolve();
    }

    proc.once('exit', resolve);
    proc.kill('SIGTERM');

    // Force kill after 2 seconds if it doesn't exit
    setTimeout(() => {
      if (!proc.killed) proc.kill('SIGKILL');
      resolve();
    }, 2000);
  });
}

/**
 * Runs a shell command string, killing any previous process first.
 * @param {string} cmd - The shell command to run (e.g., "node index.js").
 */
export async function run(cmd) {
  await killCurrent();

  logger.separator();
  logger.run(cmd);

  // Use sh -c to support pipes, redirects, and compound commands
  const proc = spawn('sh', ['-c', cmd], {
    stdio: 'inherit', // pipe child stdout/stderr directly to terminal
    env: process.env,
  });

  currentProcess = proc;

  proc.on('error', (err) => {
    logger.error(`Failed to start command: ${err.message}`);
  });

  proc.on('exit', (code, signal) => {
    if (code !== null && code !== 0) {
      logger.warn(`Command exited with code ${code}`);
    } else if (signal) {
      // Killed intentionally, no need to log
    }
  });
}

/**
 * Kills the currently running process and cleans up.
 */
export async function cleanup() {
  await killCurrent();
}
