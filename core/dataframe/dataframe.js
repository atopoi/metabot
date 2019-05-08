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

const assert = require('assert')
const _ = require('lodash')

const Slot = require('./slot.js')
const { DataFrameDef } = require('./dataframe-def.js')
const { Reactor } = require('../reactor.js')
const { say } = require('../lang.js')


const slotActionRequestVerbs = ['set', 'reset', 'showchoices', 'show']
const slotActionRequestRegex = /^# *(set|reset|showchoices|show) (\S+) *(.*)/i


const parseUserDataRequest = text => {
  const parsed = text.trim().match(slotActionRequestRegex)
  if (!parsed) return false

  const [matched, verb, slotName, value] = parsed
  return {
    text: matched,
    verb: verb.toLowerCase(),
    slot: slotName,
    value,
    conf: 1.0
  }
}

const verbIsValid = verb => slotActionRequestVerbs.includes(verb)


class DataFrame {
  constructor(dataFrameDef) {
    assert(dataFrameDef instanceof DataFrameDef, 'constructor arg must be a dataframe def')
    this.def = dataFrameDef

    // Slot hierarchy
    this.slots = dataFrameDef.slotDefs.map(slotDef => new Slot(slotDef))

    // Flat view of the slots hierarchy
    this.slotList = this.buildSlotList()
  }

  buildSlotList() {
    const slotList = []

    const pushSlot = slot => {
      slotList.push(slot)
      slot.children.forEach(child => pushSlot(child))
    }

    this.slots.forEach(slot => {
      pushSlot(slot)
    })

    return slotList
  }

  getName() {
    return this.def.name
  }

  getConfirmDialog() {
    return this.def.confirmDialog
  }

  getSlotByName(name) {
    return this.slotList.find(slot => slot.getName() === name)
  }

  // Case insensitive version
  getSlotByNameCi(name) {
    const nameCi = name.toLowerCase()
    return this.slotList.find(slot => slot.getName().toLowerCase() === nameCi)
  }

  getSlotsByType(type) {
    return this.slotList.filter(slot => slot.getType() === type)
  }

  getSlotValues() {
    return _.fromPairs(this.slotList.map(
      slot => [slot.getName(), slot.value]
    ))
  }

  reset() {
    this.slotList.forEach(slot => slot.reset())
  }

  updateSlot(slotName, updater) {
    const slotToUpdate = this.getSlotByName(slotName)
    if (!slotToUpdate) return false

    const updaterFunction = typeof (updater) === 'function'
      ? updater : slot => slot.setValue(updater)

    updaterFunction(slotToUpdate)
    return slotToUpdate
  }

  resetSlot(slotName) {
    return this.updateSlot(slotName, slot => slot.reset())
  }

  getSlotValue(slotName) {
    const slot = this.getSlotByName(slotName)
    return slot ? slot.value : undefined
  }

  getSlotChoices(slotName) {
    const slot = this.getSlotByNameCi(slotName)
    return slot && slot.getChoices()
  }

  listSlotChoices(slotName) {
    const slot = this.getSlotByNameCi(slotName)
    return slot && slot.describeChoices()
  }

  slotValues() {
    return slotName => {
      if (!slotName) return this.getSlotValues()
      const slot = this.getSlotByName(slotName)
      if (slot === undefined) return undefined
      return this.getSlotByName(slotName).value
    }
  }

  getNextSlotToFill() {
    const isRequired = slot => {
      const required = slot.isRequired()
      if (_.isFunction(required)) return required(this.slotValues())
      return required
    }

    const nextSlot = this.slotList.find(slot => slot.getType() !== 'composite' && isRequired(slot) && !slot.isFilled())

    return nextSlot !== undefined ? nextSlot.getName() : undefined
  }

  isComplete() {
    return this.getNextSlotToFill() === undefined
  }

  isEmpty() {
    return this.slotList.every(slot => !slot.isFilled())
  }

  isPartiallyFilled() {
    return !this.isEmpty() && !this.isFilled()
  }

  isFilled() {
    return this.slotList.every(slot => slot.isFilled())
  }

  getFulfillment() {
    return (this.isComplete() ? 'complete'
      : this.isFilled() ? 'filled'
        : this.isPartiallyFilled() ? 'partial'
          : this.isEmpty() ? 'empty'
            : 'invalid')
  }

  // creates a reactor responding to dataframe action requests
  toReactor() {
    return new Reactor({
      name: `react dataframe(${this.getName()})`,
      accept: event => this.extractUserRequest(event),
      action: request => this.processRequest(request)
    })
  }

  validSlotAction({ verb, slot: slotName }) {
    // TODO: should/could check if slot can be modified
    return this.getSlotByNameCi(slotName) && verbIsValid(verb)
  }

  // extracts an applicable request from the user message/intent
  // TODO: should also work on slot manipulation intent
  // TODO: add options (conf thresholds etc.)
  // TODO: use current question's slot when in slot filling and no slot is specfied
  extractUserRequest(event) {
    const parsed = event.data && event.data.text && parseUserDataRequest(event.data.text)
    if (!parsed) return false
    return parsed && this.validSlotAction(parsed) && parsed
  }

  // action request handling
  // TODO: must become an Action (or dispatch to Actions)
  processRequest(request) {
    if (!this.validSlotAction(request)) return false

    const { verb, slot: slotName, value } = request
    let res
    switch (verb) {
    case 'set':
      res = this.updateSlot(slotName, value)
      // TODO: link to Action instead of calling it inline
      return say(`Changed ${slotName} to ${value}`)
    case 'reset':
      res = this.resetSlot(slotName)
      console.log('DF', 'reset', slotName, value, this.getSlotValue(slotName))
      // TODO: link to Action instead of calling it inline
      return say(`Reset value for: ${slotName}`)
    case 'showchoices':
      res = this.listSlotChoices(slotName)
      console.log('DF', 'showchoices', slotName, this.getSlotChoices(slotName), this.listSlotChoices(slotName))
      // TODO: link to Action instead of calling it inline
      // TODO: add a description for type to use when there are no choices
      return say(res ? `Choices for ${slotName}: ${res.join(', ')}` : `Can't show choices for ${slotName}`)
    case 'show':
      res = this.getSlotValue(slotName)
      console.log('DF', 'show', slotName, res)
      // TODO: link to Action instead of calling it inline
      return say(`The current value of ${slotName} is: **${res}**`)
    default:
    }
    return say(`Unexpected dataframe request ${request}`)
  }

  setFillTask(task) {
    this.fillTask = task
  }

  describe() {
    return {
      type_: 'Dataframe',
      name: this.getName(),
      def: this.def,
      task: this.fillTask && this.fillTask.id,
      state: {
        fulfillment: this.getFulfillment(),
        slots: this.getSlotValues()
      }
    }
  }
}


module.exports = DataFrame
