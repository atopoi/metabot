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
 A simple demo app
====================================
 */

const {
  succeed,
  say,
  DO,
  ALT,
  ON,
  GET,
  TASK,
  loop
} = require('../../core/lang.js')

const { Agent } = require('../../core/agent.js')
const { actionMenu } = require('../../core/patterns/ask.js')
const { toValue } = require('../../core/entity.js')
const WeatherBot = require('./weather-bot.js')
const ChatDemoBot = require('./chat-demo-bot.js')


/*
====================================
 MoveBot
====================================
 */

const MoveBot = DO(
  say("I'm the MoveBot\nI can't do anything yet :)")
)


/*
====================================
 PhoneNumberAssist
====================================
 */

const PhoneNumberAssistBot = DO(
  say("I'm the famous PhoneNumberAssist\nNothing yet :)")
)


/*
====================================
 BankDemo
====================================
 */

const BankDemoBot = new Agent(
  'BankDemoBot',
  { icon: '💰' }
)


BankDemoBot.tasks.main = DO(
  say('BankDemo'),
  ALT(
    GET('user.name'),
    succeed('My friend')
  ),
  username => say(`Your account is empty ${toValue(username)}! Bye!`)
)


/*
====================================
 Agent Definition
====================================
 */

const SimpleDemoBot = new Agent(
  'Simple Demo Bot',
  {
    icon: '↯'
  }
)

SimpleDemoBot.help = TASK(
  'ShowHelp',
  say('How can I help you?\nI can MOVE, update your phone number, book a FLIGHT, and tell the WEATHER')
)


SimpleDemoBot.tasks.main = DO(
  ON('help', SimpleDemoBot.help),
  say('Hello'),
  SimpleDemoBot.help,
  TASK({
    name: 'menu loop',
    icon: '⟳',
    action: loop(
      DO(
        actionMenu({
          prompt: 'Please choose between:',
          choices: [
            ['m', 'Move', MoveBot],
            ['w', 'Weather', WeatherBot],
            ['p', 'Phone', PhoneNumberAssistBot],
            ['c', 'Chat', ChatDemoBot],
            ['b', 'Bank', BankDemoBot]
          ],
          onNoSelection: say('Invalid selection, try again')
        }),
        say('Can I do something else for you?')
      ),
      true // continue regardless of the loop body's failure
    )
  })
)

module.exports = SimpleDemoBot
