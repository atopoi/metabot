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

/* eslint no-undef:0 */
/* eslint no-unused-vars:0 */

Vue.use(Buefy.default)


app = new Vue({
  el: '#workspace',
  data: {
    title: 'Metabot',
    icon: 'bind_icon.png',
    active: false,
    conversation: {
      inProgress: false,
      id: undefined
    },
    messages: [],
    currentContext: {},
    showCurrentContext: true,
    showTaskIds: false,
    theme: '' // 'theme--dev'
  }
})


let ws = false

function connect() {
  ws = new WebSocket(`ws://${window.location.host}/bot`)

  ws.onmessage = evt => {
    const messageObj = JSON.parse(evt.data)

    console.log(messageObj)
    const { type } = messageObj

    if (type === 'start') {
      initializeConversation(messageObj)
    } else if (type === 'stop') {
      cleanupConversation(messageObj)
    } else if (type === 'userUtterance') {
      displayUserMessage(messageObj)
    } else {
      displayBotEvent(messageObj)
    }
  }

  ws.onopen = () => {
    console.log('Websocket connected!')
    clearMessages()
    cleanupConversation()
  }

  ws.onclose = () => {
    console.log('Websocket connection closed! Trying to reconnect...')
    enableInput(false)
    ws = false
    setTimeout(() => {
      connect()
    }, 5000)
  }

  ws.onerror = () => {
    console.error('Websocket connection error!')
  }
}


function startConversation() {
  console.log('sending start')
  sendEvent({ type: 'start' })
}


function stopConversation() {
  console.log('sending stop')
  sendEvent({ type: 'stop', id: app.conversation.id })
}


function sendEvent(event) {
  ws.send(JSON.stringify(event))
}


function sendUserMessage(data) {
  const userEvent = {
    type: 'userUtterance',
    sender: 'user',
    timestamp: Date.now()
  }
  if (typeof data === 'string') {
    userEvent.data = { text: data }
  } else userEvent.data = data

  sendEvent(userEvent)
}

function sendAnswerIntent(intentName, entities) {
  sendUserMessage({ nlu: { intents: [{ name: intentName, entities }] } })
}

function sendAnswerEntity(type, val) {
  sendAnswerIntent(undefined, [{ type, val }])
}


function initializeConversation(message) {
  const { id, mode = 'controlling' } = message
  clearMessages()
  enableInput(mode !== 'observing')
  app.conversation.inProgress = true
  app.conversation.id = id
}


function cleanupConversation() {
  enableInput(false)
  app.conversation.inProgress = false
  app.conversation.id = undefined
}


function clearMessages() {
  app.messages = []
}


function enableInput(value) {
  app.active = value
}


function displayUserMessage(message) {
  displayMessage({
    ...message, direction: 'out', user: 'You'
  })
}


function displayBotEvent(message) {
  const {
    agent, type, data, id, timestamp, context
  } = message

  displayMessage({
    id,
    timestamp,
    direction: 'in',
    user: 'Bot',
    agent,
    type,
    data,
    context
  })
}


function displayMessage(params) {
  const message = new ChatMessage(params)
  app.messages.push(message)
  focusMessage(message)
  message.ready = true
}


function focusMessage(message) {
  app.currentContext = message.context
}


enableInput(false)
connect()
