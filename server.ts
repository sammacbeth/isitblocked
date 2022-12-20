import express from 'express'
import guessUrlType, { RequestType } from '@remusao/guess-url-type';

import DDG from './src/ddg';
import { BlocklistVersion, getVersions } from './src/versions';
import AdblockerList from './src/adblocklist';
import IBlocklist from './src/blocklist';

const DEFAULT_SOURCE_URL = 'https://www.example.com/'

function blocklistMatcher(v: BlocklistVersion, engine: IBlocklist) {
    return (url: string, sourceUrl: string, type: RequestType) => {
        const result = engine.match(url, sourceUrl, type)
        return {
            blocked: result.match,
            version: v.date,
            info: result.info
        }
    }
}

const loadBlocklists = (async () => {
    return {
        ddg: (await getVersions('ddg')).map((v) => {
            const engine = new DDG(`http://localhost:${port}/${v.localPath}`, `http://localhost:${port}/blocklists/ddg/surrogates.txt`)
            engine.fetch()
            return blocklistMatcher(v, engine)
        }),
        easylist: (await getVersions('easylist')).map((v) => {
            const engine = new AdblockerList('easylist', [`http://localhost:${port}/${v.localPath}`])
            engine.fetch()
            return blocklistMatcher(v, engine)
        }),
        easyprivacy: (await getVersions('easyprivacy')).map((v) => {
            const engine = new AdblockerList('easyprivacy', [`http://localhost:${port}/${v.localPath}`])
            engine.fetch()
            return blocklistMatcher(v, engine)
        }),
    }
})()

const app = express()
const port = 9000
app.use('/blocklists', express.static('blocklists'))

app.get('/test', async (req, res) => {
    const url = req.query.url as string
    const sourceUrl = (req.query.sourceUrl as string) || DEFAULT_SOURCE_URL
    const type = (req.query.type as RequestType) || guessUrlType(url)

    console.log('/test', url, sourceUrl, type)
    const blocklists = await loadBlocklists
    try {
        res.status(200).json({
            results: {
                ddg: blocklists.ddg[0](url, sourceUrl, type),
                easylist: blocklists.easylist[0](url, sourceUrl, type),
                easyprivacy: blocklists.easyprivacy[0](url, sourceUrl, type),
            }
        }).end()
    } catch (e) {
        res.status(400).end()
    }
})

app.get('/history', async (req, res) => {
    const url = req.query.url as string
    const sourceUrl = (req.query.sourceUrl as string) || DEFAULT_SOURCE_URL
    const type = (req.query.type as RequestType) || guessUrlType(url)

    console.log('/history', url, sourceUrl, type)
    const blocklists = await loadBlocklists
    try {
        res.status(200).json({
            url,
            sourceUrl,
            type,
            results: {
                ddg: blocklists.ddg.map(match => match(url, sourceUrl, type)),
                easylist: blocklists.easylist.map(match => match(url, sourceUrl, type)),
                easyprivacy: blocklists.easyprivacy.map(match => match(url, sourceUrl, type)),
            }
        }).end()
    } catch (e) {
        res.status(400).end()
    }
})

app.listen(port)