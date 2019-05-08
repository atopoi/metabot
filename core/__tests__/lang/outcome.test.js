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
  fail, succeed, throwException, succeedIf
} = require('../../../core/lang.js')

const { tt } = require('../../test-utils/action-tester.js')

describe('succeed', () => {
  tt('should return success',
    succeed(12), false, 12)
})

describe('fail', () => {
  tt('should return failure',
    fail('error'), true, 'error')
})

describe('throwException', () => {
  tt('should return exception',
    throwException('error', { detailedErrorMessage: 'detailed error' }), true, 'exception')
})


describe('succeedIf', () => {
  tt('should succeed: predicate returns true',
    succeedIf(x => x > 10)(20), false, 20)

  tt('should fail: predicate returns false',
    succeedIf(x => x > 10)(5), true)

  tt('should succeed: predicate returns true, action result is false',
    succeedIf(x => x)(true), false, true)

  tt('should succeed: predicate returns 0, action result is 0',
    succeedIf(x => x)(0), false, 0)

  tt('should fail: predicate returns false',
    succeedIf(x => x)(0), false, 0)

  tt('should succeed: predicate returns true, result returns false',
    succeedIf(x => !x)(false), false, false)

  tt('should fail: predicate returns false, result returns false',
    succeedIf(x => !x)(true), true)
})
