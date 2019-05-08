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
/* eslint no-unused-vars: 0 */
/*
 *===============================
 * NLU
 *===============================
 */

const assert = require('assert')

const { Intent, toIntent } = require('./intent.js')


class NLU {
  constructor({ metadata, intents, intent }) {
    if (metadata) this.metadata = metadata
    if (intents) this.intents = intents.map(data => toIntent(data))
    else if (intent) {
      this.intents = [toIntent(intent)]
    }
  }

  getIntent(intentName) {
    return this.find(intent => intent.name === intentName)
  }

  getTopIntent() {
    const top = this.intents && this.intents[0]
    if (top) assert(top instanceof Intent)
    return top
  }

  hasEntity(entityType) {
    // TODO
    return false
  }

  getIntents() {
    return this.intents
  }
}


module.exports = { NLU }
