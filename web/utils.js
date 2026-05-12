const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

module.exports = { sleep, chunk, clamp };
