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

  hello_i_am_your_virtual_assistant: 'Hi, I am your virtual banking assistant.',

  what_next: 'What would you like to do next?',

  what_next_help: 'I need to know what you want to do next. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  sorry: 'Sorry about that.',

  transfer_too_many_errors: "I'm having trouble understanding you. Let me transfer you to someone who can help you.",

  // Authentication

  already_authenticated: 'You are already authenticated as #{firstName}.',

  ask_username: 'What is your username?',

  ask_username_error_1: 'Please tell me your username.',

  ask_username_error_2: 'To continue with the authentication, I need to know your username. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_username_help: 'To continue with the authentication, I need to know your username. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_password: 'What is your password?',

  ask_password_error_1: 'Please provide your password.',

  ask_password_error_2: 'To continue with the authentication, I need to know your password. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_password_help: 'To continue with the authentication, I need to know your password. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  greet_personal: 'Hello #{firstName}!',

  authentication_required: 'You need to be authenticated to perform this action.',

  authenticated_continue: 'You are now authenticated. Let\'s continue...',

  // Account balance

  acct_balance: 'Your account balance is #{balance}$.',

  ask_balance_acct_type: 'For which account?',

  ask_balance_acct_type_error_1: 'Please tell me the account for which you want to check the balance.',

  ask_balance_acct_type_error_2: 'I need the account to check the account balance, for example, "checking" or "savings". If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_balance_acct_type_help: 'I need the account to check the account balance, for example, "checking" or "savings". If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  // FAQ

  faq_daily_withdraw_limit: 'The daily withdrawal limit for checking and savings account is 500$.',

  faq_daily_withdraw_limit_personal: 'The daily withdrawal limit for your #{type} account #{id} is #{maxWithdraw}$.',

  faq_raise_daily_withdraw_limit: 'To increase your daily withdraw limit, you must fill out the limit increase request form at #{url}',

  faq_raise_daily_withdraw_limit_relative_form: 'To increase that limit, you must fill out the limit increase request form at #{url}',

  // Internal transfer

  ask_transfer_from_account_type: 'From which account?',

  ask_transfer_from_account_type_error_1: 'Please provide the account from which you want to transfer the funds.',

  ask_transfer_from_account_type_error_2: 'Before we continue, I need the account (for example, "savings") from which you want to transfer funds. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_transfer_from_account_type_help: 'I need the account from which to withdraw the funds, for example, "checking" or "savings". If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_transfer_to_account_type: 'To which account?',

  ask_transfer_to_account_type_error_1: 'Please provide the account to which you want to deposit the funds.',

  ask_transfer_to_account_type_error_2: 'I need to know the account to which you want to transfer the funds, for example, "checking". If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_transfer_to_account_type_help: 'I need to know the account to which you want to transfer the funds, for example, "checking". If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_transfer_amount: 'What is the amount you want to transfer?',

  ask_transfer_amount_error_1: 'Please provide the amount you want to transfer.',

  ask_transfer_amount_error_2: 'To continue, I need the funds transfer amount, for example, "200$". If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_transfer_amount_help: 'To continue, I need the funds transfer amount, for example, "200$". If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_transfer_recurrence: 'Is this a one-time or a recurring transfer?',

  ask_transfer_recurrence_error_1: 'Please tell me whether you want to make this transfer only once, or make it a recurring transfer.',

  ask_transfer_recurrence_error_2: 'If you want to make this transfer only once, answer "one-time". To make this a recurring or repetitive transfer, answer "recurring". If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_transfer_recurrence_help: 'If you want to make this transfer only once, answer "one-time". To make this a recurring or repetitive transfer, answer "recurring". If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_transfer_frequency: 'At what frequency should I make the payment: weekly, every other week, or monthly?',

  ask_transfer_frequency_error_1: 'How often do you want to make this transfer: every week, every other week, or every month?',

  ask_transfer_frequency_error_2: "I understood that you want to make a recurring transfer. Now, I need to know how often I should make it: every week, every two weeks, or every month. If you don't want this to be a repeat transfer, answer \"one-time\". If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.",

  ask_transfer_frequency_help: "I understood that you want to make a recurring transfer. Now, I need to know how often I should make it: every week, every two weeks, or every month. If you don't want this to be a repeat transfer, answer \"one-time\". If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.",

  ask_transfer_date: 'On what date?',

  ask_transfer_date_error_1: 'Please provide the payment date, either "today" or a later date.',

  ask_transfer_date_error_2: 'I need to know the date of the transfer. You can make it "today", or provide a date in the future, no later than 12 months from today. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_transfer_date_help: 'I need to know the date of the transfer. You can make it "today", or provide a date in the future, no later than 12 months from today. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_transfer_start_date: 'What is the date of the first transfer?',

  ask_transfer_start_date_error_1: 'Please provide the date of the first transfer for this series of recurring transfers.',

  ask_transfer_start_date_error_2: 'Before we continue, I need to know the date for the first transfer of this series of recurring transfers. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_transfer_start_date_help: 'Before we continue, I need to know the date for the first transfer of this series of recurring transfers. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_transfer_stop_date: 'What is the date of the last transfer?',

  ask_transfer_stop_date_error_1: 'Please provide the date of the last transfer for this series of recurring transfers.',

  ask_transfer_stop_date_error_2: 'I need to know the date for the last transfer of this series of recurring transfers. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_transfer_stop_date_help: 'I need to know the date for the last transfer of this series of recurring transfers. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  confirm_one_time_transfer: 'To confirm: you want to make a one-time transfer from your #{transferFromAccountType} account, to your #{transferToAccountType} account, for the amount of #{transferAmount} dollars, on #{transferDate}. [Yes] [No]',

  confirm_one_time_transfer_error_1: 'To confirm: you want to make a one-time transfer from your #{transferFromAccountType} account, to your #{transferToAccountType} account, for the amount of #{transferAmount} dollars, on #{transferDate}. [Yes] [No]',

  confirm_one_time_transfer_error_2: 'To confirm: you want to make a one-time transfer from your #{transferFromAccountType} account, to your #{transferToAccountType} account, for the amount of #{transferAmount} dollars, on #{transferDate}. [Yes] [No]',

  confirm_one_time_transfer_help: 'To confirm: you want to make a one-time transfer from your #{transferFromAccountType} account, to your #{transferToAccountType} account, for the amount of #{transferAmount} dollars, on #{transferDate}. [Yes] [No]',

  confirm_recurring_transfer: 'To confirm: you want to make a #{transferFrequency} recurring transfer from your #{transferFromAccountType} account, to your #{transferToAccountType} account, for the amount of #{transferAmount} dollars. The date of the first transfer is #{transferStartDate} and the date of the last transfer is #{transferStopDate}. [Yes] [No]',

  confirm_recurring_transfer_error_1: 'To confirm: you want to make a #{transferFrequency} recurring transfer from your #{transferFromAccountType} account, to your #{transferToAccountType} account, for the amount of #{transferAmount} dollars. The date of the first transfer is #{transferStartDate} and the date of the last transfer is #{transferStopDate}. [Yes] [No]',

  confirm_recurring_transfer_error_2: 'To confirm: you want to make a #{transferFrequency} recurring transfer from your #{transferFromAccountType} account, to your #{transferToAccountType} account, for the amount of #{transferAmount} dollars. The date of the first transfer is #{transferStartDate} and the date of the last transfer is #{transferStopDate}. [Yes] [No]',

  confirm_recurring_transfer_help: 'To confirm: you want to make a #{transferFrequency} recurring transfer from your #{transferFromAccountType} account, to your #{transferToAccountType} account, for the amount of #{transferAmount} dollars. The date of the first transfer is #{transferStartDate} and the date of the last transfer is #{transferStopDate}. [Yes] [No]',

  thanks_int_transfer_done: 'Thanks. Your transfer has been recorded.',

  // Pay bill

  ask_payee: 'Which bill do you want to pay?',

  ask_payee_error_1: 'Please give me the name of the merchant, for example, "Hydro-Quebec".',

  ask_payee_error_2: 'Before going any further, I need to know which bill you want to pay. Please provide the name of the merchant, for example, "Bell Mobility". If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_payee_help: 'Before going any further, I need to know which bill you want to pay. Please provide the name of the merchant, for example, "Bell Mobility". If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_payment_amount: 'What is the payment amount?',

  ask_payment_amount_error_1: 'Please provide the payment amount, for example, "$75.25".',

  ask_payment_amount_error_2: 'To continue with this payment, I need to know the amount. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_payment_amount_help: 'To continue with this payment, I need to know the amount. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_from_account_type: 'From which account?',

  ask_from_account_type_error_1: 'Please tell me the account from which to pay the bill, for example, "checking".',

  ask_from_account_type_error_2: 'I need the account type (for example, "savings") or the account number from which to pay that bill. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_from_account_type_help: 'I need the account type (for example, "savings") or the account number from which to pay that bill. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_recurrence: 'Is this a one-time payment or a recurring payment?',

  ask_recurrence_error_1: 'Please tell me whether you want to make this a one-time only payment, or a repeat payment.',

  ask_recurrence_error_2: 'If you want to pay this bill only once, answer "one-time". To make this a repeat payment, for example every month, answer "recurring". If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_recurrence_help: 'If you want to pay this bill only once, answer "one-time". To make this a repeat payment, for example every month, answer "recurring". If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_frequency: 'At what frequency should I make the payment: weekly, every other week, or monthly?',

  ask_frequency_error_1: 'How often do you want to make this payment: every week, every other week, or every month?',

  ask_frequency_error_2: "I understood that you want to make a recurring payment. Now, I need to know how often I should make it: every week, every two weeks, or every month. If you don't want this to be a repeat payment, answer \"one-time\". If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.",

  ask_frequency_help: "I understood that you want to make a recurring payment. Now, I need to know how often I should make it: every week, every two weeks, or every month. If you don't want this to be a repeat payment, answer \"one-time\". If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.",

  ask_pay_date: 'On what date?',

  ask_pay_date_error_1: 'Please provide the payment date, either "today" or a later date.',

  ask_pay_date_error_2: 'I need to know the date of the payment. You can make it "today", or provide a date in the future, no later than 12 months from today. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_pay_date_help: 'I need to know the date of the payment. You can make it "today", or provide a date in the future, no later than 12 months from today. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_start_date: 'What is the start date?',

  ask_start_date_error_1: 'Please provide the start date for this recurring payment.',

  ask_start_date_error_2: 'I need to know the date for the first payment of this series of recurring payments. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_start_date_help: 'I need to know the date for the first payment of this series of recurring payments. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_stop_date: 'What is the end date for this recurring payment?',

  ask_stop_date_error_1: 'Please provide the end date for your recurring payment.',

  ask_stop_date_error_2: 'I need to know the date when you wish to end the recurring payments, including the month and year. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_stop_date_help: 'I need to know the date when you wish to end the recurring payments, including the month and year. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  confirm_one_time_payment: 'To confirm, you want to make a one-time payment to #{payee}, for the amount of #{paymentAmount} dollars, from your #{fromAccountType} account, on #{payDate}. [Yes] [No]',

  confirm_one_time_payment_error_1: 'To confirm, you want to make a one-time payment to #{payee}, for the amount of #{paymentAmount} dollars, from your #{fromAccountType} account, on #{payDate}. [Yes] [No]',

  confirm_one_time_payment_error_2: 'To confirm, you want to make a one-time payment to #{payee}, for the amount of #{paymentAmount} dollars, from your #{fromAccountType} account, on #{payDate}. [Yes] [No]',

  confirm_one_time_payment_help: 'To confirm, you want to make a one-time payment to #{payee}, for the amount of #{paymentAmount} dollars, from your #{fromAccountType} account, on #{payDate}. [Yes] [No]',

  confirm_recurring_payment: 'To confirm, you want to make a recurring #{frequency} payment to #{payee}, for the amount of #{paymentAmount} dollars, from your #{fromAccountType} account. The start date is on #{startDate} and the end date is on #{stopDate}. [Yes] [No]',

  confirm_recurring_payment_error_1: 'To confirm, you want to make a recurring #{frequency} payment to #{payee}, for the amount of #{paymentAmount} dollars, from your #{fromAccountType} account. The start date is on #{startDate} and the end date is on #{stopDate}. [Yes] [No]',

  confirm_recurring_payment_error_2: 'To confirm, you want to make a recurring #{frequency} payment to #{payee}, for the amount of #{paymentAmount} dollars, from your #{fromAccountType} account. The start date is on #{startDate} and the end date is on #{stopDate}. [Yes] [No]',

  confirm_recurring_payment_help: 'To confirm, you want to make a recurring #{frequency} payment to #{payee}, for the amount of #{paymentAmount} dollars, from your #{fromAccountType} account. The start date is on #{startDate} and the end date is on #{stopDate}. [Yes] [No]',

  thanks_payment_done: 'Thanks, your payment has been recorded.',

  // Transactions

  ask_transactions_acct_type: 'What is the account type?',

  ask_transactions_acct_type_error_1: 'Please tell me the account for which you want to view the transaction history.',

  ask_transactions_acct_type_error_2: 'I need to know the account for which you want to view the transaction history. If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  ask_transactions_acct_type_help: 'I need the account from which to withdraw the funds, for example, "checking" or "savings". If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.',

  transaction_long_desc: 'Id: #{id}\nDate: #{date}\nAmount: #{amount}$\nDescription: #{description}'
}

module.exports = { en_US }
