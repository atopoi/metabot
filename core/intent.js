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
 *===========================================
 * Intents
 *===========================================
 */

const _ = require('lodash')

const { toEntity } = require('./entity.js')

const INTENT_TYPES = {}


// Utility function for crude intent matching
// A keyword can be a single word or a string containing multiple words
const textContainsKeyword = (text, keyword) => {
  const keywordStartIndex = text.indexOf(keyword)
  if (keywordStartIndex === -1) return false
  if (keywordStartIndex !== 0 && text[keywordStartIndex - 1] !== ' ') return false

  const keywordEndIndex = keywordStartIndex + keyword.length - 1
  return keywordEndIndex === text.length - 1 || text[keywordEndIndex + 1] === ' '
}


// TODO: intents should become class based, each intent type a subclass of Intent
class IntentType {
  constructor(name, { parser, keywords, info }) {
    this.name = name
    this.parser = parser
    this.info = info
    this.keywords = keywords
    // eslint-disable-next-line no-underscore-dangle
    this.type_ = 'IntentType'
  }

  toString() {
    return `<intent_type:${this.name}>`
  }

  // crude keyword match
  // TODO: remove or delegate to a proper algorithm, with a real confidence value
  matchFromKeywords(text) {
    if (!this.keywords) return null
    const keyword = this.keywords.find(kw => textContainsKeyword(text, kw))
    if (!keyword) return null
    return { text, info: { source: 'matchKeyword', keyword } }
  }

  matchesText(str) {
    const text = str.trim().toLowerCase()
    const matched = this.parser ? this.parser(text) : this.matchFromKeywords(text)
    if (!matched) return null
    matched.name = this.name
    return toIntent(matched)
  }

  describe() {
    // eslint-disable-next-line no-underscore-dangle
    const {
      type_, name, info, keywords
    } = this
    return {
      type_, name, info, keywords
    }
  }
}


const getIntentType = name => INTENT_TYPES[name]


/* defineIntent(name, methods) : creates an intent and adds it to the intents registry
   methods is an object which specifies the intent methods:
  - parser (required)
 */
const defineIntent = (name, methods) => {
  // TODO: check if intent is there
  const intentType = new IntentType(name, methods)
  INTENT_TYPES[name] = intentType
  return intentType
}


// TODO: intents should become class based, each intent type a subclass of Intent
class Intent {
  constructor(data) {
    const {
      intent, name, metadata, conf = 1.0, entities, text
    } = data
    this.name = name || intent || '<NOINTENT>'
    if (metadata) this.metadata = metadata
    this.conf = conf
    if (text) this.text = text
    if (entities) this.entities = entities.map(obj => toEntity(obj))
    // eslint-disable-next-line no-underscore-dangle
    this.type_ = 'Intent'
  }

  toString() {
    return `<intent:${this.name}>`
  }

  describe() {
    const {
      name, metadata, conf, text, entities
    } = this
    return {
      // eslint-disable-next-line no-underscore-dangle
      type_: this.type_,
      intent: this.name,
      name,
      conf,
      text,
      info: metadata,
      entities: entities ? entities.map(e => e.describe()) : null
    }
  }
}

const toIntent = obj => (obj instanceof Intent ? obj : new Intent(obj))


const matchIntent = (utterance, intentName) => {
  const { text, nlu } = utterance
  if (nlu && nlu.intents) {
    return nlu.intents.find(nluIntent => nluIntent.intent === intentName)
  }
  // If text starts with #, then it's a coded event
  if (text && text[0] === '#') return null
  if (text === intentName) return toIntent({ text, name: intentName })

  const intentType = getIntentType(intentName)
  if (!intentType) return null
  return intentType.matchesText(text)
}


const describeIntentsCatalog = () => _.mapValues(INTENT_TYPES, intentType => intentType.describe())


module.exports = {
  matchIntent,
  defineIntent,
  describeIntentsCatalog,
  INTENT_TYPES,
  Intent,
  toIntent
}
