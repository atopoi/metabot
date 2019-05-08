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

// eslint-disable-next-line camelcase
const en_US = {

// Shared

  sorry: 'Sorry about that.',

  transfer_too_many_errors: "I'm having trouble understanding you. Let me transfer you to someone who can help you.",

  // Pay bill

  ask_payee: 'Which bill do you want to pay?',

  ask_payee_error_1: 'Please give me the name of the merchant, for example, "Hydro-Quebec".',

  ask_payee_error_2: 'Before going any further, I need to know which bill you want to pay. Please provide the name of the merchant, for example, "Bell Mobility". If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_payee_help: 'Before going any further, I need to know which bill you want to pay. Please provide the name of the merchant, for example, "Bell Mobility". If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  custom_ask_payment_amount: 'What is the payment amount?',

  custom_ask_payment_amount_error_1: 'Please provide the payment amount, for example, "$75.25".',

  custom_ask_payment_amount_error_2: 'To continue with this payment, I need to know the amount. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  custom_ask_payment_amount_help: 'To continue with this payment, I need to know the amount. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  custom_ask_from_acct_type: 'From which account?',

  custom_ask_from_acct_type_error_1: 'Please tell me the account from which to pay the bill, for example, "checking".',

  custom_ask_from_acct_type_error_2: 'I need the account type (for example, "savings") or the account number from which to pay that bill. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  custom_ask_from_acct_type_help: 'I need the account type (for example, "savings") or the account number from which to pay that bill. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  confirm_one_time_payment: 'To confirm, you want to make a one-time payment to #{payee}, for the amount of #{paymentAmount} dollars, from your #{fromAccountType} account. [Yes] [No]',

  confirm_one_time_payment_error_1: 'To confirm, you want to make a one-time payment to #{payee}, for the amount of #{paymentAmount} dollars, from your #{fromAccountType} account. [Yes] [No]',

  confirm_one_time_payment_error_2: 'To confirm, you want to make a one-time payment to #{payee}, for the amount of #{paymentAmount} dollars, from your #{fromAccountType} account. [Yes] [No]',

  confirm_one_time_payment_help: 'To confirm, you want to make a one-time payment to #{payee}, for the amount of #{paymentAmount} dollars, from your #{fromAccountType} account. [Yes] [No]',

  thanks_payment_done: 'Thanks, your payment has been recorded.'
}

module.exports = { en_US }
