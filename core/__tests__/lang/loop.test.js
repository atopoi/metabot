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

const {
  DO, fail, succeed, loop, loopWhile, repeat
} = require('../../lang.js')

const { tt, makeCounter } = require('../../test-utils/action-tester.js')


// Tests

describe('counter', () => {
  let cc = makeCounter(2)
  tt('should succeed: increment the counter',
    cc.iter, false, 1)

  tt('should succeed: increment the counter once more',
    cc.iter, false, 2)

  tt('should fail: increment the counter passed the limit',
    cc.iter, true)

  cc = makeCounter(5)
  tt('should succeed if the counter value is 2',
    DO(cc.iter, cc.iter, cc.getCount), false, 2)

  cc = makeCounter(5)
  tt('should succeed if the counter is reset to 0',
    DO(cc.iter, () => cc.reset(), cc.getCount), false, 0)

  const cc2 = makeCounter(5)
  tt('should succeed if the counter increment independently to 2 and 1',
    DO(cc.iter,
      cc.iter,
      cc2.iter,
      cc.getCount,
      c => DO(
        cc2.getCount,
        c2 => succeed(`${c} ${c2}`)
      )),
    false, '2 1')
})


describe('loop', () => {
  const cc = makeCounter(5)
  tt('should succeed, and run loop 5 times and continueLoopIfFailed is false',
    DO(loop(cc.iter), cc.getCount), false, 5)
})


describe('loopWhile', () => {
  let cc = makeCounter(5)
  tt('should succeed if it loops 5 times and returns 5',
    DO(loopWhile(cc.iter, succeed(true)), cc.getCount), false, 5)

  cc = makeCounter(5)
  tt('should succeed if it loops 5 times and returns 5 even if the main action fails',
    DO(loopWhile(cc.iter, fail()), cc.getCount), false, 5)

  cc = makeCounter(5)
  tt('should succeed if if the loop did not run',
    DO(loopWhile(fail(), cc.iter), cc.getCount), false, 0)
})


describe('repeat', () => {
  tt('should succeed with last iteration\'s result',
    repeat(3, succeed(12)), false, 12)

  const cc = makeCounter()
  tt('should succeed if repeated 3 times',
    DO(repeat(3, cc.iter), cc.getCount), false, 3)

  tt('should fail: last iteration on the loop body fails',
    repeat(12, fail()), true)
})
