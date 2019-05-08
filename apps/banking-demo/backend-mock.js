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
 Backend Mock for banking demo
====================================
 */

const _ = require('lodash')

const {
  DO, filter, GET_STORE, SET_STORE, succeed
} = require('../../core/lang.js')

const { Action } = require('../../core/action.js')
const Outcome = require('../../core/outcome.js')

const credentials = [{
  username: 'john',
  password: '1234',
  userId: 'johnsmith'
}]

const users = {
  johnsmith: {
    profile: {
      firstName: 'John',
      lastName: 'Smith',
      username: 'john',
      userId: 'johnsmith'
    },
    accounts: [
      {
        id: '130 895 7',
        type: 'checking',
        balance: 5904.91,
        maxWithdraw: 700.00
      },
      {
        id: '392 094 3',
        type: 'savings',
        balance: 4800.09,
        maxWithdraw: 1000.00
      }
    ],
    transactions: [
      {
        id: '19740192',
        accountId: '130 895 7',
        date: '2018-02-04 13:00:00',
        amount: -100.00,
        description: 'Bill payment - electricity'
      }, {
        id: '68401010',
        accountId: '130 895 7',
        date: '2017-12-24 10:05:32',
        amount: -500,
        description: 'Transfer to 392 094 3'
      }, {
        id: '94829183',
        accountId: '392 094 3',
        date: '2017-12-24 10:05:32',
        amount: 500,
        description: 'Transfer from 130 895 7'
      }, {
        id: '82963018',
        accountId: '130 895 7',
        date: '2017-05-09 15:33:44',
        amount: 100,
        description: 'Deposit'
      }]
  }
}

const getUser = userId => GET_STORE(userId)

const authenticate = (username, password) => new Action(
  async ctx => {
    const credentialMatch = credentials.find(
      credential => credential.username === username && credential.password === password
    )

    const userId = credentialMatch.userId

    if (_.isUndefined(credentialMatch)) {
      return Outcome.failure('Authentication failed', ctx)
    }

    return DO(SET_STORE(userId, users[userId]), succeed(userId)).run(ctx)
  },
  ['authenticate', username, password]
)

const getProfile = userId => DO(
  getUser(userId),
  user => succeed(user.profile)
)

const getAccounts = userId => DO(
  getUser(userId),
  user => user.accounts
)

const getAccountIndex = (userId, accountId) => DO(
  getAccounts(userId),
  filter(accounts => accounts.find(account => account.id === accountId)),
  // TODO: use succeedIf ?
  accounts => succeed(accounts.findIndex(account => account.id === accountId))
)

const getAccountTransactions = (userId, accountId) => DO(
  getUser(userId),
  user => user.transactions.filter(transaction => transaction.accountId === accountId)
)

// Operations

const updateAccountBalance = params => DO(
  getAccountIndex(params.userId, params.accountId),
  accountIndex => DO(
    GET_STORE(`backend.users.${params.userId}.accounts.${accountIndex}.balance`),
    currentBalance => SET_STORE(
      `backend.users.${params.userId}.accounts.${accountIndex}.balance`,
      currentBalance + params.amount
    )
  )
)

const addTransaction = params => DO(
  GET_STORE(`backend.users.${params.userId}.transactions`),
  transactions => DO(
    SET_STORE(
      `backend.users.${params.userId}.transactions`,
      [{
        id: generateId(),
        accountId: params.accountId,
        date: formatDate(new Date()),
        amount: params.amount,
        description: params.description
      }].concat(transactions)
    )
  )
)

const transfer = params => DO(
  updateAccountBalance({
    userId: params.userId,
    accountId: params.accountId,
    amount: params.amount
  }),
  addTransaction({
    userId: params.userId,
    accountId: params.accountId,
    amount: params.amount,
    description: params.description
  })
)

const isImmediateInternalTransfer = params => (params.recurrence === 'one_time' && params.transferDate === 'today')
  || (params.recurrence === 'recurring' && params.startDate === 'today')

const internalTransfer = params => (isImmediateInternalTransfer(params)
  ? DO(
    transfer({
      userId: params.userId,
      accountId: params.fromAccountId,
      amount: -params.transferAmount,
      description: `Transfer to ${params.toAccountId}`
    }),
    transfer({
      userId: params.userId,
      accountId: params.toAccountId,
      amount: params.transferAmount,
      description: `Transfer from ${params.fromAccountId}`
    })
  )
  : succeed()) // Do nothing, no tracking of postdated transfers at the moment

const isImmediatePayBill = params => (params.recurrence === 'one_time' && params.payDate === 'today')
  || (params.recurrence === 'recurring' && params.startDate === 'today')

const payBill = params => (isImmediatePayBill(params)
  ? transfer({
    userId: params.userId,
    accountId: params.fromAccountId,
    amount: -params.paymentAmount,
    description: `Bill payment - ${params.payee}`
  })
  : succeed()) // Do nothing, no tracking of postdated payments at the moment

// Helpers

const formatDate = date => {
  const padWithZeros = dateComponent => (`0${dateComponent}`).slice(-2)

  const year = date.getFullYear()
  const month = padWithZeros(date.getMonth() + 1)
  const day = padWithZeros(date.getDate())

  const hours = padWithZeros(date.getHours())
  const minutes = padWithZeros(date.getMinutes())
  const seconds = padWithZeros(date.getSeconds())

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const generateId = () => Math.random().toString().substring(2, 10)

module.exports = {
  authenticate,
  getAccounts,
  getAccountTransactions,
  getProfile,
  internalTransfer,
  payBill
}
