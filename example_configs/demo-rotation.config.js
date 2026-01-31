let config = {
  logLevel: ['INFO', 'LOG', 'WARN', 'ERROR', 'DEBUG'], // Add "DEBUG" for even more logging
  modules: [
    {
      module: 'MMM-pages',
      config: {
        timings: {
          default: 5000,
          2: 20000
        },
        modules: [
          ['compliments'],
          ['clock'],
          ['newsfeed'],
          ['compliments'],
          ['clock'],
          ['newsfeed'],
          ['compliments'],
          ['clock'],
          ['newsfeed'],
          ['compliments'],
          ['clock'],
          ['newsfeed'],
          ['compliments'],
          ['clock'],
          ['newsfeed'],
          ['compliments'],
          ['clock'],
          ['newsfeed'],
        ]
      }
    },
    {
      module: 'MMM-page-indicator',
      classes: 'fixed_page',
      position: 'bottom_bar',
      config: {
        activeBright: true
      }
    },
    {
      module: 'compliments',
      position: 'top_bar',
      config: {
        compliments: {
          anytime: ['Test MMM-pages: Module name based configuration'],
        }
      }
    },
    {
      module: 'clock',
      position: 'top_bar'
    },
    {
      module: 'newsfeed',
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
