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

const SlotDef = require('./slot-def.js')

class DataFrameDef {
  constructor(args) {
    assert(!_.isUndefined(args), 'name and slotDefs are mandatory')

    assert(!_.isUndefined(args.name), 'name is mandatory')
    assert(_.isString(args.name), 'name must be a string')
    this.name = args.name

    assert(!_.isUndefined(args.slotDefs), 'slotDefs are mandatory')
    assert(_.isArray(args.slotDefs), 'slotDefs must be an array')
    this.slotDefs = args.slotDefs

    assert(_.isUndefined(args.confirmDialog)
      || _.isObject(args.confirmDialog), 'confirmDialog must be an action')
    this.confirmDialog = _.isUndefined(args.confirmDialog) ? null : args.confirmDialog
  }
}

function defineDataframe(args) {
  assert(!_.isUndefined(args))

  assert(!_.isUndefined(args.slots) && _.isArray(args.slots))

  const slotDefs = args.slots.map(def => new SlotDef(def))

  return new DataFrameDef({
    name: args.name,
    slotDefs,
    confirmDialog: args.confirmDialog
  })
}

module.exports = { DataFrameDef, defineDataframe }
