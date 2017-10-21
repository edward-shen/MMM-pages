Module.register("MMM-pages", {
    defaults: {
        modules: [],
        excludes: ["MMM-page-indicator"],
        animationTime: 1000,
        rotationTime: 0,
        rotationDelay: 10000
    },

    getStyles: function () {
        return ["pages.css"];
    },

    start: function () {
        this.curPage = 0;

        // Disable rotation if an invalid input is given
        this.config.rotationTime = Math.max(this.config.rotationTime, 0);
        this.config.rotationDelay = Math.max(this.config.rotationDelay, 0);

        Log.log(this.config.rotationTime + "|" + this.config.rotationDelay);
    },

    notificationReceived: function (notification, payload, sender) {
        if (notification === "PAGE_CHANGED") {
            Log.log(this.name + " recieved a notification to change to page " + payload);
            this.curPage = payload;
            this.updatePages(true);
        } else if (notification === "PAGE_INCREMENT") {
            Log.log(this.name + " recieved a notification to increment pages!");
            if (this.curPage === this.config.modules.length - 1) {
                this.curPage = 0;
            } else { this.curPage++ }
            this.updatePages(true);
        } else if (notification === "PAGE_DECREMENT") {
            Log.log(this.name + " recieved a notification to decrement pages!");
            if (this.curPage === 0) {
                this.curPage = this.config.modules.length - 1;
            } else { this.curPage-- }
            this.updatePages(true);
        } else if (notification === "DOM_OBJECTS_CREATED") {
            Log.log(this.name + " recieved that all objects are created; will now hide things!");
            this.updatePages(true);

            this.sendNotification("MAX_PAGES_CHANGED", this.config.modules.length);
        }
    },


    // TODO: Add slide-left/right animation
    updatePages: function (manuallyCalled) {
        if (this.config.modules.length !== 0) {
            Log.log("updatePages was called with manuallyCalled = " + manuallyCalled);
            const self = this;
            MM.getModules()
                .exceptWithClass(this.config.excludes)
                .exceptWithClass(this.config.modules[this.curPage])
                .enumerate(module => { module.hide(this.config.animationTime / 2, { lockString: this.identifier }) });

            setTimeout(function () {
                MM.getModules()
                    .withClass(self.config.modules[self.curPage])
                    .enumerate(module => {
                        module.show(self.config.animationTime / 2,
                            { lockString: self.identifier });
                    });
            }, this.config.animationTime / 2);

            if (manuallyCalled && this.config.rotationTime > 0) {
                Log.log("manually updated page! setting delay before resume timer!");

                clearInterval(this.timer);

                setTimeout(() => {
                    self.timer = setInterval(() => {
                        // Incrementing page
                        if (self.curPage === self.config.modules.length - 1) {
                            self.curPage = 0;
                        } else { self.curPage++ }
                        self.sendNotification("PAGE_INCREMENT");
                        self.updatePages(false);
                    }, self.config.rotationTime, false);
                }, this.config.rotationDelay);
            }
        } else { Log.error("Pages aren't properly defined!") }

    },

});
