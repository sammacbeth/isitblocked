import fetch from 'node-fetch';
import fs from 'fs'
import { createHash } from 'crypto'
import { BlocklistVersion, getVersions, getVersionsFilePath } from './src/versions';

const currentDateString = new Date().toISOString().slice(0, 10).replace(/-/g, '');

(async () => {
    const ddgVersions = await getVersions('ddg')

    // check if latest version is up-to-date
    const { url, localPath } = ddgVersions[0];

    const remoteEtag = (await fetch(url, { method: 'HEAD' })).headers.get('etag').split('"')[1]
    const hash = createHash('md5');
    hash.update(fs.readFileSync(localPath))
    const localHash = hash.digest('hex')
    
    if (remoteEtag !== localHash) {
        console.log('Default TDS out of date, replacing with new one')
        // mismatch, list is out of date.
        ddgVersions.unshift({
            date: currentDateString,
            url: ddgVersions[0].url,
            localPath: ''
        })
        ddgVersions[1].url = `https://staticcdn.duckduckgo.com/trackerblocking/tds/by-hash/tds-${localHash}.json`
    }

    fs.writeFileSync(getVersionsFilePath('ddg'), JSON.stringify(ddgVersions.map(({ date, url }) => ({ date, url })), undefined, 4))

    const easylistPath = getVersionsFilePath('easylist')
    const easylistVersions = JSON.parse(fs.readFileSync(easylistPath, 'utf-8'))
    const branchInfo = await (await fetch('https://api.github.com/repos/easylist/easylist/branches/gh-pages')).json()
    const ref = branchInfo.commit.sha;
    easylistVersions.unshift({
        date: currentDateString,
        ref,
    })
    fs.writeFileSync(getVersionsFilePath('easylist'), JSON.stringify(easylistVersions, undefined, 4))
})()
