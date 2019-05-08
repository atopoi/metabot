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
 * Configuration Layer
 *================================
 */

const { _ } = require('lodash')

const definePrefix = '-D'
const equalSign = '='


const updateConfig = (path, value) => {
  const p = path.split('.')

  let obj = getConfig()
  const lastIndex = p.length - 1
  for (let index = 0; index < lastIndex; index += 1) {
    const property = p[index]
    if (!_.isObject(obj[property])) {
      obj[property] = {}
    }
    obj = obj[property]
  }
  obj[p[lastIndex]] = value
}

const processArguments = () => {
  const args = process.argv
  _.forEach(args, arg => {
    if (arg.startsWith(definePrefix)) {
      const [path, value] = arg.substring(2).split(equalSign, 2)
      updateConfig(path, value)
    }
  })
}


const getConfig = () => module.require(`./config/${process.env.ENV || 'dev'}.js`)

module.exports = { config: getConfig(), updateConfig, processArguments }
