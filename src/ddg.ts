import * as tldts from "tldts-experimental";
import { Trackers } from "@duckduckgo/privacy-grade";
import IBlocklist from "./blocklist";
import { RequestType } from "@ghostery/adblocker";
import { fetchLocalOrRemote } from "./fetch";


type TrackerAllowlist = Record<string, TrackerAllowlistEntry>
type TrackerAllowlistEntry = {
  rules: TrackerAllowlistRule[]
}
type TrackerAllowlistRule = {
  rule: string,
  domains: string[]
}

function _matchesRule(site: string, request: string, allowListEntry: TrackerAllowlistEntry): TrackerAllowlistRule | false {
  let matchedRule: TrackerAllowlistRule = null
  request = request.split('?')[0].split(';')[0]

  // remove port from request urls
  const parsedRequest = new URL(request)
  if (parsedRequest.port) {
    parsedRequest.port = parsedRequest.protocol === 'https:' ? '443' : '80'
    request = parsedRequest.href
  }

  if (allowListEntry.rules && allowListEntry.rules.length) {
    for (const ruleObj of allowListEntry.rules) {
      if (request.match(ruleObj.rule)) {
        matchedRule = ruleObj
        break
      }
    }
  }

  if (matchedRule) {
    if (matchedRule.domains.includes('<all>')) {
      return matchedRule
    }
    const { domain, hostname } = tldts.parse(site)
    // eTLD+1 match
    if (domain && matchedRule.domains.includes(domain)) {
      return matchedRule
    }
    // hostname, or hostname-suffix match
    if (hostname && matchedRule.domains.find((d) => d === hostname || hostname.endsWith(`.${d}`))) {
      return matchedRule
    }
  } else {
    return false
  }

  return false
}

export default class DuckDuckGoBlocking implements IBlocklist {
  name = "DuckDuckGo";
  engine: any;
  engineData: string;
  allowlist: TrackerAllowlist

  constructor(
    private tdsUrl = "https://staticcdn.duckduckgo.com/trackerblocking/v6/current/extension-tds.json",
    private surrogatesUrl = "https://duckduckgo.com/contentblocking.js?l=surrogates",
    private configUrl = "https://staticcdn.duckduckgo.com/trackerblocking/config/v4/extension-config.json") {
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
      await fetchLocalOrRemote(this.tdsUrl)
    ).json();
    const surrogates = await (await fetchLocalOrRemote(this.surrogatesUrl)).text();
    const config = await (await fetchLocalOrRemote(this.configUrl)).json();
    this.engineData = JSON.stringify([
      { name: "tds", data: tds },
      { name: "surrogates", data: surrogates },
      { name: "config", data: config }
    ])
    this.engine.setLists(JSON.parse(this.engineData));
    this.allowlist = config.features?.trackerAllowlist?.settings?.allowlistedTrackers || {};
  }

  async deserialize(buf: Uint8Array): Promise<void> {
    this.engineData = Buffer.from(buf).toString("utf-8");
    const parsedData = JSON.parse(this.engineData)
    this.engine.setLists(parsedData);
    this.allowlist = parsedData.find(l => l.name === "config")?.features?.trackerAllowlist?.settings?.allowlistedTrackers || {};
  }

  match(
    url: string,
    sourceUrl: string,
    type: RequestType
  ): { match: boolean; info: { trackerAllowlist: boolean; toString(): string } } {
    const trackerData = this.engine.getTrackerData(url, sourceUrl, { type });
    let match = !!trackerData
    if (trackerData) {
      const trackerEtldPlusOne = tldts.getDomain(url);
      trackerData.trackerAllowlist = false;
      if (this.allowlist[trackerEtldPlusOne]) {
        const allowlistMatch = _matchesRule(sourceUrl, url, this.allowlist[trackerEtldPlusOne])
        if (allowlistMatch) {
          match = false;
          trackerData.trackerAllowlist = true;
          trackerData.toString = () => `tracker-allowlist: ${allowlistMatch.rule}`;
        }
      } else if (trackerData.action !== 'block' && trackerData.action !== 'redirect') {
        match = false;
      }
      if (!trackerData.trackerAllowlist) {
        trackerData.toString = () => `${trackerData.action}: ${trackerData.reason}`;
      }
    }
    return {
      match: match,
      info: trackerData,
    };
  }

}
