import assert from 'node:assert/strict';
import { microcentsToUsd, computeDiff, beginDiff } from '../src/services/usageService.js';

assert.equal(microcentsToUsd(100_000_000), '$1.00');
beginDiff({ appTotalsMicrocents: 10 });
assert.equal(computeDiff({ appTotalsMicrocents: 25 }), 15);

console.log('smoke tests passed');
