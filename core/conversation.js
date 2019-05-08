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

const EventEmitter = require('events')
const uniqueId = require('uuid/v1')

const { config } = require('./config')
const { toUtterance } = require('./utterance')


class Conversation extends EventEmitter {
  constructor(id, options = {}) {
    super()
    this.id = id
    this.timer = undefined
    this.language = config.localization.defaultLanguage
    this.currentContext = null
    this.history = []
    this.initOptions = options
    this.options = options
  }

  start(bot) {
    this.bot = bot
    this.scheduleTimeout()
    this.emit('start', { id: this.id, app: bot })
    this.history = []
    this.options = this.initOptions
  }

  stop() {
    this.bot = undefined
    clearTimeout(this.timer)
    this.emit('stop', { id: this.id })
    this.removeAllListeners()
    this.currentContext = null
    this.history = []
  }

  emitEvent(event, sender, level) {
    this.scheduleTimeout()
    const emitable = {
      ...event,
      id: uniqueId(),
      conversation: this,
      sender,
      timestamp: Date.now()
    }
    if (emitable.data && emitable.type === 'userUtterance') {
      emitable.data = toUtterance(emitable.data)
    }
    this.history.push({ level, event: emitable })
    this.emit(level, emitable)
  }

  emitUserEvent(event) {
    this.emitEvent(event, 'user', 'userEvent')
  }

  onUserEvent(listener) {
    this.on('userEvent', listener)
  }

  emitBotEvent(event) {
    this.emitEvent(event, 'Metabot', 'botEvent')
  }

  onBotEvent(listener) {
    this.on('botEvent', listener)
  }

  scheduleTimeout() {
    const conversation = this
    if (conversation.timer !== undefined) {
      clearTimeout(conversation.timer)
    }
    conversation.timer = setTimeout(
      () => conversation.stop(),
      config.session.timeout
    )
  }
}


module.exports = { Conversation }
