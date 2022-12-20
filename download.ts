import { join, basename } from 'path'
import fs from 'fs'
import fetch from "node-fetch";

async function wget(url: string, path: string) {
    console.log(`Downloading ${url} to ${path}`)
    const resp = await fetch(url)
    if (!resp.ok) {
        console.warn(`Download failed: ${url}`)
    }
    await fs.promises.writeFile(path, await resp.text(), 'utf-8')
}


async function fetchDDGLists() {
    const ddgPath = join('.', 'blocklists', 'ddg')
    const ddgVersions = JSON.parse(await fs.promises.readFile(join(ddgPath, 'versions.json'), 'utf-8'))
    const surrogatesFile = join(ddgPath, 'surrogates.txt')
    if (!fs.existsSync(surrogatesFile)) {
        await wget("https://duckduckgo.com/contentblocking.js?l=surrogates", surrogatesFile)
    }

    for (const { date, url } of ddgVersions) {
        const tdsFile = join(ddgPath, `${date}-${basename(url)}`)
        if (!fs.existsSync(tdsFile)) {
            await wget(url, tdsFile)
        }
    }
}

async function fetchEasylists() {
    const easylistPath = join('.', 'blocklists', 'easylist')
    const easyListVersions = JSON.parse(await fs.promises.readFile(join(easylistPath, 'versions.json'), 'utf-8'))

    for (const { date, ref } of easyListVersions) {
        const easylistFile = join(easylistPath, `${date}-easylist.txt`)
        const easyprivacyFile = join(easylistPath, `${date}-easyprivacy.txt`)
        if (!fs.existsSync(easylistFile)) {
            await wget(`https://github.com/easylist/easylist/blob/${ref}/easylist.txt?raw=true`, easylistFile)
        }
        if (!fs.existsSync(easyprivacyFile)) {
            await wget(`https://github.com/easylist/easylist/blob/${ref}/easyprivacy.txt?raw=true`, easyprivacyFile)
        }
    }
}

(async function main() {
    await fetchDDGLists()
    await fetchEasylists()
})()
