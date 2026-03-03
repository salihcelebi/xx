import assert from 'node:assert/strict';
import { microcentsToUsd, computeDiff, beginDiff } from '../src/services/usageService.js';
import { DEFAULT_ROUTE, normalizeRoute, isValidRoute, getCurrentRoute } from '../src/router.js';

assert.equal(microcentsToUsd(100_000_000), '$1.00');
beginDiff({ appTotalsMicrocents: 10 });
assert.equal(computeDiff({ appTotalsMicrocents: 25 }), 15);

assert.equal(normalizeRoute('#/video'), '/video');
assert.equal(normalizeRoute('chat'), '/chat');
assert.equal(isValidRoute('/admin'), true);
assert.equal(isValidRoute('/assets'), false);
assert.equal(getCurrentRoute('#/unknown'), DEFAULT_ROUTE);

console.log('smoke tests passed');
