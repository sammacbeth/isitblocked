import AdblockerList from "./adblocklist";
import CliqzAdblocker from "./cliqzadblocker";
import CliqzAntiTracking from "./cliqzantitracking";

export default [
  new CliqzAntiTracking(),
  new CliqzAdblocker('ads'),
  new CliqzAdblocker('ads+trackers'),
  new CliqzAdblocker('full'),
  new AdblockerList('easylist', ['https://easylist.to/easylist/easylist.txt']),
  new AdblockerList('easyprivacy', ['https://easylist.to/easylist/easyprivacy.txt']),
  new AdblockerList('peterlowe', ['https://pgl.yoyo.org/adservers/serverlist.php?hostformat=adblockplus&showintro=0&mimetype=plaintext']),
]
