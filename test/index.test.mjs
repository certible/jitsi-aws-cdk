import test from 'node:test';
import dashboard from './dashboard.test.mjs';

test('test modules', async () => {
  await dashboard;
});
