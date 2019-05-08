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

class SlotDef {
  constructor(args) {
    assert(!_.isUndefined(args), 'name and type are mandatory')

    assert(!_.isUndefined(args.name), 'name is mandatory')
    assert(_.isString(args.name), 'name must be a string')
    this.name = args.name

    if (!_.isUndefined(args.children)) { // Composite slot
      assert(_.isUndefined(args.type) || args.type === 'composite', 'children only exist for composite slots')
      this.type = 'composite' // Implicit type

      assert(_.isArray(args.children), 'children must be an array')
      assert(!_.isEmpty(args.children), 'children must be a non empty array')
      this.children = args.children.map(childArgs => new SlotDef(childArgs))
    } else { // Leaf slot
      assert(!_.isUndefined(args.type), 'type is mandatory')
      assert(_.isString(args.type), 'type must be a string')
      this.type = args.type
      this.children = []
    }

    assert(_.isUndefined(args.required) || _.isBoolean(args.required) || _.isFunction(args.required), 'required must be a boolean or a function')
    this.required = _.isUndefined(args.required) ? true : args.required

    assert(_.isUndefined(args.dialog) || _.isObject(args.dialog), 'dialog must be an action')
    this.dialog = _.isUndefined(args.dialog) ? null : args.dialog

    assert(_.isUndefined(args.prompt) || _.isString(args.prompt) || _.isFunction(args.prompt), 'prompt must be a string or a function')
    this.prompt = _.isUndefined(args.prompt) ? null : args.prompt
  }
}

module.exports = SlotDef
