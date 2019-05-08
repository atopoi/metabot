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
 *================================
 * Dialogue test utils
 *================================
 */

const fs = require('fs')
const path = require('path')

const { TestTransport } = require('../../transports/test/test-transport')

const { parseMarkdown } = require('./markdown-parser')

const OUTPUT_TIMEOUT_MS = 3

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

class DialogueTest {
  constructor(transport, done, exchanges = []) {
    this.transport = transport
    this.done = done
    this.exchanges = exchanges
  }

  receive(expectedOutput) {
    if (this.exchanges.length > 0) { // Append output to last exchange
      const currentExchange = this.exchanges[this.exchanges.length - 1]
      currentExchange.expectedOutput = currentExchange.expectedOutput.concat(expectedOutput)
    } else {
      this.exchanges.push({ input: null, expectedOutput })
    }
    return this
  }

  sendInput(input) {
    this.exchanges.push({ input, expectedOutput: [] })
    return this
  }

  exchange(input, expectedOutput) {
    this.exchanges.push({ input, expectedOutput })
    return this
  }

  execute(exchangesFunction) {
    return exchangesFunction(this)
  }

  async run() {
    let exchange

    for (let exchangeIndex = 0; exchangeIndex < this.exchanges.length; exchangeIndex += 1) {
      exchange = this.exchanges[exchangeIndex]

      if (exchange.input !== null) this.transport.sendInput(exchange.input)

      const actualOutput = []
      let awaitingMessages = true

      while (awaitingMessages) { // Await messages during OUTPUT_TIMEOUT_MS ms
        const awaitOutputTimeoutPromise = new Promise((resolve, reject) => {
          setTimeout(reject, OUTPUT_TIMEOUT_MS, 'exceeded await output timeout')
        })

        const outputPromise = this.transport.receiveOutput()

        // eslint-disable-next-line no-await-in-loop
        await Promise.race([awaitOutputTimeoutPromise, outputPromise]).then(output => {
          actualOutput.push(output)
        })
          // eslint-disable-next-line no-loop-func
          .catch(error => {
            if (error === 'exceeded await output timeout') { awaitingMessages = false }
          })
      }

      // Only assert output if expected output is not empty
      if (exchange.expectedOutput.length > 0) {
        expect(actualOutput.map(utterance => utterance.text)).toEqual(exchange.expectedOutput)
      }
    }

    // Wait for unexpected outputs, if any
    await sleep(OUTPUT_TIMEOUT_MS)

    expect(this.transport.getOutput()).toEqual([])

    this.done()
  }
}

const testDialogue = (transport, done, exchanges) => new DialogueTest(transport, done, exchanges)

const runDialogueTests = (bot, markdownDir, markdownFilename, setup) => {
  const testSuitesMarkdown = fs.readFileSync(path.resolve(markdownDir, markdownFilename), 'utf8')

  const testSuites = parseMarkdown(testSuitesMarkdown)

  let transport

  beforeEach(() => {
    transport = new TestTransport({
      app: bot
    })
    transport.init()

    if (setup) {
      setup()
    }
  })

  afterEach(() => {
    transport.stop()
  })

  testSuites.forEach(testSuite => {
    describe(testSuite.name, () => {
      testSuite.tests.forEach(suiteTest => {
        test(suiteTest.name, done => {
          const dialogueTest = new DialogueTest(transport, done, suiteTest.exchanges)
          return dialogueTest.run()
        })
      })
    })
  })
}

module.exports = { runDialogueTests, testDialogue }
