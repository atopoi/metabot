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

const axios = require('axios')

const { runDialogueTests } = require('../../../core/test-utils/dialogue-test.js')

const Bot = require('../bot.js')

// Setup
const forecast = [
  {
    date: '21 Aug 2018', high: '77', low: '66', text: 'Scattered Showers'
  },
  {
    date: '22 Aug 2018', high: '74', low: '63', text: 'Scattered Thunderstorms'
  },
  {
    date: '23 Aug 2018', high: '76', low: '58', text: 'Mostly Sunny'
  }
]
const simplifiedYahooWeatherResult = { query: { results: { channel: { item: { forecast } } } } }

const setup = () => {
  axios.get = jest.fn()
  axios.get.mockReturnValue(Promise.resolve({ data: simplifiedYahooWeatherResult }))
}

runDialogueTests(Bot, __dirname, 'bot.test.md', setup)
