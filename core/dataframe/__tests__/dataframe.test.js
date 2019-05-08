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

const { defineDataframe } = require('../dataframe-def.js')
const DataFrame = require('../dataframe.js')
const Slot = require('../slot.js')
const SlotDef = require('../slot-def.js')

const confirmDialog = ask('confirm')

const dataframeDef = defineDataframe({
  name: 'hierarchy',
  slots: [
    {
      name: 'parent_1',
      children: [
        { name: 'child_1', type: 'int' },
        {
          name: 'child_2',
          children: [
            { name: 'grandchild_1', type: 'int' },
            { name: 'grandchild_2', type: 'string' }]
        }
      ]
    },
    {
      name: 'parent_2',
      children: [
        { name: 'child_3', type: 'int' }
      ]
    }
  ],
  confirmDialog
})

describe('dataframe', () => {
  test('constructor arg must be a dataframe def', async () => {
    expect(
      () => new DataFrame(123)
    ).toThrow('constructor arg must be a dataframe def')
  })

  test('def attributes should be accessible', async () => {
    const dataframe = new DataFrame(dataframeDef)

    expect(dataframe.getName()).toBe('hierarchy')
    expect(dataframe.getConfirmDialog()).toEqual(confirmDialog)
  })

  test('get slot by name should return the right slot', async () => {
    const dataframe = new DataFrame(dataframeDef)

    const actualSlot = dataframe.getSlotByName('child_3')

    const expectedSlot = new Slot(new SlotDef({ name: 'child_3', type: 'int' }))

    expect(actualSlot).toEqual(expectedSlot)
  })

  test('get slot by type should return the right slots', async () => {
    const dataframe = new DataFrame(dataframeDef)

    const slots = dataframe.getSlotsByType('int')

    const expectedFirstSlot = new Slot(new SlotDef({
      name: 'child_1', type: 'int'
    }))

    const expectedSecondSlot = new Slot(new SlotDef(
      { name: 'grandchild_1', type: 'int' }
    ))

    const expectedThirdSlot = new Slot(new SlotDef(
      { name: 'child_3', type: 'int' }
    ))

    expect(slots).toEqual([expectedFirstSlot, expectedSecondSlot, expectedThirdSlot])
  })

  test('fill logic is correct', async () => {
    const dataframe = new DataFrame(dataframeDef)

    expect(dataframe.isEmpty()).toBe(true) // No slot filled
    expect(dataframe.isPartiallyFilled()).toBe(false)
    expect(dataframe.isComplete()).toBe(false)

    dataframe.updateSlot('parent_1', slot => slot.setValue('a')) // Fill first slot

    expect(dataframe.isEmpty()).toBe(false) // One slot filled
    expect(dataframe.isPartiallyFilled()).toBe(true)
    expect(dataframe.isComplete()).toBe(false)

    dataframe.updateSlot('child_1', 1) // Fill remaining slots
    dataframe.updateSlot('child_2', 'b')
    dataframe.updateSlot('grandchild_1', 2)
    dataframe.updateSlot('grandchild_2', 'c')
    dataframe.updateSlot('parent_2', 3)
    dataframe.updateSlot('child_3', 4)

    expect(dataframe.getSlotValues()).toEqual({
      parent_1: 'a',
      child_1: 1,
      child_2: 'b',
      grandchild_1: 2,
      grandchild_2: 'c',
      parent_2: 3,
      child_3: 4
    })

    expect(dataframe.isEmpty()).toBe(false) // All slots filled
    expect(dataframe.isPartiallyFilled()).toBe(false)
    expect(dataframe.isComplete()).toBe(true)

    dataframe.reset() // Reset
    expect(dataframe.slotList.every(slot => !slot.isFilled())).toBe(true)
  })
})
