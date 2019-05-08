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
const assert = require('assert')

const Outcome = require('../outcome.js')
const { run, Action, Task } = require('../action.js')
const defaultPolicy = require('../policy.js')
const {
  askOnce, DO, fail, succeed
} = require('../lang.js')


// Valid signatures: message, message + type, parameters object
const extractAskParameters = (arg1, arg2) => {
  if (_.isString(arg1)) {
    if (_.isNull(arg2)) return { messages: [arg1], type: 'any' }
    if (_.isString(arg2)) return { messages: [arg1], type: arg2 }

    throw Error('second argument, if present, must be a string')
  }

  if (_.isObject(arg1)) {
    assert(_.isString(arg1.message) || _.isArray(arg1.message))
    const messages = _.isString(arg1.message) ? [arg1.message] : arg1.message
    const confirmDialog = _.isString(arg1.confirm) ? getYesNo(arg1.confirm) : arg1.confirm

    return {
      name: arg1.name || messages[0],
      messages,
      type: arg1.type || 'any',
      maxAttempts: arg1.maxAttempts,
      exceptionOnMaxAttempts: arg1.exceptionOnMaxAttempts,
      messageData: arg1.messageData,
      confirmDialog,
      filter: arg1.filter
    }
  }

  throw Error('first argument must be a message or a parameters object')
}


const ask = (arg1, arg2 = null) => {
  const params = extractAskParameters(arg1, arg2)

  // create task
  const taskName = params.name || `ask:${params.messages[0]}`
  const askTask = new Task({
    name: taskName,
    icon: 'ᗏ',
    params
  })

  // define the task methods
  askTask.init = ctx => {
    // Get policy from agent (that's why we need to do it at runtime, when ctx is known)
    const policy = (ctx.agent && ctx.agent.policy) ? ctx.agent.policy : defaultPolicy
    const maxAttempts = params.maxAttempts || policy.ask.maxAttempts
    const exceptionOnMaxAttempts = params.exceptionOnMaxAttempts
      || policy.ask.exceptionOnMaxAttempts

    askTask.state = {
      attempts: 0, messageIndex: 0, maxAttempts, iterations: 0
    }
    if (exceptionOnMaxAttempts) askTask.state.exceptionOnMaxAttempts = true
  }

  // the main method running the actual ask actions
  askTask.asker = async ctx => {
    const {
      attempts, messageIndex, maxAttempts, exceptionOnMaxAttempts
    } = askTask.state

    // Send ask request for current prompt
    let prompt
    if (params.messages.length > 1) { // Progressive messages already defined
      prompt = params.messages[messageIndex]
    } else { // Progressive messages not defined
      prompt = params.messages[0]
      const isMessageId = _.snakeCase(prompt) === prompt
      if (isMessageId && askTask.state.attempts > 0) {
        prompt += `_error_${askTask.state.attempts}`
      }
    }

    const outcome = await run(askOnce(prompt, params), ctx)

    // On failure, retry if there are other attempts left
    const { failure, val, ctx: ctx2 } = outcome
    if (failure) {
      // Check max attempts
      if (maxAttempts && attempts >= maxAttempts - 1) {
        if (exceptionOnMaxAttempts) {
          // TODO: log event
          return Outcome.exception('maxAttempts', { attempts, maxAttempts }, ctx2)
        }
        return Outcome.failure('maxAttempts', ctx2)
      }
      askTask.state.attempts += 1
      askTask.state.messageIndex = (messageIndex + 1 < params.messages.length
        ? messageIndex + 1
        : messageIndex)
      return await askTask.asker(ctx2)
    }

    // Confirm if required
    const confirmDialog = params.confirmDialog
    if (confirmDialog) {
      const confirmation = await run(confirmDialog, ctx2)
      // TODO: should change to reflect confirmation failure?
      if (confirmation.failure) {
        // TODO: should we realy re-initialize?
        askTask.init(ctx2)
        return await askTask.run(ctx2)
      }
      return Outcome.success(val, confirmation.ctx)
    }

    // No confirmation needed, return result
    return outcome
  }

  askTask.action = askTask.asker

  // Now the ask pattern produces an action that creates the ask task at runtime and executes it
  return new Action(
    async ctx => {
      askTask.init(ctx)
      return await askTask.run(ctx)
    },
    ['ask', params]
  ).withIcon('ᗏ')
}


const getYesNo = (message, messageData = {}) => (
  ask({
    name: 'getYesNo',
    message,
    type: 'yes_no',
    messageData
  }).filter(res => res.val === 'yes')
    .withInfo('getYesNo', message)
)


const actionMenu = params => {
  const { prompt, choices, onNoSelection } = params
  // create a dictionary for the actions
  const actionDict = {}
  const choiceLines = choices.map(([name, fullName, action]) => {
    actionDict[name] = action
    actionDict[fullName] = action
    return `${name}) ${fullName}`
  })

  const message = `${prompt}\n${choiceLines.join('\n')}`
  return DO(
    ask(message, 'any'),
    choice => actionDict[choice.val] || onNoSelection || fail('actionMenu: nothing selected')
  )
}


const select = params => {
  const {
    prompt, choices, extraChoice, noChoiceDialog, onNoSelection
  } = params

  const proc = async ctx => {
    if (choices.length === 0) {
      if (noChoiceDialog === undefined) {
        return Outcome.failure('undefined_no_choice_dialog', ctx)
      }
      return await noChoiceDialog.run(ctx)
    }

    if (choices.length === 1 && extraChoice === undefined) {
      return Outcome.success(choices[0], ctx)
    }

    let menuChoices = choices.map(
      (choice, index) => [index + 1, choice, succeed(choice)]
    )
    if (extraChoice !== undefined) {
      menuChoices = menuChoices.concat([
        [menuChoices.length + 1, extraChoice.label, extraChoice.dialog]
      ])
    }

    const dialog = actionMenu({ prompt, choices: menuChoices, onNoSelection })

    return await dialog.run(ctx)
  }
  return new Action(proc, ['select', prompt, choices, onNoSelection])
}


module.exports = {
  actionMenu, ask, getYesNo, select
}
