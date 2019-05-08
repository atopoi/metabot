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

const config = {}

module.exports = config

config.logger = {}
config.logger.name = 'metabot'
config.logger.level = 'info'

config.transports = {}

/* Slack Gateway transport */

config.transports.slackGateway = {}
config.transports.slackGateway.client = {}
config.transports.slackGateway.server = {}

config.transports.slackGateway.client.serverUrl = 'ws://localhost:8010'
config.transports.slackGateway.client.username = '*'

config.transports.slackGateway.server.port = 8010
config.transports.slackGateway.server.token = 'aaa...' // enter the token number here

/* WebSocket transport */

config.transports.ws = {}
config.transports.ws.port = 8001

/* Bot launcher */

config.launcher = {}
config.launcher.bot = 'simple-demo'
config.launcher.transports = 'ws'

/* Session */
config.session = {}
config.session.timeout = 60 * 60 * 1000

/* Localization */
config.localization = {}
config.localization.defaultLanguage = 'en_US'
