import fetch from "node-fetch";
import * as tldts from "tldts-experimental";
import { ImmutableURL } from "@cliqz/url-parser";
import { Trackers } from "@duckduckgo/privacy-grade";
import IBlocklist from "./blocklist";

function guessTypeFromPath(pathname: string) {
  if (pathname.endsWith(".js")) {
    return "script";
  }
  if (pathname.endsWith(".css")) {
    return "stylesheet";
  }
  return "xmlhttprequest";
}

export default class DuckDuckGoBlocking implements IBlocklist {
  name = "DuckDuckGo";
  engine: any;

  constructor() {
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
    return Buffer.from(
      JSON.stringify({
        entityList: this.engine.entityList,
        trackerList: this.engine.trackerList,
        surrogateList: this.engine.surrogateList,
        domains: this.engine.domains,
        cnames: this.engine.cnames,
      }),
      "utf-8"
    );
  }
  async fetch(): Promise<void> {
    const tds = await (
      await fetch(
        "https://staticcdn.duckduckgo.com/trackerblocking/v2.1/tds.json"
      )
    ).json();
    const surrogates = await (
      await fetch("https://duckduckgo.com/contentblocking.js?l=surrogates")
    ).text();
    this.engine.setLists([
      { name: "tds", data: tds },
      { name: "surrogates", data: surrogates },
    ]);
  }
  async deserialize(buf: Uint8Array): Promise<void> {
    const lists = JSON.parse(Buffer.from(buf).toString("utf-8"));
    Object.assign(this.engine, lists);
  }
  async match(
    url: string
  ): Promise<{ match: boolean; info: { toString(): string } }> {
    const parsedUrl = new ImmutableURL(url);
    const type = guessTypeFromPath(parsedUrl.pathname);
    const trackerData = this.engine.getTrackerData(
      url,
      "https://example.com/",
      { type }
    );
    if (trackerData) {
      console.log(JSON.stringify(trackerData));
      trackerData.toString = () =>
        `${trackerData.action}: ${trackerData.reason}`;
    }
    return {
      match: !!trackerData,
      info: trackerData,
    };
  }
}
