import { FiltersEngine, Request } from "@cliqz/adblocker";
import fetch from "node-fetch";
import IBlocklist from "./blocklist";

export default class AdblockerList implements IBlocklist {
  engine: FiltersEngine = null;
  constructor(public name: string, protected lists: string[]) {}

  async serialize(): Promise<Uint8Array> {
    return this.engine.serialize();
  }

  async fetch(): Promise<void> {
    this.engine = await FiltersEngine.fromLists(fetch, this.lists);
  }

  async deserialize(buf: Uint8Array): Promise<void> {
    this.engine = FiltersEngine.deserialize(buf);
  }

  async match(url: string): Promise<{ match: boolean; info: string }> {
    const { match: isMatch, filter } = this.engine.match(
      Request.fromRawDetails({
        url
      })
    );
    const info = isMatch && `Filter match: ${filter.hostname || ''}${filter.filter || ''}`;
    return {
      match: isMatch,
      info
    };
  }
}
