export default interface IBlocklist {
  name: string;
  serialize(): Promise<Uint8Array>;
  fetch(): Promise<void>;
  deserialize(buf: Uint8Array): Promise<void>;
  match(url: string): Promise<{ match: boolean; info: string }>;
}
