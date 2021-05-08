/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const semver = require('semver');
const path = require('path');

export function npmPackageDirExists(packageJsonPath, packageName) {
  const fs = require('fs');
  const npm = require('npm');
  const npmFormattedPath = path.join(npm.dir, packageName);

  npm.localPrefix = packageJsonPath;
  return fs.existsSync(npmFormattedPath);
}

export function npmViewVersion(packagePath, packageName) {
  const npm = require('npm');

  return new Promise((resolve, reject) => {
    npm.load({ prefix: packagePath }, loadError => {
      if (loadError) {
        reject(loadError);
        return;
      }

      const silent = true;
      npm.commands.view([packageName, 'version'], silent, (viewError, response) => {
        if (viewError) {
          reject(viewError);
          return;
        }

        // get the keys from the object returned
        let keys = Object.keys(response);

        // ensure the version keys are semver sorted
        keys.sort((a, b) => {
          if (semver.gt(a, b))
            return 1;
          else if (semver.lt(a, b))
            return -1;

          return 0;
        });

        // take the last and most recent version key
        let lastKey = null;
        if (keys.length > 0)
          lastKey = keys[keys.length - 1];

        resolve(lastKey);
      });
    });
  });
}

export function npmViewDistTags(packagePath, packageName) {
  const npm = require('npm');

  return new Promise((resolve, reject) => {
    npm.load({ prefix: packagePath }, loadError => {
      if (loadError) {
        reject(loadError);
        return;
      }

      const silent = true;
      npm.commands.view([packageName, 'dist-tags'], silent, (viewError, response) => {
        if (viewError) {
          reject(viewError);
          return;
        }

        // get the keys from the object returned
        const keys = Object.keys(response);
        if (!keys.length)
          return reject({
            code: 'NPM_VIEW_EMPTY_RESPONSE',
            message: `NPM view did not return any tags for ${packageName}`
          })

        // take the first key and return the dist-tags keys
        const distTags = response[keys[0]]['dist-tags'];
        const tags = Object.keys(distTags)
          .map(key => ({
            name: key,
            version: distTags[key]
          }))

        // fixes a case where npm doesn't publish latest as the first dist-tag
        const latestIndex = tags.findIndex(item => item.name === 'latest');
        if (latestIndex > 0) {
          // extract the entry
          const latestEntry = tags.splice(latestIndex, 1);
          // re insert the entry at the start
          tags.splice(0, 0, latestEntry[0]);
        }

        resolve(tags);
      });
    });
  });
}

export function npmGetOutdated(packagePath) {
  const npm = require('npm');

  return new Promise((resolve, reject) => {
    npm.load({ prefix: packagePath }, loadError => {
      if (loadError) {
        reject(loadError);
        return;
      }

      npm.config.set('json', true);
      const silent = true;
      npm.commands.outdated(silent, (err, response) => {
        if (err) {
          if (err.code !== 'ETARGET') {
            reject(err);
            return;
          }
          response = "";
        }

        const outdatedResult = parseOutdatedResponse(response);
        resolve(outdatedResult);
      });
    });
  });
}

export function parseNpmArguments(packageName, packageVersion) {
  const npa = require('npm-package-arg');

  return new Promise(function (resolve, reject) {
    try {
      const npaParsed = npa.resolve(packageName, packageVersion);
      if (!npaParsed) {
        reject({ code: 'EUNSUPPORTEDPROTOCOL' });
        return;
      }
      resolve(npaParsed);
    } catch (err) {
      reject(err);
    }
  });
}

function parseOutdatedResponse(response) {
  let outdated = [];
  if (response.length > 0) {
    outdated = response.map(
      entry => ({
        path: entry[0],
        name: entry[1],
        current: entry[2],
        willInstall: entry[3],
        latest: entry[4],
        wanted: entry[5]
      })
    );
  }
  return outdated;
}