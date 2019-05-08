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

/* eslint no-restricted-syntax: 0 */
/* eslint no-await-in-loop: 0 */
/* eslint no-unused-vars: 0 */
/*
 *===========================================
 * Metabot's Core language and constructs
 *===========================================
 */

const assert = require('assert')
const axios = require('axios')
const _ = require('lodash')

const Outcome = require('./outcome.js')
const { run, Action, Task } = require('./action.js')
const { Metabot } = require('./metabot.js')
const { equalValue, toValue } = require('./entity.js')

const Context = require('./context.js')
const { reactorFromIntent } = require('./reactor.js')


/*
 *================================
 * Basic Actions
 *================================
 */

const fail = (failureType, message) => new Action(
  ctx => Outcome.failure(failureType, ctx, message),
  ['fail', failureType, message]
)


const cancel = (failureType, message) => new Action(
  ctx => Outcome.cancelation(failureType, ctx, message),
  ['cancel', failureType, message]
)

const throwException = (type, error) => new Action(ctx => Outcome.exception(type, error, ctx), ['exception', type, error])


const succeed = val => new Action(ctx => Outcome.success(val, ctx), ['succeed', val])


const lift = val => (val instanceof Action ? val : succeed(val))


/* ``succeedIf(predicate)`` applies predicate to its argument,
   and fails if the predicate returns false (compared using ===)
   and succeeds with the orginal argument value otherwise
   */
const succeedIf = predicate => val => new Action(
  ctx => (predicate(val) === false ? Outcome.failure(true, ctx) : Outcome.success(val, ctx)),
  ['succeedIf', predicate, val]
)


const CALL_SERVICE = (url, params) => {
  const proc = async ctx => {
    try {
      const res = await axios.get(url, { params })

      if (res.data) return Outcome.success(res.data, ctx)
      return Outcome.exception('serviceError', res.error, ctx)
    } catch (error) {
      return Outcome.exception('serviceError', error, ctx)
    }
  }
  return new Action(proc, ['CALL_SERVICE', url, params])
}


/*
 *================================
 * IO Primitves
 *================================
 */

const say = (message, messageData = {}) => {
  const proc = ctx => {
    Metabot.say(ctx, message, { messageData })
    return Outcome.success(message, ctx)
  }
  return new Action(proc, ['say', message]).withIcon('>')
}


/* The "low level" ask primitive */
const askOnce = (message, params = {}) => {
  const { messageData = {}, type } = params

  const proc = async ctx => {
    const acceptor = utterance => {
      const res = utterance.extractType(type)
      if (res && params.filter) {
        if (params.filter(toValue(res))) { return res }
        return null
      }
      return res
    }

    return await Metabot.ask(ctx, message, acceptor, { messageData }).then(
      // TODO: metabot ask should return an outcome
      // TODO: errors should become Metabot exceptions and return in the results flow
      res => (res ? Outcome.success(res.result, res.ctx) : Outcome.failure('ask fail', ctx)),
      err => Outcome.exception(err, ctx)
    )
  }

  return new Action(proc, ['askOnce', message, type]).withIcon('ᗏ')
}


/*
 *=================================
 * Basic Combinators and patterns
 *=================================
 */

/* The DO operator and notation
``DO`` is the basic chaining operator that becomes the first level of the DSL.
 It encompasses the "map", "then", and "bind" operators

 Note: this unorthodox recursion pattern is necessary because of the fork's polymorphism
 */
const DO = (A, B, ...others) => {
  // TODO could be rewritten as loop to keep a unique call frame
  if (!B) return A

  return DO(A.fork(B), ...others)
    .withInfo('DO', A, B, ...others)
    .withIcon('┉')
}


const DO_FOR = (iterable, looperAction, continueLoopIfFailed) => {
  const looper = async ctx => {
    let currentCtx = ctx
    let res
    for (const el of iterable) {
      res = await run(looperAction(el), currentCtx)
      if (!Outcome.isSuccess(res) && !continueLoopIfFailed) return res
      currentCtx = res.ctx
    }
    return res || Outcome.success(true, ctx)
  }

  return new Action(looper, ['DO_FOR', iterable, looperAction]).withIcon('┉')
}


/* The ALT operator
 It takes Actions as parameters, and it tries them in sequence until one of
 them succeeds, returning the success result, or failing if none of them succeeds.
 One can can think of this operator as a stateful "or".
*/
const ALT = (A, ...others) => {
  if (!A) return fail('ALT no lasuse left').withInfo('ALT')

  if (others.length === 0) return A

  // We want a lazy creation/call, thus the ``() => ...` wrapper
  return A.fork(null, () => ALT(...others))
    .withInfo('ALT', A, ...others)
    .withIcon('ᗕ')
}


/* ALT_FOR
 Similar to ALT, but instead of a sequence of Actions, it tries the actions
 ``A(x)`` where A is a Action constructor, and x takes it's value for a list or other iterable.
*/
const ALT_FOR = (iterable, A) => {
  const proc = async ctx => {
    let currentCtx = ctx
    for (const x of iterable) {
      const res = await run(A(x), currentCtx)
      // if A(x) succeeds, return result
      if (Outcome.isSuccess(res)) return res
      currentCtx = res.ctx
    }
    // nothing worked, return failure
    return Outcome.failure(false, currentCtx)
  }
  return new Action(proc, ['ALT_FOR', iterable, A]).withIcon('ᗕ')
}


const SWITCH = (actionOrValue, ...caseClauses) => {
  const proc = async ctx => {
    const action = actionOrValue instanceof Action ? actionOrValue : succeed(actionOrValue)
    const res = await run(action, ctx)
    if (Outcome.isSuccess(res)) {
      const lastCaseClause = caseClauses[caseClauses.length - 1]
      const defaultCaseClause = lastCaseClause.isDefault === true ? lastCaseClause : null

      const regularCaseClauses = defaultCaseClause
        ? caseClauses.slice(0, caseClauses.length - 1)
        : caseClauses

      for (const caseClause of regularCaseClauses) {
        if (equalValue(caseClause.value, res.val)) {
          return run(caseClause.action, ctx)
        }
      }

      if (defaultCaseClause) return run(defaultCaseClause.action, ctx)

      return Outcome.failure('no matching case clause', ctx)
    }

    return Outcome.failure('switch action failure', ctx)
  }
  return new Action(proc, ['SWITCH', actionOrValue, caseClauses])
}


const CASE = (value, ...actions) => (
  { value, action: DO(...actions) }
)


const DEFAULT = (...actions) => (
  { isDefault: true, action: DO(...actions) }
)


// exec(f) is an Action that just executes f() and returns the value with success
const exec = func => new Action(
  ctx => Outcome.success(func(), ctx),
  ['exec', func]
)


// ``call`` transforms a function (ctx) => res into an Action
const call = runner => new Action(
  runner,
  ['call', runner]
)


// ``guard(predicate: ctx -> bool, failureAction)``
// succeeds iff predicate(ctx) is true, and returns true,
// and runs failureAction (or fail as default) otherwise
const guard = (predicate, failureAction) => new Action(
  async ctx => {
    const res = await predicate(ctx)
    if (res !== false) return Outcome.success(res, ctx)
    if (failureAction) return await run(failureAction, ctx)
    return Outcome.failure(true, 'guard failed')
  },
  ['guard', predicate, failureAction]
).withIcon('⌲')


/*
 The standalone ``map`` for the monad
 ``map(f, A : Action)`` is a new Action that returns f(x) when A returns
 successfully a value x, and fails otherwise.

 Note however that in the DO notation, following A by f will do the same:
 ``DO(A, f)``
 and there is again another way to express it:
 ``A.map(f)``
 */
const map = (f, action) => action.map(f)


const filter = (predicate, action) => {
  // without action as argument, returns a kind of currified form,
  // taking a previous outcome's successful value as input
  // TODO needs a more efficient implementation
  if (action === undefined) {
    return val => filter(predicate, succeed(val))
  }
  // otherwise connects action with the predicate using the .finter method
  return action.filter(predicate)
    .withInfo('filter', predicate, action)
    .withIcon('⌲')
}


const IF = (test, onSuccess, onFailure = succeed) => lift(test)
  .fork(onSuccess, onFailure)
  .withInfo('IF', test, onSuccess, onFailure)


const equals = (value, action) => filter(res => equalValue(res, value), lift(action))


const loop = (action, continueLoopIfFailed) => {
  const action2 = continueLoopIfFailed
    ? ALT(action, succeed(true))
    : action

  const looper = ALT(
    DO(
      action2,
      () => looper
    ),
    succeed(true)
  ).withInfo('loop', action, continueLoopIfFailed)
    .withIcon('⟳')

  return looper
}


const loopWhile = (condition, main) => {
  const looper = IF(
    condition,
    DO(
      ALT(main, succeed(true)),
      () => looper
    ),
    succeed(true)
  )

  return looper.then(succeed(true))
    .withInfo('loopWhile', condition, main)
    .withIcon('⟳')
}


const repeat = (n, action) => action
  .then(res => (n > 1 ? repeat(n - 1, action) : res))
  .withInfo('repeat', n, action)
  .withIcon('⟳')


/*
 *=================================
 * Event reactors
 *=================================
 */

/* The ON combinator binds a condition to an action in a reactor
   It adds it to the context in the current task scope. Then during
  in the task process, the reactor will listen to events and trigger on the condition.
*/

const ON = (condition, action) => new Action(
  // TODO: restore reactors at the end of scope (to define)
  // TODO: currently we assume the condition is an intent, extend to more condition types
  ctx => Outcome.success(true, Metabot.pushReactor(ctx, 'top', reactorFromIntent(condition, action))),
  ['ON', condition, action]
).withIcon('⌮')


/*
 *=================================
 * Task creation and definition
 *=================================
 */

/* The TASK combinator creates a Task at runtime and then runs it.
  It can be used as:

  TASK(name, action) : wraps the action in a simple task

  TASK(specs) : creates the task according to specs
  * minimally it should define: name, action
  * TODO: can also define: resume, init, etc
*/


const TASK = (nameOrSpecs, actionOrSpecs) => {
  let specs = {}
  // TASK(name, action)
  if (_.isString(nameOrSpecs)) {
    if (actionOrSpecs instanceof Action) specs = { name: nameOrSpecs, action: actionOrSpecs }
    else throw Error('second argument must be an action')
  } else {
    // TASK(specs)
    assert(_.isPlainObject(nameOrSpecs))
    assert(_.isUndefined(actionOrSpecs))
    specs = nameOrSpecs
  }

  return new Action(
    async ctx => {
      const task = new Task(specs)
      return await task.run(ctx)
    },
    ['TASK', specs.name]
  ).withIcon('⌁')
}


/*
 *=================================
 * Local Environment management
 *=================================
 */

const GET = key => new Action(
  ctx => {
    const res = Context.readEnv(ctx, key)
    return _.isUndefined(res)
      ? Outcome.failure(`no value for ${key}`, ctx)
      : Outcome.success(res, ctx)
  },
  ['GET', key]
)


const SET = (key, val) => {
  // without a value, returns the currified form
  if (val === undefined) {
    return v => SET(key, v)
  }
  // otherwise sets the key/value in the context
  return new Action(
    ctx => {
      const ctx1 = Context.updateEnv(ctx, key, val)
      return Outcome.success(val, ctx1)
    },
    ['SET', key, val]
  )
}


// Similar to SET, but takes it's value from an Action
const LET = (key, action) => {
  if (!action) return SET(key)

  return action.fork(SET(key))
    .withInfo('LET', key, action)
}


// TODO
const GET_STORE = key => new Action(
  ctx => {
    const res = Context.readStore(ctx, key)
    return res
      ? Outcome.success(res, ctx)
      : Outcome.failure(`no value for ${key}`, ctx)
  },
  ['GET_STORE', key]
)


// TODO
const SET_STORE = (key, val) => {
  // without a value, returns the currified form
  if (val === undefined) {
    return v => SET_STORE(key, v)
  }
  // otherwise sets the key/value in the context
  return new Action(
    ctx => {
      const ctx1 = Context.updateStore(ctx, key, val)
      return Outcome.success(val, ctx1)
    },
    ['SET_STORE', key, val]
  )
}


/*
 *=================================
 * Frame management
 *=================================
 */

const GET_DATAFRAME = dataframeName => new Action(
  async ctx => {
    const dataframe = Context.getDataframe(ctx, dataframeName)
    return dataframe !== undefined ? Outcome.success(dataframe, ctx)
      : Outcome.failure('dataframe not found', ctx)
  },
  ['GET_DATAFRAME', dataframeName]
)


const GET_SLOT_OBJECT = (dataframeName, slotName) => DO(
  GET_DATAFRAME(dataframeName),
  dataframe => dataframe.getSlotByName(slotName)
).withInfo('GET_SLOT_OBJECT', dataframeName, slotName)


const GET_SLOT = (dataframeName, slotName) => DO(
  GET_DATAFRAME(dataframeName),
  dataframe => dataframe.getSlotValue(slotName)
).withInfo('GET_SLOT', dataframeName, slotName)


const SET_SLOT = (dataframeName, slotName, slotValue) => DO(
  GET_DATAFRAME(dataframeName),
  dataframe => dataframe.updateSlot(slotName, slotValue),
).withInfo('SET_SLOT', slotName, slotValue)


/*
 *=================================
 * EXPORTS
 *=================================
 */

module.exports = {
  fail,
  throwException,
  succeed,
  succeedIf,
  lift,
  cancel,
  say,
  askOnce,
  DO,
  DO_FOR,
  ALT,
  ALT_FOR,
  SWITCH,
  CASE,
  DEFAULT,
  IF,
  equals,
  LET,
  SET,
  GET,
  GET_DATAFRAME,
  GET_SLOT_OBJECT,
  GET_SLOT,
  SET_SLOT,
  SET_STORE,
  GET_STORE,
  exec,
  call,
  map,
  filter,
  guard,
  repeat,
  loop,
  loopWhile,
  CALL_SERVICE,
  ON,
  TASK
}
