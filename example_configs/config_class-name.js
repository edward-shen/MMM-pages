/*
  * This is an example configuration file for the MMM-pages module.
  *
  * Since it uses only default modules besides MMM-pages, it is a good starting
  * point for your configuration. You can add more modules if you want.
  *
  * It shows how to configure the module with class names. Checkout the
  * "Class based configuration" section in the README.
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
          ['page0'],
          ['page1'],
          ['page2'],
        ]
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
      classes: 'page1',
      position: 'bottom_bar'
    },
    {
      module: 'newsfeed',
      classes: 'page2',
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
