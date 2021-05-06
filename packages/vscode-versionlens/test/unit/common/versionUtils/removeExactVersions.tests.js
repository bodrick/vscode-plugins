/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { removeExactVersions } from 'common/versionUtils';

const assert = require('assert');

export default {

  "removes exact matches": () => {
    const tests = [
      '1.2.3-zebra',
      '1.2.3-alpha',
      '1.2.3',
      '1.2.3-beta',
      '0.0.3',
      '1.2.3-rc',
      '5.0.0'
    ].map(version => ({ version }));

    const exactVersion = '1.2.3';
    const results = removeExactVersions.call(tests, exactVersion);
    results.map(tag => tag.version)
      .forEach(match => {
        assert.ok(match !== exactVersion, "did not filter exact matches");
      });

  }

}