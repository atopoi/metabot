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
 A simple banking demo app
====================================
 */

const {
  CASE, DO, DO_FOR, ALT, filter, GET, IF, LET, loop, ON, say, SWITCH, TASK
} = require('../../core/lang.js')
const { equalValue } = require('../../core/entity.js')
const { defineIntent } = require('../../core/intent.js')

const { ask, actionMenu, getYesNo } = require('../../core/patterns/ask.js')
const { fillDataframe } = require('../../core/patterns/fill-dataframe.js')

const { Agent } = require('../../core/agent.js')

const { createUrl } = require('./banking-demo-actions.js')
const { callService } = require('./backend-api.js')

defineIntent('acct_balance', { keywords: ['balance'] })
defineIntent('authenticate', { keywords: ['authenticate', 'log in'] })
defineIntent('faq_daily_withdraw', { keywords: ['limit', 'withdraw'] })
defineIntent('pay_bill', { keywords: ['bill', 'pay'] })
defineIntent('transfer', { keywords: ['transfer'] })
defineIntent('transactions', { keywords: ['transactions', 'history'] })

/*
====================================
 Authenticate Action
====================================
 */

const authenticateTask = TASK({
  name: 'authenticate',
  icon: '👤',
  action: DO(
    // Validate credentials
    ask('ask_username'),
    username => DO(
      ask('ask_password'),
      password => callService('authenticate', { username, password }),
    ),
    // Greet user
    callService('getFirstName'),
    firstName => say('greet_personal', { firstName })
  )
})


const ensureAuthenticated = ALT(
  callService('isAuthenticated'),
  DO(
    say('authentication_required'),
    authenticateTask,
    say('authenticated_continue')
  )
)


/*
====================================
 Check Account Balance Action
====================================
 */

const checkAccountBalanceTask = TASK({
  name: 'check account balance',
  action: DO(
    ensureAuthenticated,
    ask('ask_balance_acct_type', 'acct_type'),
    type => callService('getAccount', { type }),
    account => say('acct_balance', account)
  )
})


/*
====================================
 Check Last Transactions Action
====================================
 */

const checkTransactionsTask = TASK({
  name: 'transactions history',
  action:
    DO(
      ensureAuthenticated,
      ask('ask_transactions_acct_type', 'acct_type'),
      type => callService('getAccount', { type }),
      account => callService('getTransactions', { accountId: account.id }),
      transactions => DO_FOR(transactions, transaction => say('transaction_long_desc', transaction))
    )
})


/*
====================================
 FAQ Daily Withdraw Action
====================================
 */

const faqDailyWithdrawAuthenticated = DO(
  IF(filter(accounts => accounts.length >= 1, callService('getAccounts')),
    accounts => DO_FOR(accounts, account => say('faq_daily_withdraw_limit_personal', account)),
    say('faq_daily_withdraw_limit')),

  GET('url'),
  url => IF(filter(accounts => accounts.length > 1, callService('getAccounts')),
    say('faq_raise_daily_withdraw_limit', { url }),
    say('faq_raise_daily_withdraw_limit_relative_form', { url }))
)


const faqDailyWithdrawNonAuthenticated = DO(
  say('faq_daily_withdraw_limit'),

  GET('url'),
  url => say('faq_raise_daily_withdraw_limit_relative_form', { url })
)


const faqDailyWithdrawTask = TASK({
  name: 'FAQ daily withdraw',
  action: DO(
    LET('url', createUrl('/formdailywithdrawal')),

    IF(callService('isAuthenticated'),
      faqDailyWithdrawAuthenticated,
      faqDailyWithdrawNonAuthenticated)
  )
})


/*
====================================
 Internal Transfer
====================================
 */


const transferRecurrenceIs = recurrenceType => slotValues => (
  equalValue(slotValues('transferRecurrence'), recurrenceType)
)

const internalTransferSpec = {
  name: 'internal_transfer',

  slots: [
    { name: 'transferFromAccountType', type: 'acct_type' },
    { name: 'transferToAccountType', type: 'acct_type' },
    { name: 'transferAmount', type: 'currency' },
    { name: 'transferRecurrence', type: 'recurrence' },
    { name: 'transferFrequency', type: 'frequency', required: transferRecurrenceIs('recurring') },
    { name: 'transferDate', type: 'date', required: transferRecurrenceIs('one_time') },
    { name: 'transferStartDate', type: 'date', required: transferRecurrenceIs('recurring') },
    { name: 'transferStopDate', type: 'date', required: transferRecurrenceIs('recurring') }
  ],

  confirmDialog: slotValues => SWITCH(
    slotValues.transferRecurrence,
    CASE('one_time', getYesNo('confirm_one_time_transfer', slotValues)),
    CASE('recurring', getYesNo('confirm_recurring_transfer', slotValues))
  )
}

const internalTransferTask = TASK({
  name: 'internal transfer',
  action: DO(
    ensureAuthenticated,
    IF(fillDataframe(internalTransferSpec),
      dataframe => DO(
        callService('internalTransfer', dataframe),
        say('thanks_int_transfer_done')
      ),
      say('sorry'))
  )
})


/*
====================================
 Pay Bill
====================================
 */

const recurrenceIs = recurrenceType => slotValues => equalValue(slotValues('recurrence'), recurrenceType)

const payBillSpec = {
  name: 'payBill',

  slots: [
    { name: 'payee', type: 'payee' },
    { name: 'paymentAmount', type: 'currency' },
    { name: 'fromAccountType', type: 'acct_type' },
    { name: 'recurrence', type: 'recurrence' },
    { name: 'frequency', type: 'frequency', required: recurrenceIs('recurring') },
    { name: 'payDate', type: 'date', required: recurrenceIs('one_time') },
    { name: 'startDate', type: 'date', required: recurrenceIs('recurring') },
    { name: 'stopDate', type: 'date', required: recurrenceIs('recurring') }
  ],

  confirmDialog: slotValues => SWITCH(
    slotValues.recurrence,
    CASE('one_time', getYesNo('confirm_one_time_payment', slotValues)),
    CASE('recurring', getYesNo('confirm_recurring_payment', slotValues))
  )
}


const payBillTask = TASK({
  name: 'pay bill',
  action: DO(
    ensureAuthenticated,
    IF(fillDataframe(payBillSpec),
      dataframe => DO(
        callService('payBill', dataframe),
        say('thanks_payment_done')
      ),
      say('sorry'))
  )
})


/*
====================================
 Agent Definition
====================================
 */

const BankingDemoBot = new Agent(
  'Banking Bot',
  {
    icon: '💰',

    policy: {
      ask: {
        exceptionOnMaxAttempts: true
      }
    },

    handlers: {
      maxAttempts: say('transfer_too_many_errors')
    }
  },
)


BankingDemoBot.tasks.main = DO(
  // Actions reactors
  ON('acct_balance', checkAccountBalanceTask),
  ON('faq_daily_withdraw', faqDailyWithdrawTask),
  ON('transfer', internalTransferTask),
  ON('pay_bill', payBillTask),
  ON('transactions', checkTransactionsTask),

  // Greeting
  say('hello_i_am_your_virtual_assistant'),

  // Main menu loop
  TASK({
    name: 'main menu loop',
    icon: '⟳',
    action: loop(
      DO(
        actionMenu({
          prompt: 'Please choose between:',
          choices: [
            ['c', 'Check Account Balance', checkAccountBalanceTask],
            ['f', 'FAQ Daily Withdraw', faqDailyWithdrawTask],
            ['i', 'Internal Transfer', internalTransferTask],
            ['p', 'Pay Bill', payBillTask],
            ['t', 'Transactions History', checkTransactionsTask]
          ]
        }),
        say('what_next')
      ),
      true
    )
  })
)

/*
====================================
 Init
====================================
 */

module.exports = BankingDemoBot
