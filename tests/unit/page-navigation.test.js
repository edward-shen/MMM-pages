const assert = require('node:assert/strict');
const { test, describe, beforeEach } = require('node:test');

/**
 * Unit tests for MMM-pages page changing logic
 *
 * These tests verify the page navigation and rotation functionality.
 */

// Mock globals
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

// Load the module
require('../../MMM-pages.js');

describe('Page Navigation', () => {
  let instance;

  beforeEach(() => {
    // Create a fresh instance for each test
    instance = Object.create(MMM_pages);
    instance.config = {
      modules: [
        ['page0'],
        ['page1'],
        ['page2'],
        ['page3']
      ],
      homePage: 0,
      animationTime: 1000,
      timings: { default: 5000 }
    };
    instance.curPage = 0;
    instance.sendNotification = () => {}; // Mock
  });

  describe('changePageBy()', () => {
    test('increments page by 1', () => {
      instance.changePageBy(1, 1);
      assert.equal(instance.curPage, 1);
    });

    test('decrements page by 1', () => {
      instance.curPage = 2;
      instance.changePageBy(-1, -1);
      assert.equal(instance.curPage, 1);
    });

    test('wraps around when incrementing past last page', () => {
      instance.curPage = 3; // last page
      instance.changePageBy(1, 1);
      assert.equal(instance.curPage, 0); // wraps to first
    });

    test('wraps around when decrementing past first page', () => {
      instance.curPage = 0; // first page
      instance.changePageBy(-1, -1);
      assert.equal(instance.curPage, 3); // wraps to last
    });

    test('handles multiple increments', () => {
      instance.changePageBy(2, 1);
      assert.equal(instance.curPage, 2);
    });

    test('handles multiple decrements', () => {
      instance.curPage = 3;
      instance.changePageBy(-2, -1);
      assert.equal(instance.curPage, 1);
    });

    test('handles increment with wraparound', () => {
      instance.curPage = 2;
      instance.changePageBy(3, 1);
      assert.equal(instance.curPage, 1); // 2 + 3 = 5, 5 % 4 = 1
    });

    test('handles decrement with wraparound', () => {
      instance.curPage = 1;
      instance.changePageBy(-3, -1);
      assert.equal(instance.curPage, 2); // 1 - 3 = -2, mod(-2, 4) = 2
    });

    test('uses fallback when amt is not a number', () => {
      instance.curPage = 0;
      instance.changePageBy('invalid', 2);
      assert.equal(instance.curPage, 2);
    });

    test('does nothing when both amt and fallback are invalid', () => {
      instance.curPage = 1;
      instance.changePageBy('invalid', 'also invalid');
      assert.equal(instance.curPage, 1); // unchanged
    });
  });

  describe('Page validation', () => {
    test('start() clamps invalid homePage to 0', () => {
      instance.config.homePage = 10; // invalid
      instance.config.modules = [['page0'], ['page1']];
      instance.start();
      assert.equal(instance.config.homePage, 0);
    });

    test('start() clamps negative homePage to 0', () => {
      instance.config.homePage = -5;
      instance.config.modules = [['page0'], ['page1']];
      instance.start();
      assert.equal(instance.config.homePage, 0);
    });

    test('start() keeps valid homePage', () => {
      instance.config.homePage = 1;
      instance.config.modules = [['page0'], ['page1'], ['page2']];
      instance.start();
      assert.equal(instance.config.homePage, 1);
    });
  });

  describe('Configuration sanitization', () => {
    test('start() initializes permanentlyHiddenModules', () => {
      instance.start();
      assert.ok(instance.permanentlyHiddenModules instanceof Set);
      assert.equal(instance.permanentlyHiddenModules.size, 0);
    });

    test('start() ensures timings.default is non-negative', () => {
      instance.config.timings = { default: -1000 };
      instance.start();
      assert.equal(instance.config.timings.default, 0);
    });

    test('start() ensures rotationDelay is non-negative', () => {
      instance.config.rotationDelay = -5000;
      instance.start();
      assert.equal(instance.config.rotationDelay, 0);
    });

    test('start() handles deprecated rotationTime', () => {
      instance.config.rotationTime = 10000;
      instance.config.timings = { default: 0 };
      instance.start();
      assert.equal(instance.config.timings.default, 10000);
    });
  });
});
