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

/**
 * Script to create a new bot application. Must be run from the top level
 * directory of the project.
 */

const { _ } = require('lodash')

const fs = require('fs')
const path = require('path')

const { botFolder, botModule, messagesModule } = require('../core/bot.js')

const usage = () => {
  console.log('Usage: yarn create-bot BotName')
  process.exit(-1)
}

const moduleDir = path.dirname(module.filename)

const createDirectory = botName => {
  const dirName = botFolder(botName)
  console.log('Creating directory: %s', dirName)
  try {
    fs.accessSync(dirName)
    console.log(' ... directory already exists. Aborting!')
    process.exit(-1)
  } catch (error) {
    if (error.code === 'ENOENT') {
      fs.mkdirSync(dirName)
    } else {
      console.log('An error occurred. ', error)
    }
  }
}

const createBot = (botName, className) => {
  const filename = botModule(botName)
  const templateFilename = path.resolve(moduleDir, 'templates/bot.js')

  console.log('Creating bot definition file : "%s"', filename)

  const content = fs.readFileSync(templateFilename)
  fs.writeFileSync(filename, content.toString().replace(/__BOT__/gi, className))
}

const createMessages = botName => {
  const filename = messagesModule(botName)
  const templateFilename = path.resolve(moduleDir, 'templates/messages.js')

  console.log('Creating default messages file : "%s"', filename)

  const content = fs.readFileSync(templateFilename)
  fs.writeFileSync(filename, content)
}


const run = commandLine => {
  const [botName] = _.drop(commandLine, 2)

  if (_.isUndefined(botName)) {
    usage()
  }

  const directoryName = _.kebabCase(botName)

  createDirectory(directoryName)
  createBot(directoryName, botName)
  createMessages(directoryName)
}


run(process.argv)

module.exports = { run }
