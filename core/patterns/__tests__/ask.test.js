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
  DO, fail, ON, say
} = require('../../lang.js')

const {
  actionMenu, ask, getYesNo, select
} = require('../../patterns/ask.js')

const { ff } = require('../../test-utils/action-tester.js')


/* ask */

describe('ask', () => {
  describe('parameters', () => {
    ff('message',
      ask('Your age?'), ['25'], false, '25')

    ff('message and type',
      ask('Your age?', 'int'), ['25'], false, 25)

    ff('message and type - maxAttempts reached',
      ask('Your age?', 'int'), ['abc'], true)

    ff('parameters object - message as string',
      ask({ message: 'Your age?', type: 'int' }),
      ['25'],
      false,
      25)

    ff('parameters object - messages as array',
      ask({ message: ['Your age?(1)', 'Your age?(2)', 'Your age?(3)'], type: 'int' }),
      ['25'],
      false,
      25)

    ff('parameters object - type not specified',
      ask({ message: 'Your age?' }),
      ['25'],
      false,
      '25')
  })


  describe('outcome', () => {
    ff('type: any, accept and return the answer',
      ask('Your name?'),
      ['Homer'],
      false,
      'Homer')

    ff('no type, accept and return the answer',
      ask('Your name?'),
      ['Homer'],
      false,
      'Homer')

    ff('type: int, success',
      ask({ message: 'Your age? (enter 25)', type: 'int' }),
      ['25'],
      false,
      25)

    ff('type: int, success in 2 attempts',
      ask({ message: 'Your age? (enter 25)', type: 'int', maxAttempts: 3 }),
      ['a', '25'],
      false,
      25)

    ff('type: int, success in many attempts',
      ask({ message: 'Your age? (25)', type: 'int', maxAttempts: 5 }),
      ['a', 'b', 'c', 'd', '25'],
      false,
      25)

    ff('type int: fail if the answer doesn\'t match the type, only one answer',
      ask({ message: 'Your age?', type: 'int', maxAttempts: 1 }),
      ['John'],
      true)

    ff('basic chaining with map/then',
      ask('Your name?')
        .map(name => `Hi ${name.val}!\nNow your nickname?`)
        .then(ask)
        .map(nickname => `Nice to meet you ${nickname.val}!!`)
        .then(say),
      ['Jean Lavoie', 'Zorro'],
      false,
      'Nice to meet you Zorro!!')

    ff('chaining in DO with arrows/map/bind',
      DO(
        ask("Take2, Again what's your name?"),
        name => ask(`Hi ${name.val}!\nNow your nickname?`),
        nickname => `Nice to meet you ${nickname.val}!!`,
        say
      ),
      ['Jean Lavoie', 'Zorro'],
      false,
      'Nice to meet you Zorro!!')
  })


  describe('attempts', () => {
    ff('attempts under max attempts default 3',
      ask({ message: ['Your age?(1)', 'Your age?(2)', 'Your age?(3)'], type: 'int', maxAttempts: 3 }),
      ['xyz', 'abc', '25'],
      false,
      25)

    ff('fail: attempts reach max attempts = 1',
      ask({ message: ['Your age?(1)', 'Your age?(2)', 'Your age?(3)'], type: 'int', maxAttempts: 1 }),
      ['xyz', 'abc', 'def'],
      true,
      'maxAttempts')

    ff('fail: attempts reach max attempts deafult 3',
      ask({ message: ['Your age?(1)', 'Your age?(2)', 'Your age?(3)'], type: 'int', maxAttempts: 3 }),
      ['xyz', 'abc', 'def'],
      true,
      'maxAttempts')

    ff('fail: max attempts with exception',
      ask({ message: ['Your age?(1)', 'Your age?(2)', 'Your age?(3)'], type: 'int', exceptionOnMaxAttempts: true }),
      ['xyz', 'abc', 'def'],
      true,
      'exception')

    ff('attempts number a lower than maxAttempts',
      ask({ message: 'Your age? (enter a non integer)', type: 'int', maxAttempts: 5 }),
      ['ZZZ', 'ZZZ', 'ZZZ', 'ZZZ', '25'],
      false,
      25)

    ff('fail: attempts number is equal to maxAttempts',
      ask({ message: 'Your age? (enter a non integer)', type: 'int', maxAttempts: 5 }),
      ['ZZZ', 'ZZZ', 'ZZZ', 'ZZZ', 'ZZZ'],
      true)

    ff('fail: attempts number over maxAttempts',
      ask({ message: 'Your age? (enter a non integer)', type: 'int', maxAttempts: 5 }),
      ['ZZZ', 'ZZZ', 'ZZZ', 'ZZZ', 'ZZZ', '25'],
      true)

    ff('fail: attempts number is equal to default maxAttempts (3)',
      ask({ message: 'Your age? (enter a non integer)', type: 'int' }),
      ['ZZZ', 'ZZZ', 'ZZZ'],
      true)

    ff('within max attempts limit with reactor interruption',
      DO(
        ON('help', say('help')),
        ask({ message: ['Your age?(1)', 'Your age?(2)', 'Your age?(3)'], type: 'int' })
      ),
      ['xyz', 'abc', 'help', '25'],
      false,
      25)

    ff('over max attempts with reactor interruption',
      DO(
        ON('help', say('help')),
        ask({ message: ['Your age?(1)', 'Your age?(2)', 'Your age?(3)'], type: 'int' })
      ),
      ['xyz', 'abc', 'help', 'def'],
      true,
      'maxAttempts')
  })

  describe('filtering', () => {
    const askInt = ask({
      message: 'int between 1 and 6',
      type: 'int',
      maxAttempts: 1,
      filter: n => (n > 0 && n < 7)
    })

    ff('result ok', askInt, ['2'], false, 2)
    ff('result fails the test', askInt, ['8'], true)
  })

  describe('basic types', () => {
    const askInt = ask({ message: 'int?', type: 'int', maxAttempts: 1 })

    ff('type int', askInt, ['25'], false, 25)
    ff('type int, with spaces', askInt, ['  25  '], false, 25)
    ff('type int 0', askInt, ['0'], false, 0)
    ff('type int long', askInt, ['12345678901234567890'], false, 12345678901234567890)
    ff('type int very long', askInt, ['1234567890123456789012345678901234567890'], false, 1234567890123456789012345678901234567890)
    ff('type int negative', askInt, ['-10'], false, -10)
    ff('fail: type int', askInt, ['aaa'], true)
    ff('fail: type int, empty', askInt, [''], true)

    // TODO: improve int parser
    // ff('fail: type int, decimal', askInt, ['1.2'], true)
    // ff('fail: type int, number + junk', askInt, ['1abc'], true)

    // TODO: more basic type tests
  })


  describe('confirm', () => {
    ff('dialog',
      ask({ message: 'Your name?', confirm: getYesNo('Confirm?') }),
      ['Homer', 'yes'],
      false,
      'Homer')

    ff('success',
      ask({ message: 'Your name?', confirm: 'Confirm?' }),
      ['Homer', 'yes'],
      false,
      'Homer')

    ff('failure',
      ask({ message: 'Your name?', confirm: 'Confirm?' }),
      ['Homer', 'no'],
      true)
  })
})


/* Get yes no */

describe('getYesNo', () => {
  ff('should succeed if the answer is yes',
    getYesNo('Are you happy?'), ['yes'], false, 'yes')

  ff('should succeed if the answer is y',
    getYesNo('Are you happy?'), ['y'], false, 'yes')

  ff('should succeed if the answer is Yes',
    getYesNo('Are you happy?'), ['Yes'], false, 'yes')

  ff('should succeed if the answer is Y',
    getYesNo('Are you happy?'), ['Y'], false, 'yes')

  ff('should fail if the answer is no',
    getYesNo('Are you happy?'), ['no'], true)

  ff('should fail if the answer is No',
    getYesNo('Are you happy?'), ['No'], true)

  ff('should fail if the answer is n',
    getYesNo('Are you happy?'), ['n'], true)

  ff('should fail if the answer is N',
    getYesNo('Are you happy?'), ['N'], true)
})


/* Action menu */

const menu = {
  prompt: 'Please choose between:',
  choices: [
    ['a', 'aaaa', say('a')],
    ['b', 'bbbb', say('b')],
    ['c', 'cccc', fail()]
  ]
}

const menuWithNoSelection = { ...menu, onNoSelection: say('no selection') }

describe('actionMenu', () => {
  ff('should succeed if the label name is selected',
    actionMenu(menu), ['a'], false, 'a')

  ff('should succeed if the full label name is selected',
    actionMenu(menu), ['aaaa'], false, 'a')

  ff('should succeed if any label is selected',
    actionMenu(menu), ['b'], false, 'b')

  ff('should succeed if the selection is invalid and there is a onNoSelection',
    actionMenu(menuWithNoSelection), ['d'], false, 'no selection')

  ff('should fail if the selected action fails',
    actionMenu(menu), ['c'], true)

  ff('should fail if the selection is invalid and there is no onNoSelection',
    actionMenu(menu), ['d'], true)
})


/* Select */

describe('select', () => {
  ff('should succeed if the choice selection if it is valid',
    select({
      prompt: 'Please select a callback phone number: ',
      choices: ['514-111-1111', '514-222-2222', '514-333-3333']
    }),
    ['3'],
    false,
    '514-333-3333')

  ff('should succeed if the extra choice dialog succeeds',
    select({
      prompt: 'Please select a callback phone number: ',
      choices: ['514-111-1111'],
      extraChoice: {
        label: 'other',
        dialog: ask('Enter a phone number')
      }
    }),
    ['2', '514-222-2222'],
    false,
    '514-222-2222')

  ff('should fail if the extra choice dialog fails',
    select({
      prompt: 'Please select a callback phone number: ',
      choices: ['514-111-1111'],
      extraChoice: {
        label: 'other',
        dialog: fail()
      }
    }),
    ['2'],
    true)

  ff('should succeed and auto-select the choice if there is only one',
    select({
      prompt: 'Please select a callback phone number: ',
      choices: ['514-111-1111']
    }),
    [],
    false,
    '514-111-1111')

  ff('should succeed if the noChoice dialog succeeds',
    select({
      prompt: 'Please select a callback phone number: ',
      choices: [],
      noChoiceDialog: ask('Enter a phone number')
    }),
    ['514-111-1111'],
    false,
    '514-111-1111')

  ff('should fail if the noChoice dialog fails',
    select({
      prompt: 'Please select a callback phone number: ',
      choices: [],
      noChoiceDialog: fail()
    }),
    [],
    true)

  ff('should fail if there is no choice and no noChoice dialog',
    select({
      prompt: 'Please select a callback phone number: ',
      choices: []
    }),
    [],
    true)
})
