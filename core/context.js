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
/*
 *===============================
 * The Context class and methods
 *===============================
 */

const _ = require('lodash')
const opi = require('object-path-immutable')


const createContext = params => {
  const ctx = {
    lastRes: null,
    agent: null,
    tasks: [],
    dataframe: {},
    focus: [],
    env: {},
    store: {},
    reactors: {},
    log: []
  }
  return { ...ctx, ...params }
}


const pushFrame = (ctx, frame) => opi.push(ctx, 'focus', frame)


/*
 *=====================================
 *  env, dataframe and store access
 *======================================
*/

const updateEnv = (ctx, key, val) => {
  const keyPath = typeof (key) === 'string' ? key : key.join('.')
  return opi.set(ctx, `env.${keyPath}`, val)
}


const mergeEnv = (ctx, envProperties) => {
  let mergedCtx = ctx

  Object.keys(envProperties).forEach(key => {
    mergedCtx = updateEnv(mergedCtx, key, envProperties[key])
  })

  return mergedCtx
}


const getInPath = (obj, path) => {
  if (!obj) return undefined

  let val = obj
  for (const key of path) {
    val = val[key]
    if (_.isUndefined(val) || _.isNil(val)) return undefined
  }
  return val
}


const readEnv = (ctx, keyPath) => {
  const path = typeof (keyPath) === 'string' ? keyPath.split('.') : keyPath
  return getInPath(ctx.env, path)
}


const updateStore = (ctx, key, val) => {
  const keyPath = typeof (key) === 'string' ? key : key.join('.')
  return opi.set(ctx, `store.${keyPath}`, val)
}


const readStore = (ctx, keyPath) => {
  const path = typeof (keyPath) === 'string' ? keyPath.split('.') : keyPath
  return getInPath(ctx.store, path)
}


const setDataframe = (ctx, name, dataframe) => ({
  ...ctx,
  dataframes: { ...ctx.dataframes, [name]: dataframe }
})


const getDataframe = (ctx, name) => ctx.dataframes[name] || undefined


const readDataframe = (ctx, dataframeName, key) => {
  const df = getDataframe(ctx, dataframeName)
  if (!df) return undefined
  const slot = df.getSlotByName(key)
  return (slot && slot.value) || undefined
}


/*
 *==============================
 *  IO eand test modes
 *==============================
*/

const modeNoIO = ctx => (ctx.testMode && ctx.testMode.noIO)


/*
 *========================================
 *  Serialization for logs and debuggers
 *========================================
*/

const serializeDebug = ctx => {
  const {
    conversation,
    agent,
    tasks = [],
    dataframes = {},
    focus = [],
    env = {},
    reactors = {},
    store = {}
  } = ctx

  const df = _.mapValues(dataframes, dataframe => dataframe.describe())
  const envState = { type_: 'env', name: '', state: env }

  return {
    type_: 'Context',
    conversation: conversation.id,
    agent: agent && agent.describe(),
    tasks: tasks.map(task => task.describe()),
    focus: focus.map(obj => obj.describe()),
    env: envState,
    dataframes: df,
    reactors: _.mapValues(
      reactors,
      reactorsAtLevel => reactorsAtLevel.map(reactor => reactor.describe())
    ),
    store: _.omit(store, ['backend'])
  }
}


module.exports = {
  createContext,
  pushFrame,
  updateEnv,
  mergeEnv,
  readEnv,
  getInPath,
  updateStore,
  readStore,
  setDataframe,
  getDataframe,
  readDataframe,
  modeNoIO,
  serializeDebug
}
