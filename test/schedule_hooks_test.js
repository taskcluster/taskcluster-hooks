const assert = require('assert');
const Scheduler = require('../src/scheduler');
const helper = require('./helper');

suite('bin/schedule-hooks.js', function() {
  test('schedule_hooks launches a scheduler', async () => {
    const scheduler = await helper.load('schedulerNoStart', helper.loadOptions);
    assert(scheduler instanceof Scheduler);
  });
});
