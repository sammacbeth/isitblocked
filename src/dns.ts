import IBlocklist from "./blocklist";
import { ImmutableURL } from "@cliqz/url-parser";
import { Resolver } from "dns";

export default class DNSBlocklist implements IBlocklist {
  resolver: Resolver;
  constructor(public name: string, servers: string[]) {
    this.resolver = new Resolver();
    this.resolver.setServers(servers);
  }
  async serialize(): Promise<Uint8Array> {
    return Buffer.from("");
  }

  async fetch(): Promise<void> {}

  async deserialize(buf: Uint8Array): Promise<void> {}

  async match(url: string): Promise<{ match: boolean; info: string }> {
    const { hostname } = new ImmutableURL(url);

    return new Promise((resolve, reject) => {
      this.resolver.resolve(hostname, (err, addresses) => {
        if (err) return reject(err);
        if (addresses.length === 0 || addresses[0] === "0.0.0.0") {
          resolve({
            match: true,
            info: `Blocked: ${hostname}`
          });
        } else {
          resolve({
            match: false,
            info: ""
          });
        }
      });
    });
  }
}
