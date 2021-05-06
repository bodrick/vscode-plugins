/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { npmPackageParser } from 'providers/npm/npmPackageParser.js';
import * as npmClientModule from 'providers/npm/npmClient.js';
import appSettings from 'common/appSettings.js';

const assert = require('assert');
const mock = require('mock-require');

let testContext = {}

export default {

  // reset all require mocks
  afterAll: () => mock.stopAll,

  beforeAll: () => {
    testContext = {}

    // default config mock
    testContext.githubTaggedCommitsMock = ['Commit', 'Release', 'Tag']

    // default api mock
    npmClientModule.npmViewVersion = _ => Promise.resolve(null)
  },

  beforeEach: () => {
    testContext.appContribMock = {}
    Reflect.defineProperty(
      testContext.appContribMock,
      "githubTaggedCommits", {
        get: () => testContext.githubTaggedCommitsMock
      }
    )

    Reflect.defineProperty(
      appSettings,
      "showTaggedVersions", {
        get: () => false
      }
    )
  },

  'returns the expected object for non ranged semver versions': done => {
    const packagePath = '.';
    const name = 'bootstrap';
    const version = '1.2.3';

    npmClientModule.npmViewVersion = _ => Promise.resolve('1.2.3')

    const parsedResults = npmPackageParser(packagePath, name, version, testContext.appContribMock);
    Promise.resolve(parsedResults)
      .then(results => {
        assert.equal(results[0].name, 'bootstrap', "Expected packageName");
        assert.equal(results[0].version, '1.2.3', "Expected packageVersion");
        assert.equal(results[0].meta.type, 'npm', "Expected meta.type");
        assert.ok(!results[0].meta.tag.isInvalid, "Expected meta.tag.isInvalid");
        assert.ok(results[0].meta.tag.isFixedVersion, "Expected meta.tag.isFixedVersion to be true");
        assert.equal(results[0].customGenerateVersion, null, "Expected customGenerateVersion");
        done();
      })
      .catch(err => done(err));
  },

  'returns the expected object for ranged semver versions': done => {
    const packagePath = '.';
    const name = 'bootstrap';
    const version = '~1.2.3';

    // mock the api
    npmClientModule.npmViewVersion = _ => Promise.resolve("1.2.3")

    const parsedResults = npmPackageParser(packagePath, name, version, testContext.appContribMock);
    Promise.resolve(parsedResults)
      .then(results => {
        assert.equal(results[0].name, 'bootstrap', "Expected packageName");
        assert.equal(results[0].version, '~1.2.3', "Expected packageVersion");
        assert.equal(results[0].meta.type, 'npm', "Expected meta.type");
        assert.ok(!results[0].meta.tag.isInvalid, "Expected meta.tag.isInvalid");
        assert.ok(!results[0].meta.tag.isFixedVersion, "Expected meta.tag.isFixedVersion to be false");
        assert.equal(results[0].customGenerateVersion, null, "Expected customGenerateVersion");
        done();
      })
      .catch(err => done(err));
  },

  'returns the expected object for file versions': done => {
    const packagePath = '.';
    const name = 'another-project';
    const version = 'file:../another-project';

    const parsedResults = npmPackageParser(packagePath, name, version, testContext.appContribMock);
    Promise.resolve(parsedResults)
      .then(result => {
        assert.equal(result.name, 'another-project', `Expected packageName. result.name = ${result.name}`);
        assert.equal(result.version, 'file:../another-project', `Expected packageVersion. result.version = ${result.packageVersion}`);
        assert.equal(result.meta.type, 'file', `Expected meta.type. result.meta.type = ${result.meta.type}`);
        assert.equal(result.meta.remoteUrl, '../another-project', "Expected meta.remoteUrl");
        assert.equal(result.customGenerateVersion, null, "Expected customGenerateVersion");
        done();
      })
      .catch(err => done(err));
  },

  'returns the expected object for github versions': done => {
    const packagePath = '.';
    const name = 'bootstrap';
    const version = 'twbs/bootstrap#v10.2.3-alpha';

    const parsedResults = npmPackageParser(packagePath, name, version, testContext.appContribMock);
    Promise.resolve(parsedResults)
      .then(results => {
        results.forEach((result, index) => {
          assert.equal(result.name, 'bootstrap', "Expected packageName");
          assert.equal(result.version, 'twbs/bootstrap#v10.2.3-alpha', "Expected packageName");
          assert.equal(result.meta.category, testContext.githubTaggedCommitsMock[index], `Expected meta.category ${result.meta.category} == ${testContext.githubTaggedCommitsMock[index]}`);
          assert.equal(result.meta.type, 'github', "Expected meta.type");
          assert.equal(result.meta.remoteUrl, `https://github.com/${result.meta.userRepo}/commit/${result.meta.commitish}`, "Expected meta.remoteUrl");
          assert.equal(result.meta.userRepo, 'twbs/bootstrap', "Expected meta.userRepo");
          assert.equal(result.meta.commitish, 'v10.2.3-alpha', "Expected meta.commitish");
          assert.ok(!!result.customGenerateVersion, "Expected package.customGenerateVersion");
        });
        done();
      })
      .catch(err => done(err));
  },

  'returns the expected object for git+http+github versions': done => {
    const packagePath = '.';
    const name = 'bootstrap';
    const version = 'git+https://git@github.com/twbs/bootstrap.git#v10.2.3-alpha';

    const parsedResults = npmPackageParser(packagePath, name, version, testContext.appContribMock);
    Promise.resolve(parsedResults)
      .then(results => {
        results.forEach((result, index) => {
          assert.equal(result.name, 'bootstrap', "Expected packageName");
          assert.equal(result.version, 'twbs/bootstrap#v10.2.3-alpha', "Expected packageName");
          assert.equal(result.meta.category, testContext.githubTaggedCommitsMock[index], `Expected meta.category ${result.meta.category} == ${testContext.githubTaggedCommitsMock[index]}`);
          assert.equal(result.meta.type, 'github', "Expected meta.type");
          assert.equal(result.meta.remoteUrl, `https://github.com/${result.meta.userRepo}/commit/${result.meta.commitish}`, "Expected meta.remoteUrl");
          assert.equal(result.meta.userRepo, 'twbs/bootstrap', "Expected meta.userRepo");
          assert.equal(result.meta.commitish, 'v10.2.3-alpha', "Expected meta.commitish");
          assert.ok(!!result.customGenerateVersion, "Expected package.customGenerateVersion");
        });
        done();
      })
      .catch(err => done(err));
  }

}