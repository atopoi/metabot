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

/*
 *===============================
 * Event
 *===============================
 */

const Context = require('./context')


const botEvent = (type, context, params) => ({
  sender: 'bot',
  type,
  context,
  ...params
})


// TODO:
const controlEvent = (ctx, name, params) => {
  if (Context.modeNoIO(ctx)) return
  const data = { name, params }
  ctx.conversation.emitBotEvent(botEvent('control', ctx, data))
}


// TODO: document eventData
const focusEvent = (ctx, level, tag, focusObject, eventData = {}) => {
  if (Context.modeNoIO(ctx)) return
  const data = { ...eventData, op: { level, tag, focus: focusObject } }
  ctx.conversation.emitBotEvent(botEvent('focus', ctx, data))
}


const reactorEventDebugDepth = (label, data) => {
  switch (label) {
  case 'INPUT': return 1
  case 'R:try-reactors': return 4
  case 'R:match': return data.result !== false ? 2 : 4
  case 'R:action': return data.step === 'done' ? 2 : 3
  case 'R:push': return 1
  case 'R:ask':
    switch (data.step) {
    case 'start': return 1
    case 'handled':
    case 'asyncDoneRetryMain':
      return 2
    default: return 3
    }
  default:
  }
  return 5
}

// TODO: document eventData
const reactorEvent = (ctx, label, eventData = {}) => {
  if (Context.modeNoIO(ctx)) return
  const data = { ...eventData, debugLevel: reactorEventDebugDepth(label, eventData) }
  ctx.conversation.emitBotEvent(botEvent('reactor', ctx, { label, data }))
}


const createUserEvent = (type, data) => ({ type, data, sender: 'user' })


const botTextEvent = (text, ctx, params) => {
  ctx.conversation.emitBotEvent(botEvent('utterance', ctx, { ...params, text }))
}


module.exports = {
  botEvent,
  controlEvent,
  focusEvent,
  reactorEvent,
  createUserEvent,
  botTextEvent
}
