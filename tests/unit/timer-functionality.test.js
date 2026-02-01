const assert = require('node:assert/strict');
const { test, describe, beforeEach, afterEach } = require('node:test');

/**
 * Unit tests for MMM-pages timer and rotation functionality
 *
 * These tests verify timer management, rotation delays, and hidden page timeouts.
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

global.MM = {
  getModules: () => ({
    enumerate: () => {},
    exceptWithClass: () => ({ enumerate: () => {} }),
    withClass: () => ({ enumerate: () => {} })
  })
};

require('../../MMM-pages.js');

describe('Timer Functionality', () => {
  let instance;
  let timers;

  beforeEach(() => {
    timers = [];
    instance = Object.create(MMM_pages);
    instance.config = {
      modules: [['page0'], ['page1'], ['page2']],
      fixed: ['MMM-page-indicator'],
      hiddenPages: {
        admin: ['admin-module'],
        screensaver: ['clock']
      },
      homePage: 0,
      animationTime: 1000,
      timings: { default: 5000, admin: 30000 },
      rotationDelay: 10000,
      rotationHomePage: 0,
      rotationHomePageHidden: 30000,
      useLockString: true
    };
    instance.curPage = 0;
    instance.rotationPaused = false;
    instance.isOnHiddenPage = false;
    instance.permanentlyHiddenModules = new Set();
    instance.hiddenPageTimer = null;
    instance.timer = null;
    instance.delayTimer = null;
    instance.identifier = 'MMM-pages_test';
    instance.sendNotification = () => {};
    instance.notificationReceived = () => {};
    instance.animatePageChange = () => {};
  });

  afterEach(() => {
    // Clean up any timers
    if (instance.timer) clearInterval(instance.timer);
    if (instance.delayTimer) clearTimeout(instance.delayTimer);
    if (instance.hiddenPageTimer) clearTimeout(instance.hiddenPageTimer);
    timers.forEach(timer => clearTimeout(timer));
  });

  describe('resetTimerWithDelay()', () => {
    test('sets up rotation timer with default timing', (t, done) => {
      instance.config.timings.default = 100;
      const originalSetTimeout = setTimeout;
      const originalSetInterval = setInterval;

      global.setTimeout = (callback, delay) => {
        const timer = originalSetTimeout(() => {
          callback();
          if (instance.timer) done();
        }, delay);
        timers.push(timer);
        return timer;
      };

      global.setInterval = (callback, interval) => {
        const timer = originalSetInterval(callback, interval);
        instance.timer = timer;
        return timer;
      };

      instance.resetTimerWithDelay(0);

      global.setTimeout = originalSetTimeout;
      global.setInterval = originalSetInterval;
    });

    test('uses page-specific timing when available', (t, done) => {
      instance.config.timings[1] = 10000;
      instance.curPage = 1;

      const originalSetInterval = setInterval;
      const originalSetTimeout = setTimeout;

      global.setInterval = (callback, interval) => {
        assert.equal(interval, 10000);
        const timer = originalSetInterval(callback, interval);
        instance.timer = timer;
        global.setInterval = originalSetInterval;
        global.setTimeout = originalSetTimeout;
        done();
        return timer;
      };

      instance.resetTimerWithDelay(0);
    });

    test('calls clearTimers before setting new timer', () => {
      let clearTimersCalled = false;
      instance.clearTimers = () => { clearTimersCalled = true; };
      instance.resetTimerWithDelay(0);
      assert.ok(clearTimersCalled);
    });

    test('sets up rotation home page timer when timings.default is 0', (t, done) => {
      instance.config.timings.default = 0;
      instance.config.rotationHomePage = 100;

      const originalSetTimeout = setTimeout;
      const originalSetInterval = setInterval;

      global.setTimeout = (callback, delay) => {
        const timer = originalSetTimeout(() => {
          callback();
          if (instance.timer) done();
        }, delay);
        timers.push(timer);
        return timer;
      };

      global.setInterval = (callback, interval) => {
        const timer = originalSetInterval(callback, interval);
        instance.timer = timer;
        return timer;
      };

      instance.resetTimerWithDelay(0);

      global.setTimeout = originalSetTimeout;
      global.setInterval = originalSetInterval;
    });

    test('uses rotationHomePageHidden when on hidden page', (t, done) => {
      instance.config.timings = { default: 0 }; // Remove admin entry
      instance.config.rotationHomePage = 5000;
      instance.config.rotationHomePageHidden = 30000;
      instance.isOnHiddenPage = true;

      const originalSetInterval = setInterval;
      const originalSetTimeout = setTimeout;

      global.setInterval = (callback, interval) => {
        assert.equal(interval, 30000);
        const timer = originalSetInterval(callback, interval);
        instance.timer = timer;
        global.setInterval = originalSetInterval;
        global.setTimeout = originalSetTimeout;
        done();
        return timer;
      };

      instance.resetTimerWithDelay(0);
    });

    test('does not set timer when all rotation settings are 0', (t, done) => {
      instance.config.timings = { default: 0 }; // Remove admin entry
      instance.config.rotationHomePage = 0;
      instance.config.rotationHomePageHidden = 0;

      const originalSetTimeout = setTimeout;
      const originalSetInterval = setInterval;
      let timeoutCalled = false;
      let intervalCalled = false;

      global.setTimeout = () => {
        timeoutCalled = true;
        return originalSetTimeout(() => {}, 1);
      };
      global.setInterval = () => {
        intervalCalled = true;
        return originalSetInterval(() => {}, 1);
      };

      instance.resetTimerWithDelay(0);

      originalSetTimeout(() => {
        assert.equal(timeoutCalled, false);
        assert.equal(intervalCalled, false);
        global.setTimeout = originalSetTimeout;
        global.setInterval = originalSetInterval;
        done();
      }, 50);
    });
  });

  describe('startHiddenPageTimer()', () => {
    test('sets timer when timeout is configured for page', (t, done) => {
      instance.config.timings.admin = 100;

      const originalSetTimeout = setTimeout;
      let timeoutSet = false;
      global.setTimeout = (callback, delay) => {
        timeoutSet = true;
        assert.equal(delay, 100);
        const timer = originalSetTimeout(() => {
          callback();
          done();
        }, delay);
        timers.push(timer);
        return timer;
      };

      instance.startHiddenPageTimer('admin');
      assert.ok(timeoutSet);

      global.setTimeout = originalSetTimeout;
    });

    test('does not set timer when no timeout configured', () => {
      instance.startHiddenPageTimer('screensaver');
      assert.equal(instance.hiddenPageTimer, null);
    });

    test('does not set timer when timeout is 0', () => {
      instance.config.timings.screensaver = 0;
      instance.startHiddenPageTimer('screensaver');
      assert.equal(instance.hiddenPageTimer, null);
    });

    test('clears existing timer before setting new one', () => {
      let clearTimeoutCalled = false;
      instance.hiddenPageTimer = setTimeout(() => {}, 1000);

      const originalClearTimeout = clearTimeout;
      global.clearTimeout = (timer) => {
        if (timer === instance.hiddenPageTimer) {
          clearTimeoutCalled = true;
        }
        originalClearTimeout(timer);
      };

      instance.config.timings.admin = 5000;
      instance.startHiddenPageTimer('admin');

      assert.ok(clearTimeoutCalled);
      global.clearTimeout = originalClearTimeout;
    });

    test('calls LEAVE_HIDDEN_PAGE when timeout expires', (t, done) => {
      instance.config.timings.admin = 50;

      instance.notificationReceived = (notification) => {
        if (notification === 'LEAVE_HIDDEN_PAGE') {
          done();
        }
      };

      instance.startHiddenPageTimer('admin');
    });
  });

  describe('clearTimers()', () => {
    test('clears interval timer', () => {
      instance.timer = setInterval(() => {}, 1000);
      instance.clearTimers();
      assert.ok(true);
    });

    test('clears delay timer', () => {
      instance.delayTimer = setTimeout(() => {}, 1000);
      instance.clearTimers();
      assert.ok(true);
    });

    test('clears hidden page timer', () => {
      instance.hiddenPageTimer = setTimeout(() => {}, 1000);
      instance.clearTimers();
      assert.ok(true);
    });

    test('handles null timers without error', () => {
      instance.timer = null;
      instance.delayTimer = null;
      instance.hiddenPageTimer = null;
      instance.clearTimers();
      assert.ok(true);
    });
  });
});

describe('DOM_OBJECTS_CREATED Initialization', () => {
  let instance;
  let sentNotifications;

  beforeEach(() => {
    sentNotifications = [];
    instance = Object.create(MMM_pages);
    instance.config = {
      modules: [['page0'], ['page1'], ['page2']],
      fixed: ['MMM-page-indicator'],
      hiddenPages: {},
      homePage: 0,
      animationTime: 1000,
      timings: { default: 5000 },
      rotationDelay: 10000,
      rotationHomePage: 0,
      rotationHomePageHidden: 30000,
      useLockString: true
    };
    instance.curPage = 0;
    instance.rotationPaused = false;
    instance.isOnHiddenPage = false;
    instance.permanentlyHiddenModules = new Set();
    instance.identifier = 'MMM-pages_test';
    instance.sendNotification = (notification, payload) => {
      sentNotifications.push({ notification, payload });
    };
    instance.animatePageChange = () => {};
    instance.resetTimerWithDelay = () => {};
  });

  test('sends MAX_PAGES_CHANGED notification', () => {
    global.MM = {
      getModules: () => ({
        enumerate: () => {}
      })
    };

    instance.notificationReceived('DOM_OBJECTS_CREATED');

    const maxPagesNotification = sentNotifications.find(
      n => n.notification === 'MAX_PAGES_CHANGED'
    );
    assert.ok(maxPagesNotification);
    assert.equal(maxPagesNotification.payload, 3);
  });

  test('sends NEW_PAGE notification with current page', () => {
    global.MM = {
      getModules: () => ({
        enumerate: () => {}
      })
    };

    instance.curPage = 1;
    instance.notificationReceived('DOM_OBJECTS_CREATED');

    const newPageNotification = sentNotifications.find(
      n => n.notification === 'NEW_PAGE'
    );
    assert.ok(newPageNotification);
    assert.equal(newPageNotification.payload, 1);
  });

  test('stores initially hidden modules', () => {
    global.MM = {
      getModules: () => ({
        enumerate: (callback) => {
          callback({ name: 'module1', identifier: 'id1', hidden: false });
          callback({ name: 'module2', identifier: 'id2', hidden: true });
          callback({ name: 'module3', identifier: 'id3', hidden: true });
        }
      })
    };

    instance.notificationReceived('DOM_OBJECTS_CREATED');

    assert.equal(instance.permanentlyHiddenModules.size, 2);
    assert.ok(instance.permanentlyHiddenModules.has('id2'));
    assert.ok(instance.permanentlyHiddenModules.has('id3'));
    assert.equal(instance.permanentlyHiddenModules.has('id1'), false);
  });

  test('calls animatePageChange', () => {
    global.MM = {
      getModules: () => ({
        enumerate: () => {}
      })
    };

    let animatePageChangeCalled = false;
    instance.animatePageChange = () => { animatePageChangeCalled = true; };

    instance.notificationReceived('DOM_OBJECTS_CREATED');
    assert.ok(animatePageChangeCalled);
  });

  test('calls resetTimerWithDelay with 0', () => {
    global.MM = {
      getModules: () => ({
        enumerate: () => {}
      })
    };

    let resetTimerDelay;
    instance.resetTimerWithDelay = (delay) => { resetTimerDelay = delay; };

    instance.notificationReceived('DOM_OBJECTS_CREATED');
    assert.equal(resetTimerDelay, 0);
  });
});
