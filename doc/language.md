# Metabot Action Language

Interactions in Metabots are defined as ``Actions``, which are basically functions of the context, wrapped in a Javascript object. See the [architecture document](architecture.md) for more details. ``Combinators`` create new actions from other actions and parameters. A set of basic actions and combinators are provided. New ones can be created by combining other actions and combinator, or by directly defining an action object in javascript.

An action is executed on a context, by the ``run`` method. For an action A 

```javascript
A.run(context) --> {value, failure, newContext}
```


There are many examples in the test files located in `core/__tests__/lang`. Moreover these tests give examples for all the the basic language construct's options and  parameters.


## Basic actions

### Constant outcomes

``succeed(val)`` just returns val as a success without altering the context.

``fail(reason)`` fails with an optional ``reason``

### say
``say(message, options = {})`` outputs message to the user.

There currenly only one possible option, ``messageData``, which is a dictionary ok key/values for **string interpolation**.

For example:
```javascript
say('Hello #{name}', { messageData: { name: theUserName}})
```
Will output `Hello Bert` if the userName is 'Bert'.

### ask
``ask(message, type = 'any')`` or ``ask(options)`` a message is sent as a promp to user, waiting of an answer corresponding to the specified type/filters. The options object can define any of the following keys:
* ``message``: a string or a list of strings which will be sent as prompts to the user. Where message is a list of string, we start with the first message, and the then move to the others in sequence if the user fails to asnwer correctly.
* ``type``: the expected answer type.
* ``maxAttempts``: the number of user attempts accepted before the outcome is considered a failure.
* ``exceptionOnMaxAttempts``: the number of user attempts accepted before the outcome is considered a failure.
* ``filter``: an additional condition on the result (ex: ``res => res < 10``)
* ``confirmDialog``: a confirmation dialog (action) to run after the user gave an accepatble results.
* ``name``: only for degugging the action

Some basic types are defined in core/types.js
New types are created using ``defineType`` (DEVELOP)


### CALL_SERVICE

``CALL_SERVICE(url, params)`` sends a rest call to *url* with the *params* (a key/value dict), and return the result with success if the call succeeds.


### DO
``DO`` is the basic **sequencing combinator**, basically running a sequence of actions/steps in sequence, failing immediateley if any step fails, and returning the last step's result if all steps fails
```
DO(A, B, C, ...)
```
The first step A must be an action. The next ones could be either actions, functions returning actions or other values.

See examples in the tests and demo apps.


## ALT

``ALT`` is the disjunction combinator. It corresponds to a kind or **or**. For series of actions A, B, C,...
```
ALT(A, B, C, ...)
```
is a new actions which succeeds if any of A, B, C, ... succeeds, and fails otherwise. It will tries them in order, returning the outcome if successful, or trying the next action orthewise.


## SWITCH, CASE, DEFAULT

``SWITCH(actionOrValue, ...clauses)`` where each `clause` in clauses is either a `CASE(condition, action)` pattern, or a ``DEFAULT(action)`` clause. For example:
```javascript
SWITCH(ask('enter a number', 'int'),
  CASE(0, someActionForZero),
  CASE( n => (n < 10), anotherAction),
  DEFAULT(say('Your number is to big'))
)
```


## ON

``ON(intent, action)`` declares ``Reactor`` linking the `intent` to the given action. After this declaration, when the user input matches the intent, the specified will fire.

Intents from the user utterance are either given directly by the client and transport, or the will come from a call to an NLU service (TODO), or, at least at the conception stage, they can be the result of some king of crude keyword matching. 

The declaration ``defineIntent(intentName, options)`` is a helper for simple matching rules for a given intent (DEVELOP).


## Loops

```javascript
repeat(n, mainAction)
loop(mainAction)
loopWhile(condition, mainAction)
```
These combinators implement 3 basic looping patterns.
* ``repeat`` simply repeats the mainAction n times.
* ``loop`` repeats it until it fails
* ``loopWhile`` repeats it while ``condition`` succeeds.

### LET, GET, SET

These combinators manipulate a common _state_ in the context. These state is is key/value dictionary.

* ``LET(key, action)`` binds ``key`` to the results of ``action`` if it succeeds. It fails if the action fails.

* ``SET(key, value)`` just binds `key` to `value`

* ``SET(key)`` is a *curried* form of the preceeding conbinator. It is useful inside a DO form:
```javascript
 DO(
    someAction,
    SET('name')
    )
 // is the same as:
 DO(
     someAction,
     res => SET('name', res)
     )
```
* ``GET(key)`` returns the value associated to the key if it exists, and fails otherwise.


## DATAFRAMES
*TODO*
