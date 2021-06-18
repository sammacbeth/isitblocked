# IsItBlocked

Quickly test if a URL is currently on an adblock or anti-tracking blocklist.

Reports results for:
 * Cliqz anti-tracking tracker list
 * Cliqz adblocker blocklist
 * Ghostery tracker list
 * Disconnect tracker list
 * Easylist
 * Easyprivacy
 * Peter Lowe's tracker list
 * Adguard DNS blocking
 * DuckDuckGo tracker blocklist.

## Usage

```bash
$ npx @sammacbeth/isitblocked -u "https://www.google-analytics.com/analytics.js"
  ✔ Fetch and load block lists
  ❯ Test URL https://www.google-analytics.com/analytics.js
    ✖ Cliqz AntiTracking
      → google-analytics.com is a tracker domain
    ✔ Cliqz Adblocker (ads)
    ✖ Ghostery
      → Tracker match: Google Analytics, category site_analytics (bugID 3579)
    ✖ Disconnect
      → Tracker match: Google, category Disconnect
    ✔ easylist
    ✖ easyprivacy
      → Filter match: google-analytics.com/analytics.js
    ✖ peterlowe
      → Filter match: google-analytics.com
    ✖ Adguard DNS
      → Blocked: www.google-analytics.com
    ✖ DuckDuckGo
      → redirect: matched rule - surrogate
```

Full options:
```bash
Usage: index.ts [options]

Options:
  -u --url <url>            URL to test
  -h --hostname <hostname>  Hostname to test
  -s --source <source>      Source (first party) URL (default: "https://www.example.com")
  -t --type <type>          Request type (e.g. 'script', 'xmlhttprequest'
  --no-fetch                Do not fetch lists automatically
  --no-update               Do not update out-of-date lists
  --no-cache                Do not use cached lists
  -h, --help                output usage information
```

## License

MIT
