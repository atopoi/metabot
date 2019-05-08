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

const SlotDef = require('../slot-def.js')

const { ask } = require('../../../core/patterns/ask.js')

describe('slot def', () => {
  test('mandatory values must be specified', async () => {
    expect(() => new SlotDef()).toThrow('name and type are mandatory')

    expect(() => new SlotDef({ type: 'string' })).toThrow('name is mandatory')

    expect(() => new SlotDef({ name: 'address' })).toThrow('type is mandatory')
  })

  test('default value should be set if no value is provided', async () => {
    const slotDef = new SlotDef({ name: 'address', type: 'string' })

    expect(slotDef.required).toBe(true)
    expect(slotDef.dialog).toBeNull()
    expect(slotDef.prompt).toBeNull()
    expect(slotDef.children).toEqual([])
  })

  test('specified values should be set', async () => {
    const aptNumberDialog = ask('ask_apt_number')

    const slotDef = new SlotDef({
      name: 'fullAddress',
      type: 'composite',
      required: true,
      dialog: aptNumberDialog,
      prompt: 'ask_apt_number',
      children: [
        { name: 'address', type: 'any' },
        { name: 'apt_number', type: 'unit' }
      ]
    })

    expect(slotDef.name).toBe('fullAddress')
    expect(slotDef.type).toBe('composite')
    expect(slotDef.required).toBe(true)
    expect(slotDef.dialog).toEqual(aptNumberDialog)
    expect(slotDef.prompt).toBe('ask_apt_number')
    expect(slotDef.children).toEqual([
      new SlotDef({ name: 'address', type: 'any' }),
      new SlotDef({ name: 'apt_number', type: 'unit' })
    ])
  })

  test('values should be type checked', async () => {
    const defaultSpec = { name: 'address', type: 'string' }

    expect(
      () => new SlotDef(_.defaults({ name: 123 }, defaultSpec))
    ).toThrow('name must be a string')

    expect(
      () => new SlotDef(_.defaults({ type: 123 }, defaultSpec))
    ).toThrow('type must be a string')

    expect(
      () => new SlotDef(_.defaults({ required: 123 }, defaultSpec))
    ).toThrow('required must be a boolean')

    expect(
      () => new SlotDef(_.defaults({ dialog: 123 }, defaultSpec))
    ).toThrow('dialog must be an action')

    expect(
      () => new SlotDef(_.defaults({ prompt: 123 }, defaultSpec))
    ).toThrow('prompt must be a string')

    expect(
      () => new SlotDef(_.defaults({ children: [] }, defaultSpec))
    ).toThrow('children only exist for composite slots')

    expect(
      () => new SlotDef(_.defaults({ type: 'composite', children: 123 }, defaultSpec))
    ).toThrow('children must be an array')

    expect(
      () => new SlotDef(_.defaults({ type: 'composite', children: [] }, defaultSpec))
    ).toThrow('children must be a non empty array')
  })
})
