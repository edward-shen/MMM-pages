/*
  * This is an example configuration file for the MMM-pages module.
  *
  * Since it uses only default modules besides MMM-pages, it is a good starting
  * point for your configuration. You can add more modules if you want.
  *
  * It shows how to configure the module with module names. Checkout the
  * "Module name based configuration" section in the README.
  *
*/

let config = {
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
        ]
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
