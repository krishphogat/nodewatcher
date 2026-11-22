// src/watcher.js — Core file watching logic (ESM) using Node.js built-in fs.watch
// Zero external dependencies.

import fs from 'fs';
import path from 'path';

/**
 * Creates a debounced version of a function.
 * @param {Function} fn - The function to debounce.
 * @param {number} delay - Milliseconds to wait before calling fn.
 * @returns {Function} Debounced function.
 */
function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };
}

/**
 * Resolves and validates a list of paths.
 * @param {string[]} watchPaths - Paths to validate.
 * @returns {string[]} Absolute, existing paths.
 */
function resolvePaths(watchPaths) {
  return watchPaths.map((p) => {
    const abs = path.resolve(p);
    if (!fs.existsSync(abs)) {
      throw new Error(`Path does not exist: ${abs}`);
    }
    return abs;
  });
}

/**
 * Starts watching the given paths for changes.
 *
 * @param {object} options
 * @param {string[]} options.paths       - Paths to watch (files or directories).
 * @param {number}  [options.debounce=300] - Debounce delay in ms.
 * @param {boolean} [options.recursive=true] - Watch subdirectories recursively.
 * @param {Function} options.onChange    - Called with (eventType, filePath) on change.
 * @returns {{ stop: Function }} Object with a stop() method to close all watchers.
 */
export function watch({ paths, debounce: debounceMs = 300, recursive = true, onChange }) {
  if (!paths || paths.length === 0) {
    throw new Error('At least one path must be provided to watch.');
  }
  if (typeof onChange !== 'function') {
    throw new Error('onChange callback must be a function.');
  }

  const resolvedPaths = resolvePaths(paths);
  const watchers = [];

  const debouncedChange = debounce((eventType, filePath) => {
    onChange(eventType, filePath);
  }, debounceMs);

  for (const watchPath of resolvedPaths) {
    try {
      const watcher = fs.watch(watchPath, { recursive }, (eventType, filename) => {
        const fullPath = filename
          ? path.join(watchPath, filename)
          : watchPath;
        debouncedChange(eventType, fullPath);
      });

      watcher.on('error', (err) => {
        // Surface errors but don't crash the whole watcher
        onChange('error', err.message);
      });

      watchers.push(watcher);
    } catch (err) {
      throw new Error(`Failed to watch "${watchPath}": ${err.message}`);
    }
  }

  return {
    /** Stops all active file watchers. */
    stop() {
      for (const w of watchers) {
        w.close();
      }
    },
  };
}
