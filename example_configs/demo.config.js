let config = {
  modules: [
    {
      module: 'MMM-pages',
      config: {
        useLockString: false,
        timings: {
          default: 5000,
        },
        modules: [
          ['page0'],
          ['page1'],
          ['page2'],
          ['page3'],

        ]
      }
    },
    {
      module: 'compliments',
      position: 'lower_third',
      classes: 'page0 test1',
      hiddenOnStartup: true,
      config: {
        compliments: {
          anytime: ['TEST MODULE - Should be hidden on startup!']
        }
      }
    },
    {
      disabled: false,
      module: 'MMM-page-indicator',
      classes: 'fixed_page test2',
      position: 'bottom_bar',
      config: {
        showPageNumberOnHover: true,
        pages: 3,
      }
    },
    {
      module: 'compliments',
      classes: 'page0 page1 page2',
      position: 'top_bar',
      config: {
        compliments: {
          anytime: ['Test MMM-pages: Class based configuration'],
        }
      }
    },
    {
      module: 'clock',
      classes: 'page1 page4 page12',
      position: 'middle_center'
    },
    {
      module: 'newsfeed',
      classes: 'page2 page3',
      position: 'middle_center',
      config: {
        feeds: [
          {
            title: 'New York Times',
            url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml'
          }
        ]
      }
    },
  ]
};

/** ************* DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== 'undefined') { module.exports = config; }
