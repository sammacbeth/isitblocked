import { ImmutableURL } from "@cliqz/url-parser";
import fetch from "node-fetch";
import IBlocklist from "./blocklist";

function parseList(json) {
  const lookup = {};
  Object.keys(json.categories).forEach(cat => {
    json.categories[cat].forEach(obj => {
      Object.keys(obj).forEach(serviceName => {
        Object.keys(obj[serviceName]).forEach(k => {
          if (!k.startsWith("http")) {
            return;
          }
          const domains = obj[serviceName][k];
          try {
            domains.forEach(d => {
              const parts = d.split(".").reverse();
              let root = lookup;
              parts.forEach(p => {
                if (!root[p]) {
                  root[p] = {};
                }
                root = root[p];
              });
              root["$"] = {
                name: serviceName,
                cat
              };
            });
          } catch (e) {
            throw new Error(JSON.stringify(obj[serviceName]));
          }
        });
      });
    });
  });
  return lookup;
}

export default class DisconnectBlocking implements IBlocklist {
  name = "Disconnect";
  db: any;

  async serialize(): Promise<Uint8Array> {
    return Buffer.from(JSON.stringify(this.db), "utf-8");
  }
  async fetch(): Promise<void> {
    const req = await fetch(
      "https://services.disconnect.me/disconnect-plaintext.json"
    );
    this.db = parseList(await req.json());
  }
  async deserialize(buf: Uint8Array): Promise<void> {
    this.db = JSON.parse(Buffer.from(buf).toString("utf-8"));
  }
  async match(url: string): Promise<{ match: boolean; info: string }> {
    const { hostname } = new ImmutableURL(url);
    const parts = hostname.split(".").reverse();
    let root = this.db;
    for (let i = 0; i < parts.length; i++) {
      if (!root[parts[i]]) {
        return {
          match: false,
          info: ""
        };
      }
      root = root[parts[i]];
      if (root["$"]) {
        const { name, cat } = root["$"];
        return {
          match: true,
          info: `Tracker match: ${name}, category ${cat}`
        };
      }
    }
    return {
      match: false,
      info: ""
    };
  }
}
