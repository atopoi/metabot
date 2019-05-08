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

const _ = require('lodash')

const { DataFrameDef } = require('../dataframe-def.js')
const SlotDef = require('../slot-def.js')

const { ask } = require('../../../core/patterns/ask.js')

describe('dataframe def', () => {
  test('mandatory values must be specified', async () => {
    expect(() => new DataFrameDef()).toThrow('name and slotDefs are mandatory')

    expect(() => new DataFrameDef({
      slotDefs: [
        new SlotDef({ name: 'name', type: 'string' }),
        new SlotDef({ name: 'age', type: 'number' })
      ]
    })).toThrow('name is mandatory')

    expect(() => new DataFrameDef({ name: 'profile' })).toThrow('slotDefs are mandatory')
  })

  test('default value should be set if no value is provided', async () => {
    const dataframeDef = new DataFrameDef({
      name: 'profile',
      slotDefs: [
        new SlotDef({ name: 'name', type: 'string' }),
        new SlotDef({ name: 'age', type: 'number' })
      ]
    })

    expect(dataframeDef.confirmDialog).toBeNull()
  })

  test('specified values should be set', async () => {
    const slotDefs = [
      new SlotDef({ name: 'name', type: 'string' }),
      new SlotDef({ name: 'age', type: 'number' })
    ]
    const confirmDialog = ask('confirm')

    const dataframeDef = new DataFrameDef({
      name: 'profile',
      slotDefs,
      confirmDialog
    })

    expect(dataframeDef.name).toBe('profile')
    expect(dataframeDef.slotDefs).toEqual(slotDefs)
    expect(dataframeDef.confirmDialog).toEqual(confirmDialog)
  })

  test('values should be type checked', async () => {
    const defaultSpec = {
      name: 'profile',
      slotDefs: [
        new SlotDef({ name: 'name', type: 'string' }),
        new SlotDef({ name: 'age', type: 'number' })
      ]
    }

    expect(
      () => new DataFrameDef(_.defaults({ name: 123 }, defaultSpec))
    ).toThrow('name must be a string')

    expect(
      () => new DataFrameDef(_.defaults({ slotDefs: 123 }, defaultSpec))
    ).toThrow('slotDefs must be an array')

    expect(
      () => new DataFrameDef(_.defaults({ confirmDialog: 123 }, defaultSpec))
    ).toThrow('confirmDialog must be an action')
  })
})
