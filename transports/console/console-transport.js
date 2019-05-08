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

/* eslint class-methods-use-this: 0 */
/*
 *================================
 * Basic console channel and app
 *================================
 */

const readline = require('readline')
const chalk = require('chalk')
const { table, getBorderCharacters } = require('table')
const { _ } = require('lodash')

const { BaseTransport } = require('../base-transport')

const tableConfig = width => ({
  border: getBorderCharacters('norc'),
  columns: {
    0: {
      width,
      wrapWord: true
    }
  },
  drawHorizontalLine: (index, size) => index === 0 || index >= size
})


/*
 *================================
 * Rendering
 *================================
 */

const boxText = (text, out, icon) => {
  const lineLengths = text.split('\n').map(x => x.length)
  const maxLine = Math.min(45, 1 + Math.max(...lineLengths))
  const lines = table(
    text.split('\n').map(line => [line]),
    tableConfig(maxLine)
  )

  const colorize = out ? chalk.black.bgWhiteBright : chalk.black.bgCyanBright
  const renderLine = (line, index) => (
    out ? (index === 0 ? `${icon || ' '} ` : '  ') + colorize(line)
      : colorize(line).padStart(90))

  return lines
    .split('\n')
    .map(renderLine)
    .join('\n')
}


/*
 *===============================
 * ConsoleTransport
 *===============================
 */

class ConsoleTransport extends BaseTransport {
  sendBotUtterance(utterance, event) {
    if (utterance && _.isString(utterance.text)) {
      const agent = event.context && event.context.agent
      this.consoleOut(boxText(utterance.text, true, agent && agent.getIcon()))
    }
  }

  consoleOut(msg) {
    process.stdout.clearLine()
    process.stdout.cursorTo(0)
    console.log(msg)
    this.rl.prompt(true)
  }

  sendFocusEvent(event) {
    const { op, context } = event
    const { level, tag, focus } = op
    console.log(chalk.bold.white.bgYellow(` FOCUS   | ${level} | ${tag}  > ${focus || ''} `))
    if (tag === 'leave') {
      const { agent } = context
      if (agent) {
        console.log(chalk.bold.white.bgYellow(` FOCUS   | ${level} | resume > ${agent || ''} `))
      }
    }
  }

  sendReactorEvent(event) {
    const { label, data, info = '' } = event
    const {
      level, step, reactor
    } = data

    const stepInfo = step ? `> ${step}` : ''
    const reactorInfo = reactor ? ` | ${reactor.name}` : ''

    console.log(chalk.bold.white.bgRedBright(` REACTOR | ${level} | ${label} ${stepInfo} ${reactorInfo} ${info} `))
    return true
  }

  start() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
      prompt: ''
    })

    this.rl.on(
      'line',
      line => {
        if (line === '') return
        this.consoleOut(boxText(line, false))
        this.processUserMessage({ id: 'console', data: { text: line } })
      }
    )

    this.createConversation('console')
  }
}

const consoleTransport = app => new ConsoleTransport({ app })

module.exports = consoleTransport
