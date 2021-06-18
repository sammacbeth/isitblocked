import { expect } from "chai";
import { describe, before, it } from "mocha";

import { blocklists } from "../src/lists";

const listsToTest = ["duckduckgo", "ghostery", "cliqzatt", "easyprivacy", "disconnect"];
const TRACKER_URL = "https://www.google-analytics.com/analytics.js";
const NOT_TRACKER_URL = "https://example.com/";

listsToTest.forEach((name) => {
  describe(name, () => {
    const list = blocklists[name]();

    describe("after list fetch", () => {
      before(() => list.fetch());

      it("matches a tracker URL", async () => {
        const result = await list.match(TRACKER_URL, NOT_TRACKER_URL, 'script');
        expect(result.match).to.be.true;
      });

      it("does not match a non-tracker URL", async () => {
        const result = await list.match(NOT_TRACKER_URL, NOT_TRACKER_URL, 'script');
        expect(result.match).to.be.false;
      });

      describe("after deserialization", () => {
        let reserialized = blocklists[name]();
        before(async () => {
          const data = await list.serialize();
          await reserialized.deserialize(data);
        });

        it("matches a tracker URL", async () => {
          const result = await list.match(TRACKER_URL, NOT_TRACKER_URL, 'script');
          expect(result.match).to.be.true;
        });

        it("does not match a non-tracker URL", async () => {
          const result = await list.match(NOT_TRACKER_URL, NOT_TRACKER_URL, 'script');
          expect(result.match).to.be.false;
        });
      });
    });
  });
});
