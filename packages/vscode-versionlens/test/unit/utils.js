/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const path = require('path');
const fs = require('fs');

// export interface TestFixture {
//   path: string;
//   basename: string;
//   content: string;
// }

export class TestFixtureMap {
  cache;
  fixtureRootPath;

  constructor(relativeFixtureRootPath) {
    const testPath = path.join(__dirname, '../../test');
    this.fixtureRootPath = path.join(testPath, relativeFixtureRootPath);
    if (fs.existsSync(this.fixtureRootPath) === false) {
      throw new ReferenceError("Fixture root path not found. " + this.fixtureRootPath);
    }
    this.cache = {};
  }

  read(fixtureRelativePath) {
    let cachedEntry = this.cache[fixtureRelativePath];
    if (cachedEntry === undefined) {
      let fullPath = path.join(this.fixtureRootPath, fixtureRelativePath);
      if (fs.existsSync(fullPath) === false) {
        throw new ReferenceError("Path not found. " + fullPath);
      }

      if (fs.statSync(fullPath).isFile() === false) {
        throw new ReferenceError("Path must be a valid file location. " + fullPath);
      }

      cachedEntry = {
        path: fullPath,
        basename: path.basename(fullPath),
        content: fs.readFileSync(fullPath).toString()
      };
      
      this.cache[fixtureRelativePath] = cachedEntry;
    }

    return cachedEntry;
  }

}

export function generatePackage(name, version, info) {
  return {
    name,
    version,
    meta: info
  }
}