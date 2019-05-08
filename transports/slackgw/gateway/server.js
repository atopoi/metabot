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
 * Slack proxy server
 *================================

 TODO: replace the use of the RTMClient API with the Events API. This will mean
 to expose a web server directly to the internet to receive events in the form
 of HTTP POSTs. But this will scale more easily in the long term.
 */

const { WebClient, RTMClient } = require('@slack/client')
const WebSocket = require('ws')
const { _ } = require('lodash')

const log = require('../../../core/logging')
const { config, processArguments } = require('../../../core/config')

const token = config.transports.slackGateway.server.token

const clients = {}
const wc = new WebClient(token)
const rtm = new RTMClient(token)
const users = {}

const defaultClientName = '*'
let defaultClient = false


const extractUsers = async () => {
  log.info('Extracting team members')
  wc.users.list().then(result => {
    const { ok, members } = result
    if (ok) {
      _.forEach(members, ({ id, name }) => {
        log.debug('  - %s (%s)', name, id)
        users[name] = id
      })
    }
  }).catch(reason => {
    log.error('Unable to retrieve Slack users list: %s', reason)
  })
}

/* eslint implicit-arrow-linebreak: 0 */
const validMessage = message =>
  !((message.subtype && message.subtype === 'bot_message')
    || (!message.subtype && message.user === rtm.activeUserId))


const startRTMClient = () => {
  log.info('Starting Slack RTMClient')

  rtm.on('message', message => {
    log.info('received slack message: %j', message)
    if (validMessage) {
      log.info(' - message is valid')
      const { user, channel, text } = message
      sendMessageToBot(user, channel, text)
    }
  })

  rtm.start()
}

const addClient = (user, ws) => {
  log.info('Adding client connection for %s', user)

  // testing for default client
  if (user === defaultClientName) {
    if (defaultClient) {
      log.warn('Default metabot already connected.')
      return false
    }
    defaultClient = { ws }
    return true
  }

  const slackUser = users[user]

  // checking user existence
  if (!slackUser) {
    log.info('Unknown Slack user %s. Closing connection.', user)
    return false
  }

  // checking existing connection
  if (clients[slackUser] !== undefined) {
    log.info('Client already connected (%s). Closing connection.', user)
    return false
  }

  // Creating connection
  clients[slackUser] = { ws }
  return true
}

const removeClient = name => {
  if (name === defaultClientName) {
    log.info('Removing default client')
    defaultClient = false
  } else {
    log.info('Removing client (%s)', name)
    delete clients[users[name]]
  }
}

const sendMessageToSlack = (channel, text) => {
  log.info('Sending message to slack user %s : %s', channel, text)
  rtm.sendMessage(text, channel)
}

const sendMessageToBot = (user, channel, text) => {
  log.info('Sending message to bot from %s (channel %s) : %s', user, channel, text)
  const client = clients[user] || defaultClient

  if (client === undefined) {
    log.info('Received message for non-registered user and no default bot. Ignoring!')
  }

  client.ws.send(JSON.stringify({ id: channel, text }))
}


const startWsServer = () => {
  log.info('Starting ws server.')

  const wss = new WebSocket.Server({ port: config.transports.slackGateway.server.port })
  wss.on('connection', ws => {
    log.info('New WS connection')
    let user = false
    ws.on('message', messageString => {
      log.debug('Received message from user %s: %s', user || '-', messageString)
      const message = JSON.parse(messageString)
      const { name, type } = message

      if (type === 'connect') {
        user = name
        if (!addClient(user, ws)) {
          ws.close()
        }
      } else if (type === 'text') {
        const { id, text } = message
        sendMessageToSlack(id, text)
      } else {
        log.warn('Invalid message type received: %s. Ignored', type)
      }
    })

    ws.on('close', () => {
      removeClient(user)
    })
  })
}

const start = async () => {
  log.info('Slack proxy server starting...')
  processArguments()

  await extractUsers()
  startRTMClient()
  startWsServer()

  log.info('Slack proxy server started!')
  log.info('Waiting for connections...')
}

start()
