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
  Utilities to locate bots and localization files.
 */

const path = require('path')

const log = require('../core/logging')

const baseDir = path.resolve(path.dirname(module.filename), '..')
const appsDir = path.resolve(baseDir, 'apps')


const botFolder = botName => path.resolve(appsDir, botName)
const botModule = botName => path.resolve(botFolder(botName), 'bot.js')
const messagesModule = botName => path.resolve(botFolder(botName), 'messages.js')

const loadMessages = botName => module.require(messagesModule(botName))

const tryLoadMessages = botName => {
  let messages
  try {
    messages = loadMessages(botName)
    log.info('Loaded bot messages from standard location : %s', messagesModule(botName))
  } catch (error) {
    log.info('No bot messages found. Ignoring.')
    log.warn('Localized messages not configured')
    messages = undefined
  }

  return messages
}

const loadBot = botName => {
  const bot = module.require(botModule(botName))

  bot.botFolder = botFolder(botName)

  const messages = tryLoadMessages(botName)
  bot.messageDict = messages

  return bot
}

module.exports = {
  botFolder,
  botModule,
  messagesModule,
  loadBot,
  loadMessages
}
