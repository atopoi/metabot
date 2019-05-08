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
 A bot to order coffee
====================================
 */

const {
  CASE, DO, loop, say, SWITCH, TASK
} = require('../../core/lang.js')

const { fillDataframe } = require('../../core/patterns/fill-dataframe.js')
const { getYesNo } = require('../../core/patterns/ask.js')
const { Agent } = require('../../core/agent')

const { defineIntent } = require('../../core/intent')
const { defineType } = require('../../core/types')

/*
====================================
 Mock NLU
====================================
 */

defineIntent('order_coffee', {
  keywords: ['order coffee', 'coffee', 'coffee order', 'order']
})

defineType('coffee_type', {
  choices: {
    latte: ['latte', 'cafe au lait'],
    regular: ['filter', 'regular'],
    capuccino: ['cappuccino', 'capuccino'],
    black: ['black'],
    espresso: ['espresso', 'expresso']
  }
})

defineType('coffee_size', {
  choices: {
    small: ['small', 'mini', 's'],
    medium: ['medium', 'm'],
    large: ['large', 'l'],
    double: ['double']
  }
})

defineType('milk_type', {
  choices: {
    skim: ['skim milk', 'skim', 'zero percent', 'no fat'],
    lowfat: ['low fat'],
    regular: ['two percent', 'regular'],
    fullfat: ['full milk', 'full fat'],
    cream: ['cream', 'creamer', 'half and half'],
    soy: ['soy', 'soy milk'],
    almond: ['almond', 'almond milk'],
    coconut: ['coconut', 'coco']
  }
})

defineType('topping', { choices: ['cacao', 'cinnamon', 'nothing'] })

defineType('sweetener', { choices: ['sugar', 'white sugar', 'raw sugar', 'honey', 'splenda', 'agave sirup', 'nothing'] })

/*
====================================
 Coffee Order Task
====================================
 */

const coffeeOrder = {
  name: 'coffeeOrder',

  slots: [
    { name: 'type', type: 'coffee_type' },
    { name: 'size', type: 'coffee_size' },
    { name: 'milk', type: 'milk_type' },
    { name: 'topping', type: 'any' },
    { name: 'sweetener', type: 'any', required: false },
    { name: 'quantity', type: 'int' }
  ],

  fillSlots: ({ fill, get }) => DO(
    fill('type'),
    fill('size'),

    SWITCH(get('type'),
      // latte
      CASE('latte',
        fill('milk'),
        fill('topping'),
        fill('sweetener'),
        fill('quantity')),
      // capuccino
      CASE('capuccino',
        fill('milk'),
        fill('topping'),
        fill('sweetener'),
        fill('quantity')),

      // regular
      CASE('regular',
        fill('milk'),
        fill('sweetener'),
        fill('quantity')),

      // black
      CASE('black',
        fill('sweetener'),
        fill('quantity')),

      // espresso
      CASE('espresso',
        fill('sweetener'),
        fill('quantity')))
  ),

  confirmDialog: slotValues => getYesNo('confirm', slotValues)
}

/*
====================================
 Agent Definition
====================================
 */

const coffeeBot = new Agent(
  'coffee bot',
  {
    icon: '☕'
  }
)

coffeeBot.tasks.main = DO(
  // greeting
  say('greet'),
  // Main menu loop
  // TODO: add main loop operator
  TASK({
    name: 'menu loop',
    icon: '⟳',
    action: loop(
      DO(
        fillDataframe(coffeeOrder),
        say('thanks_payment_done'),
        say('goodbye'),
        say('what_next')
      ),
      true
    )
  })
)

module.exports = coffeeBot
