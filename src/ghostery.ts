import fetch from 'node-fetch';
import IBlocklist from "./blocklist";
import { ImmutableURL } from '@cliqz/url-parser';

export default class GhosteryBlocking implements IBlocklist {
  name = 'Ghostery'
  db: any

  async serialize(): Promise<Uint8Array> {
    return Buffer.from(JSON.stringify(this.db), 'utf-8');
  }
  async fetch(): Promise<void> {
    const req = await fetch('https://cdn.ghostery.com/update/v3.1/bugs')
    this.db = await req.json();
  }
  async deserialize(buf: Uint8Array): Promise<void> {
    this.db = JSON.parse(Buffer.from(buf).toString('utf-8'));
  }
  async match(url: string): Promise<{ match: boolean; info: string }> {
    const { hostname, pathname } = new ImmutableURL(url);
    let path = pathname ? pathname.substr(1) : '';
    const found =
      // pattern classification 2: check host+path hash
      _matchesHost(this.db.patterns.host_path, hostname, path) ||
      // class 1: check host hash
      _matchesHost(this.db.patterns.host, hostname) ||
      // class 3: check path hash
      _matchesPath(this.db.patterns.path, path);

    let info = {
      name: 'Unknown',
      cat: 'unknown',
    }
    try {
      info = found && found in this.db.bugs ? this.db.apps[this.db.bugs[found].aid] : {}
    } catch(e) {}
    
    return {
      match: !!found,
      info: found ? `Tracker match: ${info.name}, category ${info.cat} (bugID ${found})` : '',
    }
  }
}

/*
 * Ghostery matching implementation from ghostery-extension code:
 * https://github.com/ghostery/ghostery-extension/blob/master/src/utils/matcher.js
 */
function _matchesHostPath(roots, src_path) {
	let root;
	let paths;
	let i;
	let j;

	for (i = 0; i < roots.length; i++) {
		root = roots[i];
		if (root.hasOwnProperty('$')) {
			paths = root.$;
			for (j = 0; j < paths.length; j++) {
				if (src_path.startsWith(paths[j].path)) {
					return paths[j].id;
				}
			}
		}
	}

	return false;
}

function _matchesHost(root, src_host, src_path?) {
	const host_rev_arr = src_host.split('.').reverse();
	const nodes_with_paths = [];
	let	host_part;
	let node = root;
	let bug_id = false;

	for (let i = 0; i < host_rev_arr.length; i++) {
		host_part = host_rev_arr[i];
		// if node has domain, advance and try to update bug_id
		if (node.hasOwnProperty(host_part)) {
			// advance node
			node = node[host_part];
			bug_id = (node.hasOwnProperty('$') ? node.$ : bug_id);

			// we store all traversed nodes that contained paths in case the final
			// node does not have the matching path
			if (src_path !== undefined && node.hasOwnProperty('$')) {
				nodes_with_paths.push(node);
			}

		// else return bug_id if it was found
		} else {
			// handle path
			if (src_path !== undefined) {
				return _matchesHostPath(nodes_with_paths, src_path);
			}

			return bug_id;
		}
	}

	// handle path
	if (src_path !== undefined) {
		return _matchesHostPath(nodes_with_paths, src_path);
	}

	return bug_id;
}

function _matchesPath(paths, src_path) {
	// const paths = bugDb.db.patterns.path;

	// NOTE: we re-add the "/" in order to match patterns that include "/"
	const srcPath = `/${src_path}`;

	for (const path in paths) {
		if (srcPath.includes(path)) {
			return paths[path];
		}
	}

	return false;
}