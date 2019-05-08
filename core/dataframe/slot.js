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

const SlotDef = require('./slot-def.js')
const { getType } = require('../types.js')


class Slot {
  constructor(def) {
    assert(def instanceof SlotDef, 'constructor arg must be a slot def')
    this.def = def

    this.state = null
    this.value = null

    this.children = def.children.map(slotDef => new Slot(slotDef))
  }

  getName() {
    return this.def.name
  }

  getType() {
    return this.def.type
  }

  getChoices() {
    const type = this.def.type && getType(this.def.type)
    return type && type.getChoices(this.value)
  }

  describeChoices() {
    const type = this.def.type && getType(this.def.type)
    return type && type.describeChoices(this.value)
  }

  isRequired() {
    return this.def.required
  }

  getDialog() {
    return this.def.dialog
  }

  getPrompt() {
    return this.def.prompt
  }

  getChildren() {
    return this.def.children
  }

  setValue(value) {
    this.state = 'set'
    this.value = value
  }

  confirm() {
    this.state = 'confirmed'
  }

  isFilled() {
    return ['set', 'confirmed'].includes(this.state)
  }

  isConfirmed() {
    return this.state === 'confirmed'
  }

  reset() {
    this.state = null
    this.value = null
  }
}

module.exports = Slot
