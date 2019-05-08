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

/*
 *====================================
 * ChatDemo
 *====================================
 */

const {
  say,
  DO,
  ALT,
  LET,
  SET,
  GET
} = require('../../core/lang.js')
const { ask } = require('../../core/patterns/ask.js')

const { Agent } = require('../../core/agent.js')


const ChatDemoBot = new Agent(
  'ChatDemoBot',
  {
    icon: '👨',

    policy: {
      ask: {
        exceptionOnMaxAttempts: false
      }
    }
  }
)

ChatDemoBot.tasks.main = DO(
  say('Here is your friendly ChatDemo!'),

  LET('user.name', ask("What's your name buddy?")),
  username => say(`Welcome ${username.val}`),

  ask('How are you today?'),
  m => m.transform(str => str.toUpperCase()),
  SET('mood'),
  m => say(`Did I hear ${m.val}?\nYou said #{mood}!!`, { mood: m }),

  GET('user.name'),
  username => ALT(
    DO(
      ask({
        message: [
          'How old are you?',
          'Your age! Enter a number!',
          `Come on ${username.val}!\nYou don't know your age?\nEnter it!`
        ],
        maxAttempts: 3,
        type: 'int'
      }),
      age => say('Ok, you are #{age}', { age })
    ),
    say(`You don't know your age, ${username.val}!!\nYou must be a 3 year old!`)
  ),

  GET('user.name'),
  username => say(`You are great, ${username.val}, I like you!`),
  say('See you soon.\nBye!')
)

module.exports = ChatDemoBot
