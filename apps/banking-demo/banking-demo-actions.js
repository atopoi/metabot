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
====================================
 Helper actions for banking demo
====================================
 */

const {
  ALT, DO, succeed
} = require('../../core/lang.js')

const { Action } = require('../../core/action.js')
const Outcome = require('../../core/outcome.js')

const createUrl = urlSuffix => {
  const proc = ctx => {
    // Note: not an actual url, only for demo purposes
    const url = `https://www.nuecho.com/en/nubank${urlSuffix}`
    return Outcome.success(url, ctx)
  }
  return new Action(proc, ['createUrl', urlSuffix])
}

module.exports = {
  createUrl
}
