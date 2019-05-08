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

const { Agent } = require('../../../core/agent.js')
const { DO, IF, say } = require('../../../core/lang.js')
const { getYesNo } = require('../../../core/patterns/ask.js')
const { fillDataframe } = require('../../../core/patterns/fill-dataframe.js')
const { testDialogue } = require('../../../core/test-utils/dialogue-test.js')

const { TestTransport } = require('../../../transports/test/test-transport')

const dataframeSpec = {
  name: 'hierarchy',
  slots: [
    {
      name: '1',
      children: [
        { name: '1.1', type: 'any' },
        {
          name: '1.2',
          children: [
            { name: '1.2.1', type: 'any', required: false },
            { name: '1.2.2', type: 'any' }]
        }
      ]
    },
    {
      name: '2',
      children: [
        { name: '2.1', type: 'any' }
      ]
    },
    { name: '3', type: 'any' },
    { name: '4', type: 'any', required: false }
  ],
  // eslint-disable-next-line no-unused-vars
  confirmDialog: slotValues => getYesNo('confirm')
}

const bot = new Agent(
  'DataframeBot',
  {
    icon: 'M'
  }
)

bot.tasks.main = DO(
  IF(fillDataframe(dataframeSpec),
    say('done'),
    say('sorry'))
)

let transport

beforeEach(() => {
  transport = new TestTransport({ app: bot })
  transport.init()
})

afterEach(() => {
  transport.stop()
})

describe('Fill dataframe', () => {
  test('Only leaf slots should be filled, not composite slots', done => {
    testDialogue(transport, done)
      .receive(['ask_1_1']) // No prompt for composite slot '1', prompt for leaf slot '1.1.'
      .run()
  })

  test('No prompt for slots that are not required', done => {
    testDialogue(transport, done)
      .receive(['ask_1_1'])
      .exchange('1_1', ['ask_1_2_2']) // No prompt for slot '1.2.1'
      .run()
  })

  test('Confirmation success', done => {
    testDialogue(transport, done)
      .receive(['ask_1_1'])
      .exchange('1_1', ['ask_1_2_2'])
      .exchange('1_2_2', ['ask_2_1'])
      .exchange('2_1', ['ask_3'])
      .exchange('3', ['confirm'])
      .exchange('yes', ['done'])
      .run()
  })

  test('Confirmation failure', done => {
    testDialogue(transport, done)
      .receive(['ask_1_1'])
      .exchange('1_1', ['ask_1_2_2'])
      .exchange('1_2_2', ['ask_2_1'])
      .exchange('2_1', ['ask_3'])
      .exchange('3', ['confirm'])
      .exchange('no', ['sorry'])
      .run()
  })
})
