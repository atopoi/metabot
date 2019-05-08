# Metabot Architecture

## Main Concepts

__Metabot__ is a task-oriented, compositional, mixed-initialive conversational platform


It offers a system for defining and depolying bots. It connects users users to bot through diverse channels and media (currently text chabots and basic IVR). Bots responds to user interactions, initiates and executes tasks.

The main components of the system are:

* The __Action Language__ is used to define conversational logic: interaction pattern and tasks, organized into __Agents__.  The __Metabot Engine__ executes the actions and tasks. __Reactors__ listen to specific user stimuli, or _utterances_ and connects them to corresponding actions.

* On the other end, we have the __Client Layer__ : web browser app, slack app, command line app etc. The client transmit the user interactions to the Metabot server.

* __Transports__ are used to bridge betweeen the Metabot actions and the client layer. A transport implements the I/O and controls specific to a client type and medium (web, slack, text, etc). There is always a __main transport__ wich is basically the server app. The main transport initiates and manage user sessions, called __conversations__. Additional transports can be attached to a conversation (for example to monitor or debug a conversation using a web-based dashboard)

* The __Metabot Controller__, simply called __Metabot__ in the code, is the central controller managing reactors, actors and agents and routing interactions back and forth to the transports.




## Action Language and Engine
Bots, Agents, Tasks, Actions, Combinators, Reactors

### Actions, contexts, outcomes combinators

An ``Action`` is a unit defining a bot interaction. Interactions can be:
* send/receive utterances to a user - **i/o operations**
* read or modify the conversation's state - **state/memory management**
* specify user interactions to listen to - **reactivity**
* succesfully return a value for the next steps or fail - **task execution**

 Essentially is a function (wrapped in a JS object for more convienient management) with the following signature:
```
Action : Context --> Outcome x Context
```

A `Context` is a conversation's full **state**. It models and represents the conversation's memory, current progress, etc. It is created at the beginning of the conversation and tied to it until it's end. As the conversation progresses, the context is passed around to the bot's actions. The actions can modify it.

An `Outcome` is either a returned **value** corresponding to a successufull execution, or a **failure**. (Failure can be more complex: cancelation, exception, etc. DEVELOP) In 

We use an **Action Language**, a kind of DSL on top of javascript's fucntions (technically a combination of state, i/o, failure/either, and task **monad**) to define actions, starting with a set of **Basic Actions** corresponding the basic interactions:
* I/O: `say`, `ask`...
* state: `LET`, `SET`, `GET`,..
* reactivity: `ON(intent, action)`...
* task fullfilment: `succeed(val)`, `fail(reason)`...

Then we we have a set of `Combinators` to _compose_ actions and define more complex ones. Combinators take actions and other parameters and produce new actions. Some basic combinator are:
* `DO` : `DO(A1, A2, ...)` executes the actions Ai in sequence, succeeds if each one of them succeeds.
* `ALT` : `ALT(A1, A2, ....)` succeeds if any of the Ai succeeds


These combinators form a (monadic) language that can be used to implement more complex behaviours and utlimately to define bots. More details on the actions and combinators in the [language](language.md) document.


### Metabot

The `Metabot object`, a singleton in the system, is responsible for executing the dialogue combinators, dispatching user events to the appropriate dialogue component (agent, dialogue, reactor, etc.).

For each conversation, the Metabot manages a stack of active dialogue agents, with the top agent having the focus. In parallel to this top agent, reactors can be installed to intercept user events (textual responses, login event, etc.).

By default, all user events are sent to the top agent. If it cannot process the event successfully, all reactors are tried in turn, beginning from the top of the stack (most recent activated agents) to the bottom . If the event cannot be processed, the top agent fails.


### Conversations

A _conversation_ is a series of exchanges between a bot and a user. It is modelled as an EventEmitter in JavaScript. A conversation is thus a bidirectional pipe by which both a transport and the Metabot interact in an asynchronous, decoupled way.

Two types of events can be listened to:
* `userEvent` - they are fired by transports (see below) when the user sends a message to the bot.
* `botEvent` - they are fired by the bot, and they represent messages sent to the user.



```mermaid
sequenceDiagram
participant U as User/Client
participant T as Transport
participant M as Metabot
participant R as Reactors/Intents
participant A as Bot Action Logics
Note over A: Agents, Actions, Tasks
U ->> T: sends message
T ->> T : retrieve or create conversation
T ->> M : emits user event
M ->> R: find applicable reactors
R ->> A : fire attached actions
A ->> A : execute actions
Note over A: Possibly defines intents as reactors
A -->> R: add reactors
A ->> A : execute actions
Note over A: Bot utterances
A ->> M: say
M ->> T: say
T ->> U: send bot message
A ->> A : execute actions
Note over A: Bot asking for data
A ->>+ M: ask and wait for answer
M ->> T: prompt user
T ->> U: send prompt
M -->> R: create reactor for answer
Note over R: Currently exists only in JS stack
M ->> T: send wait event
T ->>- U: send wait event
```

It is possible to have multiple transports connected to a conversation.

Note that events can happen asynchronously. For this reason, the Metabot object holds a mailbox to queue additional events from users while it is still processing an event.

### Utterances
**TODO**

### Intents, entities and types
**TODO**

### DATAFRAMES
**TODO**

### Session Management

A conversation exists only for a certain period of time. A session timeout is triggered when the systems detects a lack of activity in the conversation for a (configurable) given period of time. When the timeout occurs, the session is reclaimed.


__Note:__ _We need to figure out how we can stop a conversation and resume it at a later time. I.e. the session is reclaimed, but knowing that the transaction is not completed, we could "replay" some of the events and get back in the same state when a new user event arrives._

__Global Registry__

A global registry exists that holds all the active conversations. The conversations are indexed by a unique ID. Typically, this ID is provided by the messaging platform, but it could also be generated by the platform in certain cases (like the websocket transport for the HTML interface used in development).

The lifecycle of a conversation can be tracked by listening to the `start` and `stop` events on a conversation. Conversations can also be explicitely terminated by calling their `stop()` method. This has the effect of sending a `stop` event to all registered listeners, and removing all listeners afterwards.

### Transports

Transports are means by which bots are connected to actual users on messaging channels. We can view them as _drivers_, if we take the operating system (OS) analogy. They are responsible for receiving answers from users, and sending messages from bot to the user.

Transports are event listeners attached to conversations. When a bot sends a message to a user, the conversation emits an event the transport will react to (typically by making an HTTP to a remote messaging platform).

## Packaging

### Directory structure

Bots are packaged as ES6 modules. Each bot must be declared in a dedicated folder of the `apps` folder. The name of the bot must in KebabCase. The folder must contain at least two files:

```
   + metabot
   |   +--- apps
   |   |   +--- my-bot
   |   |   |   +--- bot.js
   |   |   |   +--- messages.js
```

* `bot.js` contains the code for the bot
* `messages.js` contains the localization code for all the bot messages

### Bot module

In `bot.js`, the bot is declared as a subclass of `Agent`, and this is the only exported object:

```JavaScript
    const {Agent} = require('../../core/agent')
    const Bot = new Agent('BotName', {...})

    module.exports = Bot
```

### Localization

The file `messages.js` declares all messages that will be sent to the user, in all supported languages. The messages module must export an object whose properties are language codes bound, and whose values are maps. These maps translate message IDs to either strings or functions.

Here is an example:

```JavaScript
    const en_US = {
      hello: 'Hello, world!'
      howAreYou: 'How are you today, #{name}?'
    }

    module.exports = {en_US}
```

By default, the language `en_US` is used by the framework.





## Infrastructure

### Configuration

### Logging

### Clustering



