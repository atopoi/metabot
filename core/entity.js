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
 *===========================================
 * Entity
 *===========================================
 */


class Entity {
  constructor({ type, text, val, conf = 1.0 }) {
    this.text = text
    this.val = val === undefined ? text : val
    this.type = type
    this.conf = conf
    // eslint-disable-next-line no-underscore-dangle
    this.type_ = 'Entity'
  }

  get typeName() {
    return this.type || 'any'
  }

  toString() {
    return `<entity:${this.type}:${this.val}>`
  }

  print() {
    if (this.type) return this.type.print(this)
    // TODO should it be this.val instead of this.text?
    return this.text
  }

  transform(f) {
    const res = new Entity(this)
    res.val = f(this.val)
    return res
  }

  describe() {
    const { text, type, val, conf } = this
    return {
      text, val, type, conf, type_: 'Entity'
    }
  }
}


const toValue = obj => (obj instanceof Entity ? obj.val : obj)

const equalValue = (a, b) => toValue(a) === toValue(b)


const toEntity = obj => (obj instanceof Entity ? obj : new Entity(obj))


module.exports = { Entity, equalValue, toValue, toEntity }
