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
 * Test channel
 *================================
 */

const log = require('../../core/logging')

const { Mailbox } = require('../../core/event-utils/mailbox')
const { ConversationRegistry } = require('../../core/registry')
const { Metabot } = require('../../core/metabot')

const { BaseTransport } = require('../base-transport')

const ID = 'test'

class TestTransport extends BaseTransport {
  start() {
    this.mailbox = new Mailbox()
    log.info('Starting Test transport...')
    this.createConversation(ID)
  }

  // eslint-disable-next-line class-methods-use-this
  stop() {
    const conversation = ConversationRegistry.getConversation(ID)
    Metabot.stop(conversation)

    log.info('Stopping Test transport...')
  }

  async sendInput(text) {
    this.processUserMessage({ id: ID, type: 'userUtterance', data: { text } })
  }

  async sendBotUtterance(utterance) {
    this.mailbox.send(utterance)
  }

  async receiveOutput() {
    return this.mailbox.receive()
  }

  getOutput() {
    return this.mailbox.messages
  }
}

module.exports = { TestTransport }
