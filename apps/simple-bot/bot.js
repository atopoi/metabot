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

// Imports
const {
  DO, GET, SET, IF, ON, loop, say
} = require('../../core/lang.js')
const { ask } = require('../../core/patterns/ask.js')
const { Agent } = require('../../core/agent.js')

// Create the bot
const GreatBot = new Agent('The Great Bot')


// define the bot's actions here

// define a basic help
const showHelp = DO(
  say('I\'m just a simple bot'),
  IF(GET('user.name'),
    name => say('But you can help me become great, #{name}!', { name }))
)


// the number guessing action
const guess = () => {
  const target = Math.floor(Math.random() * 6) + 1

  return DO(
    ask({
      message: ['Guess the result!', 'Enter a number between 1 and 6'],
      type: 'int',
      filter: n => (n > 0 && n < 7)
    }),
    num => (num.val === target
      ? say('Yes, you got it!')
      : say(`Wrong, the number was ${target}!`))
  )
}


// the bot's main loop
const mainActionLoop = DO(
  say('I roll a dice and you guess the result...'),
  loop(
    DO(
      say('Rolling...'),
      guess,
    )
  )
)


// the bot's init script
GreatBot.tasks.main = DO(
  say('Hello'),
  ON('help', showHelp),
  ask("what's your name?"),
  SET('user.name'),
  name => say('Nice to meet you, #{name}', { name }),
  mainActionLoop
)


// export for the bot laucher
module.exports = GreatBot
