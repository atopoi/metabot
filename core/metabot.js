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

/* eslint arrow-body-style: 0 */
/* eslint no-unused-vars: 0 */
/*
 *==============================
 *  Metabot
 *==============================
*/

const opi = require('object-path-immutable')

const EventEmitter = require('events')
const Context = require('./context')
const { localizeText, resolveText } = require('./localize.js')
const { Mailbox } = require('./event-utils/mailbox')
const {
  createUserEvent, botEvent, botTextEvent, reactorEvent, controlEvent
} = require('./event.js')
const Outcome = require('./outcome.js')
const { forkRun } = require('./action.js')
const { describeIntentsCatalog, INTENT_TYPES } = require('./intent')


class MetabotClass extends EventEmitter {
}

const Metabot = new MetabotClass()


/*
 *==============================
 *  Event and reactor handling
 *==============================
*/

// adds the reactor to the context
Metabot.pushReactor = (ctx, level, reactor) => {
  /* eslint no-param-reassign: 0 */
  reactor.owner = ctx.tasks[0] || ctx.agent
  const newCtx = opi.update(ctx, ['reactors', level], reactors => (reactors ? [reactor, ...reactors] : [reactor]))
  reactorEvent(newCtx, 'R:push', { level, reactor })
  return newCtx
}


Metabot.matchReactors = async (ctx, event, level) => {
  const reactors = ctx.reactors && ctx.reactors[level]
  reactorEvent(ctx, 'R:try-reactors', { level, reactors, info: reactors ? reactors.length : 0 })

  if (!reactors || reactors.length === 0) return false

  // find matching reactor
  // TODO: deal with multiple matches
  // TODO: are reactors allowed to modify the ctx (if they succed or if they fail)?
  let result = null
  const reactor = reactors.find(
    rr => {
      const res = rr.accept(event)
      reactorEvent(ctx, 'R:match', {
        level, step: 'try', reactor: rr, result: res, info: res || 'failed'
      })
      if (!res) return false
      result = res
      return true
    }
  )

  if (reactor) {
    if (!reactor.action) throw Error('Reactor with no action')
    reactorEvent(ctx, 'R:action', {
      level, step: 'action-start', reactor, result
    })
    // TODO: replace forkRun by
    // const outcome = await reactor.runAction(result, ctx)
    const outcome = await forkRun(Outcome.success(result, ctx), reactor.action)
    reactorEvent(ctx, 'R:action', {
      level, step: 'action-done', reactor, outcome, event, result
    })
    return {
      reactor, event, result, outcome
    }
  }
  return false
}


Metabot.tryReactors = async (ctx, event) => {
  // TODO: run through all levels
  const top = await Metabot.matchReactors(ctx, event, 'top')
  return top || await Metabot.matchReactors(ctx, event, 'dataframe')
}


/*
 *==============================
 *  IO : output
 *==============================
*/

Metabot.localize = (ctx, messageId, messageData) => {
  if (!ctx.conversation) return false
  const bot = ctx.conversation.bot
  const messageDict = bot && bot.messageDict
  const language = ctx.conversation.language
  return messageDict && language && localizeText(messageDict, language, messageId, messageData)
}


Metabot.hasMessage = (ctx, messageId) => !!Metabot.localize(ctx, messageId)


Metabot.say = (ctx, message, { messageData }) => {
  if (Context.modeNoIO(ctx)) return
  const keyOrString = message.trim()
  const localizedText = Metabot.localize(ctx, keyOrString, messageData)
  const textPattern = localizedText || keyOrString
  const utterance = resolveText(textPattern, messageData)

  if (localizedText) utterance.key = keyOrString

  botTextEvent(utterance, ctx)
}


/*
 *==============================
 *  IO : input
 *==============================
*/

Metabot.processEvent = async (event, ctx, currAsker) => {
  // Handle help request - naive implementation
  // TODO: ! delegate to asker
  if (event.data.text === '#help') {
    const helpId = `${currAsker.question}_help`
    reactorEvent(ctx, 'R:ask', {
      level: '#help', step: 'try', info: `msg: ${helpId}; found: ${Metabot.localize(ctx, helpId) && true}`
    })
    // run asker with help question (should be delegated)
    if (Metabot.localize(ctx, helpId)) return currAsker.ask(ctx, helpId)
    // not handled, ignore and resume the task
    reactorEvent(ctx, 'R:ask', {
      level: '#help', step: 'not_handled', info: event.data
    })
    return currAsker.resumeOnInterrupt(ctx)
  }

  // TODO: should try first widget id match on current questions

  // First try event handlers added in the dialog
  const reactorResult = await Metabot.tryReactors(ctx, event)
  if (reactorResult) {
    // some handler caught the user request, log and then resume the question
    // TODO: log the reaction
    const { reactor, result, outcome } = reactorResult
    reactorEvent(ctx, 'R:ask', {
      level: 'async', step: 'handled', reactor, result, info: `outcome: ${outcome && outcome.val}`
    })
    // console.dir(outcome.ctx.env)
    // Now go back to the question (still unanswered) and try again
    reactorEvent(ctx, 'R:ask', {
      level: 'async', step: 'asyncDoneRetryMain'
    })
    return currAsker.resumeOnInterrupt(outcome.ctx)
  }
  // No reactor consumed the event, the current asker consumes it
  // TODO: check user event timestamp is after the question
  const result = currAsker.acceptor(event.data)

  const reactionInfo = {
    level: 'main',
    step: 'accept?',
    info: result ? 'accepted' : 'rejected',
    result
  }
  reactorEvent(ctx, 'R:ask', reactionInfo)

  if (result) return { result, event, ctx }

  // TODO: check what is left unconsumed in the event and process it
  // TODO: proper failure processing
  return false
}


const createAsk = (question, acceptor, params = {}) => {
  const asker = {
    state: { iteration: 0 },
    question,
    acceptor,
    async ask(ctx, currentQuestion) {
      this.state.iteration += 1
      reactorEvent(ctx, 'R:ask', { level: 'main', step: 'start', info: `iter: ${this.state.iteration}` })
      Metabot.say(ctx, currentQuestion || this.question, params)
      reactorEvent(ctx, 'R:ask', { level: 'main', step: 'asked', info: question })
      return await Metabot.waitAnswer(ctx, this)
    },
    async run(ctx) {
      return await this.ask(ctx)
    },
    async resumeOnInterrupt(ctx) {
      reactorEvent(ctx, 'R:ask', { level: 'main', step: 'resumeOnInterrupt', info: question })
      return await this.ask(ctx)
    }
  }
  return asker
}


Metabot.ask = async (ctx, question, acceptor, params = {}) => {
  const task = createAsk(question, acceptor, params)
  return await task.run(ctx)
}


Metabot.waitAnswer = async (ctx, task) => {
  controlEvent(ctx, 'waitAnswer', task)
  return await Metabot.processNextUserEvent(ctx, task)
}


Metabot.processNextUserEvent = async (ctx, currentWaitingTask) => {
  const event = await Metabot.getNextUserEvent(ctx)
  reactorEvent(ctx, 'INPUT', { step: 'received', info: event.data })
  return event && await Metabot.processEvent(event, ctx, currentWaitingTask)
}


Metabot.getNextUserEvent = async ctx => {
  if (Context.modeNoIO(ctx)) {
    return await Metabot.getNextMockUserEvent(ctx)
  }
  return await ctx.mailbox.receive()
}


Metabot.getNextMockUserEvent = ctx => {
  const answers = ctx.testMode.answers || []
  const answer = answers.shift()
  if (!answer) return false
  return createUserEvent('userUtterance', answer)
}


/*
 *==============================
 *  Start - Stop
 *==============================
*/

Metabot.start = (bot, conversation) => {
  const mailbox = new Mailbox()
  const ctx = Context.createContext({ conversation, mailbox, bot })

  conversation.onUserEvent(event => { mailbox.send(event) })
  conversation.start(bot)
  // TODO: this should work!
  // controlEvent(ctx, 'botStarted',{bot, messages: bot.messages, intents:describeIntentsCatalog()})
  bot.run(ctx)
}


Metabot.stop = conversation => {
  conversation.stop()
}


module.exports = { Metabot }
