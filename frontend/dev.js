import crypto from 'node:crypto';
import { pathToFileURL } from 'url';
import path from 'path';

if (!crypto.getRandomValues && crypto.webcrypto && crypto.webcrypto.getRandomValues) {
  crypto.getRandomValues = crypto.webcrypto.getRandomValues.bind(crypto.webcrypto);
} else if (!crypto.getRandomValues) {
  crypto.getRandomValues = function (buffer) {
    return crypto.randomFillSync(buffer);
  };
}

import(pathToFileURL(path.resolve('./node_modules/vite/bin/vite.js')).href);
