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
 * Slack channel
 *================================
 */

const WebSocket = require('ws')

const log = require('../../core/logging')
const { config } = require('../../core/config')

const { BaseTransport } = require('../base-transport')

class SlackGatewayTransport extends BaseTransport {
  constructor(options) {
    super(options)

    this.username = config.transports.slackGateway.client.username
    this.server = config.transports.slackGateway.client.serverUrl
  }

  start() {
    log.info('Starting Slack Gateway transport.')
    const channel = this
    const ws = new WebSocket(this.server)
    channel.ws = ws

    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'connect', name: channel.username }))
    })

    ws.on('message', message => {
      const { id, text } = JSON.parse(message)
      channel.processUserMessage({ id, message: text })
    })

    ws.on('close', () => {
      log.info('Slack Gateway Channel stopped.')
      process.exit()
    })
  }

  async sendBotUtterance(utterance, event) {
    this.ws.send(JSON.stringify({
      id: event.conversation.id,
      name: this.username,
      type: 'text',
      text: utterance
    }))
  }
}

const slackGatewayTransport = app => new SlackGatewayTransport({ app })

module.exports = slackGatewayTransport
