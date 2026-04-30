// Stubs `react-native` so Node-side scripts can import files
// that transitively pull in RN (e.g. constants/theme.ts -> Platform).
const Module = require('module');
const orig = Module._resolveFilename;
const stubPath = require.resolve('./rn-stub.cjs');
Module._resolveFilename = function (request, ...args) {
  if (request === 'react-native') return stubPath;
  return orig.call(this, request, ...args);
};
