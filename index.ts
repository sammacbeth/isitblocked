import envPaths = require('env-paths');
import Listr = require('listr');
import fs = require('fs-extra');
import { join } from 'path';
import program = require('commander')
import lists from './src/lists';

const paths = envPaths('whoblocksme', { suffix: '' });
program.requiredOption('-u --url <url>', 'URL to test')
  .option('--no-fetch', 'Do not fetch lists automatically', false)
  .option('--no-update', 'Do not update out-of-date lists', false);
program.parse(process.argv);

const testUrl = program.url;
const checkLists = lists;
const expiry = Date.now() - (24 * 60 * 60 * 1000)
const loadLists = new Listr(checkLists.map((list) => {
  return {
    title: `${list.name}`,
    task: async () => {
      const fileName = join(paths.data, list.name);
      const exists = await fs.exists(fileName);
      if (!exists && !program.fetch) {
        throw new Error('List not available locally, need to fetch')
      }
      const shouldUpdate = !exists || (program.update && (await fs.stat(fileName)).mtime < expiry);
      if (shouldUpdate) {
        await list.fetch();
        await fs.mkdirp(paths.data);
        await fs.writeFile(fileName, await list.serialize());
      } else {
        await list.deserialize(await fs.readFile(fileName));
      }
    },
  }
}), { concurrent: true })
const tasks = new Listr([{
  title: 'Fetch and load block lists',
  task: () => loadLists,
}, {
  title: `Test URL ${testUrl}`,
  task: () => {
    return new Listr(checkLists.map((list) => {
      return {
        title: list.name,
        task: async () => {
          const { match, info } = await list.match(testUrl);
          if (match) {
            throw new Error(info);
          }
        }
      }
    }), { concurrent: true, exitOnError: false });
  }
}])

tasks.run().catch(err => {
  //
});