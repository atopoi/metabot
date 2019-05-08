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
  ================
  Bot Runner
  ================
*/

require('../transports/all-transports')
const _ = require('lodash')

const { loadBot } = require('../core/bot')
const { config, processArguments } = require('../core/config')

const { getTransport } = require('../transports/transport')

const determineTransports = () => {
  const transportNames = _.filter(config.launcher.transports.split(','))
  return _.filter(_.map(transportNames, getTransport))
}

const run = () => {
  processArguments()
  const botName = config.launcher.bot

  const bot = loadBot(botName)

  const transports = determineTransports()

  _.each(transports, transport => transport(bot))
}

run()
