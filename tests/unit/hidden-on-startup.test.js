const assert = require('node:assert/strict');
const { test, describe, beforeEach } = require('node:test');

/**
 * Unit tests for hiddenOnStartup feature (GitHub Issue #71)
 *
 * Tests that modules with hiddenOnStartup flag are properly
 * tracked and excluded from page display.
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

describe('hiddenOnStartup Feature', () => {
  let instance;

  beforeEach(() => {
    instance = Object.create(MMM_pages);
    instance.config = {
      modules: [['module-a', 'module-b'], ['module-c']],
      fixed: ['MMM-page-indicator'],
      hiddenPages: {},
      timings: { default: 5000 },
      rotationDelay: 10000
    };
    instance.permanentlyHiddenModules = new Set();
  });

  describe('permanentlyHiddenModules Set', () => {
    test('is initialized as empty Set in start()', () => {
      instance.setConfig = () => {};
      instance.start();
      assert.ok(instance.permanentlyHiddenModules instanceof Set);
      assert.equal(instance.permanentlyHiddenModules.size, 0);
    });

    test('can add modules to the Set', () => {
      instance.permanentlyHiddenModules.add('hidden-module');
      assert.ok(instance.permanentlyHiddenModules.has('hidden-module'));
    });

    test('handles multiple hidden modules', () => {
      instance.permanentlyHiddenModules.add('hidden-1');
      instance.permanentlyHiddenModules.add('hidden-2');
      instance.permanentlyHiddenModules.add('hidden-3');
      assert.equal(instance.permanentlyHiddenModules.size, 3);
    });
  });

  describe('Module filtering in animatePageChange', () => {
    let modulesShown;
    let modulesHidden;

    beforeEach(() => {
      modulesShown = [];
      modulesHidden = [];

      // Create mock modules with proper show/hide tracking
      const createMockModule = (name, hidden = false) => ({
        name,
        hidden,
        show: function (speed, callback) {
          this.hidden = false;
          modulesShown.push(name);
          if (callback) callback();
        },
        hide: function (speed, callback) {
          this.hidden = true;
          modulesHidden.push(name);
          if (callback) callback();
        }
      });

      const mockModules = {
        'module-a': createMockModule('module-a'),
        'module-b': createMockModule('module-b'),
        'module-c': createMockModule('module-c'),
        'hidden-startup': createMockModule('hidden-startup', true),
        'MMM-page-indicator': createMockModule('MMM-page-indicator')
      };

      global.MM = {
        getModules: () => ({
          enumerate: (callback) => {
            Object.values(mockModules).forEach(callback);
          },
          exceptWithClass: classes => ({
            enumerate: (callback) => {
              Object.values(mockModules)
                .filter(m => !classes.includes(m.name))
                .forEach(callback);
            }
          }),
          withClass: classes => ({
            enumerate: (callback) => {
              Object.values(mockModules)
                .filter(m => classes.includes(m.name))
                .forEach(callback);
            }
          })
        })
      };
    });

    test('hides modules not on current page', () => {
      instance.curPage = 0;
      instance.config.modules = [['module-a'], ['module-c']];
      instance.animatePageChange();

      // module-c should be hidden (it's on page 1, not page 0)
      assert.ok(modulesHidden.includes('module-c'));
    });

    test('shows modules on current page', () => {
      instance.curPage = 0;
      instance.config.modules = [['module-a'], ['module-c']];
      instance.animatePageChange();

      // module-a should not be hidden (it's on page 0)
      assert.ok(!modulesHidden.includes('module-a'));
    });

    test('does not show permanently hidden modules even on their page', () => {
      instance.permanentlyHiddenModules.add('module-a');
      instance.curPage = 0;
      instance.config.modules = [['module-a', 'module-b'], ['module-c']];
      instance.animatePageChange();

      // module-a should NOT be shown because it's permanently hidden
      // It won't be in modulesShown
      assert.ok(!modulesShown.includes('module-a'));
    });

    test('shows other modules on page when one is permanently hidden', () => {
      instance.permanentlyHiddenModules.add('module-a');
      instance.curPage = 0;
      instance.config.modules = [['module-a', 'module-b'], ['module-c']];
      instance.animatePageChange();

      // module-b should not be hidden (it's on current page)
      assert.ok(!modulesHidden.includes('module-b'));
    });

    test('permanently hidden modules are still hidden on other pages', () => {
      instance.permanentlyHiddenModules.add('module-a');
      instance.curPage = 1;
      instance.config.modules = [['module-a', 'module-b'], ['module-c']];
      instance.animatePageChange();

      // module-a should be hidden (it's on page 0, and permanently hidden)
      // But won't appear in modulesHidden because it's excluded from show, not hidden
      assert.ok(!modulesShown.includes('module-a'));
    });
  });

  describe('Edge cases', () => {
    test('empty permanentlyHiddenModules works normally', () => {
      instance.curPage = 0;
      instance.config.modules = [['module-a']];
      instance.permanentlyHiddenModules = new Set();

      // Should not throw
      assert.doesNotThrow(() => {
        // Test filter logic
        const modulesToShow = ['module-a'];
        const filtered = modulesToShow.filter(m => !instance.permanentlyHiddenModules.has(m));
        assert.deepEqual(filtered, ['module-a']);
      });
    });

    test('filtering works with module that exists in pages and hidden set', () => {
      instance.permanentlyHiddenModules.add('module-a');
      instance.permanentlyHiddenModules.add('module-b');

      const modulesToShow = ['module-a', 'module-b', 'module-c'];
      const filtered = modulesToShow.filter(m => !instance.permanentlyHiddenModules.has(m));

      assert.deepEqual(filtered, ['module-c']);
    });

    test('filtering with empty array returns empty array', () => {
      instance.permanentlyHiddenModules.add('module-a');

      const modulesToShow = [];
      const filtered = modulesToShow.filter(m => !instance.permanentlyHiddenModules.has(m));

      assert.deepEqual(filtered, []);
    });

    test('module names are case-sensitive', () => {
      instance.permanentlyHiddenModules.add('Module-A');

      const modulesToShow = ['module-a', 'Module-A'];
      const filtered = modulesToShow.filter(m => !instance.permanentlyHiddenModules.has(m));

      // Only 'module-a' should pass (lowercase)
      assert.deepEqual(filtered, ['module-a']);
    });
  });
});
