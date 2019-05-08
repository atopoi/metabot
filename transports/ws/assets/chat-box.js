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

// Icons 'ᚥ ᚤ ᚠ ᚻ ⊕ ⊖ ⊗ ⊙ ⊚ ≫ ≪ ≕ ⍒ ⍟ ⸎ ⸾ ⍰ ⟳ ⌾ 🕔 ⨭ 🔂 💾 🔁 📌 📶 ⍇ 📝 📍 ⍿ ⟴
// ⧛ ⪡ ≪ ⩤ ⫷ ╰ ╯ ╘ ⌸ ⌕ ◎ 🜙 🝊 ⌁ 👤 ⇜ ↳ ↘  ↞ ╲ 🎙 📡 ┉ ↝ ⇝ ⩚ ᗑ ⪪ ᗕ ⤜ ⪼ ⪼ ⛁


const isEmptyObject = val => Object.keys(val).length === 0


const isEmpty = val => (
  val !== 0
  && (!val
    || (val instanceof Array && val.length === 0)
    || isEmptyObject(val))
)


class ChatMessage {
  constructor(params) {
    Object.assign(this, params)
    this.ready = false
  }

  utterance() {
    return this.isDialog() && this.data
    // TODO: return this.isDialog() && this.data && this.data.utterance
  }

  textKey() {
    const utter = this.utterance()
    return utter && utter.key
  }

  lines() {
    const utterance = this.utterance()
    if (utterance) {
      if (utterance.text) {
        return utterance.text.split('\n')
      }
      if (utterance.nlu) {
        const intents = utterance.nlu.intents
        if (intents) {
          return intents.map(intent => intent.text)
        }
      }
    }
    return []
  }

  isControlEvent() {
    return this.type === 'control'
  }

  isDebug() {
    return this.type === 'runtimeEvent'
  }

  isFocusEvent() {
    return this.isDebug() && this.data.op === 'focus'
  }

  isReactor() {
    return this.type === 'reactorEvent'
  }

  isDialog() {
    return this.type === 'botUtterance' || this.type === 'userUtterance'
  }

  isFromUser() {
    return this.direction === 'out'
  }

  rowClass() {
    return this.direction === 'out'
      ? 'chat-message-row user-message'
      : 'chat-message-row bot-message'
  }

  textClass() {
    if (this.isDebug()) return 'chat-debug'

    const direction = this.direction
    if (direction === 'out') {
      return 'chat-bubble right'
    }
    return 'chat-bubble left'
  }

  userName() {
    const { agent, user } = this
    return agent ? agent.name : user
  }

  userIcon() {
    return this.agent && this.agent.icon
  }
}


Vue.component('control-event', {
  props: ['message'],
  template: `
<div class='control-event level-left'>
  <div class='event-flag control-event-name'>{{ message.data.name }}</div>
  <div v-if="message.data.info" class='event-flag control-event-info'>{{ message.data.info }}</div>
</div>`
})


Vue.component('debug-message', {
  props: ['message'],
  template: `
<div class='runtime-event level-left'>
  <div v-if="!message.isFocusEvent()" class='event-flag runtime-op'>{{ message.data.op }}</div>
  <div v-if="message.data.level" class='event-flag runtime-level'>{{ message.data.level.toUpperCase() }}</div>
  <div class='event-flag runtime-tag'>{{ message.data.tag }}</div>
  <div class='event-flag runtime-agent'>
    {{ message.data.focus.icon || ''}}
    {{ message.data.focus.name }}
  </div>
  <div v-if="message.data.focus && message.data.focus.info" class='event-flag runtime-info'>{{ message.data.focus.info }}</div>
</div>`
})


Vue.component('reactor-message', {
  props: ['data'],
  template: `
<div class='reactor-event level-left'>
  <div class='event-flag react-label'>{{ data.label }}</div>
  <div v-if="data.level" class='event-flag react-level'>{{ data.level }}</div>
  <div v-if="data.step" class='event-flag react-level'>{{ data.step }}</div>
  <div v-if="data.reactor" :class="['event-flag', 'react-reactor', {'succeeded' : data.result && data.step=='try'}]">{{ data.reactor }}</div>
  <div v-if="data.info === 0 || data.info" class='event-flag react-info'>{{ data.info }}</div>
</div>`
})


Vue.component('message-header-user', {
  props: ['message'],
  template: `
<div :class="message.rowClass()">
  <div class="chat-box-user-header">
    <span v-if="message.userIcon()" class="chat-bubble-user-icon">{{ message.userIcon() }}</span>
    <span>{{ message.userName() }}</span>
  </div>
</div>`
})


Vue.component('message-bubble', {
  props: ['message', 'show'],
  template: `
<div :class="message.rowClass()">
 <transition name="message" tag="div">
   <div v-show="show" v-bind:class="message.textClass()" :title="JSON.stringify(message.utterance(), null, 2)">
     <div class="chat-text">
       <p v-if="message.textKey()" class="chat-text-Key">{{ message.textKey() }}</p>
       <p v-for="line in message.lines()">
         {{ line }}
         <br/>
       </p>
     </div>
   </div>
 </transition>
</div>`
})


Vue.component('context-box', {
  props: ['title', 'context', 'show'],
  computed: {
    elements() {
      const {
        agent, task, focus, env, reactors, dataframe
      } = this.context
      return {
        agent, task, env, reactors, dataframe, focus
      }
    },
    allReactors() {
      if (!this.context.reactors) return []
      const top = this.context.reactors.top || []
      const dataframe = this.context.reactors.dataframe || []
      return [...top, ...dataframe]
    },
    dataframes() {
      return this.context.dataframes ? Object.values(this.context.dataframes) : []
    },
    topTask() {
      return this.context.tasks && this.context.tasks[0]
    }
  },

  template: `
<article class="message is-light context-box" v-show="show" style="border: 1px solid silver;">
  <div class="message-header">
    {{title}}
    <button class="delete" @click="show=!show"></button>
  </div>
  <div v-cloak class="message-body">
    <context-box-element name="agent"      :value="context.agent"/>
    <context-box-element name="task"       :value="topTask" :showState="true"/>
    <context-box-element name="task stack" :children="context.tasks" :expand="true"/>
    <context-box-element name="reactors"   :children="allReactors"/>
    <context-box-element name="env"        :value="context.env" :showState="true"/>
    <context-box-element name="dataframes" :children="dataframes" :expand="true"/>
    <context-box-element name="store"      :state="context.store" :showState="true"/>
    <context-box-element name="focus"      :children="context.focus"/>
  </div>
</article>`
})


Vue.component('context-box-element', {
  props: {
    name: String,
    value: [Object, String, Array],
    children: Array,
    state: [Object, Boolean],
    expand: Boolean,
    showState: Boolean,
    rank: Number,
    depth: { type: Number, default: 0 }
  },

  data() {
    return {
      expanded: this.expand,
      /* eslint no-underscore-dangle:0 */
      stateExpanded: this.showState || (this.value && ['Store', 'Dataframe', 'env'].includes(this.value.type_))
    }
  },

  computed: {
    stateObject() {
      if (this.state) return this.state
      const v = this.value
      return v && v.state && !isEmpty(v.state) && v.state
    }
  },

  methods: {
    hasChildren() {
      return this.children && this.children.length > 0
    },
    isEmpty() {
      return isEmpty(this.value)
    },
    stateEmpty() {
      return isEmpty(this.stateObject)
    },
    isTask() {
      return this.value && this.value.type_ === 'Task'
    },
    isReactor() {
      return this.value && this.value.type_ === 'Reactor'
    },
    taskIndent() {
      return this.isTask() && `${this.rank * 1.2 - 1}em`
    },
    toggleStateBox() {
      this.stateExpanded = !this.stateExpanded
    }
  },

  template: `
<div :class="['context-box-row', {'has-children': hasChildren()}, {'is-task': isTask()}, {'is-reactor' : isReactor()}]"
     @toggleStateTree="toggleStateTree()"
     :style="{'padding-left': taskIndent()}">
  <span v-if="!isTask() || depth===0"
         @click="expanded=!expanded"
          class="context-box-row-bullet">{{!hasChildren() ? '&nbsp;' : expanded ? '▼' : '▶'}}</span>
  <span v-if="isTask() && depth && rank" class="task-indent">╰</span>
  <span v-if="name" class="context-box-key" @click="expanded=!expanded">{{ name }}</span>

  <context-value
     v-show="!hasChildren() || !expanded || stateObject"
     :name="name"
     :value="isEmpty() ? '' : hasChildren() ? '...' : value"
     :state="stateObject"
     :title="JSON.stringify(value, null, 2)"
     :inline="true"
     :stateExpanded="stateExpanded">
  </context-value>
  <div class="state-tree" v-if="stateObject" v-show="stateExpanded && !stateEmpty()" @click.stop="stateExpanded=false">
    <tree-view name="state" :tree="stateObject" :expand="2">
    </tree-view>
  </div>
  <div v-show='expanded' class="context-box-children">
    <context-box-element v-for="(val, index) in children" :depth="depth ? depth + 1 : 1" :rank="index" :key="index" :value="val" :state="val && val.state">
    </context-box-element>
  </div>
</div>`
})


Vue.component('context-value', {
  props: ['name', 'value', 'state', 'inline'],

  data() {
    return {
      expanded: !this.inline
    }
  },
  methods: {
    stateEmpty() {
      return isEmpty(this.state)
    },
    stateExpanded() {
      return this.$parent.stateExpanded
    },
    isString() {
      return typeof this.value === 'string'
    },
    substr(str, width) {
      return str.length <= width ? str : `${str.substring(0, width)}…`
    }
  },

  template: `
<div :class="['context-value', {'inline': !expanded}]">
  <span v-if="isString()">
    {{value}}
  </span>
  <div v-else :class="['context-value', {'inline': expanded}]">
    <div v-if="value.id && $root.showTaskIds" class="context-value-field field-id">
      {{value.id}}
    </div>
    <span v-if="value.icon" class="context-value-field field-icon">
      {{value.icon}}
    </span>
    <div v-if="value.name" class="context-value-field field-name">
      {{substr(value.name, 20)}}
    </div>
    <div v-if="value.owner" class="context-value-field field-owner" title="owner">
      <span v-if="value.owner.icon"> {{value.owner.icon}}</span>
      <span v-if="value.owner.name"> {{value.owner.name}}</span>
      <span v-else> {{value.owner}}</span>
    </div>
    <div v-if="value.info" class="context-value-field field-info">
      {{value.info}}
    </div>
    <div v-if="state" class="context-value-field field-state" @click.prevent="$parent.toggleStateBox()">
      <span :class="['context-value--state-button', { 'state-empty': stateEmpty() }]"
            :title="stateEmpty() ? 'no state' : stateExpanded() ? 'hide state' : 'show state'">⧁</span>
      <span v-if="!stateExpanded() && !stateEmpty()">{{state}}</span>
    </div>
    <div v-if="value.action" class="context-value-field field-action" :title="JSON.stringify(value.action, null, 2)">
      <span v-if="value.action.info" class="field-name">{{substr(value.action.info)}}</span>
      <span v-else> {{substr(JSON.stringify(value.action || ''), 20)}}</span>
    </div>
  </div>
</div>`
})


Vue.component('tree-view', {
  props: ['tree', 'expand', 'nodeGetter'],
  template: `
<div class="tree-view">
  <tree-node v-for="(val, key) in tree" :key="key" :name="key" :val="val" :expand="expand">
  </tree-node>
</div>`
})


Vue.component('tree-node', {
  props: [
    'name', 'val', 'expand', 'nodeGetter'
  ],

  data() {
    return {
      expanded: this.expand > 0
    }
  },

  methods: {
    isEmpty() {
      return isEmpty(this.val)
    },
    isEntity() {
      return _.isObject(this.val) && this.val.type_ === 'Entity'
    },
    isTree() {
      return _.isPlainObject(this.val) && !this.isEntity()
    },
    isLeaf() {
      return !this.isTree()
    },
    formatedValue() {
      // simple version, could become more elaborate
      return this.isEntity() ? this.val.val : this.isLeaf() && this.val
    }
  },

  template: `
<div :class="['tree-node', {'expanded': expanded}]">
  <div class="tree-node--item" @click.stop="expanded=!expanded">
    <span class="context-box-row-bullet">{{isLeaf() ? '&nbsp;' : expanded ? '▼' : '▶'}}</span>
    <span class="tree-node--key">{{ name }}</span>
    <span v-if="isLeaf()" class="tree-node--value" :title="JSON.stringify(val, null, 2)">{{ formatedValue() || '&nbsp;' }}</span>
  </div>
  <div v-if="isTree()" v-show="expanded" class="tree-node--children">
    <tree-node v-for="(v, key) in val" :key="key" :name="key" :val="v" :expand="expand > 0 ? expand - 1 : 0">
    </tree-node>
  </div>
</div>`
})


// const shortIntentRegex = /^# *([^;]*);?(.*)$/
// const longIntentRegex = /^# *(\w*) *({.*})$/

Vue.component('chat-box', {
  props: ['title', 'icon', 'messages', 'conversation', 'active', 'showCurrentContext'],

  data() {
    return {
      debug: {
        show: false,
        focus: {
          show: true,
          level: 1
        },
        reactor: {
          show: true,
          level: 3
        }
      },
      showMessageKeys: true,
      showControlEvents: false
    }
  },

  updated() {
    const elem = this.$el.getElementsByClassName('chat-box-messages')[0]
    elem.scrollTop = elem.scrollHeight
  },

  computed: {
    visibleMessages() {
      return this.messages.filter(this.messageVisible)
    },
    conversationStarted() {
      return this.conversation.inProgress
    }
  },

  methods: {
    inputEnabled() {
      return !!this.active
    },

    messageVisible(message) {
      if (message.isDialog()) return true
      if (message.isControlEvent()) return this.showControlEvents
      if (!this.debug.show) return false
      const level = message.data.debugLevel || 0
      if (message.isDebug()) return this.debug.focus.show && (level <= this.debug.focus.level)
      if (message.isReactor()) return this.debug.reactor.show && (level <= this.debug.reactor.level)
      return false
    },

    messageFirstInSeq(index, message) {
      if (index === 0) return true
      // if (!message.isDialog()) return false

      const prev = this.visibleMessages[index - 1]
      return message.direction !== prev.direction
        || (message.agent && message.agent.name !== prev.agent.name)
    },

    toggleDebug() {
      this.debug.show = !this.debug.show
    },

    startOrStop() {
      console.log(this.conversation)
      if (this.conversation.inProgress) {
        stopConversation()
      } else {
        startConversation()
      }
    },

    sendMessageFromInput(event) {
      const text = event.target.value.trim()
      // eslint-disable-next-line no-param-reassign
      event.target.value = ''
      sendUserMessage({ text })
    }
  },

  template: '#chat-box-template'
})
