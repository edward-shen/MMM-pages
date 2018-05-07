
# MMM-pages

This [MagicMirror²][mm] Module allows you to have pages in your magic mirror!
Want to have more modules in your magic mirror, but want to keep the format?
Or, want to have grouped modules that are themed together? Look no further!

[Click here to see an example of it in action!][example_url]

Note that this module does not provide any method of manually changing the page!
You should ask other developers to add a notification to their modules, or add
one yourself!

## Installation

In your terminal, go to your MagicMirror's Module folder:

```bash
cd ~/MagicMirror/modules
```
Clone this repository:
```bash
git clone https://github.com/edward-shen/MMM-pages.git
```
Configure the module in your config.js file.

*\<self-promotion>*

To display what page you're on, I'd highly recommend checking out my
[page indicator module][page indicator].

*\<\\self-promotion>*

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
```js
modules: [
    {
        module: 'MMM-pages',
        config: {
                modules:
                    [[ "weatherforecast", "newsfeed"],
                     [ "calendar", "compliments" ]],
                excludes: ["clock", "currentweather", "MMM-page-indicator"],
        }
    }
]
```

## Configuration options

Option         |Type                                                       |Default Value           |Description
---------------|-----------------------------------------------------------|------------------------|---------
`modules`      |`[ [String, String, ...],`<br>`[String, String, ...], ...]`|`[]`                    |A 2D String array of what each module should be on which page. Notethat all entries must take their class name (e.g. this module's class name is `MMM-pages`, while the default modules may just have `newsfeed`, without the `MMM-` prefix.
`excludes`     |`[ String, String, ... ]`                                  |`["MMM-page-indicator"]`|Which modules should show up all the time.
`animationTime`|`int`                                                      |`1000`                  |Fading animation time. Set to `0` for instant change. Value is in milliseconds (1 second = 1000 milliseconds).
`rotationTime` |`int`                                                      |`0`                     |Time, in milliseconds, between automatic page changes.
`delayTime`    |`int`                                                      |`0`                     |Time, in milliseconds, of how long should a manual page change linger before returning to automatic page changing. In other words, how long should the timer wait for after you manually change a page. This does include the animation time, so you may wish to increase it by a few seconds or so to account for the animation time.

For the `module` configuration option, the first element of the outer array
should consist of elements that should be on the first page. The second element
should consist of elements that should be on the second page, and so forth.

## Regarding notifications

This module responds to the notification `PAGE_CHANGED`. The payload should be
an `integer`. Note that this has strict error checking, so `"3"` will not work,
while `3` will. Also do note that to switch to page 1, you need to send `0` to 
the module. **This uses a zero-based numbering system.**

Let's say that you want to change the indicator to page 3. In your code, you
would write:
```js
this.sendNotification("PAGE_CHANGED", 2);
```
This would cause the module to change show that you are on page 3.

Sending a `PAGE_INCREMENT` or `PAGE_DECREMENT` without any parameters will
increase or decrease the page by one. Attaching a valid payload to the
aforementioned notifications will increase or decrease the pages by that amount.
Remember that this module **strictly checks** for a number.

This module keeps internal track of how many pages you have, defined by your 
config in the config file. There is no way to dynamically change the pages you 
have. If there arises a need, please create an issue.

This module sends one notification, `MAX_PAGES_CHANGED` to assist display 
modules with how many pages they should display. However, this module does not 
enforce what page other modules should indicate. This is intentional, because 
any other module that needs a page change notification should be recieving from 
the notification system.

## FAQ

- Help! My module is (above/below) another module in the same region but I want
  it to be somewhere else!

  The order of your `config.js` determines your module location. If you have two
  modules, both with `position:bottom_bar`, the one that is first listed will
  appear on top. The rest will appear in the same order you defined them in. If
  you want this module to be at the very bottom, define this module as the last
  module in your `config.js` file. If you want it to be on top in that region,
  make sure no other module is defined before it that has the same region.

- Can I make a pull request?

  Please do! Feel free; I love improvements!

- I want more config options!

  Please make an issue. Thanks!

[example_url]: https://www.youtube.com/watch?v=1NQ-sGtdUdg
[mm]: https://github.com/MichMich/MagicMirror
[page indicator]: https://github.com/edward-shen/MMM-page-indicator
