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

const { ask } = require('../../../core/patterns/ask.js')

const SlotDef = require('../slot-def.js')
const Slot = require('../slot.js')

describe('slot', () => {
  test('constructor arg must be a slot def', async () => {
    expect(
      () => new Slot(123)
    ).toThrow('constructor arg must be a slot def')
  })

  test('def attributes should be accessible', async () => {
    const addressDialog = ask('ask_address')

    const slot = new Slot(new SlotDef({
      name: 'fullAddress',
      dialog: addressDialog,
      prompt: 'ask_address',
      children: [
        { name: 'address', type: 'any' },
        { name: 'apt_number', type: 'unit' }
      ]
    }))

    expect(slot.getName()).toBe('fullAddress')
    expect(slot.getType()).toBe('composite')
    expect(slot.isRequired()).toBe(true)
    expect(slot.getDialog()).toEqual(addressDialog)
    expect(slot.getPrompt()).toBe('ask_address')
    expect(slot.getChildren()).toEqual([
      new SlotDef({ name: 'address', type: 'any' }),
      new SlotDef({ name: 'apt_number', type: 'unit' })
    ])
  })

  test('state and value should be updated properly', async () => {
    const slot = new Slot(new SlotDef({
      name: 'payment_amount',
      type: 'currency'
    }))

    expect(slot.state).toBe(null)
    expect(slot.value).toBe(null)
    expect(!slot.isFilled() && !slot.isConfirmed()).toBe(true)

    slot.setValue(50)

    expect(slot.state).toBe('set')
    expect(slot.value).toBe(50)
    expect(slot.isFilled() && !slot.isConfirmed()).toBe(true)

    slot.confirm()

    expect(slot.state).toBe('confirmed')
    expect(slot.value).toBe(50)
    expect(slot.isFilled() && slot.isConfirmed()).toBe(true)

    slot.reset()

    expect(slot.state).toBe(null)
    expect(slot.value).toBe(null)
    expect(!slot.isFilled() && !slot.isConfirmed()).toBe(true)
  })

  test('hierarchy should be built properly', async () => {
    const checkSlot = (slot, slotName, childCount) => {
      expect(slot.getName()).toBe(slotName)
      expect(slot.getChildren().length).toBe(childCount)
    }

    const parentSlotDef = new SlotDef({
      name: 'parent',
      children: [
        { name: 'child_1', type: 'int' },
        {
          name: 'child_2',
          children: [
            { name: 'grandchild_1', type: 'int' },
            { name: 'grandchild_2', type: 'string' }]
        }
      ]
    })

    const parentSlot = new Slot(parentSlotDef)

    checkSlot(parentSlot, 'parent', 2)
    checkSlot(parentSlot.children[0], 'child_1', 0)
    checkSlot(parentSlot.children[1], 'child_2', 2)
    checkSlot(parentSlot.children[1].children[0], 'grandchild_1', 0)
    checkSlot(parentSlot.children[1].children[1], 'grandchild_2', 0)
  })
})
