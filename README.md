# Introduction

__Metabot__ is a chabot engine and platform allowing developers and dialogue designer to quickly define and deploy rich task-oriented, mixed initiative conversational agents.

The bots can be text based (chatbots) and they could connect to diverse clients like web client, slack apps, etc.

One of Metabot's characteristics is that _it does not use rules or states tables_. Rules are hards to write and maintain, they don't scale, and as soon as the bot's actions goes beyond some basic operations, the bot's logics become very hard to reason about, even fot experienced programmers.

In contrast, Metabot offers a **pattern-based compositional approach**: basic interactions are combined into more complex ones using ``combinators``. These combinators capture common sense patterns: ask something and wait for the answer, try in sequence, repeat until success, repeat on a list... Complex actions are easly defined, re-used, and transferred to other tasks.


# Metabot's features

* Task oriented : bots can resolve complex multistep tasks interactively with their user.

* Mixed initiative : user can diverge from current task, initiate new tasks/intents and come back (or not) at anytime

* Not based on rules and state tables

* Compositional -> scaffolding from simple tasks using combinators expressing composition patterns

* Basic actions action coverering base operations
  * i/o
  * state
  * intents
  * tasks management

* Reusable actions and behaviours

* Everything is asynchronous

* Multi channel: http, web sockets, slack app, etc. via extensible transports

* Multi-agent (not done yet)

* Complex slot-filling patterns expressed in simple operators and structures (``dataframes``)

* Powerfull monitoring tools and possibilities


## Implementation features

* It is implemented in node.js and javascript: functional, asynch, event management, great server ecosystem. (But any system with proper asynchronous functional programming could have been used)

* Behaviours and actions are just functions (in a wrapper object)

* The actions and combinators form a bot DSL, hosted direct inside javascript.

* Total separation separation of:
  * the bot's conversational and task logic
  * the bot's surface messages
  * the actual rendering and interface with the client tools

* Modular and easily extensible

* The DSLs implementation follows monadic functional programming methods.



# Simple example

Create a bot in the apps folder:

In file ``apps/great-bot/bot.js``
```javascript
// Imports
const { DO, GET, SET, IF, ON, say} = require('../../core/lang.js')
const { ask } = require('../../core/patterns/ask.js')
const { Agent } = require('../../core/agent.js')

// Create the bot
const GreatBot = new Agent('The Great Bot')

// define the bot's actions here


// export for the bot laucher
module.exports = GreatBot
```

Then the bot can be launched with:
```bash
node scripts/launcher.js -Dlauncher.bot=great-bot
```
The default laucher uses deploys basic web server using websockets.


Let's add functionality to the bot:

```javascript
GreatBot.tasks.main = DO(
    say('Hello'),
    ON('help', showHelp),
    ask("what's your name?"),
    SET('user.name'),
    name => say('Nice to meet you, #{name}', {name}),
    MainActionLoop
)
```

Here is a simple help method:
```javascript
const showHelp = DO(
   say('I\'m just a simple bot')
    IF(GET('user.name'),
       name => say('But you can help me become great, #{name}!', {name}))
)
```

For the main main action loop, let's implement a simple number guessing game:
```javascript
const MainActionLoop = DO(
   say('I roll a dice and you guess the result...'),
   loop(
       DO(
        say('Rolling...'),
        guess(Math.floor(Math.random() * 6)),
       )
   ))

const guess = targetNumber => DO(
    ask({
         messages: ['Guess the result!', 'Enter a number between 1 and 6'],
         type: 'int'
        })
    guess => IF(guess === targetNumber
      say('Yes, got it!'),
      say(`The number was ${targetNumber}!`)
      ))
    )
```
