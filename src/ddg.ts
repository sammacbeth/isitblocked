import fetch from "node-fetch";
import * as tldts from "tldts-experimental";
import { Trackers } from "@duckduckgo/privacy-grade";
import IBlocklist from "./blocklist";
import { RequestType } from "@cliqz/adblocker";

export default class DuckDuckGoBlocking implements IBlocklist {
  name = "DuckDuckGo";
  engine: any;
  engineData: string;

  constructor(
      private tdsUrl = "https://staticcdn.duckduckgo.com/trackerblocking/v3/tds.json", 
      private surrogatesUrl = "https://duckduckgo.com/contentblocking.js?l=surrogates") {
    this.engine = new Trackers({
      tldjs: tldts,
      utils: {
        extractHostFromURL: (url, shouldKeepWWW) => {
          if (!url) return "";

          let hostname = tldts.getHostname(url) || "";

          if (!shouldKeepWWW) {
            hostname = hostname.replace(/^www\./, "");
          }

          return hostname;
        },
      },
    });
  }

  async serialize(): Promise<Uint8Array> {
    return Buffer.from(this.engineData, "utf-8");
  }
  async fetch(): Promise<void> {
    const tds = await (
      await fetch(this.tdsUrl)
    ).json();
    const surrogates = await (await fetch(this.surrogatesUrl)).text();
    this.engineData = JSON.stringify([
      { name: "tds", data: tds },
      { name: "surrogates", data: surrogates },
    ])
    this.engine.setLists(JSON.parse(this.engineData));
  }
  async deserialize(buf: Uint8Array): Promise<void> {
    this.engineData = Buffer.from(buf).toString("utf-8");
    this.engine.setLists(JSON.parse(this.engineData));
  }
  async match(
    url: string,
    sourceUrl: string,
    type: RequestType
  ): Promise<{ match: boolean; info: { toString(): string } }> {
    const trackerData = this.engine.getTrackerData(url, sourceUrl, { type });
    if (trackerData) {
      trackerData.toString = () =>
        `${trackerData.action}: ${trackerData.reason}`;
    }
    return {
      match: !!trackerData,
      info: trackerData,
    };
  }
}
