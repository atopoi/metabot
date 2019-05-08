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
 * Text message localization and resolution
 *===========================================
 */

const _ = require('lodash')
const { toValue } = require('./entity.js')
const log = require('./logging.js')


const parseInterpolator = pattern => {
  const chunks = pattern.split(/(#{[^}]*})/)
  if (chunks.length === 1) return false
  return chunks.map(chunk => (
    chunk.startsWith('#{') ? { key: chunk.slice(2, -1) } : chunk
  ))
}


const resolveKey = ({ key }, getter) => (_.isFunction(getter) ? getter(key) : getter[key])


const resolveText = (pattern, messageData = {}) => {
  // TODO: the interpolator could be cached in the message dictionary
  const elements = parseInterpolator(pattern)
  if (!elements) {
    return {
      text: pattern,
      fragments: [pattern]
    }
  }

  const fragments = elements.map(
    element => (_.isString(element) ? element : resolveKey(element, messageData))
  )

  const text = fragments.map(fragment => {
    if (_.isArray(fragment)) {
      return fragment.map(toValue).join(', ')
    }
    if (_.isObject(fragment)) {
      return fragment.val
    }
    return fragment
  }).join('')

  // TODO: add all variable resolutions as info
  return {
    text,
    fragments,
    pattern
  }
}


const localizeText = (messages, language, text, messageData = {}) => {
  if (_.isUndefined(messages)) return false // No localization

  if (_.isUndefined(messages[language])) {
    log.warn('Language not supported: %s', language)
    return false
  }

  const localizedMessage = messages[language][text]
  if (_.isUndefined(localizedMessage)) {
    log.warn('Message not localized in %s: %s', language, text)
    return false
  }

  if (_.isString(localizedMessage)) return localizedMessage

  // TODO: throw an error as soon as the message files are converted
  if (_.isFunction(localizedMessage)) return localizedMessage(messageData)

  throw new Error('Unexpected localized message type')
}


module.exports = {
  resolveText,
  localizeText
}
