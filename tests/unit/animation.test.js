const assert = require('node:assert/strict');
const { test, describe, beforeEach } = require('node:test');

/**
 * Unit tests for MMM-pages animation and page display logic
 *
 * These tests verify the animatePageChange function and module show/hide logic.
 */

let MMM_pages;

global.Module = {
  register: (name, definition) => {
    if (name === 'MMM-pages') {
      MMM_pages = definition;
    }
  }
};

global.Log = {
  log: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {}
};

require('../../MMM-pages.js');

describe('animatePageChange()', () => {
  let instance;
  let hiddenModules;
  let shownModules;
  let hideCallbacks;
  let showCallbacks;

  beforeEach(() => {
    hiddenModules = [];
    shownModules = [];
    hideCallbacks = [];
    showCallbacks = [];

    instance = Object.create(MMM_pages);
    instance.config = {
      modules: [
        ['clock', 'weather'],
        ['calendar', 'newsfeed'],
        ['compliments']
      ],
      fixed: ['MMM-page-indicator'],
      hiddenPages: {
        admin: ['admin-module'],
        screensaver: ['clock', 'MMM-BackgroundSlideshow']
      },
      animationTime: 1000,
      useLockString: true
    };
    instance.curPage = 0;
    instance.identifier = 'MMM-pages_test';
    instance.permanentlyHiddenModules = new Set();

    // Mock MM.getModules() with tracking
    global.MM = {
      getModules: () => ({
        exceptWithClass: classes => ({
          enumerate: (callback) => {
            hiddenModules.push(classes);
            hideCallbacks.push(callback);
            // Simulate calling the callback
            callback({
              name: 'test-module',
              identifier: 'test-id',
              hide: () => {
                // Track hide calls
              }
            });
          }
        }),
        withClass: classes => ({
          enumerate: (callback) => {
            shownModules.push(classes);
            showCallbacks.push(callback);
          }
        })
      })
    };
  });

  test('hides modules not on current page', () => {
    instance.animatePageChange();

    // Should hide modules not in fixed + current page modules
    assert.equal(hiddenModules.length, 1);
    const expectedVisible = ['MMM-page-indicator', 'clock', 'weather'];
    assert.deepEqual(hiddenModules[0], expectedVisible);
  });

  test('shows modules on current page after animation delay', (t, done) => {
    const originalSetTimeout = setTimeout;
    global.setTimeout = (callback, delay) => {
      assert.equal(delay, 500); // animationTime / 2
      callback(); // Execute immediately for test

      // Check that show was called with correct modules
      assert.equal(shownModules.length, 1);
      const expectedVisible = ['MMM-page-indicator', 'clock', 'weather'];
      assert.deepEqual(shownModules[0], expectedVisible);

      global.setTimeout = originalSetTimeout;
      done();
    };

    instance.animatePageChange();
  });

  test('uses correct modules for page 1', () => {
    instance.curPage = 1;
    instance.animatePageChange();

    const expectedVisible = ['MMM-page-indicator', 'calendar', 'newsfeed'];
    assert.deepEqual(hiddenModules[0], expectedVisible);
  });

  test('uses correct modules for page 2', () => {
    instance.curPage = 2;
    instance.animatePageChange();

    const expectedVisible = ['MMM-page-indicator', 'compliments'];
    assert.deepEqual(hiddenModules[0], expectedVisible);
  });

  test('uses hidden page modules when targetPageName provided', () => {
    instance.animatePageChange('admin');

    // Should use hiddenPages.admin modules
    assert.deepEqual(hiddenModules[0], ['admin-module']);
  });

  test('uses different hidden page modules', () => {
    instance.animatePageChange('screensaver');

    assert.deepEqual(hiddenModules[0], ['clock', 'MMM-BackgroundSlideshow']);
  });

  test('respects permanentlyHiddenModules and does not show them', (t, done) => {
    instance.permanentlyHiddenModules.add('test-hidden-id');

    global.MM = {
      getModules: () => ({
        exceptWithClass: () => ({
          enumerate: () => {}
        }),
        withClass: () => ({
          enumerate: (callback) => {
            // Simulate two modules, one permanently hidden
            const module1 = {
              identifier: 'test-hidden-id',
              show: () => { assert.fail('Should not show permanently hidden module'); }
            };
            const module2 = {
              identifier: 'test-visible-id',
              shown: false,
              show: () => { module2.shown = true; }
            };

            callback(module1);
            callback(module2);

            // Only module2 should be shown
            assert.equal(module2.shown, true);
            done();
          }
        })
      })
    };

    const originalSetTimeout = setTimeout;
    global.setTimeout = (callback) => {
      callback();
      global.setTimeout = originalSetTimeout;
    };

    instance.animatePageChange();
  });

  test('uses lockString when useLockString is true', () => {
    instance.config.useLockString = true;
    let capturedLockObj;

    global.MM = {
      getModules: () => ({
        exceptWithClass: () => ({
          enumerate: (callback) => {
            callback({
              hide: (time, cb, lockObj) => {
                capturedLockObj = lockObj;
              }
            });
          }
        }),
        withClass: () => ({
          enumerate: () => {}
        })
      })
    };

    instance.animatePageChange();

    assert.ok(capturedLockObj);
    assert.equal(capturedLockObj.lockString, 'MMM-pages_test');
  });

  test('does not use lockString when useLockString is false', () => {
    instance.config.useLockString = false;
    let capturedLockObj = 'not-undefined';

    global.MM = {
      getModules: () => ({
        exceptWithClass: () => ({
          enumerate: (callback) => {
            callback({
              hide: (time, cb, lockObj) => {
                capturedLockObj = lockObj;
              }
            });
          }
        }),
        withClass: () => ({
          enumerate: () => {}
        })
      })
    };

    instance.animatePageChange();

    assert.equal(capturedLockObj, undefined);
  });

  test('uses half of animationTime for transitions', () => {
    instance.config.animationTime = 2000;
    let capturedTime;

    global.MM = {
      getModules: () => ({
        exceptWithClass: () => ({
          enumerate: (callback) => {
            callback({
              hide: (time) => {
                capturedTime = time;
              }
            });
          }
        }),
        withClass: () => ({
          enumerate: () => {}
        })
      })
    };

    instance.animatePageChange();

    assert.equal(capturedTime, 1000); // animationTime / 2
  });

  test('handles page with no modules gracefully', () => {
    instance.config.modules.push([]); // Add empty page
    instance.curPage = 3;

    // Should not crash
    assert.doesNotThrow(() => {
      instance.animatePageChange();
    });
  });
});
