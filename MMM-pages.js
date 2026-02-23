Module.register('MMM-pages', {

  /**
   * By default, we have don't pseudo-paginate any modules. We also exclude
   * the page indicator by default, in case people actually want to use the
   * sister module. We also don't rotate out modules by default.
   */
  defaults: {
    modules: [],
    fixed: ['MMM-page-indicator'],
    hiddenPages: {},
    animationTime: 1000,
    rotationTime: 0, // Deprecated
    timings: { default: 0 },
    rotationHomePage: 0,
    rotationHomePageHidden: 30000,
    rotationDelay: 10000,
    homePage: 0,
    useLockString: true,
  },

  /**
   * Modulo that also works with negative numbers.
   * @param {number} x The dividend
   * @param {number} n The divisor
   * @returns {number} The result of x mod n
   */
  mod(x, n) {
    return ((x % n) + n) % n;
  },

  /**
   * Clears all active timers.
   */
  clearTimers() {
    // This timer is the auto rotate function.
    clearInterval(this.timer);
    // This is delay timer after manually updating.
    clearInterval(this.delayTimer);
    // This is the hidden page timer.
    clearTimeout(this.hiddenPageTimer);
  },

  /**
   * Pseudo-constructor for our module. Makes sure that values aren't negative,
   * and sets the default current page to 0.
   */
  start() {
    // Clamp homePage value to [0, num pages).
    if (this.config.homePage >= this.config.modules.length || this.config.homePage < 0) {
      this.config.homePage = 0;
    }
    this.curPage = this.config.homePage;
    this.rotationPaused = false;
    this.isOnHiddenPage = false;

    // Compatibility
    if (this.config.rotationTime) {
      Log.warn('[MMM-pages] The config option "rotationTime" is deprecated. Please use "timings" instead.');
      this.config.timings.default = this.config.rotationTime;
    }

    // Disable rotation if an invalid input is given
    this.config.timings.default = Math.max(this.config.timings.default, 0);
    this.config.rotationDelay = Math.max(this.config.rotationDelay, 0);
    this.config.rotationHomePage = Math.max(this.config.rotationHomePage, 0);
    this.config.rotationHomePageHidden = Math.max(this.config.rotationHomePageHidden, 0);

    if (!this.config.useLockString) {
      Log.log('[MMM-pages] User opted to not use lock strings!');
    }

    this.hiddenPageTimer = null;
    this.permanentlyHiddenModules = new Set();
  },

  /**
   * Handles incoming notifications. Responds to the following:
   *   'PAGE_SELECT' - Set the page to the specified payload page.
   *   'PAGE_CHANGED' - Deprecated alias for PAGE_SELECT.
   *   'PAGE_INCREMENT' - Move to the next page.
   *   'PAGE_DECREMENT' - Move to the previous page.
   *   'DOM_OBJECTS_CREATED' - Starts the module.
   *   'QUERY_PAGE_NUMBER' - Requests the current page number
   *   'PAUSE_ROTATION' - Stops rotation
   *   'RESUME_ROTATION' - Resumes rotation
   *   'HOME_PAGE' - Calls PAGE_SELECT with the default home page.
   *   'SHOW_HIDDEN_PAGE' - Shows the (in the payload) specified hidden
   *                        page by name
   *   'LEAVE_HIDDEN_PAGE' - Hides the currently showing hidden page and
   *                         resumes showing the last page
   * @param {string} notification the notification ID
   * @param {number|string} payload the page to change to/by
   */
  notificationReceived(notification, payload) {
    switch (notification) {
      case 'PAGE_CHANGED':
        Log.warn('[MMM-pages] The notification "PAGE_CHANGED" is deprecated. Please use "PAGE_SELECT" instead.');
        // falls through
      case 'PAGE_SELECT':
        Log.log(`[MMM-pages] received a notification to change to page ${payload} of type ${typeof payload}.`);
        this.curPage = payload;
        this.updatePages();
        break;
      case 'PAGE_INCREMENT':
        Log.log('[MMM-pages] received a notification to increment pages!');
        this.changePageBy(payload, 1);
        this.updatePages();
        break;
      case 'PAGE_DECREMENT':
        Log.log('[MMM-pages] received a notification to decrement pages!');
        // We can't just pass in -payload for situations where payload is null
        // JS will coerce -payload to -0.
        this.changePageBy(payload ? -payload : payload, -1);
        this.updatePages();
        break;
      case 'DOM_OBJECTS_CREATED':
        Log.log('[MMM-pages] received that all objects are created; will now hide things!');
        // Store modules that are initially hidden (hiddenOnStartup: true)
        MM.getModules().enumerate((module) => {
          if (module.hidden) {
            this.permanentlyHiddenModules.add(module.identifier);
            Log.log(`[MMM-pages] Module ${module.name} (${module.identifier}) is initially hidden and will remain so`);
          }
        });
        this.sendNotification('MAX_PAGES_CHANGED', this.config.modules.length);
        this.sendNotification('NEW_PAGE', this.curPage);
        this.animatePageChange();
        this.resetTimerWithDelay(0);
        this.registerApiActions();
        break;
      case 'QUERY_PAGE_NUMBER':
        this.sendNotification('PAGE_NUMBER_IS', this.curPage);
        break;
      case 'PAUSE_ROTATION':
        this.setRotation(false);
        break;
      case 'RESUME_ROTATION':
        this.setRotation(true);
        break;
      case 'HOME_PAGE':
        this.notificationReceived('PAGE_SELECT', this.config.homePage);
        break;
      case 'SHOW_HIDDEN_PAGE':
        Log.log(`[MMM-pages] received a notification to change to the hidden page "${payload}" of type "${typeof payload}".`);
        this.isOnHiddenPage = true;
        this.setRotation(false);
        this.showHiddenPage(payload);
        break;
      case 'LEAVE_HIDDEN_PAGE':
        Log.log('[MMM-pages] received a notification to leave the current hidden page.');
        this.isOnHiddenPage = false;
        clearTimeout(this.hiddenPageTimer);
        this.animatePageChange();
        this.setRotation(true);
        break;
      default: // Do nothing
    }
  },

  /**
   * Changes the internal page number by the specified amount. If the provided
   * amount is invalid, use the fallback amount. If the fallback amount is
   * missing or invalid, do nothing.
   * @param {number} amt the amount of pages to move forward by. Accepts
   * negative numbers.
   * @param {number} fallback the fallback value to use. Accepts negative
   * numbers.
   */
  changePageBy(amt, fallback) {
    if (typeof amt !== 'number' && typeof fallback === 'undefined') {
      Log.warn(`[MMM-pages] ${amt} is not a number!`);
    }

    if (typeof amt === 'number' && !Number.isNaN(amt)) {
      this.curPage = this.mod(
        this.curPage + amt,
        this.config.modules.length
      );
    } else if (typeof fallback === 'number') {
      this.curPage = this.mod(
        this.curPage + fallback,
        this.config.modules.length
      );
    }
  },

  /**
   * Handles hiding the current page's elements and showing the next page's
   * elements.
   */
  updatePages() {
    // Update if there's at least one page.
    if (this.config.modules.length > 0) {
      this.animatePageChange();
      if (!this.rotationPaused) {
        this.resetTimerWithDelay(0);
      }
      this.sendNotification('NEW_PAGE', this.curPage);
    } else {
      Log.error(`[MMM-pages] Pages are not properly defined! Expected array, got ${typeof this.config.modules}`);
    }
  },

  /**
   * Animates the page change from the previous page to the current one. This
   * assumes that there is a discrepancy between the page currently being shown
   * and the page that is meant to be shown.
   * @param {string} [targetPageName] the name of the hiddenPage we want to show.
   * Optional and only used when we want to switch to a hidden page
   */
  animatePageChange(targetPageName) {
    let lockStringObj = { lockString: this.identifier };
    if (!this.config.useLockString) {
      // Passing in an undefined object is equivalent to not passing it in at
      // all, effectively providing only one arg to the hide and show calls
      lockStringObj = undefined;
    }

    // Hides all modules not on the current page. This hides any module not
    // meant to be shown.

    let modulesToShow;
    if (typeof targetPageName === 'undefined') {
      modulesToShow = this.config.fixed.concat(this.config.modules[this.curPage]);
    } else {
      modulesToShow = this.config.hiddenPages[targetPageName];
    }
    const animationTime = this.config.animationTime / 2;

    MM.getModules()
      .exceptWithClass(modulesToShow)
      .enumerate(module => module.hide(animationTime, () => {}, lockStringObj));

    // Shows all modules meant to be on the current page, after a small delay.
    setTimeout(() => {
      MM.getModules()
        .withClass(modulesToShow)
        .enumerate((module) => {
          // Respect hiddenOnStartup - don't show modules that were initially hidden
          if (!this.permanentlyHiddenModules.has(module.identifier)) {
            module.show(animationTime, () => {}, lockStringObj);
          }
        });
    }, animationTime);
  },

  /**
   * Resets the page changing timer with a delay.
   * @param {number} delay the delay, in milliseconds.
   */
  resetTimerWithDelay(delay) {
    Log.debug(`[MMM-pages] resetTimerWithDelay called with delay: ${delay}ms`);
    if (this.config.timings.default > 0 || Object.keys(this.config.timings).length > 1) {
      this.clearTimers();
      let currentRotationTime = this.config.timings.default;
      if (this.config.timings[this.curPage]) {
        currentRotationTime = this.config.timings[this.curPage];
      }

      this.delayTimer = setTimeout(() => {
        Log.debug(`[MMM-pages] Starting auto rotation with interval: ${currentRotationTime}ms`);
        this.timer = setInterval(() => {
          // Inform other modules and page change.
          // MagicMirror automatically excludes the sender from receiving the
          // message, so we need to trigger it for ourselves.
          this.sendNotification('PAGE_INCREMENT');
          this.notificationReceived('PAGE_INCREMENT');
        }, currentRotationTime);
      }, delay);
    } else {
      // Determine which rotationHomePage setting to use based on current page type
      const rotationHomePageTimeout = this.isOnHiddenPage
        ? this.config.rotationHomePageHidden
        : this.config.rotationHomePage;

      if (rotationHomePageTimeout > 0) {
        this.clearTimers();

        this.delayTimer = setTimeout(() => {
          this.timer = setInterval(() => {
            // Inform other modules and page change.
            // MagicMirror automatically excludes the sender from receiving the
            // message, so we need to trigger it for ourselves.
            this.sendNotification('PAGE_SELECT', 0);
            this.notificationReceived('PAGE_SELECT', this.config.homePage);
          }, rotationHomePageTimeout);
        }, delay);
      }
    }
  },

  /**
   * Toggles page rotation.
   * @param {boolean} shouldRotate - True to resume rotation, false to pause it.
   */
  setRotation(shouldRotate) {
    const action = shouldRotate ? 'resume' : 'pause';
    Log.debug(`[MMM-pages] setRotation called: ${action} rotation`);
    if (shouldRotate === !this.rotationPaused) {
      Log.debug(`[MMM-pages] Rotation already ${shouldRotate ? 'running' : 'paused'}!`);
    } else {
      if (shouldRotate) {
        this.resetTimerWithDelay(this.config.rotationDelay);
        this.rotationPaused = false;
        Log.debug('[MMM-pages] Rotation resumed');
      } else {
        this.clearTimers();
        this.rotationPaused = true;
        Log.debug('[MMM-pages] Rotation paused');
      }
    }
  },

  /**
   * Register API actions for MMM-Remote-Control integration.
   * This allows controlling pages from the Remote Control UI.
   */
  registerApiActions() {
    const api = {
      module: 'MMM-pages',
      path: 'pages',
      actions: {
        next: {
          notification: 'PAGE_INCREMENT',
          prettyName: 'Next Page'
        },
        previous: {
          notification: 'PAGE_DECREMENT',
          prettyName: 'Previous Page'
        },
        home: {
          notification: 'HOME_PAGE',
          prettyName: 'Home Page'
        },
        pause: {
          notification: 'PAUSE_ROTATION',
          prettyName: 'Pause Rotation'
        },
        resume: {
          notification: 'RESUME_ROTATION',
          prettyName: 'Resume Rotation'
        },
        leave: {
          notification: 'LEAVE_HIDDEN_PAGE',
          prettyName: 'Leave Hidden Page'
        }
      }
    };

    // Add an action for each page
    for (let i = 0; i < this.config.modules.length; i++) {
      api.actions[`page${i}`] = {
        notification: 'PAGE_SELECT',
        payload: i,
        prettyName: `Page ${i}`
      };
    }

    // Add an action for each hidden page (prefixed to avoid collision with core actions)
    for (const pageName of Object.keys(this.config.hiddenPages)) {
      const key = `show${pageName.replace(/\s/gu, '').toLowerCase()}`;
      api.actions[key] = {
        notification: 'SHOW_HIDDEN_PAGE',
        payload: pageName,
        prettyName: `Show ${pageName}`
      };
    }

    this.sendNotification('REGISTER_API', api);
  },

  /**
   * Handles hidden pages.
   * @param {string} name the name of the hiddenPage we want to show
   */
  showHiddenPage(name) {
    if (name in this.config.hiddenPages) {
      this.animatePageChange(name);
      this.startHiddenPageTimer(name);
    } else {
      Log.error(`[MMM-pages] Hidden page "${name}" does not exist!`);
    }
  },

  /**
   * Starts a timer for a hidden page.
   * @param {string} pageName - The name of the hidden page for which the timer is being started.
   */
  startHiddenPageTimer(pageName) {
    clearTimeout(this.hiddenPageTimer);
    const timeout = this.config.timings[pageName];
    if (timeout && timeout > 0) {
      Log.debug(`[MMM-pages] Starting hidden page timer for "${pageName}" with timeout ${timeout}ms`);
      this.hiddenPageTimer = setTimeout(() => {
        Log.debug(`[MMM-pages] Hidden page "${pageName}" timeout reached, returning to normal rotation`);
        this.notificationReceived('LEAVE_HIDDEN_PAGE');
      }, timeout);
    } else {
      Log.debug(`[MMM-pages] No timeout configured for hidden page "${pageName}"`);
    }
  }
});
