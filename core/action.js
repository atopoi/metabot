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

/* eslint no-unused-vars: 0 */
/*
 *===========================================
 * Metabot's Action class
 *===========================================
 */

const Outcome = require('./outcome.js')
const Context = require('./context.js')
const { focusEvent } = require('./event.js')
// serial ids for actions
let lastActionId = 0
const getNextActionId = () => { lastActionId += 1; return lastActionId }


/*
 *===============================
 * running
 *===============================
 */

const run = async (runner, ctx) => {
  // TODO maybe remove this case?
  if (typeof (runner) === 'function') {
    return await runner(ctx)
  }
  if (typeof (runner) === 'object') {
    return await runner.run(ctx)
  }
  // TODO maybe remove this case and throw error?
  return Outcome.success(runner, ctx)
}


/*
 Function: forkRun(res, onSuccess, onFail=null, onCancel=null)

 This function binds a result value to continuations.

 Since a result can be a success, a failure or a cancelation
 (which is a special case of failure), we can specify continuations for each case.
 The function thus "forks" the results in the different continuations.

 Each continuation can be either an Action, a function returning an Action,
 or a function returning any other type of value. These cases correspond
  to a monad's "then", bind", and "map" :

 # "monadic then" - the continuation is a Action:
 Forget the result value and just follow by running the action with the new context
 (Equivalent to  () => action )

 # "monadic bind" - a function returning an Action
 In this case we apply the function to the result's value,
 we get a new Action (parametrized by this value),
 then run the Action on the results context, and return it's value

 # "monadic map" - a function returning any other type of value
 in this case, we just apply the function to the result's value,
 and return the new value without changing the result's failure state or context.

 forkRun is used to define many of the various chining operators
*/

const forkRun = async (res, onSuccess, onFail = null, onCancel = null) => {
  const { val, ctx } = res

  const next = Outcome.isSuccess(res) ? onSuccess
    : Outcome.isCancel(res) ? onCancel
      : Outcome.isException(res) ? null
        : onFail

  if (!next) return res

  if (next instanceof Action) {
    // "monadic then"
    return await next.run(ctx)
  }

  if (typeof (next) === 'function') {
    // two possibilities:  "map" or  "bind"
    const nextRes = next(val)
    if (nextRes instanceof Action) {
      // monadic bind
      const newRes = await nextRes.run(ctx)
      return newRes
    }
    // monadic map
    return { ...res, val: nextRes }
  }

  throw Error('ForkRun_error')
}


/*
 *===============================
 * Action
 *===============================
*/

class Action {
  constructor(proc, info = []) {
    // eslint-disable-next-line no-underscore-dangle
    this.type_ = 'Action'
    this.id = getNextActionId()
    this.proc = proc
    if (info.length > 0) {
      const [op, ...args] = info
      this.op = op
      this.args = args
    }
    this.handlers = {}
  }

  withInfo(name, ...args) {
    this.op = name
    this.args = args
    return this
  }

  withIcon(icon) {
    this.icon = icon
    return this
  }

  toCode() {
    const descr = this.args.map(x => (x instanceof Action ? x.toCode() : x)).join(', ')
    return `${this.op}(${descr})`
  }

  describe() {
    return {
      // eslint-disable-next-line no-underscore-dangle
      type_: this.type_,
      op: this.op,
      icon: this.icon,
      info: this.toCode()
    }
  }

  async run(ctx) {
    return await this.runProcedure(this.proc, ctx)
  }

  async handleExceptions(outcome) {
    if (Outcome.isException(outcome)) {
      if (this.handlers) {
        const errorType = outcome.errorType
        const handler = this.handlers[errorType]
        if (handler) return await handler.run(outcome.ctx)
      }
    }
    return outcome
  }

  async runProcedure(proc, ctx) {
    // add the action to the focus stack and run proc on on context
    const ctx1 = { ...ctx, focus: [this, ...ctx.focus] }
    let outcome
    try {
      outcome = await proc(ctx1)
      // check for action exceptions
      outcome = await this.handleExceptions(outcome)
    } catch (error) {
      outcome = { ...outcome, RTError: error, RTErrorOn: ctx.focus }
    }
    // restore focus
    const ctx2 = { ...outcome.ctx, focus: ctx.focus }
    // return result
    return { ...outcome, ctx: ctx2 }
  }

  async test(tester = null) {
    return await this.run(Context.createContext())
      .then(tester || (res => { console.log(res); return res }))
      .catch(console.log)
  }

  // TODO proper ctx+store dispatch on failures
  fork(onSuccess, onFail, onCancel) {
    return new Action(
      async ctx => {
        const res = await this.run(ctx)
        return await forkRun(res, onSuccess, onFail, onCancel)
      },
      ['.fork', this, onSuccess, onFail, onCancel]
    )
  }

  map(funct) {
    return this.fork(funct)
      .withInfo('map', this, funct)
  }

  then(next) {
    return this.fork(next)
      .withInfo('≫', this, next)
  }

  filter(predicate) {
    const action = this
    return new Action(
      async ctx => {
        const res = await action.run(ctx)
        const { failure, val, ctx: ctx2 } = res
        return ((failure || predicate(val))
          // on failure or on predicate success, pass the res as is
          ? res
          // otherwise fail
          : Outcome.failure('filtered out', ctx2)
        )
      },
      ['filter', predicate]
    )
  }

  orElse(next) {
    return this.fork(null, next)
      .withInfo('.orElse', next)
  }

  onCancel(action) {
    return this.fork(null, null, action)
  }
}


/*
 *=================================
 * Tasks
 *=================================
 */

class Task extends Action {
  constructor(specs = {}) {
    super(null, ['Task', specs])
    this.name = specs.name
    this.action = specs.action
    this.config = specs
    this.handlers = specs.handlers
    this.state = {}
  }

  describe() {
    return {
      type_: 'Task',
      id: this.id,
      name: this.name,
      icon: this.config.icon || (this.action && this.action.icon),
      owner: this.owner && { name: this.owner.name, icon: this.owner.icon },
      action: this.action.describe ? this.action.describe() : this.action.name,
      state: this.state
    }
  }

  async runAction(runner, ctx) {
    // runner is an Action or a function of ctx
    // add task to context and run task action
    const ctx1 = { ...ctx, tasks: [this, ...ctx.tasks] }
    focusEvent(ctx1, 'task', 'enter', this, { debugLevel: 1 })
    let outcome = await run(runner, ctx1)

    // check for exceptions
    outcome = await this.handleExceptions(outcome)

    // restore task in context and return outcome
    focusEvent(ctx1, 'task', 'leave', this, { debugLevel: 1 })
    const newCtx = { ...outcome.ctx, tasks: ctx.tasks }
    return { ...outcome, ctx: newCtx }
  }

  async run(ctx) {
    this.owner = ctx.tasks[0] || ctx.agent
    return this.runAction(this.action, ctx)
  }
}


module.exports = {
  run, forkRun, Action, Task
}
