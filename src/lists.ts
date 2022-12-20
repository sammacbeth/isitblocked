import AdblockerList from "./adblocklist";
import CliqzAdblocker from "./cliqzadblocker";
import CliqzAntiTracking from "./cliqzantitracking";
import GhosteryBlocking from "./ghostery";
import DisconnectBlocking from "./disconnect";
import DuckDuckGoBlocking from "./ddg";
import IBlocklist from "./blocklist";

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
};

function select(entries: string[]) {
  return entries.map(k => blocklists[k]());
}

export default select([
  "cliqzatt",
  "adb",
  "ghostery",
  "disconnect",
  "easylist",
  "easyprivacy",
  "peterlowe",
  "adguard_dns",
  "duckduckgo",
]);
