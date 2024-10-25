import { FiltersEngine, Request, RequestType } from "@ghostery/adblocker";
import { fetchLocalOrRemote } from "./fetch";
import IBlocklist from "./blocklist";

export interface MatchDetails {
  match: boolean;
  redirect?: boolean;
  exception?: string;
  filter?: string;
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
      info: {
        match: details.match,
        redirect: !!details.redirect,
        exception: details.exception?.toString(),
        filter: details.exception?.toString()
      }
    };
  }
}
