import { join, basename } from 'path'
import fs from 'fs'

export type BlocklistVersion = {
    date: string;
    url: string;
    localPath: string;
}

export function getVersionsFilePath(blocklist: 'ddg' | 'easylist' | 'easyprivacy'): string {
    return join('.', 'blocklists', blocklist, 'versions.json')
}

export async function getVersions(blocklist: 'ddg' | 'easylist' | 'easyprivacy'): Promise<BlocklistVersion[]> {
    if (blocklist === 'ddg') {
        const ddgPath = join('.', 'blocklists', 'ddg')
        const versions: Pick<BlocklistVersion, 'date' | 'url'>[] = JSON.parse(await fs.promises.readFile(join(ddgPath, 'versions.json'), 'utf-8'))
        return versions.map(({ date, url }) => {
            return {
                date,
                url,
                localPath: join('blocklists/ddg/', `${date}-${basename(url)}`)
            }
        })
    } else {
        const easylistPath = join('.', 'blocklists', 'easylist')
        const versions = JSON.parse(await fs.promises.readFile(join(easylistPath, 'versions.json'), 'utf-8'))
        return versions.map(({ date, ref }) => {
            const localPath = join(easylistPath, `${date}-${blocklist}.txt`)
            const url = `https://github.com/easylist/easylist/blob/${ref}/${blocklist}.txt?raw=true`
            return {
                date,
                url,
                localPath,
            }
        })
    }
}