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

/* eslint object-curly-newline: [
    "error", {"ObjectPattern": { "multiline": true, "minProperties": 5 }}
   ] */
/*
 *===========================================
 * Types
 *===========================================
 */

const _ = require('lodash')

const { Entity } = require('./entity.js')

const TYPES = {}


class Type {
  constructor(name, { parser, printer, choices }) {
    this.name = name
    this.parser = parser
    this.printer = printer
    this.choices = choices
    // eslint-disable-next-line no-underscore-dangle
    this.type_ = 'Type'
  }

  toString() {
    return `<type:${this.name}>`
  }

  parse(str) {
    const type = this.name
    const text = str.trim()
    const val = this.parser(text)
    return (val || val === 0)
      && new Entity({ type, val, text })
  }

  print(entity) {
    if (this.printer) return this.printer(entity)
    return entity.text
  }

  getChoices(entity) {
    if (this.choices) {
      return _.isFunction(this.choices) ? this.choices(entity) : this.choices
    }
    return false
  }

  describeChoices(entity) {
    const choices = this.getChoices(entity)
    if (!choices) return false
    if (_.isString(choices) || _.isArray(choices)) return choices
    if (_.isPlainObject(choices)) return _.values(choices).map(names => names[0])
    return false
  }
}


const isType = obj => (obj instanceof Type)


const getType = nameOrType => (
  isType(nameOrType)
    ? nameOrType
    : TYPES[nameOrType]
)

/* addType(name, methods) : creates a type and adds it to the types registry
   methods is an object which specifies the type methods:
  - parser (required)
  - printer
  - choices (a list or a function of the entity)
 */
const addType = (name, methods) => {
  // TODO: check if type is there
  const type = new Type(name, methods)
  TYPES[name] = type
  return type
}


const addTypeFromEnum = (name, enumValues) => {
  const parser = value => {
    const val = value.toLowerCase()
    const enumKey = Object.keys(enumValues).find(
      key => enumValues[key].includes(val)
    )
    return enumKey !== undefined ? enumKey : null
  }
  return addType(name, { parser, choices: enumValues })
}


const addTypeFromList = (name, values) => {
  const set = new Set(values)
  const parser = value => (set.has(value.toLowerCase()) ? value.toLowerCase() : null)
  return addType(name, { parser, choices: values })
}


const defineType = (name, options) => {
  const { choices } = options
  if (_.isArray(choices)) return addTypeFromList(name, choices)
  if (_.isPlainObject(choices)) return addTypeFromEnum(name, choices)
  return addType(name, options)
}


/*
 *===========================================
 * Basic types
 *===========================================
 */

// Type: 'any', accepts any string
defineType('any', { parser: x => x })


// Type: 'notnull', accepts any non null string
defineType('notnull', { parser: x => { const str = x.trim(); return str !== '' && str } })

// Type: 'yes_no', accepts yes or no
defineType('yes_no', { choices: { yes: ['y', 'yes', 'ok'], no: ['n', 'no', 'nope'] } })


// Type: int, TODO: implement properly
defineType('int', { parser: parseInt })


/*
 *===========================================
 * Simplified banking chatbot entity types
 *===========================================
 */

defineType('address', { parser: x => (/^\d{0-5} \w+$/.test(x) ? x : null) })

defineType('currency', { parser: x => (/^\d+\$?$/.test(x) ? parseInt(x.replace('$', ''), 10) : null) })

defineType('phone_number', { parser: x => (/^(\d{3}-\d{3}-\d{4})|\d{10}$/.test(x) ? x.replace(/-/g, '') : null) })

defineType('transfer_type', {
  choices: {
    callback: ['callback', 'call me'],
    chat_transfer: ['chat', 'chat transfer']
  }
})

defineType('recipient', { choices: ['bart', 'lisa'] })

defineType('payee', { choices: ['bell', 'rogers', 'videotron'] })

defineType('recurrence', {
  choices: {
    one_time: ['one time', 'one-time', 'single', 'unique'],
    recurring: ['recurring', 'recurrent', 'multiple', 'repetitive']
  }
})

defineType('frequency', {
  choices: {
    weekly: ['weekly', 'each week', 'every week', 'once a week'],
    bi_weekly: ['bi-weekly', 'every two weeks', 'every other week', 'twice a month', 'bi-monthly'],
    monthly: ['monthly', 'every month', 'each month', 'once a month']
  }
})

defineType('acct_type', {
  choices: {
    checking: ['checking', 'chequing'],
    savings: ['saving', 'savings']
  }
})

defineType('date', { choices: ['yesterday', 'today', 'tomorrow', 'in two days', 'next week', 'next month'] })


module.exports = {
  getType,
  Type,
  defineType
}
