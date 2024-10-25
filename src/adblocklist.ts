import { BlockingResponse, FiltersEngine, Request, RequestType } from "@ghostery/adblocker";
import { fetchLocalOrRemote } from "./fetch";
import IBlocklist from "./blocklist";

export class MatchDetails {
  match: boolean;
  redirect?: boolean;
  exception?: string;
  filter?: string;

  constructor(response: BlockingResponse) {
    this.match = response.match
    this.redirect = !!response.redirect
    this.exception = response.exception?.toString()
    this.filter = response.filter?.toString()
  }

  toString() {
    if (this.redirect) {
      return `Redirect: ${this.filter}`
    }
    if (this.exception) {
      return `Filter exception: ${this.exception}`
    }
    if (this.filter) {
      return `Filter match: ${this.filter}`
    }
    return 'No match'
  }
}

export default class AdblockerList implements IBlocklist {
  engine: FiltersEngine = null;
  constructor(public name: string, protected lists: string[]) {}

  async serialize(): Promise<Uint8Array> {
    return this.engine.serialize();
  }

  async fetch(): Promise<void> {
    this.engine = await FiltersEngine.fromLists(fetchLocalOrRemote, this.lists);
  }

  async deserialize(buf: Uint8Array): Promise<void> {
    this.engine = FiltersEngine.deserialize(buf);
  }

  match(url: string, sourceUrl: string, type: RequestType): { match: boolean; info: MatchDetails } {
    const details = this.engine.match(
      Request.fromRawDetails({
        url,
        sourceUrl,
        type,
      })
    );
    return {
      match: details.match,
      info: new MatchDetails(details)
    };
  }
}
