Module.register('MMM-pages', {

  /**
   * By default, we have don't psuedo-paginate any modules. We also exclude
   * the page indicator by default, in case people actually want to use the
   * sister module. We also don't rotate out modules by default.
   */
  defaults: {
    modules: [],
    excludes: ['MMM-page-indicator'],
    animationTime: 1000,
    rotationTime: 0,
    rotationDelay: 10000,
  },

  getStyles() {
    return ['pages.css'];
  },

  /**
   * Pseudo-constructor for our module. Makes sure that values aren't negative,
   * and sets the default current page to 0.
   */
  start() {
    this.curPage = 0;

    // Disable rotation if an invalid input is given
    this.config.rotationTime = Math.max(this.config.rotationTime, 0);
    this.config.rotationDelay = Math.max(this.config.rotationDelay, 0);
  },

  /**
   * Handles incoming notifications. Repsonds to the following:
   *   'PAGE_CHANGED' - Set the page to the specified payload page.
   *   'PAGE_INCREMENT' - Move to the next page.
   *   'PAGE_DECREMENT' - Move to the previous page.
   *   'DOM_OBJECTS_CREATED' - Starts the module.
   * @param {string} notification the notification ID
   * @param {number} payload the page to change to
   */
  notificationReceived(notification, payload) {
    switch (notification) {
      case 'PAGE_CHANGED':
        Log.log(`${this.name} recieved a notification`
          + `to change to page ${payload}`);
        if (typeof curPage === 'number') {
          this.curPage = payload;
        } else {
          Log.error('Was asked to change to a nonnumber!');
        }
        this.updatePages(true);
        break;
      case 'PAGE_INCREMENT':
        Log.log(`${this.name} recieved a notification to increment pages!`);
        this.curPage = (this.curPage === this.config.modules.length - 1)
          ? 0 : this.curPage + 1;
        this.updatePages(true);
        break;
      case 'PAGE_DECREMENT':
        Log.log(`${this.name} recieved a notification to decrement pages!`);
        this.curPage = (this.curPage === 0)
          ? this.config.modules.length - 1 : this.curPage - 1;
        this.updatePages(true);
        break;
      case 'DOM_OBJECTS_CREATED':
        Log.log(`${this.name} recieved that all objects are created;`
          + 'will now hide things!');
        this.updatePages(true);
        this.sendNotification(
          'MAX_PAGES_CHANGED',
          this.config.modules.length,
        );
        break;
      default:
    }
  },

  // TODO: Add slide-left/right animation
  /**
   * Handles hiding the current page's elements and unhinding the next page's
   * elements.
   * @param {boolean} manuallyCalled whether or not to add in an extended delay.
   */
  updatePages(manuallyCalled) {
    if (this.config.modules.length !== 0) {
      Log.log(`updatePages was ${manuallyCalled ? '' : 'not'} manually called`);
      const self = this;

      // Hides the current page's elements.
      MM.getModules()
        .exceptWithClass(this.config.excludes)
        .exceptWithClass(this.config.modules[this.curPage])
        .enumerate((module) => {
          module.hide(
            this.config.animationTime / 2,
            { lockString: this.identifier },
          );
        });

      // Shows the next page's elements
      setTimeout(() => {
        MM.getModules()
          .withClass(self.config.modules[self.curPage])
          .enumerate((module) => {
            module.show(
              self.config.animationTime / 2,
              { lockString: self.identifier },
            );
          });
      }, this.config.animationTime / 2);

      if (manuallyCalled) {
        Log.log('Manually updated page! setting delay before resuming timer!');

        clearInterval(this.timer);

        setTimeout(() => {
          self.timer = setInterval(() => {
            // Incrementing page
            self.curPage = (self.curPage === self.config.modules.length - 1)
              ? 0 : self.curPage + 1;
            self.sendNotification('PAGE_INCREMENT');
            self.updatePages(false);
          }, self.config.rotationTime, false);
        }, this.config.rotationDelay);
      }
    } else { Log.error("Pages aren't properly defined!"); }
  },

});
