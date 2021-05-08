/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { npmViewDistTags } from 'providers/npm/npmClient.js'

const mock = require('mock-require')
const assert = require('assert')

let npmMock = null
let testContext = null

export default {

  beforeAll: () => {
    // mock require modules
    npmMock = {
      commands: {}
    }
    mock('npm', npmMock)
  },

  // reset all require mocks
  afterAll: () => mock.stopAll(),

  beforeEach: () => {
    testContext = {}

    // mock defaults
    npmMock.load = (cli, cb) => cb(true)
    npmMock.commands.view = (name, args, cb) => cb()
  },

  "rejects on npm.load error": done => {
    npmMock.load = (cli, cb) => cb("load error")

    npmViewDistTags()
      .then(results => done(new Error("Should not be called")))
      .catch(actual => {
        assert.equal(actual, "load error", `actual = ${actual}`)
        done()
      })
  },

  "rejects on npm.view error": done => {
    npmMock.load = (cli, cb) => cb()
    npmMock.commands.view = (n, v, cb) => cb("view error")

    npmViewDistTags()
      .then(results => done(new Error("Should not be called")))
      .catch(actual => {
        assert.equal(actual, "view error", `actual = ${actual}`)
        done()
      })
  },

  "throws NPM_VIEW_EMPTY_RESPONSE when response is empty": done => {
    const response = {}
    npmMock.load = (cli, cb) => cb()
    npmMock.commands.view = (n, v, cb) => cb(null, response)

    npmViewDistTags()
      .then(results => done(new Error("Should not be called")))
      .catch(actual => {
        assert.equal(actual.code, 'NPM_VIEW_EMPTY_RESPONSE', `actual = ${actual}`)
        done()
      })
  },

  "returns tags in expected mapped format": done => {
    const testDistTags = {
      "latest": "2.6.1",
      "beta": "2.2.0",
      "legacy": "1.15.0"
    }

    const testResponse = {
      "*": {
        "dist-tags": testDistTags
      }
    }

    npmMock.load = (cli, cb) => cb()
    npmMock.commands.view = (n, v, cb) => cb(null, testResponse)

    npmViewDistTags()
      .then(actual => {
        const expectedDistTags = Object.keys(testDistTags)
          .map(name => {
            return {
              name,
              version: testDistTags[name]
            }
          })

        expectedDistTags.forEach((expectedDistTag, i) => {
          const actualDistTag = actual[i]
          assert.ok(actualDistTag !== null, `actual = ${actualDistTag}`)
          assert.equal(actualDistTag.name, expectedDistTag.name, `actual = ${actualDistTag.name}`)
          assert.equal(actualDistTag.version, expectedDistTag.version, `actual = ${actualDistTag.version}`)
        })

        done()
      })
      .catch(error => done(error))
  },

  "always returns the the latest tag as the top entry": done => {
    const testDistTags = {
      "beta": "2.2.0",
      "latest": "2.6.1",
      "legacy": "1.15.0"
    }

    const testResponse = {
      "*": {
        "dist-tags": testDistTags
      }
    }

    npmMock.load = (cli, cb) => cb()
    npmMock.commands.view = (n, v, cb) => cb(null, testResponse)

    npmViewDistTags()
      .then(actual => {
        const [actualDistTag] = actual
        assert.ok(actualDistTag !== null, `actual = ${actualDistTag}`)
        assert.equal(actualDistTag.name, 'latest', `actual = ${actualDistTag.name}`)
        assert.equal(actualDistTag.version, '2.6.1', `actual = ${actualDistTag.version}`)
        done()
      })
      .catch(error => done(error))
  }

}