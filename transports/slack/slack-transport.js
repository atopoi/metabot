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

const { RTMClient } = require('@slack/client')

const log = require('../../core/logging')
const { config } = require('../../core/config')

const { BaseTransport } = require('../base-transport')

const token = config.transports.slackGateway.server.token

class SlackTransport extends BaseTransport {
  start() {
    const transport = this

    transport.rtm = new RTMClient(token)

    transport.rtm.on('message', message => {
      if ((message.subtype && message.subtype === 'bot_message')
        || (!message.subtype && message.user === transport.rtm.activeUserId)) {
        return
      }

      transport.processUserMessage({
        id: message.channel,
        type: message.type,
        data: { text: message.text }
      })
    })

    log.info('Starting Slack transport...')
    transport.rtm.start()
  }

  async sendBotUtterance(utterance, event) {
    this.rtm.sendMessage(utterance.text, event.conversation.id)
  }
}

const slackTransport = app => new SlackTransport({ app })

module.exports = slackTransport
