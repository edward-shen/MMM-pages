Module.register("MMM-pages", {
    defaults: {
        modules: [],
        excludes: ["MMM-page-indicator"],
        animationTime: 1000,
        
    },
    
    getStyles: function() {
        return ["pages.css"];
    },
    
    start: function() {
        this.curPage = 0;
    },
    
    notificationReceived: function(notification, payload, sender) {
        if (notification === "PAGE_CHANGED") {
            Log.log(this.name + " recieved a notification to change to page " + payload);
            this.curPage = payload;
            this.updatePages();
        } else if (notification === "PAGE_INCREMENT") {
            Log.log(this.name + " recieved a notification to increment pages!");
            if (this.curPage === this.config.modules.length - 1) {
                this.curPage = 0;
            } else { this.curPage++ }
            this.updatePages();
        } else if (notification === "PAGE_DECREMENT") {
            Log.log(this.name + " recieved a notification to decrement pages!");
            if (this.curPage === 0) {
                this.curPage = this.config.modules.length - 1;
            } else { this.curPage-- }
            this.updatePages();
        } else if (notification === "DOM_OBJECTS_CREATED") {
            Log.log(this.name + " recieved that all objects are created; will now hide things!");
            this.updatePages();
            
            this.sendNotification("MAX_PAGES_CHANGED", this.config.modules.length);
        }
    },
    
    
    // TODO: Add slide-left/right animation
    updatePages: function() {
        if (this.config.modules.length !== 0) {
            MM.getModules() 
                .exceptWithClass(this.config.excludes)
                .exceptWithClass(this.config.modules[this.curPage])
                .enumerate(module => { module.hide(this.config.animationTime / 2, { lockString: this.identifier }) });
                
            let self = this;
            setTimeout(function() {
                MM.getModules()
                    .withClass(self.config.modules[self.curPage])
                    .enumerate(module => { module.show(self.config.animationTime / 2, { lockString: self.identifier }) });
            }, this.config.animationTime / 2);
        } else { Log.error("Pages aren't properly defined!") }
    },
    
});
