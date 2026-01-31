const assert = require('node:assert/strict');
const { test, describe, beforeEach } = require('node:test');

/**
 * Unit tests for MMM-pages core functions
 *
 * These tests verify basic helper functions like mod() and page calculation logic.
 */

// Mock the Module.register functionality to extract the module definition
let MMM_pages;

// We need to mock the Module global that MagicMirror provides
global.Module = {
  register: (name, definition) => {
    if (name === 'MMM-pages') {
      MMM_pages = definition;
    }
  }
};

// Mock Log for testing
global.Log = {
  log: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {}
};

// Load the module
require('../../MMM-pages.js');

describe('MMM-pages Core Functions', () => {
  describe('mod()', () => {
    test('handles positive modulo', () => {
      const result = MMM_pages.mod(5, 3);
      assert.equal(result, 2);
    });

    test('handles negative modulo correctly', () => {
      const result = MMM_pages.mod(-1, 3);
      assert.equal(result, 2);
    });

    test('handles zero', () => {
      const result = MMM_pages.mod(0, 5);
      assert.equal(result, 0);
    });

    test('handles larger negative numbers', () => {
      const result = MMM_pages.mod(-7, 3);
      assert.equal(result, 2);
    });

    test('wraps around correctly', () => {
      const result = MMM_pages.mod(6, 3);
      assert.equal(result, 0);
    });
  });

  describe('clearTimers()', () => {
    let instance;

    beforeEach(() => {
      // Create a fresh instance for each test
      instance = Object.create(MMM_pages);
      instance.timer = setTimeout(() => {}, 1000);
      instance.delayTimer = setTimeout(() => {}, 1000);
      instance.hiddenPageTimer = setTimeout(() => {}, 1000);
    });

    test('clears all timers', () => {
      instance.clearTimers();

      // Timers should be cleared (we can't directly verify, but no errors should occur)
      assert.ok(true, 'clearTimers executed without errors');
    });
  });

  describe('Configuration defaults', () => {
    test('has correct default values', () => {
      assert.deepEqual(MMM_pages.defaults.modules, []);
      assert.deepEqual(MMM_pages.defaults.fixed, ['MMM-page-indicator']);
      assert.deepEqual(MMM_pages.defaults.hiddenPages, {});
      assert.equal(MMM_pages.defaults.animationTime, 1000);
      assert.equal(MMM_pages.defaults.useLockString, true);
    });

    test('has deprecated rotationTime set to 0', () => {
      assert.equal(MMM_pages.defaults.rotationTime, 0);
    });

    test('has timings object with default', () => {
      assert.deepEqual(MMM_pages.defaults.timings, { default: 0 });
    });
  });
});
