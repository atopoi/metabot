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
 Backend API for banking demo
====================================
 */

const {
  DO, GET_STORE, SET_STORE
} = require('../../core/lang.js')
const { toValue, equalValue } = require('../../core/entity.js')
const Dataframe = require('../../core/dataframe/dataframe.js')

const Backend = require('./backend-mock.js')

const authenticate = ({ username, password }) => DO(
  Backend.authenticate(toValue(username), toValue(password)),
  userId => SET_STORE('userId', userId)
)

const isAuthenticated = GET_STORE('userId')

const getUserId = GET_STORE('userId')

const getProfile = DO(
  getUserId,
  userId => Backend.getProfile(userId)
)

const getFirstName = DO(
  getProfile,
  profile => profile.firstName
)

const getAccounts = DO(
  getUserId,
  userId => Backend.getAccounts(userId)
)

const getAccount = ({ type }) => DO(
  getAccounts,
  accounts => accounts.find(account => equalValue(account.type, type))
)

const getTransactions = ({ accountId }) => DO(
  getUserId,
  userId => Backend.getAccountTransactions(userId, accountId)
)

// Commit operations

const internalTransfer = params => DO(
  getUserId,

  userId => DO(
    getAccount({ type: params.transferFromAccountType }),

    fromAccount => DO(
      getAccount({ type: params.transferToAccountType }),

      toAccount => Backend.internalTransfer({
        userId,
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        transferAmount: params.transferAmount,
        recurrence: params.transferRecurrence,
        frequency: params.transferFrequency,
        transferDate: params.transferDate,
        startDate: params.transferStartDate,
        stopDate: params.transferStopDate
      })
    )
  )
)

const payBill = params => DO(
  getUserId,

  userId => DO(
    getAccount({ type: params.fromAccountType }),

    fromAccount => Backend.payBill({
      userId,
      payee: params.payee,
      paymentAmount: params.paymentAmount,
      fromAccountId: fromAccount.id,
      recurrence: params.recurrence,
      frequency: params.frequency,
      payDate: params.payDate,
      startDate: params.startDate,
      stopDate: params.stopDate
    })
  )
)

const services = {
  authenticate,
  getAccount,
  getAccounts,
  getFirstName,
  getTransactions,
  internalTransfer,
  isAuthenticated,
  payBill
}

const callService = (serviceName, params) => {
  if (params) {
    if (params instanceof Dataframe) {
      return DO(services[serviceName](params.getSlotValues()))
    }
    return DO(services[serviceName](params))
  }
  return DO(services[serviceName])
}

module.exports = {
  callService
}
