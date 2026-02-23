const assert = require('node:assert/strict');
const { test, describe, beforeEach } = require('node:test');

/**
 * Unit tests for MMM-pages notification handling
 *
 * These tests verify notification reception and state changes.
 */

let MMM_pages;
let capturedNotifications = [];

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

// Mock MM.getModules() for tests
global.MM = {
  getModules: () => ({
    enumerate: () => {},
    exceptWithClass: () => ({ enumerate: () => {} }),
    withClass: () => ({ enumerate: () => {} })
  })
};

require('../../MMM-pages.js');

describe('Notification Handling', () => {
  let instance;

  beforeEach(() => {
    capturedNotifications = [];
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
    instance.hiddenPageTimer = null;
    instance.identifier = 'MMM-pages_test';
    instance.sendNotification = (notification, payload) => {
      capturedNotifications.push({ notification, payload });
    };
    // Mock timer functions
    instance.timer = null;
    instance.delayTimer = null;
    // Mock methods that would cause side effects
    instance.animatePageChange = () => {};
    instance.resetTimerWithDelay = () => {};
    instance.clearTimers = () => {};
    instance.startHiddenPageTimer = () => {};
    instance.showHiddenPage = () => {};
    instance.updatePages = () => {};
  });

  describe('PAGE_CHANGED notification', () => {
    test('sets curPage to payload value', () => {
      instance.notificationReceived('PAGE_CHANGED', 2);
      assert.equal(instance.curPage, 2);
    });

    test('triggers updatePages', () => {
      let updatePagesCalled = false;
      instance.updatePages = () => { updatePagesCalled = true; };
      instance.notificationReceived('PAGE_CHANGED', 1);
      assert.ok(updatePagesCalled);
    });

    test('logs deprecation warning', () => {
      let warnMessage = '';
      global.Log.warn = (msg) => { warnMessage = msg; };
      instance.notificationReceived('PAGE_CHANGED', 1);
      assert.ok(warnMessage.includes('deprecated'));
      global.Log.warn = () => {};
    });
  });

  describe('PAGE_SELECT notification', () => {
    test('sets curPage to payload value', () => {
      instance.notificationReceived('PAGE_SELECT', 2);
      assert.equal(instance.curPage, 2);
    });

    test('triggers updatePages', () => {
      let updatePagesCalled = false;
      instance.updatePages = () => { updatePagesCalled = true; };
      instance.notificationReceived('PAGE_SELECT', 1);
      assert.ok(updatePagesCalled);
    });

    test('does not log deprecation warning', () => {
      let warnCalled = false;
      global.Log.warn = () => { warnCalled = true; };
      instance.notificationReceived('PAGE_SELECT', 1);
      assert.equal(warnCalled, false);
      global.Log.warn = () => {};
    });
  });

  describe('PAGE_INCREMENT notification', () => {
    test('increments page by 1 when no payload', () => {
      instance.curPage = 0;
      instance.notificationReceived('PAGE_INCREMENT');
      assert.equal(instance.curPage, 1);
    });

    test('increments page by payload amount', () => {
      instance.curPage = 0;
      instance.notificationReceived('PAGE_INCREMENT', 2);
      assert.equal(instance.curPage, 2);
    });
  });

  describe('PAGE_DECREMENT notification', () => {
    test('decrements page by 1 when no payload', () => {
      instance.curPage = 2;
      instance.notificationReceived('PAGE_DECREMENT');
      assert.equal(instance.curPage, 1);
    });

    test('decrements page by payload amount', () => {
      instance.curPage = 2;
      instance.notificationReceived('PAGE_DECREMENT', 2);
      assert.equal(instance.curPage, 0);
    });

    test('wraps around when decrementing past 0', () => {
      instance.curPage = 0;
      instance.notificationReceived('PAGE_DECREMENT');
      assert.equal(instance.curPage, 2); // last page
    });
  });

  describe('QUERY_PAGE_NUMBER notification', () => {
    test('sends PAGE_NUMBER_IS with current page', () => {
      instance.curPage = 1;
      instance.notificationReceived('QUERY_PAGE_NUMBER');
      assert.equal(capturedNotifications.length, 1);
      assert.equal(capturedNotifications[0].notification, 'PAGE_NUMBER_IS');
      assert.equal(capturedNotifications[0].payload, 1);
    });
  });

  describe('PAUSE_ROTATION notification', () => {
    test('pauses rotation via setRotation', () => {
      let setRotationArg;
      instance.setRotation = (val) => { setRotationArg = val; };
      instance.notificationReceived('PAUSE_ROTATION');
      assert.equal(setRotationArg, false);
    });
  });

  describe('RESUME_ROTATION notification', () => {
    test('resumes rotation via setRotation', () => {
      let setRotationArg;
      instance.setRotation = (val) => { setRotationArg = val; };
      instance.notificationReceived('RESUME_ROTATION');
      assert.equal(setRotationArg, true);
    });
  });

  describe('HOME_PAGE notification', () => {
    test('changes to home page', () => {
      instance.config.homePage = 0;
      instance.curPage = 2;
      instance.notificationReceived('HOME_PAGE');
      assert.equal(instance.curPage, 0);
    });
  });

  describe('SHOW_HIDDEN_PAGE notification', () => {
    test('sets isOnHiddenPage to true', () => {
      instance.isOnHiddenPage = false;
      instance.setRotation = () => {};
      instance.notificationReceived('SHOW_HIDDEN_PAGE', 'admin');
      assert.equal(instance.isOnHiddenPage, true);
    });

    test('calls setRotation with false', () => {
      let setRotationArg;
      instance.setRotation = (val) => { setRotationArg = val; };
      instance.notificationReceived('SHOW_HIDDEN_PAGE', 'admin');
      assert.equal(setRotationArg, false);
    });

    test('calls showHiddenPage with payload', () => {
      let showHiddenPageArg;
      instance.setRotation = () => {};
      instance.showHiddenPage = (page) => { showHiddenPageArg = page; };
      instance.notificationReceived('SHOW_HIDDEN_PAGE', 'admin');
      assert.equal(showHiddenPageArg, 'admin');
    });
  });

  describe('LEAVE_HIDDEN_PAGE notification', () => {
    test('sets isOnHiddenPage to false', () => {
      instance.isOnHiddenPage = true;
      instance.setRotation = () => {};
      instance.notificationReceived('LEAVE_HIDDEN_PAGE');
      assert.equal(instance.isOnHiddenPage, false);
    });

    test('calls animatePageChange', () => {
      let animatePageChangeCalled = false;
      instance.animatePageChange = () => { animatePageChangeCalled = true; };
      instance.setRotation = () => {};
      instance.notificationReceived('LEAVE_HIDDEN_PAGE');
      assert.ok(animatePageChangeCalled);
    });

    test('calls setRotation with true', () => {
      let setRotationArg;
      instance.setRotation = (val) => { setRotationArg = val; };
      instance.notificationReceived('LEAVE_HIDDEN_PAGE');
      assert.equal(setRotationArg, true);
    });
  });
});

describe('setRotation()', () => {
  let instance;

  beforeEach(() => {
    instance = Object.create(MMM_pages);
    instance.config = {
      rotationDelay: 10000,
      timings: { default: 5000 }
    };
    instance.rotationPaused = false;
    instance.clearTimers = () => {};
    instance.resetTimerWithDelay = () => {};
  });

  test('pauses rotation when false is passed', () => {
    instance.rotationPaused = false;
    instance.setRotation(false);
    assert.equal(instance.rotationPaused, true);
  });

  test('resumes rotation when true is passed', () => {
    instance.rotationPaused = true;
    instance.setRotation(true);
    assert.equal(instance.rotationPaused, false);
  });

  test('calls clearTimers when pausing', () => {
    instance.rotationPaused = false;
    let clearTimersCalled = false;
    instance.clearTimers = () => { clearTimersCalled = true; };
    instance.setRotation(false);
    assert.ok(clearTimersCalled);
  });

  test('calls resetTimerWithDelay when resuming', () => {
    instance.rotationPaused = true;
    let resetTimerCalled = false;
    instance.resetTimerWithDelay = () => { resetTimerCalled = true; };
    instance.setRotation(true);
    assert.ok(resetTimerCalled);
  });

  test('does nothing when already paused and pause requested', () => {
    instance.rotationPaused = true;
    let clearTimersCalled = false;
    instance.clearTimers = () => { clearTimersCalled = true; };
    instance.setRotation(false);
    assert.equal(clearTimersCalled, false);
  });

  test('does nothing when already running and resume requested', () => {
    instance.rotationPaused = false;
    let resetTimerCalled = false;
    instance.resetTimerWithDelay = () => { resetTimerCalled = true; };
    instance.setRotation(true);
    assert.equal(resetTimerCalled, false);
  });
});

describe('showHiddenPage()', () => {
  let instance;

  beforeEach(() => {
    instance = Object.create(MMM_pages);
    instance.config = {
      hiddenPages: {
        admin: ['admin-module'],
        screensaver: ['clock']
      },
      timings: {}
    };
    instance.animatePageChange = () => {};
    instance.startHiddenPageTimer = () => {};
  });

  test('calls animatePageChange with page name', () => {
    let passedPageName;
    instance.animatePageChange = (name) => { passedPageName = name; };
    instance.showHiddenPage('admin');
    assert.equal(passedPageName, 'admin');
  });

  test('logs error for non-existent hidden page', () => {
    let errorLogged = false;
    global.Log.error = () => { errorLogged = true; };
    instance.showHiddenPage('nonexistent');
    assert.ok(errorLogged);
    global.Log.error = () => {};
  });
});

describe('updatePages()', () => {
  let instance;

  beforeEach(() => {
    instance = Object.create(MMM_pages);
    instance.config = {
      modules: [['page0'], ['page1']],
      timings: { default: 5000 }
    };
    instance.curPage = 0;
    instance.rotationPaused = false;
    instance.animatePageChange = () => {};
    instance.resetTimerWithDelay = () => {};
    instance.sendNotification = () => {};
  });

  test('sends NEW_PAGE notification', () => {
    let sentNotification;
    instance.sendNotification = (notification, payload) => {
      sentNotification = { notification, payload };
    };
    instance.curPage = 1;
    instance.updatePages();
    assert.equal(sentNotification.notification, 'NEW_PAGE');
    assert.equal(sentNotification.payload, 1);
  });

  test('does not reset timer when rotation is paused', () => {
    let resetTimerCalled = false;
    instance.resetTimerWithDelay = () => { resetTimerCalled = true; };
    instance.rotationPaused = true;
    instance.updatePages();
    assert.equal(resetTimerCalled, false);
  });

  test('resets timer when rotation is not paused', () => {
    let resetTimerCalled = false;
    instance.resetTimerWithDelay = () => { resetTimerCalled = true; };
    instance.rotationPaused = false;
    instance.updatePages();
    assert.ok(resetTimerCalled);
  });

  test('logs error when no pages defined', () => {
    let errorLogged = false;
    global.Log.error = () => { errorLogged = true; };
    instance.config.modules = [];
    instance.updatePages();
    assert.ok(errorLogged);
    global.Log.error = () => {};
  });
});

describe('registerApiActions()', () => {
  let instance;
  let capturedNotifications;

  beforeEach(() => {
    capturedNotifications = [];
    instance = Object.create(MMM_pages);
    instance.config = {
      modules: [['page0'], ['page1'], ['page2']],
      hiddenPages: {
        admin: ['admin-module'],
        screensaver: ['clock']
      }
    };
    instance.sendNotification = (notification, payload) => {
      capturedNotifications.push({ notification, payload });
    };
  });

  test('sends REGISTER_API notification', () => {
    instance.registerApiActions();
    assert.equal(capturedNotifications.length, 1);
    assert.equal(capturedNotifications[0].notification, 'REGISTER_API');
  });

  test('registers module name and path', () => {
    instance.registerApiActions();
    const api = capturedNotifications[0].payload;
    assert.equal(api.module, 'MMM-pages');
    assert.equal(api.path, 'pages');
  });

  test('registers next, previous, home, pause, resume, leave actions', () => {
    instance.registerApiActions();
    const { actions } = capturedNotifications[0].payload;
    assert.equal(actions.next.notification, 'PAGE_INCREMENT');
    assert.equal(actions.previous.notification, 'PAGE_DECREMENT');
    assert.equal(actions.home.notification, 'HOME_PAGE');
    assert.equal(actions.pause.notification, 'PAUSE_ROTATION');
    assert.equal(actions.resume.notification, 'RESUME_ROTATION');
    assert.equal(actions.leave.notification, 'LEAVE_HIDDEN_PAGE');
  });

  test('registers one action per page', () => {
    instance.registerApiActions();
    const { actions } = capturedNotifications[0].payload;
    assert.equal(actions.page0.notification, 'PAGE_SELECT');
    assert.equal(actions.page0.payload, 0);
    assert.equal(actions.page1.payload, 1);
    assert.equal(actions.page2.payload, 2);
  });

  test('registers actions for hidden pages', () => {
    instance.registerApiActions();
    const { actions } = capturedNotifications[0].payload;
    assert.equal(actions.showadmin.notification, 'SHOW_HIDDEN_PAGE');
    assert.equal(actions.showadmin.payload, 'admin');
    assert.equal(actions.showscreensaver.notification, 'SHOW_HIDDEN_PAGE');
    assert.equal(actions.showscreensaver.payload, 'screensaver');
  });

  test('works with no hidden pages', () => {
    instance.config.hiddenPages = {};
    instance.registerApiActions();
    const { actions } = capturedNotifications[0].payload;
    assert.equal(Object.keys(actions).length, 9); // 6 fixed + 3 pages
  });
});
