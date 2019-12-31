import fetch from "node-fetch";
import { ImmutableURL } from "@cliqz/url-parser";
import IBlocklist from "./blocklist";
import PackedBloomFilter from "./bloom-filter";
import md5 from "./md5";

const CDN_BASE_URL = "https://cdn.cliqz.com/anti-tracking/whitelist/2";

export default class CliqzAntiTracking implements IBlocklist {
  name = "Cliqz AntiTracking";
  buffer: ArrayBuffer = null;
  bloomFilter: PackedBloomFilter = null;

  async serialize(): Promise<Uint8Array> {
    return Buffer.from(this.buffer);
  }

  async fetch(): Promise<void> {
    const update = await fetch(`${CDN_BASE_URL}/update.json.gz`);
    const { version } = await update.json();
    const bfRequest = await fetch(`${CDN_BASE_URL}/${version}/bloom_filter.gz`);
    this.buffer = await bfRequest.arrayBuffer();
    this.bloomFilter = new PackedBloomFilter(this.buffer);
  }

  async deserialize(buf: Uint8Array): Promise<void> {
    this.buffer = buf.buffer;
    this.bloomFilter = new PackedBloomFilter(this.buffer);
  }

  async match(url: string): Promise<{ match: boolean; info: string }> {
    const generalDomain = new ImmutableURL(url).generalDomain;
    const isMatch = this.bloomFilter.testSingle(
      `c${md5(generalDomain).substring(0, 16)}`
    );
    return {
      match: isMatch,
      info: isMatch ? `${generalDomain} is a tracker domain` : ""
    };
  }
}
