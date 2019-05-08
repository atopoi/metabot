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
  DO, filter
} = require('../../lang.js')

const { askOnce } = require('../../lang.js')
const { ff } = require('../../test-utils/action-tester.js')


describe('ask input format', () => {
  describe('test input given as text, NLU objects, or NLU objects serialized as json', () => {
    const askInt = askOnce('Enter an integer', { type: 'int' })
    const expectInt = n => DO(askInt, filter(x => x.val === n))

    ff('type int, text input, parses as int,', askInt, ['25'], false, 25)
    ff('type int, object input, value is int with type int', askInt, [{ type: 'int', val: 25 }], false, 25)
    ff('type int, object input, value is int, no type specified', askInt, [{ type: 'int', val: 25 }], false, 25)
    ff('type int, object input, value is expected int', expectInt(25), [{ type: 'int', val: 25 }], false, 25)
    ff('type int, json input, value is expected int', expectInt(25), ['{"type": "int", "val": 25}'], false, 25)
    ff('type int, object input, wrong answer -> fail', expectInt(25), [{ type: 'int', val: 24 }], true)
    ff('type int, json input, wrong asnwer -> fail', expectInt(25), ['{"type": "int", "val": 24}'], true)
    ff('type int, json input, expect 0, input value is 0', expectInt(0), ['{"type": "int", "val": 0}'], false, 0)
    ff('type int, json input, expect 0, no input -> fail', expectInt(0), ['{"type": "int", "val": ""}'], true)
    ff('type any, json input, type any, value is int as string -> fail', expectInt(25), ['{"type": "any", "val": "25"}'], true)
    ff('type unspecified, json input, no type, value is int as string -> fail', expectInt(25), ['{"val": "25"}'], true)
    ff('type int, json input, bad input type -> fail', expectInt(25), ['{"type": "int", "val": "25"}'], true)
  })
})
