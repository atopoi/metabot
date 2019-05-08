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
 *================================
 * Mailbox
 *================================
 */

class Mailbox {
  constructor() {
    this.messages = []
    this.resolver = false
  }

  send(event) {
    if (this.messages.length === 0 && this.resolver) {
      const resolver = this.resolver
      this.resolver = false
      resolver(event)
      return
    }
    this.messages.push(event)
  }

  receive() {
    if (this.messages.length > 0) {
      return this.messages.shift()
    }

    const queue = this
    const promise = new Promise(resolve => {
      queue.resolver = resolve
    })
    return promise
  }
}

module.exports = { Mailbox }
