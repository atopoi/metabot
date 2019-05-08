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

/* eslint object-curly-newline: ["error", { "minProperties": 5 }] */
/*
 *===============================
 * Utterance
 *===============================
 */


const assert = require('assert')
const { getType } = require('./types.js')
const { Entity } = require('./entity.js')
const { NLU } = require('./nlu.js')


// TODO: needs more thinking
// currently uses only top intent's entities
const extractType = (utterance, nameOrType = 'any') => {
  assert(utterance instanceof Utterance)
  const type = getType(nameOrType)

  if (utterance.nlu && utterance.nlu.intents) {
    const topIntent = utterance.nlu.getTopIntent()
    if (!topIntent) return null

    const matchedEntity = (type.name === 'any'
      ? (topIntent.entities && topIntent.entities[0])
      : topIntent.entities.find(entity => entity.type === type.name))
    if (matchedEntity) {
      assert(matchedEntity instanceof Entity)
      matchedEntity.parentIntent = topIntent.name
      return matchedEntity
    }
    return null
  }
  // TODO throw error if null
  return type.parse(utterance.text)
}

class Utterance {
  constructor({ text, fragments, nlu, metadata }) {
    this.text = text
    if (metadata) this.metadata = metadata
    if (fragments) this.fragments = fragments
    if (nlu) {
      if (nlu instanceof NLU) this.nlu = nlu
      else this.nlu = new NLU(nlu)
    }
  }

  extractType(nameOrType) {
    return extractType(this, nameOrType)
  }
}


const toUtterance = obj => (obj instanceof Utterance ? obj : new Utterance(obj))


module.exports = { Utterance, toUtterance }
