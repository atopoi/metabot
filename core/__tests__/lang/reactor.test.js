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
  succeed,
  say,
  DO,
  LET,
  GET,
  SET,
  ON
} = require('../../lang.js')
const { ask } = require('../../patterns/ask.js')

const { ff } = require('../../test-utils/action-tester.js')


describe('ON basics', () => {
  const A1 = DO(
    ON('help', x => say(`I will help you with *${x}*!`)),
    ask('What\'s your name?'),
  )

  ff('should succeed: reactor not matched',
    A1,
    ['Zorro'],
    false,
    'Zorro')

  ff('should succeed: reactor matched once',
    A1,
    ['help', 'Zorro'],
    false,
    'Zorro')

  ff('should succeed: reactor matched many times, not consuming ask attempts',
    A1,
    ['help', 'help', 'help', 'help', 'Zorro'],
    false,
    'Zorro')
})


describe('ON with ask and types', () => {
  const A2 = DO(
    ON('help', x => say(`I will help you with *${x.val}*!`)),
    ask({ message: 'Your age', type: 'int', maxAttempts: 2 }),
  )

  ff('should succeed: no reactor match, ask type match',
    A2,
    ['1'],
    false,
    1)

  ff('should succeed: reactor match, then ask type match',
    A2,
    ['help', '1'],
    false,
    1)

  ff('should succeed: reactor matches, wihtout consuming attemps',
    A2,
    ['help', 'a', '1'],
    false,
    1)

  ff('should fail: reactor matches, ask fails with no attempts left',
    A2,
    ['help', 'a', 'a', '1'],
    true)

  ff('should succeed: reactor matches wihtout consuming attemps, mix order',
    A2,
    ['a', 'help', '1'],
    false,
    1)

  ff('should succeed: many reactor matches, not affecting  as attempts',
    A2,
    ['help', 'help', 'help', '1'],
    false,
    1)
})

describe('ON with effects', () => {
  const A3 = DO(
    LET('flag', succeed('no')),
    ON('change', SET('flag', 'yes')),
    ask('What\'s your name?'),
    GET('flag')
  )

  ff('should succeed: reactor not called, no side effect',
    A3,
    ['Zorro'],
    false,
    'no')

  ff('should succeed: reactor called, flag modified',
    A3,
    ['change', 'Zorro'],
    false,
    'yes')
})


describe('ON with nested event reactors', () => {
  const A4 = DO(
    ON('help', x => say(`I will help you with *${x.val}*!`)),
    ask('What\'s your name?'),
    x => DO(
      ask('Your friend?'),
      y => `${x.val} ${y.val}`
    )
  )

  ff('should succeed: mix reactor/ask answers',
    A4,
    ['help', 'Zorro', 'help', 'Homer'],
    false,
    'Zorro Homer')

  ff('should succeed: mix reactor/ask answers with many help requests',
    A4,
    ['help', 'Zorro', 'help', 'help', 'help', 'Homer'],
    false,
    'Zorro Homer')

  const A5 = DO(
    LET('flag', succeed('state0')),
    ON('changeflag', x => SET('flag', 'state1')),
    ask('What\'s your name?'),
    x => DO(
      ON('changeflag',
        DO(
          say('react: changing flag'),
          SET('flag', `last_${x.val}`)
        )),
      ask('What\'s your age?', 'int'),
      y => DO(
        GET('flag'),
        flag => say(`${x.val} ${y.val} ${flag}`)
      )
    )
  )

  ff('should succeed: mix reactor/ask flow 1',
    A5,
    ['Zorro', '33', 'changeflag'],
    false,
    'Zorro 33 state0')

  ff('should succeed: mix reactor/ask flow 2',
    A5,
    ['changeflag', 'Zorro', '33'],
    false,
    'Zorro 33 state1')

  ff('should fail: mix reactor/ask flow 3',
    A5,
    ['Zorro', 'changeflag', 'Homer'],
    true)

  // TODO: should work!!
  /*
  ff('should succeed: mix reactor/ask flow 4',
    A5,
    ['changeflag', 'Zorro', 'changeflag', '44'],
    false,
    'Zorro 44 last_Zorro')
    */
})
