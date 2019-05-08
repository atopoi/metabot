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
 * Basic web channel
 *================================
 */

const express = require('express')
const path = require('path')
const _ = require('lodash')

const uniqueId = require('uuid/v1')

const log = require('../../core/logging')
const { config } = require('../../core/config')
const Context = require('../../core/context')
const { ConversationRegistry } = require('../../core/registry')

const { BaseTransport } = require('../base-transport')

const ConnectionMode = {
  observing: 'observing',
  controlling: 'controlling'
}

class Connection {
  constructor(ws, id) {
    this.ws = ws
    this.id = id
    this.conversation = undefined
    this.mode = undefined
  }

  isConversationAttached() {
    return !_.isUndefined(this.conversation)
  }

  attachConversation(conversation) {
    this.conversation = conversation
    this.mode = this.id !== this.conversation.id
      ? ConnectionMode.observing
      : ConnectionMode.controlling
  }

  detachConversation() {
    this.conversation = undefined
    this.mode = undefined
  }

  isObserving() {
    return this.observing === ConnectionMode.observing
  }

  send(message) {
    this.ws.send(JSON.stringify(message))
  }
}

class WebSocketTransport extends BaseTransport {
  constructor(options) {
    super(options)

    this.server = config.transports.ws
    this.nextId = 0
    this.connections = {}
    this.attachedConnections = {}
  }

  start() {
    log.info('Starting ws server.')
    const app = express()
    module.require('express-ws')(app)

    const staticDir = path.join(__dirname, 'assets')
    log.info('Reading static files from %s', staticDir)

    app.use('/', express.static(staticDir))

    app.ws('/bot', ws => {
      log.info('Accepting WebSocket connection.')
      const id = uniqueId()
      const connection = new Connection(ws, id)

      this.connections[id] = connection

      log.info('Generated ID %s.', id)

      ws.on('message', data => {
        const message = JSON.parse(data)
        if (message.type === 'start') {
          this.startConversation(connection)
        } else if (message.type === 'stop') {
          this.stopConversation(connection, message.id)
        } else if (message.type === 'userUtterance') {
          this.processUserMessage({ id, ...message })
        } else {
          log.warn('websocket message type not supported: %s', message.type)
        }
      })
      ws.on('close', () => {
        this.closeConnection(connection)
      })
    })

    ConversationRegistry.on('created', data => {
      const { conversation } = data
      this.attachConnection(conversation)
    })

    ConversationRegistry.on('deleted', data => {
      const { conversation } = data
      this.detachConnection(conversation)
    })

    log.info('Web server started.', this.server.port)
    log.info('Point your browser to http://localhost:%s/index.html', this.server.port)
    app.listen(this.server.port)
  }

  startConversation(connection) {
    this.createConversation(connection.id)
  }

  stopConversation(connection, id) {
    if (id === connection.id) {
      connection.conversation.stop()
    } else {
      this.detachConnection(connection.conversation)
    }
  }

  closeConnection(connection) {
    log.info('closing connection %s', connection.id)
    delete this.connections[connection.id]

    if (connection.isConversationAttached() && connection.mode === ConnectionMode.controlling) {
      connection.conversation.stop()
    }
  }

  findAvailableConnection() {
    return _.find(this.connections, connection => !connection.isConversationAttached())
  }

  getConnection(id) {
    return this.connections[id]
  }

  getAttachedConnection(id) {
    return this.attachedConnections[id]
  }

  attachConnection(conversation) {
    let connection = this.getConnection(conversation.id)
    if (_.isUndefined(connection)) {
      connection = this.findAvailableConnection()
      if (!_.isUndefined(connection)) {
        log.info('attaching conversation "%s" to remote connection "%s"', conversation.id, connection.id)
        this.setupListeners(conversation)
      }
    }
    if (connection) {
      this.attachedConnections[conversation.id] = connection
      connection.attachConversation(conversation)
      connection.send({ type: 'start', id: conversation.id, mode: connection.mode })
    }
  }

  detachConnection(conversation) {
    const id = conversation.id
    const connection = this.getAttachedConnection(id)
    if (!_.isUndefined(connection)) {
      connection.conversation = undefined
      delete this.attachedConnections[id]
      connection.send({ type: 'stop', id })
    }
  }

  send(context, type, data) {
    const { conversation, agent } = context
    const id = conversation.id
    const connection = this.getAttachedConnection(id)
    if (!_.isUndefined(connection)) {
      const message = {
        conversation: id,
        type,
        data,
        agent: agent && agent.describe(),
        context: Context.serializeDebug(context)
      }
      const info = data.text || data.info || data.name
      log.info('Sending message to "%s" : %s %s', id, type, info || '')
      connection.send(message)
    }
    return true
  }

  renderUserEvent(event) {
    const { sender, id, data } = event
    this.send(
      { conversation: event.conversation },
      'userUtterance',
      { sender, id, ...data }
    )
  }


  sendBotUtterance(utterance, event) {
    this.send(event.context, 'botUtterance', utterance)
  }

  sendControlEvent(event) {
    const { name, context, data } = event
    this.send(context, 'control', { name, data })
  }

  // TODO: simplify focus event structure
  sendFocusEvent(event) {
    const { op, context } = event
    const { level, tag, focus } = op
    const params = {
      op: 'focus',
      level,
      tag,
      focus: focus.describe()
    }
    this.send(context, 'runtimeEvent', params)
  }

  // TODO: simplify reactor event structure
  sendReactorEvent(event) {
    const { label, data, context } = event
    const {
      level, step, reactor, result, info = '', debugLevel
    } = data

    const params = {
      op: 'react',
      level,
      label,
      step,
      reactor: reactor ? reactor.name : '',
      info,
      result,
      debugLevel
    }
    this.send(context, 'reactorEvent', params)
  }
}


const websockTransport = app => new WebSocketTransport({ app })

module.exports = websockTransport
