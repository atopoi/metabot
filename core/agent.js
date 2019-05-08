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
 * Agent
 *===============================
 */

const _ = require('lodash')

const Outcome = require('./outcome.js')
const { Action, Task } = require('./action.js')
const { focusEvent } = require('./event.js')

const defaultPolicy = require('./policy.js')


class Agent extends Action {
  constructor(name, specs = {}) {
    super(null, ['Agent', specs])
    this.name = name
    this.config = specs
    this.handlers = specs.handlers
    this.tasks = {}
    this.skills = {}
    this.policy = specs.policy ? _.merge({}, defaultPolicy, specs.policy) : defaultPolicy
  }

  toString() {
    return `<Agent:${this.name}>`
  }

  getIcon() {
    return this.config.icon
  }

  describe() {
    return {
      type_: 'Agent',
      name: this.name,
      icon: this.getIcon()
    }
  }

  async run(ctx) {
    const { main } = this.tasks
    if (!main) return Outcome.exception(`No Main in Agent: ${this}`)

    // set new agent in ctx
    const ctx1 = { ...ctx, agent: this }

    // create agent Task
    const task = new Task({
      name: `${this.name}:main`,
      agent: this,
      owner: this,
      icon: this.getIcon() || '⍊',
      handlers: this.config.handlers,
      action: main
    })
    focusEvent(ctx1, 'agent', 'enter', this, { debugLevel: 1 })
    const outcome = await task.run(ctx1)
    focusEvent(outcome.ctx, 'agent', 'leave', this, { debugLevel: 1 })

    // restore original agent and reactors
    const newCtx = { ...outcome.ctx, agent: ctx.agent, reactors: ctx.reactors }
    if (ctx.agent) focusEvent(newCtx, 'agent', 'resume', ctx.agent, { debugLevel: 2 })

    // return result with restored context
    const res = { ...outcome, ctx: newCtx }
    return res
  }
}


module.exports = { Agent }
