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
 * Abstract web-based channel
 *================================
 */

/*
  * TODO:
  * Performance testing / make sure the model does not leak resources
  * Session affinity in clustered environment
  * Non-text input/output
  * Registry for bots
  * Registry for transports
  * Transport for MicrosoftBotFramework
  * Real HTML Debugger (IDM revamped?)
  * Make a multi-channel demo (SMS + web form)
  * Redo NLU server in Node.js
  * Make everything production grade...
 */
const _ = require('lodash')

const { ConversationRegistry } = require('../core/registry')
const { Metabot } = require('../core/metabot')
const log = require('../core/logging')

const { Transport } = require('./transport')

class BaseTransport extends Transport {
  constructor(options) {
    super()

    if (!options.app) throw Error('No application defined for transport')
    this.application = options.app
  }

  // API

  renderUserEvent(event) {
    return true
  }

  renderBotEvent(event) {
    switch (event.type) {
    case 'control':
      this.sendControlEvent(event)
      break
    case 'utterance':
      this.renderBotUtterance(event.text, event)
      break
    case 'focus':
      this.sendFocusEvent(event)
      break
    case 'reactor':
      this.sendReactorEvent(event)
      break
    default:
      log.warn('Event type not yet supported: %s', event.type)
    }
    return true
  }

  renderBotUtterance(utterance, event) {
    this.sendBotUtterance(utterance, event)
    return true
  }

  sendControlEvent(event) {
    return true
  }

  sendFocusEvent(event) {
    return true
  }

  sendReactorEvent(event) {
    return true
  }

  /* eslint class-methods-use-this: 0 */
  start() {
    throw Error('start not implemented')
  }

  /* eslint no-unused-vars: 0, class-methods-use-this: 0 */
  async sendBotUtterance(utterance, event) {
    throw Error('sendBotUtterance not implemented')
  }

  createConversation(id) {
    const transport = this
    const conversation = ConversationRegistry.registerConversation(id)
    this.setupListeners(conversation)
    Metabot.start(transport.application, conversation)

    return conversation
  }

  stopConversation(id) {
    const conversation = ConversationRegistry.getConversation(id)
    if (conversation) { Metabot.stop(conversation) }
  }

  setupListeners(conversation) {
    const transport = this
    conversation.onBotEvent(event => transport.renderBotEvent(event))
    conversation.onUserEvent(event => transport.renderUserEvent(event))
  }

  processUserMessage(message) {
    const { id, type, data } = message

    log.info('[%s] Received: %s', id, JSON.stringify(data))

    const conversation = ConversationRegistry.getConversation(id)
    if (conversation === undefined) {
      this.createConversation(id)
    } else {
      conversation.emitUserEvent({ type, data })
    }

    return 'ok'
  }

  init() {
    this.start()
  }
}

module.exports = { BaseTransport }
