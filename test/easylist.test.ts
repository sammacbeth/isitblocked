import { expect } from "chai";
import { describe, before, it } from "mocha";

import { blocklists } from "../src/lists";

describe("easylist matching", () => {
  const list = blocklists["easyprivacy"]();

  before(() => list.fetch());

  it("matches $third-party rules (#76)", async () => {
    const result = await list.match(
      "https://244631299-prod.rfksrv.com/rfk/js/12359-244631299/init.js",
      "https://www.example.com",
      "script"
    );
    expect(result.match).to.be.true;
  });

  it("does not match $third-party rule when source matches", async () => {
    const result = await list.match(
      "https://244631299-prod.rfksrv.com/rfk/js/12359-244631299/init.js",
      "https://www.rfksrv.com",
      "script"
    );
    expect(result.match).to.be.false;
  })
});
