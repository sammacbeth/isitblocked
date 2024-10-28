import AdblockerList from "./adblocklist";
import CliqzAdblocker from "./cliqzadblocker";
import CliqzAntiTracking from "./cliqzantitracking";
import GhosteryBlocking from "./ghostery";
import DisconnectBlocking from "./disconnect";
import DuckDuckGoBlocking from "./ddg";
import IBlocklist from "./blocklist";

const uBODefaults = [
  "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.txt",
  "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters-2020.txt",
  "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters-2021.txt",
  "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters-2022.txt",
  "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters-2023.txt",
  "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters-2024.txt",
  "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/badware.txt",
  "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/privacy.txt",
  "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/resource-abuse.txt",
  "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/unbreak.txt",
  "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/quick-fixes.txt",
  "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/ubo-link-shorteners.txt",
  "https://easylist.to/easylist/easylist.txt",
  "https://easylist.to/easylist/easyprivacy.txt",
  "https://malware-filter.gitlab.io/malware-filter/urlhaus-filter-agh-online.txt",
  "https://pgl.yoyo.org/adservers/serverlist.php?hostformat=adblockplus&showintro=1&mimetype=plaintext",
]

export const blocklists: { [name: string]: () => IBlocklist } = {
  cliqzatt: () => new CliqzAntiTracking(),
  adb: () => new CliqzAdblocker("ads"),
  adb_trackers: () => new CliqzAdblocker("ads+trackers"),
  adb_full: () => new CliqzAdblocker("full"),
  easylist: () => new AdblockerList("easylist", [
    "https://easylist.to/easylist/easylist.txt"
  ]),
  easyprivacy: () => new AdblockerList("easyprivacy", [
    "https://easylist.to/easylist/easyprivacy.txt"
  ]),
  peterlowe: () => new AdblockerList("peterlowe", [
    "https://pgl.yoyo.org/adservers/serverlist.php?hostformat=adblockplus&showintro=0&mimetype=plaintext"
  ]),
  ghostery: () => new GhosteryBlocking(),
  disconnect: () => new DisconnectBlocking(),
  duckduckgo: () => new DuckDuckGoBlocking(),
  ubo: () => new AdblockerList('uBlock Origin', uBODefaults),
  brave: () => new AdblockerList('Brave', [
    ...uBODefaults,
    "https://raw.githubusercontent.com/brave/adblock-lists/master/brave-lists/brave-specific.txt",
    "https://raw.githubusercontent.com/brave/adblock-lists/master/brave-lists/brave-social.txt",
    "https://raw.githubusercontent.com/brave/adblock-lists/master/brave-lists/brave-unbreak.txt",
    "https://raw.githubusercontent.com/brave/adblock-lists/master/brave-lists/brave-android-specific.txt",
    "https://raw.githubusercontent.com/brave/adblock-lists/master/brave-lists/brave-sugarcoat.txt",
    "https://secure.fanboy.co.nz/fanboy-cookiemonster_ubo.txt",
    "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/annoyances-cookies.txt",
    "https://raw.githubusercontent.com/brave/adblock-lists/master/brave-lists/brave-cookie-specific.txt",
  ]),
  adblockplus: () => new AdblockerList('Adblock Plus', [
    "https://easylist-downloads.adblockplus.org/v3/full/abp-filters-anti-cv.txt",
    "https://easylist-downloads.adblockplus.org/v3/full/easylist.txt",
    "https://easylist-downloads.adblockplus.org/v3/full/exceptionrules.txt",
  ])
};

function select(entries: string[]) {
  return entries.map(k => blocklists[k]());
}

export default select([
  "cliqzatt",
  "adb",
  "ghostery",
  "disconnect",
  "duckduckgo",
  "ubo",
  "brave",
  "adblockplus"
]);
