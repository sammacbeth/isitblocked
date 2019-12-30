import { FiltersEngine } from "@cliqz/adblocker";
import fetch from "node-fetch";
import AdblockerList from "./adblocklist";

export type BlockMode = "ads" | "ads+trackers" | "full";

export default class CliqzAdblocker extends AdblockerList {
  constructor(private mode: BlockMode) {
    super(`Cliqz Adblocker (${mode})`, []);
  }

  async fetch(): Promise<void> {
    switch (this.mode) {
      case "ads":
        this.engine = await FiltersEngine.fromPrebuiltAdsOnly(fetch);
        return;
      case "ads+trackers":
        this.engine = await FiltersEngine.fromPrebuiltAdsAndTracking(fetch);
        return;
      case "full":
        this.engine = await FiltersEngine.fromPrebuiltFull(fetch);
        return;
    }
  }
}
