import envPaths = require("env-paths");
import Listr = require("listr");
import fs = require("fs-extra");
import { join } from "path";
import program = require("commander");
import lists from "./src/lists";
import { guessTypeFromPath } from "./src/util"

const paths = envPaths("isitblocked", { suffix: "" });
program
  .option("-u --url <url>", "URL to test")
  .option("-h --hostname <hostname>", "Hostname to test")
  .option("-s --source <source>", "Source (first party) URL", "https://www.example.com")
  .option("-t --type <type>", "Request type (e.g. 'script', 'xmlhttprequest'")
  .option("--no-fetch", "Do not fetch lists automatically", false)
  .option("--no-update", "Do not update out-of-date lists", false)
  .option("--no-cache", "Do not use cached lists", false);
program.parse(process.argv);

if (!program.url && !program.hostname) {
  program.outputHelp();
  process.exit();
}

const testUrl = program.url || `https://${program.hostname}/`;
const checkLists = lists;
const expiry = Date.now() - 24 * 60 * 60 * 1000;
const loadLists = new Listr(
  checkLists.map(list => {
    return {
      title: `${list.name}`,
      task: async () => {
        const fileName = join(paths.data, list.name);
        const exists = await fs.exists(fileName);
        if (!exists && !program.fetch) {
          throw new Error("List not available locally, need to fetch");
        }
        const shouldUpdate =
          !exists || !program.cache ||
          (program.update && (await fs.stat(fileName)).mtime < expiry);
        if (shouldUpdate) {
          await list.fetch();
          await fs.mkdirp(paths.data);
          await fs.writeFile(fileName, await list.serialize());
        } else {
          await list.deserialize(await fs.readFile(fileName));
        }
      }
    };
  }),
  { concurrent: true }
);
const tasks = new Listr([
  {
    title: "Fetch and load block lists",
    task: () => loadLists
  },
  {
    title: `Test URL ${testUrl}`,
    task: () => {
      return new Listr(
        checkLists.map(list => {
          return {
            title: list.name,
            task: async () => {
              const { match, info } = await list.match(testUrl, program.source, program.type || guessTypeFromPath(testUrl));
              if (match) {
                throw new Error(info.toString());
              }
            }
          };
        }),
        { concurrent: true, exitOnError: false }
      );
    }
  }
]);

tasks.run().catch(err => {
  //
});
