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

const { askOnce, say } = require('../../../core/lang.js')

const { ff, tt } = require('../../test-utils/action-tester.js')


describe('say', () => {
  tt('should succeed and return the message',
    say('x'), false, 'x')
})


describe('askOnce', () => {
  ff('should succeed and return the answer',
    askOnce('Your name?'),
    ['Homer'],
    false,
    'Homer')

  ff('should succeed with an integer response and return the answer',
    askOnce('Your name?', { type: 'int' }),
    ['12'],
    false,
    12)

  ff('should fail : response not int',
    askOnce('Your age', { type: 'int' }),
    ['aa'],
    true)
})
