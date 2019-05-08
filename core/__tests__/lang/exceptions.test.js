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

/* eslint no-unused-vars: 0 */
/*
====================================
 Basic Metabot language tests
====================================
 */

const {
  throwException,
  succeed,
  DO,
  TASK
} = require('../../lang.js')
const { ask } = require('../../patterns/ask.js')
const { Agent } = require('../../../core/agent.js')

const { ff, tt } = require('../../test-utils/action-tester.js')


const action1 = DO(
  throwException('error1')
)
action1.handlers.error1 = succeed('handled')


const action2 = DO(
  throwException('error1'),
  succeed('unreachable')
)
action2.handlers.error1 = succeed('handled')


const action3 = TASK(
  'test',
  DO(
    throwException('error1'),
    succeed('unreachable')
  )
)
action3.handlers.error1 = succeed('handled')


const action4 = DO(
  ask('ask int 4', 'int'),
  x => throwException(x.val === 1 ? 'error1' : 'error2')
)
action4.handlers.error1 = succeed('handled1')
action4.handlers.error2 = succeed('handled2')


const action5 = DO(
  ask({
    message: 'ask int 5', type: 'int', maxAttempts: 3, exceptionOnMaxAttempts: true
  })
)
action5.handlers.maxAttempts = succeed('try later')


const agent1 = new Agent(
  'agent1',
  {
    handlers: {
      maxAttempts: succeed('try later')
    }
  }
)
agent1.tasks.main = ask({
  message: 'ask int agent 1', type: 'int', maxAttempts: 2, exceptionOnMaxAttempts: true
})


const agent2 = new Agent(
  'agent2',
  {
    policy: {
      ask: { exceptionOnMaxAttempts: true }
    },
    handlers: {
      maxAttempts: succeed('try later')
    }
  }
)
agent2.tasks.main = ask({
  message: 'ask int agent 2', type: 'int', maxAttempts: 3
})


describe('exceptions', () => {
  tt('catch simple exception with handler',
    action1,
    false,
    'handled')

  tt('catch simple exception with handler in DO',
    action2,
    false,
    'handled')

  tt('catch simple exception with handler in a task',
    action3,
    false,
    'handled')

  ff('catch with multiple exceptions 1',
    action4,
    ['1'],
    false,
    'handled1')

  ff('catch with multiple exceptions 2',
    action4,
    ['2'],
    false,
    'handled2')

  ff('catch maxAttempts exception, specified in ask params',
    action5,
    ['a', 'a', 'a'],
    false,
    'try later')

  ff('catch maxAttempts in agent, specified in ask params',
    agent1,
    ['a', 'a', 'a'],
    false,
    'try later')

  ff('catch maxAttempts in agent, specified in global policy',
    agent2,
    ['a', 'a', 'a'],
    false,
    'try later')
})
