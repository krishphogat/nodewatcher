// src/watcher.cjs — CommonJS wrapper for the ESM watcher module
// Allows require('nodewatcher') to work in CJS projects.

'use strict';

// We use a dynamic import() to load the ESM module from CJS context.
// This is the standard pattern for dual CJS+ESM packages.
module.exports = {
  watch: async function watch(options) {
    const { watch: esWatch } = await import('./watcher.js');
    return esWatch(options);
  },
};
