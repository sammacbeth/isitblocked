import { Fetch } from "@cliqz/adblocker";
import fetch from "node-fetch";
import fs from 'fs/promises'

export function fetchLocalOrRemote(url: string): ReturnType<Fetch> {
    // remote fetch, use fetch lib
    if (url.startsWith('http:') || url.startsWith('https:')) {
        return fetch(url)
    }
    // local fetch - read with standard FS lib
    return Promise.resolve({
        text: () => fs.readFile(url, 'utf-8'),
        arrayBuffer: () => fs.readFile(url),
        json: async () => JSON.parse(await fs.readFile(url, 'utf-8'))
    })
}
