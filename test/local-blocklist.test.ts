import { expect } from "chai";
import { describe, before, it } from "mocha";
import { writeFileSync, unlinkSync, existsSync } from "fs";
import { blocklists } from "../src/lists";
import DuckDuckGoBlocking from "../src/ddg";
import AdblockerList from "../src/adblocklist";

describe("local blocklist URL", () => {
    const tmpBlocklistPaths = {
        ddg: './ddg_tmp.json',
        adb: './adb_tmp.txt'
    }
    afterEach(() => {
        Object.values(tmpBlocklistPaths).forEach(f => {
            if (existsSync(f)) {
                unlinkSync(f)
            }
        })
    })

    it('DDG can use local blocklist file', async () => {
        writeFileSync(tmpBlocklistPaths.ddg, JSON.stringify({
            trackers: {
                'example.com': {
                    domain: 'example.com',
                    default: 'block'
                }
            },
            entities: {},
            domains: {}
        }))
        const ddg = new DuckDuckGoBlocking(tmpBlocklistPaths.ddg);
        await ddg.fetch()
        const matchResult = ddg.match('https://www.example.com/', 'https://test.com', 'script')
        expect(matchResult.info.toString()).to.match(/^block/)
    })

    it('Adblocker can use a local blocklist file', async () => {
        writeFileSync(tmpBlocklistPaths.adb, '||example.com^')
        const adb = new AdblockerList('custom', [tmpBlocklistPaths.adb])
        await adb.fetch()
        const matchResult = adb.match('https://www.example.com/', 'https://test.com', 'script')
        expect(matchResult.match).to.be.true
    })
})
