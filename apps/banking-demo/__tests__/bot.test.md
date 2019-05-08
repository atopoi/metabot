# Fragments

## Main menu loop

* *continue*
  - What would you like to do next?
  - Please choose between:
    c) Check Account Balance
    f) FAQ Daily Withdraw
    i) Internal Transfer
    p) Pay Bill
    t) Transactions History

# Main

## Main menu

* *start*
  - Hi, I am your virtual banking assistant.
  - Please choose between:
    c) Check Account Balance
    f) FAQ Daily Withdraw
    i) Internal Transfer
    p) Pay Bill
    t) Transactions History

# Authenticate

## Authenticate success

> Main menu

* c
  - You need to be authenticated to perform this action.
  - What is your username?
* john
  - What is your password?
* 1234
  - Hello John!
  - You are now authenticated. Let's continue...
  - For which account?
* checking
  - Your account balance is 5904.91$.

> Main menu loop

# Check account balance

## Not authenticated

> Main menu

* c
  - You need to be authenticated to perform this action.
  - What is your username?
* john
  - What is your password?
* 1234
  - Hello John!
  - You are now authenticated. Let's continue...
  - For which account?
* checking
  - Your account balance is 5904.91$.

> Main menu loop

## Already authenticated

> Not authenticated

* c
  - For which account?
* checking
  - Your account balance is 5904.91$.

> Main menu loop

## Max error

> Authenticate success

* c
  - For which account?
* abc
  - Please tell me the account for which you want to check the balance.
* def
  - I need the account to check the account balance, for example, "checking" or "savings". If you need to speak to someone, just tell me, and I will be happy to transfer you to an agent.
* ghi
  - I'm having trouble understanding you. Let me transfer you to someone who can help you.

# FAQ

## Not authenticated

> Main menu

* f
  - The daily withdrawal limit for checking and savings account is 500$.
  - To increase that limit, you must fill out the limit increase request form at https://www.nuecho.com/en/nubank/formdailywithdrawal

> Main menu loop

## Authenticated

> Authenticate success

* f
  - The daily withdrawal limit for your checking account 130 895 7 is 700$.
  - The daily withdrawal limit for your savings account 392 094 3 is 1000$.
  - To increase your daily withdraw limit, you must fill out the limit increase request form at https://www.nuecho.com/en/nubank/formdailywithdrawal

> Main menu loop

# Internal transfer

## Not authenticated

> Main menu

* i
  - You need to be authenticated to perform this action.
  - What is your username?
* john
  - What is your password?
* 1234
  - Hello John!
  - You are now authenticated. Let's continue...
  - From which account?

## One time

> Not authenticated

* checking
  - To which account?
* savings
  - What is the amount you want to transfer?
* 10$
  - Is this a one-time or a recurring transfer?
* one-time
  - On what date?
* today
  - To confirm: you want to make a one-time transfer from your checking account, to your savings account, for the amount of 10 dollars, on today. [Yes] [No]
* yes
  - Thanks. Your transfer has been recorded.

> Main menu loop

## Recurring

> Not authenticated

* checking
  - To which account?
* savings
  - What is the amount you want to transfer?
* 10$
  - Is this a one-time or a recurring transfer?
* recurring
  - At what frequency should I make the payment: weekly, every other week, or monthly?
* weekly
  - What is the date of the first transfer?
* today
  - What is the date of the last transfer?
* next week
  - To confirm: you want to make a weekly recurring transfer from your checking account, to your savings account, for the amount of 10 dollars. The date of the first transfer is today and the date of the last transfer is next week. [Yes] [No]
* yes
  - Thanks. Your transfer has been recorded.

> Main menu loop

## Confirmation failure

> Not authenticated

* checking
  - To which account?
* savings
  - What is the amount you want to transfer?
* 10$
  - Is this a one-time or a recurring transfer?
* one-time
  - On what date?
* today
  - To confirm: you want to make a one-time transfer from your checking account, to your savings account, for the amount of 10 dollars, on today. [Yes] [No]
* no
  - Sorry about that.

> Main menu loop

# Pay bill

## Not authenticated

> Main menu

* p
  - You need to be authenticated to perform this action.
  - What is your username?
* john
  - What is your password?
* 1234
  - Hello John!
  - You are now authenticated. Let's continue...
  - Which bill do you want to pay?

## One time

> Not authenticated

* rogers
  - What is the payment amount?
* 20$
  - From which account?
* checking
  - Is this a one-time payment or a recurring payment?
* one time
  - On what date?
* today
  - To confirm, you want to make a one-time payment to rogers, for the amount of 20 dollars, from your checking account, on today. [Yes] [No]
* yes
  - Thanks, your payment has been recorded.

> Main menu loop

## Recurring

> Not authenticated

* rogers
  - What is the payment amount?
* 20$
  - From which account?
* checking
  - Is this a one-time payment or a recurring payment?
* recurring
  - At what frequency should I make the payment: weekly, every other week, or monthly?
* weekly
  - What is the start date?
* today
  - What is the end date for this recurring payment?
* next week
  - To confirm, you want to make a recurring weekly payment to rogers, for the amount of 20 dollars, from your checking account. The start date is on today and the end date is on next week. [Yes] [No]
* yes
  - Thanks, your payment has been recorded.

> Main menu loop

## Confirmation failure

> Not authenticated

* rogers
  - What is the payment amount?
* 20$
  - From which account?
* checking
  - Is this a one-time payment or a recurring payment?
* one time
  - On what date?
* today
  - To confirm, you want to make a one-time payment to rogers, for the amount of 20 dollars, from your checking account, on today. [Yes] [No]
* no
  - Sorry about that.

> Main menu loop

# Transaction history

## Not authenticated

> Main menu

* t
  - You need to be authenticated to perform this action.
  - What is your username?
* john
  - What is your password?
* 1234
  - Hello John!
  - You are now authenticated. Let's continue...
  - What is the account type?

## Authenticated

> Not authenticated

* checking
  - Id: 19740192
    Date: 2018-02-04 13:00:00
    Amount: -100$
    Description: Bill payment - electricity
  - Id: 68401010
    Date: 2017-12-24 10:05:32
    Amount: -500$
    Description: Transfer to 392 094 3
  - Id: 82963018
    Date: 2017-05-09 15:33:44
    Amount: 100$
    Description: Deposit

> Main menu loop