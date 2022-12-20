import { join, basename } from 'path'
import fs from 'fs'
import fetch from "node-fetch";
import { getVersions } from './src/versions';

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
    const ddgVersions = await getVersions('ddg')
    const surrogatesFile = join(ddgPath, 'surrogates.txt')
    if (!fs.existsSync(surrogatesFile)) {
        await wget("https://duckduckgo.com/contentblocking.js?l=surrogates", surrogatesFile)
    }

    for (const { url, localPath } of ddgVersions) {
        const tdsFile = join('.', localPath)
        if (!fs.existsSync(tdsFile)) {
            await wget(url, tdsFile)
        }
    }
}

async function fetchEasylists() {
    const easylistPath = join('.', 'blocklists', 'easylist')

    for (const versions of [await getVersions('easylist'), await getVersions('easyprivacy')]) {
        for (const { url, localPath } of versions) {
            const filePath = join('.', localPath)
            if (!fs.existsSync(filePath)) {
                await wget(url, filePath)
            }
        }
    }
}

(async function main() {
    await fetchDDGLists()
    await fetchEasylists()
})()
