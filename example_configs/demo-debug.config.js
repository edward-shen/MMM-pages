let config = {
  address: 'localhost', // Address to listen on, can be:
  // - "localhost", "127.0.0.1", "::1" to listen on loopback interface
  // - another specific IPv4/6 to listen on a specific interface
  // - "0.0.0.0", "::" to listen on any interface
  // Default, when address config is left out or empty, is "localhost"
  port: 8081,
  basePath: '/', // The URL path where MagicMirror² is hosted. If you are using a Reverse proxy
  // you must set the sub path here. basePath must end with a /
  ipWhitelist: ['127.0.0.1', '::ffff:127.0.0.1', '::1'], // Set [] to allow all IP addresses
  // or add a specific IPv4 of 192.168.1.5 :
  // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
  // or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
  // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

  useHttps: false, // Support HTTPS or not, default "false" will use HTTP
  httpsPrivateKey: '', // HTTPS private key path, only require when useHttps is true
  httpsCertificate: '', // HTTPS Certificate path, only require when useHttps is true

  language: 'de',
  locale: 'de-DE', // this variable is provided as a consistent location
  // it is currently only used by 3rd party modules. no MagicMirror code uses this value
  // as we have no usage, we  have no constraints on what this field holds
  // see https://en.wikipedia.org/wiki/Locale_(computer_software) for the possibilities

  logLevel: ['INFO', 'LOG', 'WARN', 'ERROR', 'DEBUG'], // Add "DEBUG" for even more logging
  timeFormat: 24,
  units: 'metric',

  modules: [
    {
      module: 'MMM-anotherNewsFeed',
      header: 'ANOTHER News Feed',
      position: 'bottom_bar',
      config: {
        feeds: [
          {
            title: 'New York Times',
            url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
          },
          {
            title: 'CBC World',
            url: 'https://www.cbc.ca/webfeed/rss/rss-world',
          },
          {
            title: 'BBC World News',
            url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
          }
        ],
        showImage: true,
      }
    },
    {

      module: 'MMM-SendNotificationButton',
      position: 'top_left',
      header: 'SendNotificationButton',
      config: {
        // See below for Configuration Options
      }
    },
    {

      module: 'MMM-ViewNotifications',
      position: 'top_left',
      header: 'ViewNotifications',
      config: {
        // See below for Configuration Options
      }
    },

    {
      module: 'MMM-page-indicator',
      position: 'bottom_bar',
      config: {
        activeBright: true,
      }
    },
    {
      module: 'MMM-pages',
      config: {
        timings: {
          default: 5000, // rotate every 5 seconds
          0: 20000, // page 0 rotates every 20 seconds
          admin: 30000 // admin hidden page auto-returns after 30 seconds
        },
        modules: [
          ['MMM-anotherNewsFeed'], // page 0
          ['calendar', 'compliments'], // page 1
        ],
        fixed: [ // modules that are always shown
          'clock',
          'MMM-ViewNotifications',
          'MMM-SendNotificationButton',
          'MMM-page-indicator'
        ],
        hiddenPages: { // modules that are only shown on specific pages
          screenSaver: [
            'clock',
            'MMM-BackgroundSlideshow'
          ],
          admin: [
            'MMM-anotherNewsFeed'
          ]
        }
      }
    },
  ]

};

/** ************* DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== 'undefined') { module.exports = config; }
