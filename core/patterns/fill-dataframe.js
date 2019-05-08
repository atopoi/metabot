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

const Context = require('../context.js')
const { Metabot } = require('../metabot.js')
const { Action } = require('../action.js')
const { DataFrameDef, defineDataframe } = require('../dataframe/dataframe-def.js')
const Dataframe = require('../dataframe/dataframe.js')
const {
  DO, fail, filter, GET_DATAFRAME, GET_SLOT_OBJECT, GET_SLOT, SET_SLOT, IF, loopWhile, succeed, TASK
} = require('../lang.js')
const { ask, getYesNo } = require('./ask.js')


const withDataframe = (dataframeSpec, dataframeAction) => new Action(
  async ctx => {
    const dataframeDef = dataframeSpec instanceof DataFrameDef
      ? dataframeSpec
      : defineDataframe(dataframeSpec)

    const dataframe = new Dataframe(dataframeDef)
    const dataframeName = dataframeDef.name
    const reactor = dataframe.toReactor()
    reactor.icon = '⌸'

    // TODO: unify Context manipulations in Metabot
    const ctx2 = Context.setDataframe(ctx, dataframeName, dataframe)
    const ctx3 = Metabot.pushReactor(ctx2, 'dataframe', reactor)
    // TODO: error handling with try/catch
    const res = await dataframeAction(dataframe).run(ctx3)
    // TODO: restore ctx: remove dataframe and reactor
    return res
  },
  ['withDataframe', dataframeSpec, dataframeAction]
)


const fillDataframe = dataframeSpec => {
  const getConfirmDialog = dataframe => {
    const defaultConfirmDialog = getYesNo('confirm')
    // TODO: Laurence: note que ca ne semble pas valide pour le cas defaultConfirmDialog!
    const dialog = (dataframe.getConfirmDialog()
      || defaultConfirmDialog)(dataframe.getSlotValues())
    dialog.name = `fillDataframe:${dataframe.getName()}_confirm`
    return dialog
  }

  return withDataframe(
    dataframeSpec,

    dataframe => {
      const task = TASK({
        name: `fill_dataframe:${dataframe.getName()}`,
        icon: '⌸',
        action: DO(
          dataframeSpec.fillSlots ? dataframeSpec.fillSlots({
            fill: fillDataframeSlot(dataframeSpec.name),
            get: getDataframeSlotValue(dataframeSpec.name),
            set: setDataframeSlotValue(dataframeSpec.name)
          })
            : fillAllSlots(dataframe.getName()),
          IF(
            // Confirm
            DO(
              GET_DATAFRAME(dataframe.getName()),
              filledDataframe => getConfirmDialog(filledDataframe)
            ),
            // return dataframe
            // TODO: immutable version could be:
            //   GET_DATAFRAME(dataframe.getName()),
            succeed(dataframe),
            // TODO: implement change/cancel/retry/return failure
            fail('confirmation failure')
          )
        )
      })
      dataframe.setFillTask(task)
      return task
    }
  )
}


const fillDataframeSlot = dataframeName => slotName => fillSlot(dataframeName, slotName)

const getDataframeSlotValue = dataframeName => slotName => GET_SLOT(dataframeName, slotName)

const setDataframeSlotValue = dataframeName => (
  (slotName, slotValue) => SET_SLOT(dataframeName, slotName, slotValue)
)


const fillAllSlots = dataframeName => TASK({
  name: `fill_slots:${dataframeName}`,
  icon: '⟳',
  action: loopWhile(
    filter(dataframe => !dataframe.isComplete(), GET_DATAFRAME(dataframeName)),
    DO(
      GET_DATAFRAME(dataframeName),
      dataframe => fillSlot(dataframeName, dataframe.getNextSlotToFill())
    )
  )
}).withInfo('fillAllSlots', dataframeName)


const getDialog = (dataframe, slot) => {
  const dialog = slot.getDialog()
  if (dialog) return dialog

  let prompt = slot.getPrompt()
  if (!prompt) {
    prompt = `ask_${_.snakeCase(slot.getName())}`
  } else if (_.isFunction(prompt)) {
    prompt = prompt(dataframe)
  }
  return ask({
    message: prompt,
    type: slot.getType(),
    name: prompt
  })
}


const fillSlot = (dataframeName, slotName) => TASK({
  name: `fill_slot:${slotName}`,
  icon: '⍇',
  action: DO(
    GET_DATAFRAME(dataframeName),
    dataframe => DO(
      GET_SLOT_OBJECT(dataframeName, slotName),
      slot => getDialog(dataframe, slot)
    ),
    value => SET_SLOT(dataframeName, slotName, value)
  )
}).withInfo('fillSlot', dataframeName, slotName)


module.exports = { fillDataframe }
