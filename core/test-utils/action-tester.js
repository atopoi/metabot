/*
 * Copyright 2019 Nu Echo Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const _ = require('lodash')

const Context = require('../context.js')
const { toValue } = require('../entity.js')
const { toUtterance } = require('../utterance.js')
const { exec, guard } = require('../lang.js')

const noIoContext = (answers = []) => {
  const ctx = Context.createContext()
  ctx.testMode = { noIO: true, answers }
  return ctx
}


const checkTestResult = (result, shouldFail, expectedValue) => {
  if (shouldFail) {
    expect(result.failure).not.toBeNull()
    if (expectedValue !== undefined) {
      expect(result.failure).toEqual(expectedValue)
    }
  } else {
    expect(result.failure).toBeNull()
    expect(toValue(result.val)).toEqual(expectedValue)
  }
}


const readAnswer = answer => {
  if (_.isString(answer)) {
    const text = answer.trim()
    if (text.startsWith('{') && text.endsWith('}')) {
      const obj = JSON.parse(text)
      // TODO: validate
      return { text, nlu: { intents: [{ entities: [obj] }] } }
    }
    if (text.startsWith('#')) {
      // TODO: spec and proper parsing
      return { text, nlu: { intents: [{ name: text.slice(1) }] } }
    }
    return { text }
  }
  return { nlu: { intents: [{ entities: [answer] }] } }
}


// Use ff for tests that expect user input
const ff = (description, action, answers, shouldFail, expectedValue) => test(
  description,
  async () => {
    const userUtterances = answers.map(readAnswer).map(toUtterance)
    const ctx = noIoContext(userUtterances)
    const result = await action.run(ctx)

    checkTestResult(result, shouldFail, expectedValue)
  }
)


// Use tt for tests that don't expect user input
const tt = (description, action, shouldFail, expectedValue) => test(description, async () => {
  const ctx = noIoContext()
  const result = await action.run(ctx)

  checkTestResult(result, shouldFail, expectedValue)
})


class TestCounter {
  constructor(max) {
    this.max = max
    this.count = 0
    const cc = this
    this.getCount = exec(() => cc.count)
    this.iter = guard(
      () => {
        if (cc.done()) return false
        cc.count += 1
        return cc.count
      }
    )
  }

  done() {
    return this.max !== undefined && this.count >= this.max
  }

  reset() {
    this.count = 0
    return true
  }
}

const makeCounter = n => new TestCounter(n)


module.exports = {
  ff, tt, makeCounter
}
