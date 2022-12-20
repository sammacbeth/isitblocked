import { RequestType } from "@cliqz/adblocker";

export default interface IBlocklist {
  name: string;
  serialize(): Promise<Uint8Array>;
  fetch(): Promise<void>;
  deserialize(buf: Uint8Array): Promise<void>;
  match(
    url: string,
    sourceUrl: string,
    type: RequestType
  ): { match: boolean; info: { toString(): string } };
}
