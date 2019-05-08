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
 A simple demo app for dataframes
====================================
 */

const { DO, IF, say } = require('../../core/lang.js')
const { ask, getYesNo } = require('../../core/patterns/ask.js')
const { fillDataframe } = require('../../core/patterns/fill-dataframe.js')

const { Agent } = require('../../core/agent.js')

/*
====================================
 Agent Definition
====================================
 */

// Note: modified pay bill use case to show the dataframe filling logic
const paymentAmountDialog = ask('custom_ask_payment_amount', 'currency')

const payBillSpec = {
  name: 'pay_bill',
  slots: [
    { name: 'payee', type: 'payee' },
    { name: 'payment_amount', type: 'currency', dialog: paymentAmountDialog },
    { name: 'from_acct_type', type: 'acct_type', prompt: 'custom_ask_from_acct_type' },
    { name: 'pay_date', type: 'date', required: false }
  ],
  confirmDialog: slotValues => getYesNo('confirm_one_time_payment', {
    payee: slotValues.payee,
    paymentAmount: slotValues.payment_amount,
    fromAccountType: slotValues.from_acct_type
  })
}

const DataframeBot = new Agent(
  'Dataframe Bot',
  {
    icon: 'D',

    policy: {
      ask: {
        exceptionOnMaxAttempts: true
      }
    },

    handlers: {
      maxAttempts: say('transfer_too_many_errors')
    }
  }
)

DataframeBot.tasks.main = DO(
  IF(fillDataframe(payBillSpec),
    say('thanks_payment_done'),
    say('sorry'))
)

/*
====================================
 Init
====================================
 */

module.exports = DataframeBot
