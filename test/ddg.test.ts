import { expect } from "chai";
import { describe, before, it } from "mocha";
import DuckDuckGoBlocking from "../src/ddg";


describe('DDG Blocking Tests', () => {
    const ddg = new DuckDuckGoBlocking()

    before(async () => {
        await ddg.fetch()
    })

    it('blocks a standard tracker', () => {
        const result = ddg.match("https://www.google-analytics.com/analytics.js", "https://example.com/", 'script');
        expect(result.match).to.be.true
        expect(result.info.trackerAllowlist).to.be.false
    })

    it('all domains tracker allowlist', () => {
        const result = ddg.match("https://assets.brightspot.abebooks.a2z.com/test", "https://example.com/", 'script');
        expect(result.match).to.be.false
        expect(result.info.trackerAllowlist).to.be.true
    })

    it('specific domain tracker allowlist', () => {
        const result = ddg.match("https://static.addtoany.com/menu/page.js", "https://x22report.com/", 'script');
        expect(result.match).to.be.false
        expect(result.info.trackerAllowlist).to.be.true
    })

    it('specific domain tracker allowlist on different site', () => {
        const result = ddg.match("https://static.addtoany.com/menu/page.js", "https://example.com/", 'script');
        expect(result.match).to.be.true
        expect(result.info.trackerAllowlist).to.be.false
    })

    it('action: none is not a match', () => {
        const result = ddg.match("https://0.gravatar.com/avatar/", "https://example.com/", 'image');
        expect(result.match).to.be.false
    })

    it('action: ignore is not a match', () => {
        const result = ddg.match("https://123.hp.com/", "https://123.hp.com/", 'document');
        expect(result.match).to.be.false
    })
})
