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
 *==============================
 *  Reactor
 *==============================
*/

const { matchIntent } = require('./intent.js')

class Reactor {
  constructor(params) {
    const {
      name, intent, action, accept, owner
    } = params
    if (!action) throw Error('Reactor with no action')
    if (!(accept || intent)) throw Error('Reactor with no intent or accept method')
    this.owner = owner
    this.action = action
    this.name = name || (intent && `reactor_${intent}`) || 'reactor'
    this.icon = params.icon || '🜙'
    if (accept) this.accept = accept
  }

  describe() {
    const {
      name, id, owner, action, icon
    } = this
    const actionInfo = action && ((action.describe && action.describe()) || action.toString())
    return {
      type_: 'Reactor',
      name,
      id,
      icon,
      owner: owner && owner.name,
      action: actionInfo || ''
    }
  }

  tryAccept(event) {
    if (this.accept) return this.accept(event)
    return false
  }

  async runAction(input, ctx) {
    console.log('runAction', this.name, input)
    const res = await this.action(input)(ctx)
    console.log('runAction res:', res)
    // TODO: add more checks
    return await this.action(input)(ctx)
  }
}


// creates a reactor matching a given intent
// TODO: add more possibilities to the intent (types etc)
const reactorFromIntent = (intentName, action) => new Reactor({
  name: `ON: ${intentName}`,
  intent: intentName,
  accept: userEvent => matchIntent(userEvent.data, intentName),
  action
})


module.exports = {
  Reactor,
  reactorFromIntent
}
