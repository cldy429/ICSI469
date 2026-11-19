import {copyFile} from 'node:fs/promises';

// Keep the offline browser demo identical to the API's generated frames.
await copyFile(
  new URL('../../naadam-api/src/wrestling-demo.js', import.meta.url),
  new URL('../public/js/wrestling-demo.js', import.meta.url),
);
console.log('Frontend ready in naadam-front/public');
