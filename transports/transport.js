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
 *===============================
 * Channel
 *===============================
 * A channel is a user interface
 */

const EventEmitter = require('events')

class Transport extends EventEmitter {
}

const transportRegistry = {}

/**
 * Returns the registered transport for the given name.
 *
 * @param {string} name name of the transport
 */
const getTransport = name => transportRegistry[name]

/**
 * Registers a new transports under the given name.
 * Returns the previously registered transport for that name.
 *
 * @param {string} name name of the transport to register
 * @param {(bot) => Agent} transport transport constructor to register
 */
const registerTransport = (name, transportCtor) => {
  const previousTransport = transportRegistry[name]

  transportRegistry[name] = bot => {
    const transport = transportCtor(bot)
    transport.init()
  }
  return previousTransport
}

module.exports = { Transport, getTransport, registerTransport }
